# GitHub 加速镜像 | GitHub Acceleration Proxy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

基于 Cloudflare Workers 的高性能 GitHub 文件加速代理服务。

A high-performance GitHub file acceleration proxy service based on Cloudflare Workers.

[English](#english) | [中文](#中文)

Demo: https://github-proxy.asailor.org

---

## 中文

### ✨ 核心特性

- 🚀 **零配置部署** - 无需 KV 存储，一键即用
- ⚡ **智能缓存** - 多层缓存策略，根据路径类型自动调整 TTL
- 🌐 **全域名支持** - 支持 `github.com`、`raw.githubusercontent.com`、`gist.github.com` 等
- 📦 **完整功能** - 断点续传、CORS 支持、ETag 验证
- 🔧 **可靠性优化** - 重试机制、超时控制、连接优化
- 🎨 **精美首页** - 中英双语界面，支持三种 URL 格式说明

### 🎨 缓存策略

系统根据文件路径自动选择最优缓存策略：

| 路径类型 | 示例 | Edge 缓存 | 浏览器缓存 | 版本控制 |
|---------|------|-----------|-----------|----------|
| **动态内容** | `/latest/`, `/main/`, `/nightly/` | 1 小时 | 5 分钟 | ETag |
| **固定版本** | `/v1.0/`, `/tags/`, `/releases/download/v1.0/` | 30 天 | 1 天 | 日期 |
| **普通路径** | 其他所有路径 | 1 天 | 1 小时 | ETag |

### 🚀 快速部署

#### 方法一：一键部署（推荐）

点击下方按钮，自动部署到 Cloudflare Workers：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)

**步骤：**
1. 点击上方按钮
2. 登录 Cloudflare 账号
3. 授权 GitHub 仓库访问
4. 点击 "Deploy" 按钮
5. 等待部署完成（约 1-2 分钟）
6. 获取 Worker URL（格式：`https://your-worker.workers.dev`）

#### 方法二：手动部署

**前置要求：**
- Cloudflare 账号（[免费注册](https://dash.cloudflare.com/sign-up)）
- （建议）托管到 Cloudflare 的域名 - 用于绑定自定义域名，避免 `*.workers.dev` 域名被封锁的风险

**部署步骤：**

1. **登录 Cloudflare Dashboard**
   ```
   访问：https://dash.cloudflare.com/
   ```

2. **创建 Worker**
   - 点击左侧菜单 `Workers & Pages`
   - 点击 `Create Application`
   - 选择 `Create Worker`
   - 输入 Worker 名称（例如：`github-proxy`）
   - 点击 `Deploy`

3. **部署代码**
   - 点击 `Edit Code` 按钮
   - 删除默认代码
   - 复制 [`worker.js`](worker.js) 的完整内容
   - 粘贴到编辑器
   - 点击右上角 `Save and Deploy`

4. **绑定自定义域名（可选）**
   - 在 Worker 详情页，点击 `Settings` → `Triggers`
   - 点击 `Add Custom Domain`
   - 输入域名（例如：`gh.example.com`）
   - 等待 DNS 配置生效（通常 1-5 分钟）

5. **完成部署** ✅
   - 默认 URL：`https://your-worker.workers.dev`
   - 自定义域名：`https://gh.example.com`（如已配置）

#### 方法三：自动部署（推荐用于持续维护）

配置 GitHub Actions 实现代码 push 后自动部署，保持 Worker 与仓库同步。

**⚠️ 注意**：一键部署只在首次点击时生效，后续 GitHub 代码更新不会自动同步到 Worker。如需持续维护，建议配置自动部署。

**配置步骤**：查看 [自动部署配置指南](DEPLOYMENT.md#中文)


### 📖 使用指南

#### 基本用法

将 GitHub URL 的域名替换为您的 Worker 域名：

```bash
# 原始 URL
https://github.com/torvalds/linux/archive/refs/tags/v6.6.tar.gz

# 加速 URL（使用 Workers 域名）
https://your-worker.workers.dev/torvalds/linux/archive/refs/tags/v6.6.tar.gz

# 加速 URL（使用自定义域名）
https://gh.example.com/torvalds/linux/archive/refs/tags/v6.6.tar.gz
```

#### 支持的路径格式

**1. 简洁格式（推荐）**
```
https://your-worker.workers.dev/user/repo/releases/download/v1.0/file.zip
https://your-worker.workers.dev/user/repo/archive/refs/tags/v1.0.tar.gz
```

**2. 完整格式（显式指定域名）**
```
https://your-worker.workers.dev/github.com/user/repo/releases/download/v1.0/file.zip
https://your-worker.workers.dev/raw.githubusercontent.com/user/repo/main/script.sh
https://your-worker.workers.dev/gist.githubusercontent.com/user/gist-id/raw/file.txt
```

#### 实际使用示例

**下载 Release 文件**
```bash
# 下载 Clash Meta 核心
wget https://your-worker.workers.dev/MetaCubeX/mihomo/releases/download/v1.18.0/mihomo-linux-amd64

# 下载 Node.js 源码
curl -O https://your-worker.workers.dev/nodejs/node/archive/refs/tags/v20.10.0.tar.gz
```

**获取 Raw 文件**
```bash
# 获取脚本文件
curl https://your-worker.workers.dev/raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# 获取配置文件
wget https://your-worker.workers.dev/raw.githubusercontent.com/torvalds/linux/master/.gitignore
```

**在脚本中使用**
```bash
#!/bin/bash

# 设置镜像地址
GITHUB_PROXY="https://your-worker.workers.dev"

# 下载文件
download_file() {
    local repo=$1
    local tag=$2
    local filename=$3
    
    wget "${GITHUB_PROXY}/${repo}/releases/download/${tag}/${filename}"
}

# 使用示例
download_file "cli/cli" "v2.40.0" "gh_2.40.0_linux_amd64.tar.gz"
```

**Git Clone 加速**
```bash
# 方法1: 使用 git config
git config --global url."https://your-worker.workers.dev/".insteadOf "https://github.com/"
git clone https://github.com/torvalds/linux.git

# 方法2: 直接替换 URL
git clone https://your-worker.workers.dev/torvalds/linux.git
```

### ⚙️ 配置说明

在 `worker.js` 中可自定义以下参数：

#### 缓存配置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `EDGE_CACHE_SECONDS` | `2592000` (30天) | 边缘缓存 TTL |
| `SWR_SECONDS` | `86400` (1天) | 过期后仍可用时间 |
| `BROWSER_CACHE_SECONDS` | `3600` (1小时) | 浏览器缓存 TTL |

#### 性能配置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `ENABLE_COMPRESSION` | `true` | 启用 Brotli/Gzip 压缩 |
| `ENABLE_EARLY_HINTS` | `true` | 启用 Early Hints (HTTP 103) |
| `MAX_RETRIES` | `2` | 请求失败最大重试次数 |
| `RETRY_DELAY_MS` | `500` | 重试间隔（毫秒） |
| `REQUEST_TIMEOUT_MS` | `30000` | 请求超时时间（毫秒） |

### 🔍 性能优化

#### 网络层优化
- ✅ **HTTP/3 & HTTP/2** - 多路复用，减少连接开销
- ✅ **Early Hints** - 提前预连接，降低首字节时间
- ✅ **Keep-Alive** - 连接复用，减少 TCP 握手
- ✅ **Smart DNS** - 使用 Cloudflare DNS (1.1.1.1)

#### 缓存优化
- ✅ **多层缓存** - 浏览器 → Worker → Edge 三层缓存
- ✅ **智能失效** - 基于 ETag 和日期的自动版本管理
- ✅ **Vary 支持** - 基于编码类型的缓存变体
- ✅ **SWR 机制** - 后台异步更新，减少阻塞

#### 可靠性优化
- ✅ **智能重试** - 指数退避算法，避免雪崩
- ✅ **超时控制** - 30 秒超时，避免长时间等待
- ✅ **错误降级** - 支持配置备用镜像源

#### 内容优化
- ✅ **自动压缩** - HTML/CSS/JS Minify
- ✅ **图片优化** - Polish 有损压缩
- ✅ **智能加载** - Mirage 自适应图片

### 📊 响应头说明

Worker 会添加以下调试头：

| 响应头 | 说明 | 示例值 |
|--------|------|--------|
| `X-Cache-Status` | 缓存命中状态 | `HIT` / `MISS` |
| `X-Cache-Strategy` | 缓存策略类型 | `dynamic` / `versioned` / `default` |
| `X-Mirror-Version` | 缓存版本号 | `20231223` / `abc123...` (ETag) |
| `X-GitHub-Target` | 实际请求的 GitHub URL | `https://github.com/...` |
| `X-Response-Time` | 响应时间 | `1234ms` |

**调试示例：**
```bash
curl -I https://your-worker.workers.dev/cli/cli/releases/download/v2.40.0/gh_2.40.0_linux_amd64.tar.gz

HTTP/2 200
x-cache-status: HIT
x-cache-strategy: versioned
x-mirror-version: 20231223
x-response-time: 45ms
```

### ⚠️ 注意事项

1. **限制说明**
   - 免费版每日 100,000 次请求限制
   - 单文件大小限制 100MB（Cloudflare 限制）
   - CPU 执行时间 50ms（免费版）/ 无限制（付费版）

2. **缓存行为**
   - 浏览器缓存：根据策略自动调整（5分钟 - 1天）
   - 边缘缓存：根据策略自动调整（1小时 - 30天）
   - 版本号：每天 UTC 00:00 自动更新

3. **使用建议**
   - 建议先测试小文件，确认正常后再用于大文件
   - 如需频繁访问，建议绑定自定义域名
   - 大量请求建议升级到 Workers Paid 计划

4. **清除缓存**
   - Dashboard：`Caching` → `Configuration` → `Purge Cache`
   - API：使用 Cloudflare API 按 URL 清除
   - 自动：等待缓存过期或版本号更新

### 🔧 故障排查

**问题：404 Not Found**
```
检查路径格式是否正确
确认 GitHub 上该文件确实存在
查看 X-GitHub-Target 头确认目标 URL
```

**问题：缓存未命中（X-Cache-Status: MISS）**
```
首次请求必定 MISS，再次请求应为 HIT
检查是否为动态路径（/latest/ 等）
查看 X-Cache-Strategy 确认策略类型
```

**问题：下载速度慢**
```
检查是否使用了 Cloudflare CDN 节点
确认本地网络到 Cloudflare 的连接质量
查看 X-Response-Time 分析延迟来源
```

### 📝 更新日志

查看 [Releases](https://github.com/Aethersailor/cf-ghproxy-worker/releases) 获取版本历史。

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

**贡献指南：**
1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 📄 许可证

本项目采用 [GNU General Public License v3.0](LICENSE) 许可证。

### 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 强大的边缘计算平台
- [GitHub](https://github.com/) - 全球最大的代码托管平台

---

## English

### ✨ Key Features

- 🚀 **Zero Configuration** - No KV storage, one-click deployment
- ⚡ **Intelligent Caching** - Multi-layer caching strategy with automatic TTL adjustment
- 🌐 **Full Domain Support** - Supports `github.com`, `raw.githubusercontent.com`, `gist.github.com`, etc.
- 📦 **Complete Features** - Resumable downloads, CORS support, ETag validation
- 🔧 **Reliability** - Retry mechanism, timeout control, connection optimization
- 🎨 **Beautiful Homepage** - Bilingual interface with three URL format examples

### 🎨 Caching Strategy

The system automatically selects the optimal caching strategy based on file paths:

| Path Type | Example | Edge Cache | Browser Cache | Version Control |
|-----------|---------|------------|---------------|-----------------|
| **Dynamic Content** | `/latest/`, `/main/`, `/nightly/` | 1 hour | 5 minutes | ETag |
| **Versioned Paths** | `/v1.0/`, `/tags/`, `/releases/download/v1.0/` | 30 days | 1 day | Date |
| **Regular Paths** | All other paths | 1 day | 1 hour | ETag |

### 🚀 Quick Deployment

#### Method 1: One-Click Deploy (Recommended)

Click the button below to automatically deploy to Cloudflare Workers:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)

**Steps:**
1. Click the button above
2. Log in to your Cloudflare account
3. Authorize GitHub repository access
4. Click the "Deploy" button
5. Wait for deployment to complete (about 1-2 minutes)
6. Get your Worker URL (format: `https://your-worker.workers.dev`)

#### Method 2: Manual Deployment

**Prerequisites:**
- Cloudflare account ([Free Sign Up](https://dash.cloudflare.com/sign-up))
- (Recommended) A domain hosted on Cloudflare - For binding custom domain to avoid `*.workers.dev` blocking risks

**Deployment Steps:**

1. **Log in to Cloudflare Dashboard**
   ```
   Visit: https://dash.cloudflare.com/
   ```

2. **Create Worker**
   - Click `Workers & Pages` in the left menu
   - Click `Create Application`
   - Select `Create Worker`
   - Enter Worker name (e.g., `github-proxy`)
   - Click `Deploy`

3. **Deploy Code**
   - Click the `Edit Code` button
   - Delete the default code
   - Copy the complete content of [`worker.js`](worker.js)
   - Paste into the editor
   - Click `Save and Deploy` in the top right

4. **Bind Custom Domain (Optional)**
   - On the Worker details page, click `Settings` → `Triggers`
   - Click `Add Custom Domain`
   - Enter domain (e.g., `gh.example.com`)
   - Wait for DNS configuration to take effect (usually 1-5 minutes)

5. **Deployment Complete** ✅
   - Default URL: `https://your-worker.workers.dev`
   - Custom domain: `https://gh.example.com` (if configured)

#### Method 3: Auto-Deployment (Recommended for Ongoing Maintenance)

Configure GitHub Actions to automatically deploy when code is pushed, keeping your Worker synchronized with the repository.

**⚠️ Note**: One-click deploy only works when the button is clicked. GitHub code updates won't automatically sync to the Worker. For ongoing maintenance, auto-deployment is recommended.

**Configuration Steps**: See [Auto-Deployment Configuration Guide](DEPLOYMENT.md#english)


### 📖 Usage Guide

#### Basic Usage

Replace the domain in GitHub URLs with your Worker domain:

```bash
# Original URL
https://github.com/torvalds/linux/archive/refs/tags/v6.6.tar.gz

# Accelerated URL (using Workers domain)
https://your-worker.workers.dev/torvalds/linux/archive/refs/tags/v6.6.tar.gz

# Accelerated URL (using custom domain)
https://gh.example.com/torvalds/linux/archive/refs/tags/v6.6.tar.gz
```

#### Supported Path Formats

**1. Simplified Format (Recommended)**
```
https://your-worker.workers.dev/user/repo/releases/download/v1.0/file.zip
https://your-worker.workers.dev/user/repo/archive/refs/tags/v1.0.tar.gz
```

**2. Full Format (Explicit domain)**
```
https://your-worker.workers.dev/github.com/user/repo/releases/download/v1.0/file.zip
https://your-worker.workers.dev/raw.githubusercontent.com/user/repo/main/script.sh
https://your-worker.workers.dev/gist.githubusercontent.com/user/gist-id/raw/file.txt
```

#### Practical Examples

**Download Release Files**
```bash
# Download Clash Meta core
wget https://your-worker.workers.dev/MetaCubeX/mihomo/releases/download/v1.18.0/mihomo-linux-amd64

# Download Node.js source code
curl -O https://your-worker.workers.dev/nodejs/node/archive/refs/tags/v20.10.0.tar.gz
```

**Get Raw Files**
```bash
# Get script file
curl https://your-worker.workers.dev/raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# Get configuration file
wget https://your-worker.workers.dev/raw.githubusercontent.com/torvalds/linux/master/.gitignore
```

**Use in Scripts**
```bash
#!/bin/bash

# Set proxy address
GITHUB_PROXY="https://your-worker.workers.dev"

# Download file
download_file() {
    local repo=$1
    local tag=$2
    local filename=$3
    
    wget "${GITHUB_PROXY}/${repo}/releases/download/${tag}/${filename}"
}

# Usage example
download_file "cli/cli" "v2.40.0" "gh_2.40.0_linux_amd64.tar.gz"
```

**Git Clone Acceleration**
```bash
# Method 1: Use git config
git config --global url."https://your-worker.workers.dev/".insteadOf "https://github.com/"
git clone https://github.com/torvalds/linux.git

# Method 2: Direct URL replacement
git clone https://your-worker.workers.dev/torvalds/linux.git
```

### ⚙️ Configuration

Customize the following parameters in `worker.js`:

#### Cache Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `EDGE_CACHE_SECONDS` | `2592000` (30 days) | Edge cache TTL |
| `SWR_SECONDS` | `86400` (1 day) | Stale-while-revalidate duration |
| `BROWSER_CACHE_SECONDS` | `3600` (1 hour) | Browser cache TTL |

#### Performance Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `ENABLE_COMPRESSION` | `true` | Enable Brotli/Gzip compression |
| `ENABLE_EARLY_HINTS` | `true` | Enable Early Hints (HTTP 103) |
| `MAX_RETRIES` | `2` | Maximum retry attempts |
| `RETRY_DELAY_MS` | `500` | Retry interval (milliseconds) |
| `REQUEST_TIMEOUT_MS` | `30000` | Request timeout (milliseconds) |

### 🔍 Performance Optimization

#### Network Layer
- ✅ **HTTP/3 & HTTP/2** - Multiplexing, reduced connection overhead
- ✅ **Early Hints** - Pre-connect, lower TTFB
- ✅ **Keep-Alive** - Connection reuse, reduced TCP handshake
- ✅ **Smart DNS** - Using Cloudflare DNS (1.1.1.1)

#### Caching
- ✅ **Multi-Layer Cache** - Browser → Worker → Edge three-tier caching
- ✅ **Smart Invalidation** - Automatic version management based on ETag and date
- ✅ **Vary Support** - Cache variants based on encoding type
- ✅ **SWR Mechanism** - Background async update, reduced blocking

#### Reliability
- ✅ **Smart Retry** - Exponential backoff algorithm
- ✅ **Timeout Control** - 30-second timeout
- ✅ **Error Fallback** - Support for fallback mirror sources

#### Content Optimization
- ✅ **Auto Minify** - HTML/CSS/JS minification
- ✅ **Image Optimization** - Polish lossy compression
- ✅ **Smart Loading** - Mirage adaptive images

### 📊 Response Headers

The Worker adds the following debug headers:

| Header | Description | Example Value |
|--------|-------------|---------------|
| `X-Cache-Status` | Cache hit status | `HIT` / `MISS` |
| `X-Cache-Strategy` | Cache strategy type | `dynamic` / `versioned` / `default` |
| `X-Mirror-Version` | Cache version | `20231223` / `abc123...` (ETag) |
| `X-GitHub-Target` | Actual GitHub URL requested | `https://github.com/...` |
| `X-Response-Time` | Response time | `1234ms` |

**Debug Example:**
```bash
curl -I https://your-worker.workers.dev/cli/cli/releases/download/v2.40.0/gh_2.40.0_linux_amd64.tar.gz

HTTP/2 200
x-cache-status: HIT
x-cache-strategy: versioned
x-mirror-version: 20231223
x-response-time: 45ms
```

### ⚠️ Important Notes

1. **Limitations**
   - Free tier: 100,000 requests per day
   - Single file size limit: 100MB (Cloudflare limitation)
   - CPU execution time: 50ms (free) / unlimited (paid)

2. **Cache Behavior**
   - Browser cache: Auto-adjusted based on strategy (5min - 1day)
   - Edge cache: Auto-adjusted based on strategy (1hour - 30days)
   - Version number: Auto-updated daily at UTC 00:00

3. **Recommendations**
   - Test with small files first before using for large files
   - Bind custom domain for frequent access
   - Upgrade to Workers Paid plan for high traffic

4. **Cache Purging**
   - Dashboard: `Caching` → `Configuration` → `Purge Cache`
   - API: Use Cloudflare API to purge by URL
   - Auto: Wait for cache expiration or version update

### 🔧 Troubleshooting

**Issue: 404 Not Found**
```
Check if path format is correct
Verify the file exists on GitHub
Check X-GitHub-Target header for target URL
```

**Issue: Cache Miss (X-Cache-Status: MISS)**
```
First request must be MISS, subsequent should be HIT
Check if it's a dynamic path (/latest/, etc.)
Review X-Cache-Strategy to confirm strategy type
```

**Issue: Slow Download Speed**
```
Check if using Cloudflare CDN nodes
Verify local network connection quality to Cloudflare
Review X-Response-Time to analyze latency source
```

### 📝 Changelog

See [Releases](https://github.com/Aethersailor/cf-ghproxy-worker/releases) for version history.

### 🤝 Contributing

Issues and Pull Requests are welcome!

**Contribution Guidelines:**
1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

### 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) - Powerful edge computing platform
- [GitHub](https://github.com/) - The world's largest code hosting platform

---

<p align="center">Made with ❤️ by <a href="https://github.com/Aethersailor">Aethersailor</a></p>
