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
const MAX_GIT_REDIRECTS = 3;           // Git discovery 最大同源重定向次数 | Maximum same-origin Git discovery redirects

const GIT_ROUTE = Object.freeze({
    ORDINARY: "ordinary",
    DISCOVERY: "git-discovery",
    UPLOAD_PACK: "git-upload-pack",
    FORBIDDEN: "forbidden-git-write",
});

// 支持的 GitHub 域名 | Supported GitHub domains
const GITHUB_HOSTS = [
    "github.com",
    "api.github.com",
    "raw.githubusercontent.com",
    "gist.github.com",
    "gist.githubusercontent.com",
    "github.githubassets.com",
    "codeload.github.com"
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
 * @param {string} domain - 当前访问域名（如 https://github-proxy.asailor.org）| Current domain (e.g., https://github-proxy.asailor.org)
 * @returns {string} HTML 页面内容 | HTML page content
 */
function getHomePage(domain = 'https://your-worker.workers.dev') {
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
        
        /* 转换器卡片样式 */
        .converter-card {
            background: var(--accent-gradient);
            border: none;
            position: relative;
            overflow: hidden;
        }
        .converter-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.1);
            pointer-events: none;
        }
        .converter-card:hover {
            transform: translateY(-4px);
        }
        .converter-card h2 {
            color: white;
            margin-bottom: 1.5rem;
        }
        .input-group {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        .url-input {
            flex: 1;
            padding: 1rem 1.25rem;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            font-family: inherit;
            transition: all 0.3s ease;
        }
        .url-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        .url-input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.15);
        }
        .action-btn {
            padding: 1rem 1.5rem;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-family: inherit;
        }
        .paste-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            white-space: nowrap;
        }
        .paste-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .result-area {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 1rem 1.25rem;
            margin-bottom: 1.25rem;
        }
        .result-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 0.5rem;
        }
        .result-url {
            color: #a8dadc;
            word-break: break-all;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }
        .copy-btn {
            flex: 1;
            min-width: 100px;
            background: rgba(255, 255, 255, 0.15);
            color: white;
        }
        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
        }
        .download-btn {
            flex: 1;
            min-width: 100px;
            background: rgba(16, 185, 129, 0.8);
            color: white;
        }
        .download-btn:hover {
            background: rgba(16, 185, 129, 1);
            transform: translateY(-2px);
        }
        .error-msg {
            color: #fca5a5;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            display: none;
        }
        .toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        .toast.error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
        }
        
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
            .input-group {
                flex-direction: column;
            }
            .paste-btn {
                width: 100%;
            }
            .button-group {
                flex-direction: column;
            }
            .copy-btn, .download-btn {
                width: 100%;
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
        
        <!-- 转换器卡片 -->
        <div class="card converter-card">
            <h2>
                <span>⚡</span>
                <span class="lang-content active" data-lang="zh">快速转换</span>
                <span class="lang-content" data-lang="en">Quick Convert</span>
            </h2>
            
            <!-- 输入区域 -->
            <div class="input-group">
                <input type="text" id="github-url" class="url-input" 
                    placeholder="粘贴 GitHub 链接，例如：https://github.com/user/repo/..."
                    data-placeholder-zh="粘贴 GitHub 链接，例如：https://github.com/user/repo/..."
                    data-placeholder-en="Paste GitHub URL, e.g.: https://github.com/user/repo/...">
                <button class="action-btn paste-btn" onclick="pasteFromClipboard()" title="从剪贴板粘贴">
                    <span>📋</span>
                    <span class="lang-content active" data-lang="zh">粘贴</span>
                    <span class="lang-content" data-lang="en">Paste</span>
                </button>
            </div>
            
            <!-- 错误提示 -->
            <div class="error-msg" id="error-msg">
                <span class="lang-content active" data-lang="zh">⚠️ 请输入有效的 GitHub 链接</span>
                <span class="lang-content" data-lang="en">⚠️ Please enter a valid GitHub URL</span>
            </div>
            
            <!-- 结果预览 -->
            <div class="result-area" id="result-area" style="display: none;">
                <div class="result-label">
                    <span class="lang-content active" data-lang="zh">🚀 加速链接</span>
                    <span class="lang-content" data-lang="en">🚀 Accelerated URL</span>
                </div>
                <div class="result-url" id="result-url"></div>
            </div>
            
            <!-- 操作按钮组 -->
            <div class="button-group" id="button-group" style="display: none;">
                <button class="action-btn copy-btn" onclick="copyUrl()">
                    <span>📋</span>
                    <span class="lang-content active" data-lang="zh">复制链接</span>
                    <span class="lang-content" data-lang="en">Copy URL</span>
                </button>
                <button class="action-btn download-btn" onclick="downloadFile()">
                    <span>📥</span>
                    <span class="lang-content active" data-lang="zh">直接下载</span>
                    <span class="lang-content" data-lang="en">Download</span>
                </button>
                <button class="action-btn copy-btn" onclick="copyWget()">
                    <span>💻</span> wget
                </button>
                <button class="action-btn copy-btn" onclick="copyCurl()">
                    <span>💻</span> curl
                </button>
            </div>
        </div>
        
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
            <p class="lang-content active" data-lang="zh">将 GitHub 链接的域名替换为代理域名即可使用：</p>
            <p class="lang-content" data-lang="en">Replace the GitHub domain with the proxy domain:</p>
            <div class="format-item">
                <div class="format-title">
                    <span class="lang-content active" data-lang="zh">📦 域名路径格式</span>
                    <span class="lang-content" data-lang="en">📦 Domain Path Format</span>
                </div>
                <div class="format-desc lang-content active" data-lang="zh">将 GitHub 链接中的 https:// 去掉，保留域名和路径</div>
                <div class="format-desc lang-content" data-lang="en">Remove https:// from GitHub URL, keep domain and path</div>
                <div class="code-block">${domain}/github.com/user/repo/releases/download/v1.0/file.zip</div>
            </div>
            <div class="format-item">
                <div class="format-title">
                    <span class="lang-content active" data-lang="zh">🔗 完整 URL 格式</span>
                    <span class="lang-content" data-lang="en">🔗 Full URL Format</span>
                </div>
                <div class="format-desc lang-content active" data-lang="zh">直接在代理域名后粘贴完整 GitHub 链接，最直观</div>
                <div class="format-desc lang-content" data-lang="en">Paste the full GitHub URL after the proxy domain, most intuitive</div>
                <div class="code-block">${domain}/https://github.com/user/repo/releases/download/v1.0/file.zip</div>
            </div>
            <h3 class="lang-content active" data-lang="zh">支持的域名</h3>
            <h3 class="lang-content" data-lang="en">Supported Domains</h3>
            <ul style="color: var(--text-secondary); margin-left: 2rem; margin-top: 0.5rem;">
                <li>github.com</li>
                <li>raw.githubusercontent.com</li>
                <li>gist.githubusercontent.com</li>
                <li>gist.github.com</li>
                <li>api.github.com</li>
                <li>codeload.github.com</li>
                <li>github.githubassets.com</li>
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
    
    <!-- Toast 提示 -->
    <div class="toast" id="toast"></div>
    
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
        
        // ==================== 转换器功能 ====================
        
        // 当前代理域名
        const PROXY_DOMAIN = '${domain}';
        
        // 支持的 GitHub 域名
        const SUPPORTED_HOSTS = [
            'github.com', 'raw.githubusercontent.com', 'gist.github.com',
            'gist.githubusercontent.com', 'github.githubassets.com', 
            'codeload.github.com', 'api.github.com'
        ];
        
        // 输入框监听
        document.getElementById('github-url').addEventListener('input', handleInput);
        document.getElementById('github-url').addEventListener('paste', function() {
            setTimeout(handleInput, 0);
        });
        
        // 处理输入
        function handleInput() {
            const input = document.getElementById('github-url').value.trim();
            const resultArea = document.getElementById('result-area');
            const buttonGroup = document.getElementById('button-group');
            const errorMsg = document.getElementById('error-msg');
            
            if (!input) {
                resultArea.style.display = 'none';
                buttonGroup.style.display = 'none';
                errorMsg.style.display = 'none';
                return;
            }
            
            const proxyUrl = convertToProxyUrl(input);
            if (proxyUrl) {
                document.getElementById('result-url').textContent = proxyUrl;
                resultArea.style.display = 'block';
                buttonGroup.style.display = 'flex';
                errorMsg.style.display = 'none';
            } else {
                resultArea.style.display = 'none';
                buttonGroup.style.display = 'none';
                errorMsg.style.display = 'block';
            }
        }
        
        // 转换为代理 URL（统一使用域名路径格式）
        function convertToProxyUrl(url) {
            try {
                // 清理 URL
                url = url.trim();
                
                // 尝试解析为 URL
                if (url.startsWith('https://') || url.startsWith('http://')) {
                    const parsed = new URL(url);
                    if (SUPPORTED_HOSTS.includes(parsed.hostname)) {
                        // 统一使用域名路径格式，清晰明确
                        return PROXY_DOMAIN + '/' + parsed.hostname + parsed.pathname + parsed.search + parsed.hash;
                    }
                }
                return null;
            } catch (e) {
                return null;
            }
        }
        
        // 从剪贴板粘贴
        async function pasteFromClipboard() {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById('github-url').value = text;
                handleInput();
            } catch (e) {
                showToast(currentLang === 'zh' ? '无法访问剪贴板，请手动粘贴' : 'Cannot access clipboard, please paste manually', true);
            }
        }
        
        // 复制加速链接
        function copyUrl() {
            const url = document.getElementById('result-url').textContent;
            copyToClipboard(url, currentLang === 'zh' ? '✅ 链接已复制' : '✅ URL copied');
        }
        
        // 复制 wget 命令
        function copyWget() {
            const url = document.getElementById('result-url').textContent;
            copyToClipboard('wget ' + url, currentLang === 'zh' ? '✅ wget 命令已复制' : '✅ wget command copied');
        }
        
        // 复制 curl 命令
        function copyCurl() {
            const url = document.getElementById('result-url').textContent;
            copyToClipboard('curl -LO ' + url, currentLang === 'zh' ? '✅ curl 命令已复制' : '✅ curl command copied');
        }
        
        // 直接下载
        function downloadFile() {
            const url = document.getElementById('result-url').textContent;
            if (url) {
                window.open(url, '_blank');
            }
        }
        
        // 复制到剪贴板
        async function copyToClipboard(text, message) {
            try {
                await navigator.clipboard.writeText(text);
                showToast(message);
            } catch (e) {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast(message);
                } catch (err) {
                    showToast(currentLang === 'zh' ? '复制失败' : 'Copy failed', true);
                }
                document.body.removeChild(textarea);
            }
        }
        
        // 显示 Toast 提示
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast' + (isError ? ' error' : '');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }
        
        // 更新 placeholder（语言切换时调用）
        function updatePlaceholders() {
            const input = document.getElementById('github-url');
            if (input) {
                input.placeholder = input.getAttribute('data-placeholder-' + currentLang);
            }
        }
        
        // 扩展语言切换函数
        const originalApplyLanguage = applyLanguage;
        applyLanguage = function(lang) {
            originalApplyLanguage(lang);
            updatePlaceholders();
        };
        
        // 初始化 placeholder
        updatePlaceholders();
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
            if (targetUrl.protocol === "https:" &&
                !targetUrl.username &&
                !targetUrl.password &&
                GITHUB_HOSTS.includes(targetUrl.hostname)) {
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
 * 精确识别 Git Smart HTTP 的只读拉取路径。
 * Classify the read-only Git Smart HTTP routes precisely.
 *
 * @param {string} method - HTTP method
 * @param {Object} githubInfo - Parsed GitHub target
 * @param {URLSearchParams} searchParams - Proxy request query
 * @param {Headers} headers - Incoming request headers
 * @returns {string} One of GIT_ROUTE
 */
export function classifyGitRequest(method, githubInfo, searchParams, headers) {
    const normalizedMethod = String(method || "").toUpperCase();
    if (!githubInfo || githubInfo.host !== "github.com") {
        return normalizedMethod === "POST" ? GIT_ROUTE.FORBIDDEN : GIT_ROUTE.ORDINARY;
    }

    let targetPath;
    try {
        targetPath = new URL(githubInfo.fullUrl).pathname;
    } catch {
        return GIT_ROUTE.FORBIDDEN;
    }

    // GitHub accepts repository URLs with or without a trailing `.git`.
    const discoveryPath = /^\/[^/?#]+\/[^/?#]+\/info\/refs$/;
    const uploadPackPath = /^\/[^/?#]+\/[^/?#]+\/git-upload-pack$/;
    const receivePackPath = /^\/[^/?#]+\/[^/?#]+\/git-receive-pack$/;
    const parameters = [...searchParams.entries()];

    if (discoveryPath.test(targetPath)) {
        const uploadPackDiscovery = parameters.length === 1 &&
            parameters[0][0] === "service" &&
            parameters[0][1] === "git-upload-pack";
        return normalizedMethod === "GET" && uploadPackDiscovery
            ? GIT_ROUTE.DISCOVERY
            : GIT_ROUTE.FORBIDDEN;
    }

    if (uploadPackPath.test(targetPath)) {
        const contentType = (headers.get("content-type") || "")
            .split(";", 1)[0]
            .trim()
            .toLowerCase();
        return normalizedMethod === "POST" &&
            parameters.length === 0 &&
            contentType === "application/x-git-upload-pack-request"
            ? GIT_ROUTE.UPLOAD_PACK
            : GIT_ROUTE.FORBIDDEN;
    }

    if (receivePackPath.test(targetPath) ||
        searchParams.get("service") === "git-receive-pack") {
        return GIT_ROUTE.FORBIDDEN;
    }

    return normalizedMethod === "POST" ? GIT_ROUTE.FORBIDDEN : GIT_ROUTE.ORDINARY;
}

function privateGitEnabled(env) {
    return env && env.PRIVATE_GIT_MODE === "passthrough";
}

function gitProxyError(status, english, chinese, extraHeaders = {}) {
    return new Response(`${english}\n${chinese}\n`, {
        status,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "private, no-store",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
            ...extraHeaders,
        },
    });
}

function isRedirectStatus(status) {
    return status === 301 || status === 302 || status === 303 ||
        status === 307 || status === 308;
}

async function fetchOnce(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

async function fetchGitRequest(upstreamUrl, request, passHeaders, route) {
    let currentUrl = new URL(upstreamUrl);
    const method = request.method.toUpperCase();

    for (let redirectCount = 0; redirectCount <= MAX_GIT_REDIRECTS; redirectCount++) {
        let response;
        try {
            response = await fetchOnce(currentUrl.toString(), {
                method,
                headers: passHeaders,
                body: method === "POST" ? request.body : undefined,
                redirect: "manual",
                cf: {
                    cacheEverything: false,
                    cacheTtlByStatus: { "200-599": -1 },
                },
            });
        } catch (error) {
            const detail = error instanceof Error ? error.message.toLowerCase() : "";
            const category = detail.includes("cache")
                ? "cache-option"
                : (detail.includes("mock") || detail.includes("intercept")
                    ? "request-interception"
                    : (detail.includes("body")
                        ? "request-body"
                        : "fetch-error"));
            console.error(JSON.stringify({
                message: "git upstream fetch failed",
                method,
                route,
                error: error instanceof Error ? error.name : "UnknownError",
                category,
            }));
            return gitProxyError(
                502,
                "GitHub Git transport request failed.",
                "GitHub Git 传输请求失败。"
            );
        }

        if (!isRedirectStatus(response.status)) {
            return response;
        }

        if (method === "POST") {
            return gitProxyError(
                502,
                "GitHub redirected a non-replayable git-upload-pack request.",
                "GitHub 重定向了不可重放的 git-upload-pack 请求。"
            );
        }

        const location = response.headers.get("location");
        if (!location || redirectCount === MAX_GIT_REDIRECTS) {
            return gitProxyError(
                502,
                "GitHub Git discovery exceeded the redirect limit.",
                "GitHub Git 发现请求超过重定向上限。"
            );
        }

        const nextUrl = new URL(location, currentUrl);
        const nextInfo = {
            host: nextUrl.hostname,
            path: nextUrl.pathname,
            fullUrl: nextUrl.origin + nextUrl.pathname,
        };
        const nextRoute = classifyGitRequest(
            "GET", nextInfo, nextUrl.searchParams, passHeaders
        );
        if (nextUrl.protocol !== "https:" ||
            nextUrl.hostname !== "github.com" ||
            nextRoute !== route) {
            return gitProxyError(
                502,
                "GitHub Git discovery attempted an unsafe redirect.",
                "GitHub Git 发现请求尝试了不安全的重定向。"
            );
        }
        currentUrl = nextUrl;
    }

    return gitProxyError(
        502,
        "GitHub Git discovery failed.",
        "GitHub Git 发现请求失败。"
    );
}

function gitResponseHeaders(upstreamResponse, authenticated) {
    const headers = new Headers(upstreamResponse.headers);
    for (const name of [
        "age",
        "cdn-cache-control",
        "cloudflare-cdn-cache-control",
        "expires",
        "set-cookie",
        "x-github-target",
    ]) {
        headers.delete(name);
    }
    headers.set("Cache-Control", authenticated ? "private, no-store" : "no-store");
    headers.set("Pragma", "no-cache");
    headers.set("X-Cache-Status", "BYPASS");
    headers.set("X-Cache-Strategy", "git-smart");
    headers.set("X-Content-Type-Options", "nosniff");
    return headers;
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
            const response = await fetchOnce(url, options);

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
            if (url.pathname !== "/") {
                return gitProxyError(
                    400,
                    "Invalid or unsafe GitHub target URL.",
                    "GitHub 目标 URL 无效或不安全。"
                );
            }
            // 显示首页 | Show homepage
            const currentDomain = url.origin; // 获取当前访问域名
            return new Response(getHomePage(currentDomain), {
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

        const gitRoute = classifyGitRequest(
            request.method, githubInfo, url.searchParams, request.headers
        );
        const gitSmart = gitRoute === GIT_ROUTE.DISCOVERY ||
            gitRoute === GIT_ROUTE.UPLOAD_PACK;
        const authorization = request.headers.get("authorization");

        if (gitRoute === GIT_ROUTE.FORBIDDEN) {
            return gitProxyError(
                405,
                "Only read-only git-upload-pack requests are supported.",
                "仅支持只读 git-upload-pack 拉取请求。",
                { "Allow": "GET, HEAD, OPTIONS, POST" }
            );
        }

        if (request.method !== "GET" && request.method !== "HEAD" && !gitSmart) {
            return gitProxyError(
                405,
                "Method Not Allowed.",
                "不允许使用此请求方法。",
                { "Allow": "GET, HEAD, OPTIONS, POST" }
            );
        }

        if (authorization && !gitSmart) {
            return gitProxyError(
                403,
                "Credentials are accepted only for read-only Git pull requests.",
                "凭据仅可用于只读 Git 拉取请求。"
            );
        }

        if (authorization && !privateGitEnabled(env)) {
            return gitProxyError(
                403,
                "Private Git credential forwarding is disabled on this Worker.",
                "此 Worker 未启用私有 Git 凭据转发。"
            );
        }

        if (authorization &&
            !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(authorization)) {
            return gitProxyError(
                400,
                "Private Git pull requires HTTP Basic authentication.",
                "私有 Git 拉取需要使用 HTTP Basic 认证。"
            );
        }

        const startTime = Date.now();

        // 根据路径确定缓存策略 | Determine cache strategy based on path
        const cacheStrategy = getCacheStrategy(githubInfo.path);

        // 获取客户端支持的编码 | Get client's supported encodings
        const acceptEncoding = request.headers.get("accept-encoding") || "";

        // Git Smart HTTP and credential-bearing requests must never use a
        // shared cache key. Ordinary downloads preserve the existing cache.
        const initialCacheKey = gitSmart
            ? null
            : getOptimalCacheKey(request.url, acceptEncoding);
        const cacheKey = initialCacheKey
            ? new Request(initialCacheKey, { method: "GET" })
            : null;

        const upstreamUrl = githubInfo.fullUrl + url.search;

        // 向浏览器发送 Early Hints (HTTP 103) | Send Early Hints to browser (HTTP 103)
        if (ENABLE_EARLY_HINTS && request.method === "GET" && !gitSmart) {
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
        if (request.method === "GET" && !isRange && !gitSmart && cacheKey) {
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

        if (gitSmart) {
            for (const h of ["git-protocol", "content-type"]) {
                const v = request.headers.get(h);
                if (v) passHeaders.set(h, v);
            }
            if (authorization) {
                passHeaders.set("authorization", authorization);
            }
        }

        // 使用重试逻辑从上游获取 | Fetch from upstream with retry logic
        const upstreamResp = gitSmart
            ? await fetchGitRequest(
                upstreamUrl, request, passHeaders, gitRoute
            )
            : await fetchWithRetry(upstreamUrl, {
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

        if (gitSmart) {
            return new Response(upstreamResp.body, {
                status: upstreamResp.status,
                statusText: upstreamResp.statusText,
                headers: gitResponseHeaders(upstreamResp, Boolean(authorization)),
            });
        }

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
