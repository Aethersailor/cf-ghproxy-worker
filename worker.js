// ==================== Configuration ====================

// Cache TTL settings
const EDGE_CACHE_SECONDS = 2592000;  // 30 days
const SWR_SECONDS = 86400;           // Stale-while-revalidate: 1 day
const BROWSER_CACHE_SECONDS = 3600;  // Browser cache: 1 hour

// Performance optimization
const ENABLE_COMPRESSION = true;      // Enable Brotli/Gzip compression
const ENABLE_EARLY_HINTS = true;      // Enable Early Hints (HTTP 103)
const MAX_RETRIES = 2;                // Max retry attempts for failed requests
const RETRY_DELAY_MS = 500;           // Delay between retries (milliseconds)
const REQUEST_TIMEOUT_MS = 30000;     // Request timeout: 30 seconds

// Supported GitHub domains
const GITHUB_HOSTS = [
    "github.com",
    "raw.githubusercontent.com",
    "gist.github.com",
    "gist.githubusercontent.com"
];

// Fallback mirrors (optional, for degradation)
const FALLBACK_MIRRORS = [
    // Add other GitHub mirror sites here, e.g.:
    // "hub.fastgit.xyz",
    // "github.com.cnpmjs.org"
];

// =======================================================

/**
 * Generate cache version based on current date (YYYYMMDD format)
 * Cache automatically expires daily at UTC 00:00
 * @returns {string} Date-based version string (e.g., "20231223")
 */
function getCacheVersion() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * Extract and normalize ETag from response headers
 * Removes W/ prefix and quotes, truncates to 32 characters
 * @param {Response} response - HTTP response object
 * @returns {string|null} Normalized ETag or null if not present
 */
function extractETag(response) {
    const etag = response.headers.get('etag');
    if (!etag) return null;

    // Normalize: W/"abc123" or "abc123" → abc123
    return etag.replace(/^W\/"|"/g, '').substring(0, 32);
}

/**
 * Determine cache strategy based on request path
 * @param {string} pathname - Request pathname
 * @returns {Object} Cache strategy with edgeTTL, browserTTL, useETag, and description
 */
function getCacheStrategy(pathname) {
    // Dynamic paths (frequently updated): short cache + ETag validation
    if (pathname.includes('/latest/') ||
        pathname.includes('/nightly/') ||
        pathname.includes('/master/') ||
        pathname.includes('/main/')) {
        return {
            edgeTTL: 3600,        // 1 hour
            browserTTL: 300,      // 5 minutes
            useETag: true,
            description: 'dynamic'
        };
    }

    // Versioned paths (immutable): long cache, no ETag needed
    // Matches: /v1.0/, /v1.0.0/, /1.0/, /tag/v1.0/, /releases/download/v1.0/, etc.
    if (/\/v?\d+\.\d+(\.\d+)?\//.test(pathname) ||
        /\/tags?\//.test(pathname) ||
        /\/releases\/download\/v?\d+/.test(pathname)) {
        return {
            edgeTTL: 2592000,     // 30 days
            browserTTL: 86400,    // 1 day
            useETag: false,
            description: 'versioned'
        };
    }

    // Default strategy: medium cache + ETag validation
    return {
        edgeTTL: 86400,       // 1 day
        browserTTL: 3600,     // 1 hour
        useETag: true,
        description: 'default'
    };
}

/**
 * Parse request pathname and extract GitHub target information
 * @param {string} pathname - Request pathname
 * @returns {Object|null} Object with host, path, and fullUrl, or null if invalid
 */
function parseGitHubPath(pathname) {
    // Supported path formats:
    // 1. /github.com/user/repo/...
    // 2. /raw.githubusercontent.com/user/repo/...
    // 3. /user/repo/... (defaults to github.com)

    const parts = pathname.split('/').filter(p => p);
    if (parts.length === 0) {
        return null;
    }

    let githubHost = "github.com";
    let githubPath = pathname;

    // Check if first part is a GitHub domain
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
 * Fetch with retry logic and timeout control
 * Optimized for unreliable network conditions (e.g., China mainland)
 * @param {string} url - Target URL
 * @param {Object} options - Fetch options
 * @param {number} retries - Maximum retry attempts
 * @returns {Promise<Response>} HTTP response
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

            // Don't retry on success or client errors (4xx)
            if (response.ok || (response.status >= 400 && response.status < 500)) {
                return response;
            }

            // Retry on server errors (5xx) or other failures
            if (i < retries) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (i + 1)));
                continue;
            }

            return response;
        } catch (error) {
            // Retry on timeout or network errors
            if (i < retries) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (i + 1)));
                continue;
            }
            throw error;
        }
    }
}

/**
 * Check if content type should be compressed
 * @param {string} contentType - Content-Type header value
 * @returns {boolean} True if content should be compressed
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
 * Generate optimized cache key with version and encoding information
 * @param {string} url - Request URL
 * @param {string} acceptEncoding - Accept-Encoding header value
 * @param {string|null} version - Cache version (ETag or date-based)
 * @returns {string} Cache key URL string
 */
function getOptimalCacheKey(url, acceptEncoding, version = null) {
    const cacheUrl = new URL(url);

    // Use provided version (ETag) or date-based version
    const cacheVersion = version || getCacheVersion();
    cacheUrl.searchParams.set("__v", cacheVersion);

    // Add encoding identifier based on client support
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

        // Parse and validate GitHub path
        const githubInfo = parseGitHubPath(url.pathname);
        if (!githubInfo) {
            return new Response("Invalid path. Usage: /[github.com]/user/repo/path/to/file", {
                status: 400,
                headers: { "Content-Type": "text/plain" }
            });
        }

        // Handle CORS preflight requests
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

        // Only allow GET and HEAD methods
        if (request.method !== "GET" && request.method !== "HEAD") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const startTime = Date.now();

        // Determine cache strategy based on path
        const cacheStrategy = getCacheStrategy(githubInfo.path);

        // Get client's supported encodings
        const acceptEncoding = request.headers.get("accept-encoding") || "";

        // Generate cache key for lookup
        const initialCacheKey = getOptimalCacheKey(request.url, acceptEncoding);
        const cacheKey = new Request(initialCacheKey, { method: "GET" });

        const upstreamUrl = githubInfo.fullUrl + url.search;

        // Send Early Hints to browser (HTTP 103)
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
                        // Early Hints failure doesn't affect main flow
                    }
                })()
            );
        }

        // Check edge cache (Cloudflare's default cache)
        const cache = caches.default;

        // Only cache complete GET requests (not Range requests)
        const isRange = !!request.headers.get("range");
        if (request.method === "GET" && !isRange) {
            const hit = await cache.match(cacheKey);
            if (hit) {
                // Return cached response with updated headers
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

        // Forward necessary headers to upstream
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

        // Fetch from upstream with retry logic
        const upstreamResp = await fetchWithRetry(upstreamUrl, {
            method: request.method,
            headers: passHeaders,
            redirect: "follow",
            cf: {
                // Cloudflare-specific optimizations
                cacheEverything: true,
                cacheTtl: cacheStrategy.edgeTTL,
                cacheTtlByStatus: {
                    "200-299": cacheStrategy.edgeTTL,
                    "404": 60,
                    "500-599": 0
                },

                // Image optimization
                polish: "lossy",
                mirage: true,

                // Minification
                minify: {
                    javascript: true,
                    css: true,
                    html: true
                },

                // Use Cloudflare DNS (1.1.1.1)
                resolveOverride: "1.1.1.1"
            },
        });

        const respHeaders = new Headers(upstreamResp.headers);

        // Extract ETag and regenerate cache key if needed
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

        // Set Cache-Control header
        respHeaders.set(
            "Cache-Control",
            `public, max-age=${cacheStrategy.browserTTL}, s-maxage=${cacheStrategy.edgeTTL}, stale-while-revalidate=${SWR_SECONDS}`
        );

        // Set Vary header for encoding-based caching
        const varyHeaders = ["Accept-Encoding"];
        if (respHeaders.has("Vary")) {
            varyHeaders.push(respHeaders.get("Vary"));
        }
        respHeaders.set("Vary", varyHeaders.join(", "));

        // CORS headers
        respHeaders.set("Access-Control-Allow-Origin", "*");
        respHeaders.set("Access-Control-Expose-Headers", "*");

        // Debug and performance headers
        respHeaders.set("X-Mirror-Version", cacheVersion);
        respHeaders.set("X-Cache-Strategy", cacheStrategy.description);
        respHeaders.set("X-GitHub-Target", upstreamUrl);
        respHeaders.set("X-Cache-Status", "MISS");
        respHeaders.set("X-Response-Time", `${Date.now() - startTime}ms`);

        // Security headers
        respHeaders.set("X-Content-Type-Options", "nosniff");
        respHeaders.set("X-Frame-Options", "SAMEORIGIN");

        // Connection optimization
        respHeaders.set("Connection", "keep-alive");
        respHeaders.set("Keep-Alive", "timeout=60, max=1000");

        const out = new Response(upstreamResp.body, {
            status: upstreamResp.status,
            statusText: upstreamResp.statusText,
            headers: respHeaders,
        });

        // Asynchronously write to cache
        if (request.method === "GET" && upstreamResp.status === 200 && !isRange) {
            ctx.waitUntil(cache.put(finalCacheKey, out.clone()));
        }

        return out;
    },
};
