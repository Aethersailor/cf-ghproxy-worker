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
 * 生成首页 HTML 内容
 * Generate homepage HTML content
 * 
 * @returns {string} HTML 页面内容 | HTML page content
 */
function getHomePage() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="GitHub Proxy - 快速访问 GitHub 资源 | Fast access to GitHub resources">
    <meta name="color-scheme" content="light dark">
    <title>GitHub Proxy - Cloudflare Workers</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* 深色主题 */
        :root {
            --bg-primary: #0a0e27;
            --bg-secondary: #141b3d;
            --bg-card: rgba(20, 27, 61, 0.6);
            --text-primary: #e8eaed;
            --text-secondary: #9aa0a6;
            --accent-primary: #4c9aff;
            --accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --border-color: rgba(255, 255, 255, 0.1);
            --shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            --glow: 0 0 20px rgba(76, 154, 255, 0.3);
            --code-bg: rgba(0, 0, 0, 0.3);
            --code-text: #a8dadc;
            --gradient-1: rgba(102, 126, 234, 0.15);
            --gradient-2: rgba(118, 75, 162, 0.15);
        }
        
        /* 浅色主题 */
        [data-theme="light"] {
            --bg-primary: #f5f7fa;
            --bg-secondary: #ffffff;
            --bg-card: rgba(255, 255, 255, 0.9);
            --text-primary: #1a202c;
            --text-secondary: #4a5568;
            --accent-primary: #3b82f6;
            --accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --border-color: rgba(0, 0, 0, 0.1);
            --shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            --glow: 0 0 20px rgba(59, 130, 246, 0.3);
            --code-bg: rgba(0, 0, 0, 0.05);
            --code-text: #2d3748;
            --gradient-1: rgba(102, 126, 234, 0.08);
            --gradient-2: rgba(118, 75, 162, 0.08);
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 20% 50%, var(--gradient-1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, var(--gradient-2) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
            transition: opacity 0.3s ease;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 2rem; position: relative; z-index: 1; }
        header { text-align: center; margin-bottom: 3rem; animation: fadeInDown 0.6s ease-out; }
        .logo { display: inline-flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .logo-icon {
            width: 56px;
            height: 56px;
            background: var(--accent-gradient);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            box-shadow: var(--glow);
            animation: pulse 2s ease-in-out infinite;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }
        .subtitle { color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 2rem; }
        .card {
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow);
            transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
            animation: fadeInUp 0.6s ease-out;
        }
        .card:hover { transform: translateY(-4px); box-shadow: var(--shadow), var(--glow); }
        .card h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .card h3 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.8rem; color: var(--accent-primary); }
        .format-item {
            background: rgba(76, 154, 255, 0.05);
            border-left: 3px solid var(--accent-primary);
            padding: 1.2rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .format-item:hover { background: rgba(76, 154, 255, 0.1); transform: translateX(4px); }
        .format-title { font-weight: 600; color: var(--accent-primary); margin-bottom: 0.5rem; font-size: 1.05rem; }
        .format-desc { color: var(--text-secondary); margin-bottom: 0.8rem; font-size: 0.95rem; }
        .code-block {
            background: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            color: var(--code-text);
            overflow-x: auto;
            white-space: nowrap;
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }
        .code-block:hover { border-color: var(--accent-primary); }
        .github-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.8rem 1.5rem;
            background: var(--accent-gradient);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: var(--shadow);
        }
        .github-link:hover { transform: translateY(-2px); box-shadow: var(--shadow), var(--glow); }
        footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            margin-top: auto;
            font-size: 0.9rem;
        }
        footer a { color: var(--accent-primary); text-decoration: none; transition: color 0.3s ease; }
        footer a:hover { color: #667eea; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        /* 控制按钮组 */
        .controls {
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 100;
            display: flex;
            gap: 0.75rem;
        }
        .control-btn {
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.6rem 1.2rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .control-btn:hover {
            background: rgba(76, 154, 255, 0.2);
            border-color: var(--accent-primary);
            transform: translateY(-2px);
        }
        .lang-content { display: none; }
        .lang-content.active { display: block; }
        
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            h1 { font-size: 2rem; }
            .card { padding: 1.5rem; }
            .code-block { font-size: 0.8rem; }
            .controls {
                top: 1rem;
                right: 1rem;
                flex-direction: column;
                gap: 0.5rem;
            }
            .control-btn {
                padding: 0.5rem 1rem;
                font-size: 0.85rem;
            }
        }
    </style>
</head>
<body>
    <!-- 控制按钮组 -->
    <div class="controls">
        <button class="control-btn" id="theme-btn" onclick="toggleTheme()" title="切换主题 / Toggle Theme">
            <span id="theme-icon">🌙</span>
            <span id="theme-text">深色</span>
        </button>
        <button class="control-btn" id="lang-btn" onclick="toggleLanguage()" title="切换语言 / Switch Language">
            <span id="lang-text">EN</span>
        </button>
    </div>

    <div class="container">
        <header>
            <div class="logo"><div class="logo-icon">🚀</div></div>
            <h1>GitHub Proxy</h1>
            <p class="subtitle">
                <span class="lang-content active" data-lang="zh">基于 Cloudflare Workers 的 GitHub 加速代理服务</span>
                <span class="lang-content" data-lang="en">GitHub Acceleration Proxy Service Based on Cloudflare Workers</span>
            </p>
        </header>
        <div class="card">
            <h2><span>📖</span>
                <span class="lang-content active" data-lang="zh">项目介绍</span>
                <span class="lang-content" data-lang="en">Introduction</span>
            </h2>
            <p class="lang-content active" data-lang="zh">GitHub Proxy 是一个部署在 Cloudflare Workers 上的轻量级代理服务，旨在解决 GitHub 资源访问速度慢的问题。通过全球 CDN 边缘节点，为您提供快速、稳定的 GitHub 文件下载和访问体验。</p>
            <p class="lang-content" data-lang="en">GitHub Proxy is a lightweight proxy service deployed on Cloudflare Workers, designed to solve the problem of slow GitHub resource access. Through global CDN edge nodes, it provides you with fast and stable GitHub file download and access experience.</p>
        </div>
        <div class="card">
            <h2><span>🛠️</span>
                <span class="lang-content active" data-lang="zh">使用说明</span>
                <span class="lang-content" data-lang="en">Usage Guide</span>
            </h2>
            <p class="lang-content active" data-lang="zh">支持三种 URL 格式，选择任意一种即可：</p>
            <p class="lang-content" data-lang="en">Three URL formats are supported, choose any one:</p>
            <div class="format-item">
                <div class="format-title">
                    <span class="lang-content active" data-lang="zh">方案 1：完整 URL 格式</span>
                    <span class="lang-content" data-lang="en">Format 1: Full URL</span>
                </div>
                <div class="format-desc lang-content active" data-lang="zh">直接在代理域名后面粘贴完整的 GitHub URL</div>
                <div class="format-desc lang-content" data-lang="en">Paste the full GitHub URL directly after the proxy domain</div>
                <div class="code-block">https://your-worker.workers.dev/https://github.com/user/repo/releases/download/v1.0/file.zip</div>
            </div>
            <div class="format-item">
                <div class="format-title">
                    <span class="lang-content active" data-lang="zh">方案 2：域名路径格式</span>
                    <span class="lang-content" data-lang="en">Format 2: Domain Path</span>
                </div>
                <div class="format-desc lang-content active" data-lang="zh">去掉协议头（https://），从域名开始</div>
                <div class="format-desc lang-content" data-lang="en">Remove the protocol (https://), start from the domain</div>
                <div class="code-block">https://your-worker.workers.dev/github.com/user/repo/releases/download/v1.0/file.zip</div>
            </div>
            <div class="format-item">
                <div class="format-title">
                    <span class="lang-content active" data-lang="zh">方案 3：简化路径格式</span>
                    <span class="lang-content" data-lang="en">Format 3: Simplified Path</span>
                </div>
                <div class="format-desc lang-content active" data-lang="zh">只保留用户名/仓库名/路径，最简洁的形式</div>
                <div class="format-desc lang-content" data-lang="en">Keep only username/repo/path, the most concise format</div>
                <div class="code-block">https://your-worker.workers.dev/user/repo/releases/download/v1.0/file.zip</div>
            </div>
            <h3 class="lang-content active" data-lang="zh">支持的域名</h3>
            <h3 class="lang-content" data-lang="en">Supported Domains</h3>
            <ul style="color: var(--text-secondary); margin-left: 2rem; margin-top: 0.5rem;">
                <li>github.com</li>
                <li>raw.githubusercontent.com</li>
                <li>gist.github.com</li>
                <li>gist.githubusercontent.com</li>
            </ul>
        </div>
        <div class="card" style="text-align: center;">
            <a href="https://github.com/Aethersailor/cf-ghproxy-worker" class="github-link" target="_blank" rel="noopener">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                <span class="lang-content active" data-lang="zh">查看源码</span>
                <span class="lang-content" data-lang="en">View Source Code</span>
            </a>
        </div>
    </div>
    <footer>
        <p class="lang-content active" data-lang="zh">
            由 <a href="https://workers.cloudflare.com/" target="_blank" rel="noopener">Cloudflare Workers</a> 强力驱动 | 
            开源项目 <a href="https://github.com/Aethersailor/cf-ghproxy-worker" target="_blank" rel="noopener">cf-ghproxy-worker</a>
        </p>
        <p class="lang-content" data-lang="en">
            Powered by <a href="https://workers.cloudflare.com/" target="_blank" rel="noopener">Cloudflare Workers</a> | 
            Open Source Project <a href="https://github.com/Aethersailor/cf-ghproxy-worker" target="_blank" rel="noopener">cf-ghproxy-worker</a>
        </p>
    </footer>
    <script>
        // 检测系统偏好
        function getSystemPreferences() {
            const systemLang = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            return { systemLang, systemTheme };
        }
        
        // 初始化
        const { systemLang, systemTheme } = getSystemPreferences();
        let currentLang = sessionStorage.getItem('userLang') || systemLang;
        let currentTheme = sessionStorage.getItem('userTheme') || systemTheme;
        
        // 应用主题
        function applyTheme(theme) {
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                document.getElementById('theme-icon').textContent = '☀️';
                document.getElementById('theme-text').textContent = currentLang === 'zh' ? '浅色' : 'Light';
            } else {
                document.documentElement.removeAttribute('data-theme');
                document.getElementById('theme-icon').textContent = '🌙';
                document.getElementById('theme-text').textContent = currentLang === 'zh' ? '深色' : 'Dark';
            }
        }
        
        // 应用语言
        function applyLanguage(lang) {
            document.getElementById('lang-text').textContent = lang === 'zh' ? 'EN' : '中文';
            document.querySelectorAll('.lang-content').forEach(el => {
                if (el.dataset.lang === lang) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
            // 更新主题按钮文字
            applyTheme(currentTheme);
        }
        
        // 切换主题
        function toggleTheme() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            sessionStorage.setItem('userTheme', currentTheme);
            applyTheme(currentTheme);
        }
        
        // 切换语言
        function toggleLanguage() {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            sessionStorage.setItem('userLang', currentLang);
            applyLanguage(currentLang);
        }
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // 只有在用户未手动设置时才跟随系统
            if (!sessionStorage.getItem('userTheme')) {
                currentTheme = e.matches ? 'dark' : 'light';
                applyTheme(currentTheme);
            }
        });
        
        // 初始化应用设置
        applyTheme(currentTheme);
        applyLanguage(currentLang);
    </script>
</body>
</html>`;
}

// ==================== 配置项 Configuration ====================

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
 * 支持三种路径格式（优先级从高到低）：
 * Supports three path formats (priority from high to low):
 * 1. /https://github.com/user/repo/... （完整 URL）| (Full URL)
 * 2. /github.com/user/repo/... （域名路径）| (Domain path)
 * 3. /user/repo/... （简化路径，默认 github.com）| (Simplified path, defaults to github.com)
 * 
 * @param {string} pathname - 请求路径 | Request pathname
 * @returns {Object|null} 包含 host、path 和 fullUrl 的对象，无效时返回 null
 *                        Object with host, path, and fullUrl, or null if invalid
 */
function parseGitHubPath(pathname) {
    // 去除首尾的斜杠 | Remove leading/trailing slashes
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');

    if (!cleanPath) {
        return null;
    }

    // 方案 1：完整 URL 格式（/https://github.com/...）
    // Format 1: Full URL format (/https://github.com/...)
    if (cleanPath.startsWith('https://') || cleanPath.startsWith('http://')) {
        try {
            const targetUrl = new URL(cleanPath);

            // 验证是否为支持的 GitHub 域名 | Verify if it's a supported GitHub domain
            if (GITHUB_HOSTS.includes(targetUrl.hostname)) {
                return {
                    host: targetUrl.hostname,
                    path: targetUrl.pathname + targetUrl.search + targetUrl.hash,
                    fullUrl: targetUrl.href
                };
            }

            // 不支持的域名，返回错误 | Unsupported domain, return null
            return null;
        } catch (e) {
            // URL 解析失败，继续尝试其他格式 | URL parsing failed, try other formats
            // 这里不应该发生，但作为容错处理 | This shouldn't happen, but added for error handling
        }
    }

    // 方案 2 和 3：域名路径或简化路径
    // Format 2 & 3: Domain path or simplified path
    const parts = cleanPath.split('/');
    let githubHost = "github.com";
    let githubPath = '';

    // 检查第一部分是否为 GitHub 域名（方案 2）
    // Check if first part is a GitHub domain (Format 2)
    if (GITHUB_HOSTS.includes(parts[0])) {
        githubHost = parts[0];
        githubPath = '/' + parts.slice(1).join('/');
    } else {
        // 方案 3：默认使用 github.com | Format 3: Default to github.com
        githubPath = '/' + cleanPath;
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
            // 显示首页 | Show homepage
            return new Response(getHomePage(), {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "public, max-age=3600"
                }
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
