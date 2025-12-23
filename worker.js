// ==================== 配置项 Configuration ====================

// 缓存 TTL 设置 | Cache TTL settings
const EDGE_CACHE_SECONDS = 2592000;  // 边缘缓存：30 天 | Edge cache: 30 days
const SWR_SECONDS = 86400;           // 过期后仍可用时间：1 天 | Stale-while-revalidate: 1 day
const BROWSER_CACHE_SECONDS = 3600;  // 浏览器缓存：1 小时 | Browser cache: 1 hour

// 性能优化配置 | Performance optimization settings
const ENABLE_COMPRESSION = true;      // 启用 Brotli/Gzip 压缩 | Enable Brotli/Gzip compression
const ENABLE_EARLY_HINTS = true;      // 启用 Early Hints (HTTP 103) | Enable Early Hints (HTTP 103)
const MAX_RETRIES = 2;                // 最大重试次数 | Max retry attempts
const RETRY_DELAY_MS = 500;           // 重试延迟（毫秒）| Retry delay in milliseconds
const REQUEST_TIMEOUT_MS = 30000;     // 请求超时：30 秒 | Request timeout: 30 seconds

// 支持的 GitHub 域名 | Supported GitHub domains
const GITHUB_HOSTS = [
    "github.com",
    "raw.githubusercontent.com",
    "gist.github.com",
    "gist.githubusercontent.com"
];

// 备用镜像源（可选，用于降级）| Fallback mirrors (optional, for degradation)
const FALLBACK_MIRRORS = [
    // 可以添加其他 GitHub 镜像站 | Add other GitHub mirror sites here
    // "hub.fastgit.xyz",
    // "github.com.cnpmjs.org"
];

// ===============================================================

/**
 * 生成基于日期的缓存版本号（YYYYMMDD 格式）
 * Generate cache version based on current date (YYYYMMDD format)
 * 
 * 缓存在每天 UTC 00:00 自动过期
 * Cache automatically expires daily at UTC 00:00
 * 
 * @returns {string} 日期版本字符串（例如 "20231223"）| Date-based version string (e.g., "20231223")
 */
function getCacheVersion() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * 从响应头提取并规范化 ETag
 * Extract and normalize ETag from response headers
 * 
 * 移除 W/ 前缀和引号，截取前 32 个字符
 * Removes W/ prefix and quotes, truncates to 32 characters
 * 
 * @param {Response} response - HTTP 响应对象 | HTTP response object
 * @returns {string|null} 规范化的 ETag 或 null | Normalized ETag or null if not present
 */
function extractETag(response) {
    const etag = response.headers.get('etag');
    if (!etag) return null;

    // 规范化：W/"abc123" 或 "abc123" → abc123
    // Normalize: W/"abc123" or "abc123" → abc123
    return etag.replace(/^W\/"|"/g, '').substring(0, 32);
}

/**
 * 根据请求路径确定缓存策略
 * Determine cache strategy based on request path
 * 
 * @param {string} pathname - 请求路径 | Request pathname
 * @returns {Object} 缓存策略对象 | Cache strategy object with edgeTTL, browserTTL, useETag, and description
 */
function getCacheStrategy(pathname) {
    // 动态路径（频繁更新）：短缓存 + ETag 验证
    // Dynamic paths (frequently updated): short cache + ETag validation
    if (pathname.includes('/latest/') ||
        pathname.includes('/nightly/') ||
        pathname.includes('/master/') ||
        pathname.includes('/main/')) {
        return {
            edgeTTL: 3600,        // 1 小时 | 1 hour
            browserTTL: 300,      // 5 分钟 | 5 minutes
            useETag: true,
            description: 'dynamic'
        };
    }

    // 固定版本路径（不可变）：长缓存，无需 ETag
    // Versioned paths (immutable): long cache, no ETag needed
    // 匹配：/v1.0/, /v1.0.0/, /1.0/, /tag/v1.0/, /releases/download/v1.0/ 等
    // Matches: /v1.0/, /v1.0.0/, /1.0/, /tag/v1.0/, /releases/download/v1.0/, etc.
    if (/\/v?\d+\.\d+(\.\d+)?\//.test(pathname) ||
        /\/tags?\//.test(pathname) ||
        /\/releases\/download\/v?\d+/.test(pathname)) {
        return {
            edgeTTL: 2592000,     // 30 天 | 30 days
            browserTTL: 86400,    // 1 天 | 1 day
            useETag: false,
            description: 'versioned'
        };
    }

    // 默认策略：中等缓存 + ETag 验证
    // Default strategy: medium cache + ETag validation
    return {
        edgeTTL: 86400,       // 1 天 | 1 day
        browserTTL: 3600,     // 1 小时 | 1 hour
        useETag: true,
        description: 'default'
    };
}

/**
 * 解析请求路径并提取 GitHub 目标信息
 * Parse request pathname and extract GitHub target information
 * 
 * @param {string} pathname - 请求路径 | Request pathname
 * @returns {Object|null} 包含 host、path 和 fullUrl 的对象，无效时返回 null
 *                        Object with host, path, and fullUrl, or null if invalid
 */
function parseGitHubPath(pathname) {
    // 支持的路径格式 | Supported path formats:
    // 1. /github.com/user/repo/...
    // 2. /raw.githubusercontent.com/user/repo/...
    // 3. /user/repo/... （默认使用 github.com）| (defaults to github.com)

    const parts = pathname.split('/').filter(p => p);
    if (parts.length === 0) {
        return null;
    }

    let githubHost = "github.com";
    let githubPath = pathname;

    // 检查第一部分是否为 GitHub 域名 | Check if first part is a GitHub domain
    if (GITHUB_HOSTS.includes(parts[0])) {
        githubHost = parts[0];
        githubPath = '/' + parts.slice(1).join('/');
    }

    return {
        host: githubHost,
        path: githubPath,
        fullUrl: `https://${githubHost}${githubPath}`
    };
}

/**
 * 带重试逻辑和超时控制的智能请求函数
 * Fetch with retry logic and timeout control
 * 
 * 针对不稳定网络环境优化（例如中国大陆）
 * Optimized for unreliable network conditions (e.g., China mainland)
 * 
 * @param {string} url - 目标 URL | Target URL
 * @param {Object} options - Fetch 选项 | Fetch options
 * @param {number} retries - 最大重试次数 | Maximum retry attempts
 * @returns {Promise<Response>} HTTP 响应 | HTTP response
 */
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    for (let i = 0; i <= retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // 成功或客户端错误（4xx）时不重试 | Don't retry on success or client errors (4xx)
            if (response.ok || (response.status >= 400 && response.status < 500)) {
                return response;
            }

            // 服务器错误（5xx）或其他失败时重试 | Retry on server errors (5xx) or other failures
            if (i < retries) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (i + 1)));
                continue;
            }

            return response;
        } catch (error) {
            // 超时或网络错误时重试 | Retry on timeout or network errors
            if (i < retries) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (i + 1)));
                continue;
            }
            throw error;
        }
    }
}

/**
 * 判断内容类型是否应该压缩
 * Check if content type should be compressed
 * 
 * @param {string} contentType - Content-Type 头的值 | Content-Type header value
 * @returns {boolean} 如果内容应该被压缩则返回 true | True if content should be compressed
 */
function shouldCompress(contentType) {
    if (!contentType) return false;

    const compressibleTypes = [
        'text/',
        'application/javascript',
        'application/json',
        'application/xml',
        'application/x-yaml',
        'image/svg+xml'
    ];

    return compressibleTypes.some(type => contentType.includes(type));
}

/**
 * 生成包含版本号和编码信息的优化缓存键
 * Generate optimized cache key with version and encoding information
 * 
 * @param {string} url - 请求 URL | Request URL
 * @param {string} acceptEncoding - Accept-Encoding 头的值 | Accept-Encoding header value
 * @param {string|null} version - 缓存版本（ETag 或基于日期）| Cache version (ETag or date-based)
 * @returns {string} 缓存键 URL 字符串 | Cache key URL string
 */
function getOptimalCacheKey(url, acceptEncoding, version = null) {
    const cacheUrl = new URL(url);

    // 使用提供的版本（ETag）或基于日期的版本 | Use provided version (ETag) or date-based version
    const cacheVersion = version || getCacheVersion();
    cacheUrl.searchParams.set("__v", cacheVersion);

    // 根据客户端支持添加编码标识 | Add encoding identifier based on client support
    if (acceptEncoding) {
        if (acceptEncoding.includes('br')) {
            cacheUrl.searchParams.set("__enc", "br");
        } else if (acceptEncoding.includes('gzip')) {
            cacheUrl.searchParams.set("__enc", "gzip");
        }
    }

    return cacheUrl.toString();
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 解析并验证 GitHub 路径 | Parse and validate GitHub path
        const githubInfo = parseGitHubPath(url.pathname);
        if (!githubInfo) {
            return new Response("Invalid path. Usage: /[github.com]/user/repo/path/to/file", {
                status: 400,
                headers: { "Content-Type": "text/plain" }
            });
        }

        // 处理 CORS 预检请求 | Handle CORS preflight requests
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Max-Age": "86400",
                },
            });
        }

        // 仅允许 GET 和 HEAD 方法 | Only allow GET and HEAD methods
        if (request.method !== "GET" && request.method !== "HEAD") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const startTime = Date.now();

        // 根据路径确定缓存策略 | Determine cache strategy based on path
        const cacheStrategy = getCacheStrategy(githubInfo.path);

        // 获取客户端支持的编码 | Get client's supported encodings
        const acceptEncoding = request.headers.get("accept-encoding") || "";

        // 生成用于查询的缓存键 | Generate cache key for lookup
        const initialCacheKey = getOptimalCacheKey(request.url, acceptEncoding);
        const cacheKey = new Request(initialCacheKey, { method: "GET" });

        const upstreamUrl = githubInfo.fullUrl + url.search;

        // 向浏览器发送 Early Hints (HTTP 103) | Send Early Hints to browser (HTTP 103)
        if (ENABLE_EARLY_HINTS && request.method === "GET") {
            ctx.waitUntil(
                (async () => {
                    try {
                        await fetch(request.url, {
                            method: "HEAD",
                            headers: {
                                "Link": `<${upstreamUrl}>; rel=preconnect`,
                            }
                        });
                    } catch (e) {
                        // Early Hints 失败不影响主流程 | Early Hints failure doesn't affect main flow
                    }
                })()
            );
        }

        // 检查边缘缓存（Cloudflare 默认缓存）| Check edge cache (Cloudflare's default cache)
        const cache = caches.default;

        // 仅缓存完整的 GET 请求（不包括 Range 请求）| Only cache complete GET requests (not Range requests)
        const isRange = !!request.headers.get("range");
        if (request.method === "GET" && !isRange) {
            const hit = await cache.match(cacheKey);
            if (hit) {
                // 返回缓存响应并更新头部 | Return cached response with updated headers
                const headers = new Headers(hit.headers);
                headers.set("X-Cache-Status", "HIT");
                headers.set("X-Cache-Strategy", cacheStrategy.description);
                headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
                return new Response(hit.body, {
                    status: hit.status,
                    headers: headers
                });
            }
        }

        // 向上游转发必要的请求头 | Forward necessary headers to upstream
        const passHeaders = new Headers();
        for (const h of [
            "range",
            "if-range",
            "if-none-match",
            "if-modified-since",
            "user-agent",
            "accept",
            "accept-encoding",
        ]) {
            const v = request.headers.get(h);
            if (v) passHeaders.set(h, v);
        }

        // 使用重试逻辑从上游获取 | Fetch from upstream with retry logic
        const upstreamResp = await fetchWithRetry(upstreamUrl, {
            method: request.method,
            headers: passHeaders,
            redirect: "follow",
            cf: {
                // Cloudflare 特定优化 | Cloudflare-specific optimizations
                cacheEverything: true,
                cacheTtl: cacheStrategy.edgeTTL,
                cacheTtlByStatus: {
                    "200-299": cacheStrategy.edgeTTL,
                    "404": 60,
                    "500-599": 0
                },

                // 图片优化 | Image optimization
                polish: "lossy",
                mirage: true,

                // 代码压缩 | Minification
                minify: {
                    javascript: true,
                    css: true,
                    html: true
                },

                // 使用 Cloudflare DNS (1.1.1.1) | Use Cloudflare DNS (1.1.1.1)
                resolveOverride: "1.1.1.1"
            },
        });

        const respHeaders = new Headers(upstreamResp.headers);

        // 提取 ETag 并在需要时重新生成缓存键 | Extract ETag and regenerate cache key if needed
        let finalCacheKey = cacheKey;
        let cacheVersion = getCacheVersion();

        if (cacheStrategy.useETag) {
            const etag = extractETag(upstreamResp);
            if (etag) {
                cacheVersion = etag;
                const etagCacheKeyStr = getOptimalCacheKey(request.url, acceptEncoding, etag);
                finalCacheKey = new Request(etagCacheKeyStr, { method: "GET" });
            }
        }

        // 设置 Cache-Control 头 | Set Cache-Control header
        respHeaders.set(
            "Cache-Control",
            `public, max-age=${cacheStrategy.browserTTL}, s-maxage=${cacheStrategy.edgeTTL}, stale-while-revalidate=${SWR_SECONDS}`
        );

        // 设置 Vary 头以支持基于编码的缓存 | Set Vary header for encoding-based caching
        const varyHeaders = ["Accept-Encoding"];
        if (respHeaders.has("Vary")) {
            varyHeaders.push(respHeaders.get("Vary"));
        }
        respHeaders.set("Vary", varyHeaders.join(", "));

        // CORS 头 | CORS headers
        respHeaders.set("Access-Control-Allow-Origin", "*");
        respHeaders.set("Access-Control-Expose-Headers", "*");

        // 调试和性能头 | Debug and performance headers
        respHeaders.set("X-Mirror-Version", cacheVersion);
        respHeaders.set("X-Cache-Strategy", cacheStrategy.description);
        respHeaders.set("X-GitHub-Target", upstreamUrl);
        respHeaders.set("X-Cache-Status", "MISS");
        respHeaders.set("X-Response-Time", `${Date.now() - startTime}ms`);

        // 安全头 | Security headers
        respHeaders.set("X-Content-Type-Options", "nosniff");
        respHeaders.set("X-Frame-Options", "SAMEORIGIN");

        // 连接优化 | Connection optimization
        respHeaders.set("Connection", "keep-alive");
        respHeaders.set("Keep-Alive", "timeout=60, max=1000");

        const out = new Response(upstreamResp.body, {
            status: upstreamResp.status,
            statusText: upstreamResp.statusText,
            headers: respHeaders,
        });

        // 异步写入缓存 | Asynchronously write to cache
        if (request.method === "GET" && upstreamResp.status === 200 && !isRange) {
            ctx.waitUntil(cache.put(finalCacheKey, out.clone()));
        }

        return out;
    },
};
