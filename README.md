<div align="center">

# 🚀 GitHub Proxy

**基于 Cloudflare Workers 的高性能 GitHub 文件加速代理**

**High-Performance GitHub Acceleration Proxy on Cloudflare Workers**

<br/>

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Maintained](https://img.shields.io/badge/Maintained-Yes-green.svg)](https://github.com/Aethersailor/cf-ghproxy-worker/commits/main)
[![GitHub Stars](https://img.shields.io/github/stars/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/issues)
[![Last Commit](https://img.shields.io/github/last-commit/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/commits/main)

<br/>

**[English](#english)** | **[中文](#中文)**

</div>

<br/>

---

## 中文

### 📚 目录

- [✨ 核心特性](#-核心特性)
- [🎨 界面特性](#-界面特性)
- [📊 缓存策略](#-缓存策略)
- [🚀 快速部署](#-快速部署)
- [📖 使用指南](#-使用指南)
- [⚙️ 配置说明](#️-配置说明)
- [🔍 性能优化](#-性能优化)
- [📊 响应头说明](#-响应头说明)
- [⚠️ 注意事项](#️-注意事项)
- [🔧 故障排查](#-故障排查)
- [🤝 贡献](#-贡献)

<br/>

### ✨ 核心特性

<table>
<tr>
<td align="center" width="33%">
<h4>🚀 零配置部署</h4>
<p>无需 KV 存储，一键即用<br/>30 秒完成部署</p>
</td>
<td align="center" width="33%">
<h4>⚡ 智能缓存</h4>
<p>多层缓存策略<br/>根据路径类型自动调整 TTL</p>
</td>
<td align="center" width="33%">
<h4>🌐 全域名支持</h4>
<p>支持 github.com 等<br/>所有 GitHub 相关域名</p>
</td>
</tr>
<tr>
<td align="center" width="33%">
<h4>📦 完整功能</h4>
<p>断点续传、CORS 支持<br/>ETag 验证</p>
</td>
<td align="center" width="33%">
<h4>🔧 高可靠性</h4>
<p>重试机制、超时控制<br/>连接优化</p>
</td>
<td align="center" width="33%">
<h4>🎨 精美首页</h4>
<p>中英双语界面<br/>支持深色/浅色主题</p>
</td>
</tr>
</table>

<br/>

### 🎨 界面特性

- 🌓 **智能主题** - 自动跟随系统浅色/深色主题，支持手动切换
- 🌍 **自动语言检测** - 根据浏览器语言自动选择中文/英文界面
- 🔄 **实时主题同步** - 系统主题变化时自动切换，无需刷新
- 📋 **域名自动替换** - 示例 URL 自动显示当前访问域名，即用即改
- 🎯 **状态记忆** - 使用 sessionStorage 保存用户偏好，刷新后恢复系统设置

<br/>

### 📊 缓存策略

系统根据文件路径自动选择最优缓存策略：

| 路径类型 | 示例 | Edge 缓存 | 浏览器缓存 | 版本控制 |
|:--------:|:-----|:---------:|:----------:|:--------:|
| **动态内容** | `/latest/`, `/main/`, `/nightly/` | 1 小时 | 5 分钟 | ETag |
| **固定版本** | `/v1.0/`, `/tags/`, `/releases/download/v1.0/` | 30 天 | 1 天 | 日期 |
| **普通路径** | 其他所有路径 | 1 天 | 1 小时 | ETag |

<br/>

### 🚀 快速部署

> 💡 **30 秒快速上手**
>
> 1. 点击上方 **Deploy to Cloudflare Workers** 按钮
> 2. 登录 Cloudflare 并授权 GitHub 仓库访问
> 3. 点击 **Deploy** 按钮，等待 1-2 分钟
> 4. 获取 Worker URL：`https://your-worker.workers.dev`
> 5. 将 GitHub URL 的域名替换为你的 Worker 域名即可使用！

<br/>

#### 方法一：一键部署（推荐）

点击下方按钮，自动部署到 Cloudflare Workers：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)

<br/>

#### 方法二：手动部署

<details>
<summary><b>📖 点击展开详细步骤</b></summary>

<br/>

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

</details>

<br/>

#### 方法三：自动部署（推荐用于持续维护）

配置 GitHub Actions 实现代码 push 后自动部署，保持 Worker 与仓库同步。

> ⚠️ **注意**：一键部署只在首次点击时生效，后续 GitHub 代码更新不会自动同步到 Worker。如需持续维护，建议配置自动部署。

📖 **配置步骤**：查看 [自动部署配置指南](DEPLOYMENT.md#中文)

<br/>

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

<br/>

#### 支持的路径格式

| 格式 | 说明 | 示例 |
|:----:|:-----|:-----|
| **简洁格式** | 推荐，最常用 | `https://proxy.dev/user/repo/releases/download/v1.0/file.zip` |
| **完整格式** | 显式指定域名 | `https://proxy.dev/github.com/user/repo/...` |
| **Raw 格式** | 获取原始文件 | `https://proxy.dev/raw.githubusercontent.com/user/repo/main/file` |

<br/>

#### 实际使用示例

<details>
<summary><b>📥 下载 Release 文件</b></summary>

```bash
# 下载 Clash Meta 核心
wget https://your-worker.workers.dev/MetaCubeX/mihomo/releases/download/v1.18.0/mihomo-linux-amd64

# 下载 Node.js 源码
curl -O https://your-worker.workers.dev/nodejs/node/archive/refs/tags/v20.10.0.tar.gz
```

</details>

<details>
<summary><b>📄 获取 Raw 文件</b></summary>

```bash
# 获取脚本文件
curl https://your-worker.workers.dev/raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# 获取配置文件
wget https://your-worker.workers.dev/raw.githubusercontent.com/torvalds/linux/master/.gitignore
```

</details>

<details>
<summary><b>📝 在脚本中使用</b></summary>

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

</details>

<details>
<summary><b>🔄 Git Clone 加速</b></summary>

```bash
# 方法1: 使用 git config
git config --global url."https://your-worker.workers.dev/".insteadOf "https://github.com/"
git clone https://github.com/torvalds/linux.git

# 方法2: 直接替换 URL
git clone https://your-worker.workers.dev/torvalds/linux.git
```

</details>

<br/>

### ⚙️ 配置说明

在 `worker.js` 中可自定义以下参数：

#### 缓存配置

| 参数 | 默认值 | 说明 |
|:-----|:------:|:-----|
| `EDGE_CACHE_SECONDS` | `2592000` (30天) | 边缘缓存 TTL |
| `SWR_SECONDS` | `86400` (1天) | 过期后仍可用时间 |
| `BROWSER_CACHE_SECONDS` | `3600` (1小时) | 浏览器缓存 TTL |

#### 性能配置

| 参数 | 默认值 | 说明 |
|:-----|:------:|:-----|
| `ENABLE_COMPRESSION` | `true` | 启用 Brotli/Gzip 压缩 |
| `ENABLE_EARLY_HINTS` | `true` | 启用 Early Hints (HTTP 103) |
| `MAX_RETRIES` | `2` | 请求失败最大重试次数 |
| `RETRY_DELAY_MS` | `500` | 重试间隔（毫秒） |
| `REQUEST_TIMEOUT_MS` | `30000` | 请求超时时间（毫秒） |

<br/>

### 🔍 性能优化

<table>
<tr>
<td width="50%">

#### 🌐 网络层优化

- ✅ **HTTP/3 & HTTP/2** - 多路复用，减少连接开销
- ✅ **Early Hints** - 提前预连接，降低首字节时间
- ✅ **Keep-Alive** - 连接复用，减少 TCP 握手
- ✅ **Smart DNS** - 使用 Cloudflare DNS (1.1.1.1)

</td>
<td width="50%">

#### 💾 缓存优化

- ✅ **多层缓存** - 浏览器 → Worker → Edge 三层缓存
- ✅ **智能失效** - 基于 ETag 和日期的自动版本管理
- ✅ **Vary 支持** - 基于编码类型的缓存变体
- ✅ **SWR 机制** - 后台异步更新，减少阻塞

</td>
</tr>
<tr>
<td width="50%">

#### 🛡️ 可靠性优化

- ✅ **智能重试** - 指数退避算法，避免雪崩
- ✅ **超时控制** - 30 秒超时，避免长时间等待
- ✅ **错误降级** - 支持配置备用镜像源

</td>
<td width="50%">

#### 📦 内容优化

- ✅ **自动压缩** - HTML/CSS/JS Minify
- ✅ **图片优化** - Polish 有损压缩
- ✅ **智能加载** - Mirage 自适应图片

</td>
</tr>
</table>

<br/>

### 📊 响应头说明

Worker 会添加以下调试头：

| 响应头 | 说明 | 示例值 |
|:-------|:-----|:-------|
| `X-Cache-Status` | 缓存命中状态 | `HIT` / `MISS` |
| `X-Cache-Strategy` | 缓存策略类型 | `dynamic` / `versioned` / `default` |
| `X-Mirror-Version` | 缓存版本号 | `20231223` / `abc123...` (ETag) |
| `X-GitHub-Target` | 实际请求的 GitHub URL | `https://github.com/...` |
| `X-Response-Time` | 响应时间 | `1234ms` |

<details>
<summary><b>🔍 调试示例</b></summary>

```bash
curl -I https://your-worker.workers.dev/cli/cli/releases/download/v2.40.0/gh_2.40.0_linux_amd64.tar.gz

HTTP/2 200
x-cache-status: HIT
x-cache-strategy: versioned
x-mirror-version: 20231223
x-response-time: 45ms
```

</details>

<br/>

### ⚠️ 注意事项

> **📌 限制说明**
>
> - 免费版每日 100,000 次请求限制
> - 单文件大小限制 100MB（Cloudflare 限制）
> - CPU 执行时间 50ms（免费版）/ 无限制（付费版）

> **💾 缓存行为**
>
> - 浏览器缓存：根据策略自动调整（5分钟 - 1天）
> - 边缘缓存：根据策略自动调整（1小时 - 30天）
> - 版本号：每天 UTC 00:00 自动更新

> **💡 使用建议**
>
> - 建议先测试小文件，确认正常后再用于大文件
> - 如需频繁访问，建议绑定自定义域名
> - 大量请求建议升级到 Workers Paid 计划

> **🗑️ 清除缓存**
>
> - Dashboard：`Caching` → `Configuration` → `Purge Cache`
> - API：使用 Cloudflare API 按 URL 清除
> - 自动：等待缓存过期或版本号更新

<br/>

### 🔧 故障排查

<details>
<summary><b>❌ 404 Not Found</b></summary>

- 检查路径格式是否正确
- 确认 GitHub 上该文件确实存在
- 查看 `X-GitHub-Target` 头确认目标 URL

</details>

<details>
<summary><b>🔄 缓存未命中（X-Cache-Status: MISS）</b></summary>

- 首次请求必定 MISS，再次请求应为 HIT
- 检查是否为动态路径（`/latest/` 等）
- 查看 `X-Cache-Strategy` 确认策略类型

</details>

<details>
<summary><b>🐢 下载速度慢</b></summary>

- 检查是否使用了 Cloudflare CDN 节点
- 确认本地网络到 Cloudflare 的连接质量
- 查看 `X-Response-Time` 分析延迟来源

</details>

<br/>

### 📝 更新日志

查看 [Releases](https://github.com/Aethersailor/cf-ghproxy-worker/releases) 获取版本历史。

<br/>

---

<div align="center">

### 🤝 参与贡献

**欢迎提交 Issue 和 Pull Request！**

[🐛 报告问题](https://github.com/Aethersailor/cf-ghproxy-worker/issues/new?labels=bug) ·
[💡 功能建议](https://github.com/Aethersailor/cf-ghproxy-worker/issues/new?labels=enhancement) ·
[📖 完善文档](https://github.com/Aethersailor/cf-ghproxy-worker/issues/new?labels=documentation)

</div>

<br/>

**贡献步骤：**

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

<br/>

### 📄 许可证

本项目采用 [GNU General Public License v3.0](LICENSE) 许可证。

<br/>

### 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 强大的边缘计算平台
- [GitHub](https://github.com/) - 全球最大的代码托管平台

<br/>

---

<br/>

## English

### 📚 Table of Contents

- [✨ Key Features](#-key-features)
- [🎨 Interface Features](#-interface-features)
- [📊 Caching Strategy](#-caching-strategy)
- [🚀 Quick Deployment](#-quick-deployment)
- [📖 Usage Guide](#-usage-guide)
- [⚙️ Configuration](#️-configuration)
- [🔍 Performance Optimization](#-performance-optimization)
- [📊 Response Headers](#-response-headers)
- [⚠️ Important Notes](#️-important-notes)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

<br/>

### ✨ Key Features

<table>
<tr>
<td align="center" width="33%">
<h4>🚀 Zero Configuration</h4>
<p>No KV storage required<br/>One-click deployment</p>
</td>
<td align="center" width="33%">
<h4>⚡ Intelligent Caching</h4>
<p>Multi-layer caching strategy<br/>Auto-adjusts TTL by path type</p>
</td>
<td align="center" width="33%">
<h4>🌐 Full Domain Support</h4>
<p>Supports github.com and<br/>all GitHub-related domains</p>
</td>
</tr>
<tr>
<td align="center" width="33%">
<h4>📦 Complete Features</h4>
<p>Resumable downloads, CORS<br/>ETag validation</p>
</td>
<td align="center" width="33%">
<h4>🔧 High Reliability</h4>
<p>Retry mechanism, timeout control<br/>Connection optimization</p>
</td>
<td align="center" width="33%">
<h4>🎨 Beautiful Homepage</h4>
<p>Bilingual interface<br/>Dark/Light theme support</p>
</td>
</tr>
</table>

<br/>

### 🎨 Interface Features

- 🌓 **Smart Theme** - Auto-follows system light/dark theme with manual toggle
- 🌍 **Auto Language Detection** - Automatically selects Chinese/English based on browser language
- 🔄 **Real-time Theme Sync** - Auto-switches when system theme changes, no refresh needed
- 📋 **Dynamic Domain Replacement** - Example URLs automatically show current accessing domain
- 🎯 **Preference Memory** - Uses sessionStorage to save user preferences, resets to system on refresh

<br/>

### 📊 Caching Strategy

The system automatically selects the optimal caching strategy based on file paths:

| Path Type | Example | Edge Cache | Browser Cache | Version Control |
|:---------:|:--------|:----------:|:-------------:|:---------------:|
| **Dynamic Content** | `/latest/`, `/main/`, `/nightly/` | 1 hour | 5 minutes | ETag |
| **Versioned Paths** | `/v1.0/`, `/tags/`, `/releases/download/v1.0/` | 30 days | 1 day | Date |
| **Regular Paths** | All other paths | 1 day | 1 hour | ETag |

<br/>

### 🚀 Quick Deployment

> 💡 **Get Started in 30 Seconds**
>
> 1. Click the **Deploy to Cloudflare Workers** button above
> 2. Log in to Cloudflare and authorize GitHub repository access
> 3. Click **Deploy** button, wait for 1-2 minutes
> 4. Get your Worker URL: `https://your-worker.workers.dev`
> 5. Replace GitHub URL domain with your Worker domain to use!

<br/>

#### Method 1: One-Click Deploy (Recommended)

Click the button below to automatically deploy to Cloudflare Workers:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)

<br/>

#### Method 2: Manual Deployment

<details>
<summary><b>📖 Click to expand detailed steps</b></summary>

<br/>

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

</details>

<br/>

#### Method 3: Auto-Deployment (Recommended for Ongoing Maintenance)

Configure GitHub Actions to automatically deploy when code is pushed, keeping your Worker synchronized with the repository.

> ⚠️ **Note**: One-click deploy only works when the button is clicked. GitHub code updates won't automatically sync to the Worker. For ongoing maintenance, auto-deployment is recommended.

📖 **Configuration Steps**: See [Auto-Deployment Configuration Guide](DEPLOYMENT.md#english)

<br/>

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

<br/>

#### Supported Path Formats

| Format | Description | Example |
|:------:|:------------|:--------|
| **Simplified** | Recommended, most common | `https://proxy.dev/user/repo/releases/download/v1.0/file.zip` |
| **Full Format** | Explicit domain | `https://proxy.dev/github.com/user/repo/...` |
| **Raw Format** | Get raw files | `https://proxy.dev/raw.githubusercontent.com/user/repo/main/file` |

<br/>

#### Practical Examples

<details>
<summary><b>📥 Download Release Files</b></summary>

```bash
# Download Clash Meta core
wget https://your-worker.workers.dev/MetaCubeX/mihomo/releases/download/v1.18.0/mihomo-linux-amd64

# Download Node.js source code
curl -O https://your-worker.workers.dev/nodejs/node/archive/refs/tags/v20.10.0.tar.gz
```

</details>

<details>
<summary><b>📄 Get Raw Files</b></summary>

```bash
# Get script file
curl https://your-worker.workers.dev/raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# Get configuration file
wget https://your-worker.workers.dev/raw.githubusercontent.com/torvalds/linux/master/.gitignore
```

</details>

<details>
<summary><b>📝 Use in Scripts</b></summary>

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

</details>

<details>
<summary><b>🔄 Git Clone Acceleration</b></summary>

```bash
# Method 1: Use git config
git config --global url."https://your-worker.workers.dev/".insteadOf "https://github.com/"
git clone https://github.com/torvalds/linux.git

# Method 2: Direct URL replacement
git clone https://your-worker.workers.dev/torvalds/linux.git
```

</details>

<br/>

### ⚙️ Configuration

Customize the following parameters in `worker.js`:

#### Cache Configuration

| Parameter | Default | Description |
|:----------|:-------:|:------------|
| `EDGE_CACHE_SECONDS` | `2592000` (30 days) | Edge cache TTL |
| `SWR_SECONDS` | `86400` (1 day) | Stale-while-revalidate duration |
| `BROWSER_CACHE_SECONDS` | `3600` (1 hour) | Browser cache TTL |

#### Performance Configuration

| Parameter | Default | Description |
|:----------|:-------:|:------------|
| `ENABLE_COMPRESSION` | `true` | Enable Brotli/Gzip compression |
| `ENABLE_EARLY_HINTS` | `true` | Enable Early Hints (HTTP 103) |
| `MAX_RETRIES` | `2` | Maximum retry attempts |
| `RETRY_DELAY_MS` | `500` | Retry interval (milliseconds) |
| `REQUEST_TIMEOUT_MS` | `30000` | Request timeout (milliseconds) |

<br/>

### 🔍 Performance Optimization

<table>
<tr>
<td width="50%">

#### 🌐 Network Layer

- ✅ **HTTP/3 & HTTP/2** - Multiplexing, reduced connection overhead
- ✅ **Early Hints** - Pre-connect, lower TTFB
- ✅ **Keep-Alive** - Connection reuse, reduced TCP handshake
- ✅ **Smart DNS** - Using Cloudflare DNS (1.1.1.1)

</td>
<td width="50%">

#### 💾 Caching

- ✅ **Multi-Layer Cache** - Browser → Worker → Edge three-tier caching
- ✅ **Smart Invalidation** - Automatic version management based on ETag and date
- ✅ **Vary Support** - Cache variants based on encoding type
- ✅ **SWR Mechanism** - Background async update, reduced blocking

</td>
</tr>
<tr>
<td width="50%">

#### 🛡️ Reliability

- ✅ **Smart Retry** - Exponential backoff algorithm
- ✅ **Timeout Control** - 30-second timeout
- ✅ **Error Fallback** - Support for fallback mirror sources

</td>
<td width="50%">

#### 📦 Content Optimization

- ✅ **Auto Minify** - HTML/CSS/JS minification
- ✅ **Image Optimization** - Polish lossy compression
- ✅ **Smart Loading** - Mirage adaptive images

</td>
</tr>
</table>

<br/>

### 📊 Response Headers

The Worker adds the following debug headers:

| Header | Description | Example Value |
|:-------|:------------|:--------------|
| `X-Cache-Status` | Cache hit status | `HIT` / `MISS` |
| `X-Cache-Strategy` | Cache strategy type | `dynamic` / `versioned` / `default` |
| `X-Mirror-Version` | Cache version | `20231223` / `abc123...` (ETag) |
| `X-GitHub-Target` | Actual GitHub URL requested | `https://github.com/...` |
| `X-Response-Time` | Response time | `1234ms` |

<details>
<summary><b>🔍 Debug Example</b></summary>

```bash
curl -I https://your-worker.workers.dev/cli/cli/releases/download/v2.40.0/gh_2.40.0_linux_amd64.tar.gz

HTTP/2 200
x-cache-status: HIT
x-cache-strategy: versioned
x-mirror-version: 20231223
x-response-time: 45ms
```

</details>

<br/>

### ⚠️ Important Notes

> **📌 Limitations**
>
> - Free tier: 100,000 requests per day
> - Single file size limit: 100MB (Cloudflare limitation)
> - CPU execution time: 50ms (free) / unlimited (paid)

> **💾 Cache Behavior**
>
> - Browser cache: Auto-adjusted based on strategy (5min - 1day)
> - Edge cache: Auto-adjusted based on strategy (1hour - 30days)
> - Version number: Auto-updated daily at UTC 00:00

> **💡 Recommendations**
>
> - Test with small files first before using for large files
> - Bind custom domain for frequent access
> - Upgrade to Workers Paid plan for high traffic

> **🗑️ Cache Purging**
>
> - Dashboard: `Caching` → `Configuration` → `Purge Cache`
> - API: Use Cloudflare API to purge by URL
> - Auto: Wait for cache expiration or version update

<br/>

### 🔧 Troubleshooting

<details>
<summary><b>❌ 404 Not Found</b></summary>

- Check if path format is correct
- Verify the file exists on GitHub
- Check `X-GitHub-Target` header for target URL

</details>

<details>
<summary><b>🔄 Cache Miss (X-Cache-Status: MISS)</b></summary>

- First request must be MISS, subsequent should be HIT
- Check if it's a dynamic path (`/latest/`, etc.)
- Review `X-Cache-Strategy` to confirm strategy type

</details>

<details>
<summary><b>🐢 Slow Download Speed</b></summary>

- Check if using Cloudflare CDN nodes
- Verify local network connection quality to Cloudflare
- Review `X-Response-Time` to analyze latency source

</details>

<br/>

### 📝 Changelog

See [Releases](https://github.com/Aethersailor/cf-ghproxy-worker/releases) for version history.

<br/>

---

<div align="center">

### 🤝 Contributing

**Issues and Pull Requests are welcome!**

[🐛 Report Bug](https://github.com/Aethersailor/cf-ghproxy-worker/issues/new?labels=bug) ·
[💡 Request Feature](https://github.com/Aethersailor/cf-ghproxy-worker/issues/new?labels=enhancement) ·
[📖 Improve Docs](https://github.com/Aethersailor/cf-ghproxy-worker/issues/new?labels=documentation)

</div>

<br/>

**Contribution Steps:**

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

<br/>

### 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

<br/>

### 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) - Powerful edge computing platform
- [GitHub](https://github.com/) - The world's largest code hosting platform

<br/>

---

<p align="center">
  <sub>Made with ❤️ by <a href="https://github.com/Aethersailor">Aethersailor</a></sub>
</p>

<p align="center">
  <a href="https://github.com/Aethersailor/cf-ghproxy-worker/stargazers">⭐ Star this project</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/Aethersailor/cf-ghproxy-worker/network/members">🍴 Fork this project</a>
</p>
