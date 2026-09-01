<div align="center">

# 🚀 Cloudflare GitHub-Proxy Worker

**High-Performance GitHub Acceleration Proxy on Cloudflare Workers**

**基于 Cloudflare Workers 的高性能 GitHub 文件加速代理**

<br/>

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Maintained](https://img.shields.io/badge/Maintained-Yes-green.svg)](https://github.com/Aethersailor/cf-ghproxy-worker/commits/main)
[![GitHub Stars](https://img.shields.io/github/stars/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/issues)
[![Last Commit](https://img.shields.io/github/last-commit/Aethersailor/cf-ghproxy-worker?style=flat&logo=github)](https://github.com/Aethersailor/cf-ghproxy-worker/commits/main)

<br/>

**[📖 中文文档 / Chinese Documentation](README.md)**

</div>

<br/>

---

## 📚 Table of Contents

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

## ✨ Key Features

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

## 🎨 Interface Features

- 🌓 **Smart Theme** - Auto-follows system light/dark theme with manual toggle
- 🌍 **Auto Language Detection** - Automatically selects Chinese/English based on browser language
- 🔄 **Real-time Theme Sync** - Auto-switches when system theme changes, no refresh needed
- 📋 **Dynamic Domain Replacement** - Example URLs automatically show current accessing domain
- 🎯 **Preference Memory** - Uses sessionStorage to save user preferences, resets to system on refresh

<br/>

## 📊 Caching Strategy

The system automatically selects the optimal caching strategy based on file paths:

| Path Type | Example | Edge Cache | Browser Cache | Version Control |
|:---------:|:--------|:----------:|:-------------:|:---------------:|
| **Dynamic Content** | `/latest/`, `/main/`, `/nightly/` | 1 hour | 5 minutes | ETag |
| **Versioned Paths** | `/v1.0/`, `/tags/`, `/releases/download/v1.0/` | 30 days | 1 day | Date |
| **Regular Paths** | All other paths | 1 day | 1 hour | ETag |

<br/>

## 🚀 Quick Deployment

> 💡 **Get Started in 30 Seconds**
>
> 1. Click the **Deploy to Cloudflare Workers** button above
> 2. Log in to Cloudflare and authorize GitHub repository access
> 3. Click **Deploy** button, wait for 1-2 minutes
> 4. Get your Worker URL: `https://your-worker.workers.dev`
> 5. Replace GitHub URL domain with your Worker domain to use!

<br/>

### Method 1: One-Click Deploy (Recommended)

Click the button below to automatically deploy to Cloudflare Workers:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Aethersailor/cf-ghproxy-worker)

<br/>

### Method 2: Manual Deployment

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

### Method 3: Auto-Deployment (Recommended for Ongoing Maintenance)

Configure GitHub Actions to automatically deploy when code is pushed, keeping your Worker synchronized with the repository.

> ⚠️ **Note**: One-click deploy only works when the button is clicked. GitHub code updates won't automatically sync to the Worker. For ongoing maintenance, auto-deployment is recommended.

📖 **Configuration Steps**: See [Auto-Deployment Configuration Guide](DEPLOYMENT.md#english)

<br/>

## 📖 Usage Guide

### Basic Usage

Replace the domain in GitHub URLs with your Worker domain:

```bash
# Original URL
https://github.com/torvalds/linux/archive/refs/tags/v6.6.tar.gz

# Accelerated URL (domain path format)
https://your-worker.workers.dev/github.com/torvalds/linux/archive/refs/tags/v6.6.tar.gz

# Or use full URL format (paste the complete URL after proxy domain)
https://your-worker.workers.dev/https://github.com/torvalds/linux/archive/refs/tags/v6.6.tar.gz
```

<br/>

### Supported Path Formats

| Format | Description | Example |
|:------:|:------------|:--------|
| **📦 Domain Path** | Remove https://, keep domain and path | `proxy.dev/github.com/user/repo/...` |
| **🔗 Full URL** | Paste full GitHub URL directly | `proxy.dev/https://github.com/user/repo/...` |

<br/>

### Practical Examples

<details>
<summary><b>📥 Download Release Files</b></summary>

```bash
# Download Clash Meta core
wget https://your-worker.workers.dev/github.com/MetaCubeX/mihomo/releases/download/v1.18.0/mihomo-linux-amd64

# Download Node.js source code
curl -O https://your-worker.workers.dev/github.com/nodejs/node/archive/refs/tags/v20.10.0.tar.gz
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
    
    wget "${GITHUB_PROXY}/github.com/${repo}/releases/download/${tag}/${filename}"
}

# Usage example
download_file "cli/cli" "v2.40.0" "gh_2.40.0_linux_amd64.tar.gz"
```

</details>

<details>
<summary><b>🔄 Git Clone Acceleration</b></summary>

```bash
# Public repositories: Method 1, use git config
git config --global url."https://your-worker.workers.dev/github.com/".insteadOf "https://github.com/"
git clone https://github.com/torvalds/linux.git

# Public repositories: Method 2, replace the URL directly
git clone https://your-worker.workers.dev/github.com/torvalds/linux.git
```

The Worker supports read-only Git Smart HTTP (`clone`, `fetch`, and `pull`). It does not support `push` or Git LFS.

#### Private repositories

> [!CAUTION]
> Use private repository support only on a Worker deployment you control and trust. The PAT passes through Cloudflare and the Worker; never give credentials to a public proxy service.

1. Explicitly enable credential pass-through in `wrangler.toml`. Named environments must declare the variable independently:

   ```toml
   [vars]
   PRIVATE_GIT_MODE = "passthrough"

   [env.production.vars]
   PRIVATE_GIT_MODE = "passthrough"
   ```

2. Use a short-lived fine-grained PAT restricted to `Contents: Read-only` for the target repository. Put only the username in the URL to trigger an interactive password prompt, then enter the PAT as the password:

   ```bash
   git clone https://YOUR-USERNAME@your-worker.workers.dev/github.com/OWNER/PRIVATE-REPO.git
   ```

Never put the PAT in a URL, script, `wrangler.toml`, or repository file. Authenticated Git requests always bypass Worker/CDN caches.

</details>

<br/>

## ⚙️ Configuration

Customize the following parameters in `worker.js`:

### Cache Configuration

| Parameter | Default | Description |
|:----------|:-------:|:------------|
| `EDGE_CACHE_SECONDS` | `2592000` (30 days) | Edge cache TTL |
| `SWR_SECONDS` | `86400` (1 day) | Stale-while-revalidate duration |
| `BROWSER_CACHE_SECONDS` | `3600` (1 hour) | Browser cache TTL |

### Performance Configuration

| Parameter | Default | Description |
|:----------|:-------:|:------------|
| `ENABLE_COMPRESSION` | `true` | Enable Brotli/Gzip compression |
| `ENABLE_EARLY_HINTS` | `true` | Enable Early Hints (HTTP 103) |
| `MAX_RETRIES` | `2` | Maximum retry attempts |
| `RETRY_DELAY_MS` | `500` | Retry interval (milliseconds) |
| `REQUEST_TIMEOUT_MS` | `30000` | Request timeout (milliseconds) |

### Private Git Configuration

| Wrangler Variable | Default | Description |
|:------------------|:-------:|:------------|
| `PRIVATE_GIT_MODE` | `disabled` | Set to `passthrough` to forward Basic/PAT only to read-only `git-upload-pack` routes on `github.com`; all authenticated traffic bypasses caches |

<br/>

## 🔍 Performance Optimization

<table>
<tr>
<td width="50%">

### 🌐 Network Layer

- ✅ **HTTP/3 & HTTP/2** - Multiplexing, reduced connection overhead
- ✅ **Early Hints** - Pre-connect, lower TTFB
- ✅ **Keep-Alive** - Connection reuse, reduced TCP handshake
- ✅ **Smart DNS** - Using Cloudflare DNS (1.1.1.1)

</td>
<td width="50%">

### 💾 Caching

- ✅ **Multi-Layer Cache** - Browser → Worker → Edge three-tier caching
- ✅ **Smart Invalidation** - Automatic version management based on ETag and date
- ✅ **Vary Support** - Cache variants based on encoding type
- ✅ **SWR Mechanism** - Background async update, reduced blocking

</td>
</tr>
<tr>
<td width="50%">

### 🛡️ Reliability

- ✅ **Smart Retry** - Exponential backoff algorithm
- ✅ **Timeout Control** - 30-second timeout
- ✅ **Error Fallback** - Support for fallback mirror sources

</td>
<td width="50%">

### 📦 Content Optimization

- ✅ **Auto Minify** - HTML/CSS/JS minification
- ✅ **Image Optimization** - Polish lossy compression
- ✅ **Smart Loading** - Mirage adaptive images

</td>
</tr>
</table>

<br/>

## 📊 Response Headers

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

## ⚠️ Important Notes

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

## 🔧 Troubleshooting

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

## 📝 Changelog

See [Releases](https://github.com/Aethersailor/cf-ghproxy-worker/releases) for version history.

<br/>

---

<div align="center">

## 🤝 Contributing

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

## 📄 License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

<br/>

## 🙏 Acknowledgments

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
