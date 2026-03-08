# 多平台部署指南

本指南将帮助您将公司智能体管理系统部署到不同的平台。

## 📖 目录

- [快速开始](#快速开始)
- [Vercel 部署](#vercel-部署-推荐)
- [Netlify 部署](#netlify-部署)
- [Docker 部署](#docker-部署)
- [云服务器部署](#云服务器部署)
- [比较与推荐](#比较与推荐)
- [故障排查](#故障排查)

---

## 🚀 快速开始

### 前置条件

✅ Git 仓库已创建（参考 `PUSH_TO_GITHUB.md`）
✅ 获取所需服务的 API 密钥（见 `DEPLOYMENT_ENV.md`）
✅ 准备好 PostgreSQL 数据库

### 推荐方案

| 需求场景 | 推荐平台 | 成本 | 难度 |
|---------|---------|------|------|
| 快速上线，无需运维 | **Vercel** | 免费版充足 | ⭐ 简单 |
| 需要更多自定义 | **Netlify** | 免费版充足 | ⭐ 简单 |
| 需要完全控制 | **Docker + 云服务器** | 按需付费 | ⭐⭐⭐ 中等 |

---

## ☁️ Vercel 部署（推荐）

### 为什么选择 Vercel？

- ✅ Next.js 官方推荐平台
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 免费版：100GB 带宽/月
- ✅ 零配置部署

### 部署步骤

#### 方式 1: 通过 GitHub 自动部署（推荐）

**Step 1: 安装 Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: 登录并连接项目**

```bash
vercel login
vercel link
```

按提示选择：
- Link to existing project? No
- Project name: `company-agent-management`
- Directory: `.`
- Override settings? No

**Step 3: 配置环境变量**

```bash
# 添加生产环境变量
vercel env add DATABASE_URL production
# 粘贴你的数据库连接字符串

vercel env add COZE_API_KEY production
# 粘贴你的 Coze API Key

vercel env add COZE_API_SECRET production
# 粘贴你的 Coze API Secret

vercel env add S3_ACCESS_KEY_ID production
vercel env add S3_SECRET_ACCESS_KEY production
vercel env add S3_BUCKET_NAME production
vercel env add S3_REGION production
vercel env add S3_ENDPOINT production
```

**Step 4: 部署到生产环境**

```bash
vercel --prod
```

等待部署完成，你会得到生产环境 URL。

**Step 5: 配置 GitHub 自动部署**

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 `Settings` → `Git`
4. 确保已连接 GitHub 仓库
5. 推送代码到 `main` 分支会自动部署

#### 方式 2: 通过 Vercel Dashboard 部署

**Step 1: 导入项目**

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 `Add New` → `Project`
3. 选择你的 GitHub 仓库
4. 点击 `Import`

**Step 2: 配置项目**

```
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm install && pnpm build
Output Directory: .next
Install Command: pnpm install
```

**Step 3: 添加环境变量**

在 `Environment Variables` 部分添加：

```
DATABASE_URL = postgresql://...
COZE_API_KEY = your-api-key
COZE_API_SECRET = your-api-secret
S3_ACCESS_KEY_ID = your-access-key
S3_SECRET_ACCESS_KEY = your-secret-key
S3_BUCKET_NAME = your-bucket-name
S3_REGION = us-east-1
S3_ENDPOINT = https://s3.amazonaws.com
```

**Step 4: 部署**

点击 `Deploy` 按钮开始部署。

### 验证部署

访问你的 Vercel URL，检查：
- ✅ 页面能正常加载
- ✅ 智能体管理功能正常
- ✅ 流式对话正常工作
- ✅ 文件上传功能正常

### 自定义域名（可选）

1. 进入 `Settings` → `Domains`
2. 添加你的域名（如 `agents.yourcompany.com`）
3. 按提示配置 DNS 记录

---

## 🌊 Netlify 部署

### 为什么选择 Netlify？

- ✅ 免费版：300GB 带宽/月
- ✅ 强大的表单和函数支持
- ✅ 边缘网络加速
- ✅ 灵活的构建配置

### 部署步骤

**Step 1: 连接 GitHub 仓库**

1. 登录 [Netlify Dashboard](https://app.netlify.com/)
2. 点击 `Add new site` → `Import an existing project`
3. 授权访问 GitHub
4. 选择你的仓库

**Step 2: 配置构建设置**

Netlify 会自动读取 `netlify.toml`，配置如下：

```toml
Build command: pnpm install && pnpm build
Publish directory: .next
```

**Step 3: 配置环境变量**

1. 进入 `Site settings` → `Environment variables`
2. 添加所有必需的环境变量（参考 `DEPLOYMENT_ENV.md`）

**Step 4: 部署**

- 推送代码到 `main` 分支会自动部署
- 或手动点击 `Deploy site` → `Deploy`

### Netlify Functions（可选）

如果需要使用 Netlify Functions，需要额外配置：

```toml
[functions]
  node_bundler = "esbuild"
  included_files = ["**/*.wasm"]
```

---

## 🐳 Docker 部署

### 为什么选择 Docker？

- ✅ 完全控制部署环境
- ✅ 易于扩展和迁移
- ✅ 版本可复现
- ✅ 适合复杂架构

### 方式 1: Docker Compose（快速开始）

**Step 1: 准备配置文件**

```bash
# 复制环境变量模板
cp .env.docker.example .env

# 编辑环境变量
nano .env
```

**Step 2: 配置 `.env` 文件**

```env
# 数据库
DATABASE_URL=postgresql://postgres:password@postgres:5432/agentdb

# Coze API
COZE_API_KEY=your-coze-api-key
COZE_API_SECRET=your-coze-api-secret
COZE_WORKSPACE_ID=your-workspace-id

# S3 存储
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com

# Redis（可选）
REDIS_URL=redis://redis:6379

# 应用配置
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Step 3: 构建并启动**

```bash
# 构建镜像
docker-compose build

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 检查服务状态
docker-compose ps
```

**Step 4: 访问应用**

访问 `http://localhost:5000`

### 方式 2: 单容器部署

**Step 1: 构建镜像**

```bash
docker build -t company-agent-management:latest .
```

**Step 2: 运行容器**

```bash
docker run -d \
  --name agent-management \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  company-agent-management:latest
```

**Step 3: 查看日志**

```bash
docker logs -f agent-management
```

### 方式 3: 推送到 Docker Hub

**Step 1: 登录 Docker Hub**

```bash
docker login
```

**Step 2: 标记镜像**

```bash
docker tag company-agent-management:latest your-username/company-agent-management:latest
```

**Step 3: 推送镜像**

```bash
docker push your-username/company-agent-management:latest
```

**Step 4: 在其他服务器拉取并运行**

```bash
docker run -d \
  --name agent-management \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  your-username/company-agent-management:latest
```

---

## 🖥️ 云服务器部署

### 适合场景

- 需要完全控制服务器
- 有高并发需求
- 需要集成其他服务
- 有自建基础设施

### 推荐云服务商

| 服务商 | 适合场景 | 价格区间 |
|--------|---------|---------|
| **阿里云** | 国内业务 | ¥50-500/月 |
| **腾讯云** | 国内业务 | ¥50-500/月 |
| **AWS** | 全球业务 | $5-50/月 |
| **DigitalOcean** | 简单易用 | $4-20/月 |
| **Linode** | 高性能 | $5-20/月 |

### 部署步骤（以 Ubuntu 为例）

**Step 1: 连接服务器**

```bash
ssh root@your-server-ip
```

**Step 2: 安装 Docker**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

**Step 3: 克隆项目**

```bash
git clone https://github.com/your-username/company-agent-management.git
cd company-agent-management
```

**Step 4: 配置环境变量**

```bash
cp .env.docker.example .env
nano .env
```

**Step 5: 启动服务**

```bash
docker-compose up -d
```

**Step 6: 配置反向代理（可选）**

```bash
# 安装 Nginx
apt update && apt install nginx -y

# 创建配置文件
nano /etc/nginx/sites-available/agent-management
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
ln -s /etc/nginx/sites-available/agent-management /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

**Step 7: 配置 HTTPS（推荐）**

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书
certbot --nginx -d your-domain.com
```

### 使用 PM2 部署（替代 Docker）

**Step 1: 安装 Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

**Step 2: 安装 pnpm**

```bash
npm install -g pnpm
```

**Step 3: 克隆并安装依赖**

```bash
git clone https://github.com/your-username/company-agent-management.git
cd company-agent-management
pnpm install
```

**Step 4: 构建项目**

```bash
pnpm build
```

**Step 5: 配置环境变量**

```bash
cp .env.docker.example .env
nano .env
```

**Step 6: 安装 PM2**

```bash
npm install -g pm2
```

**Step 7: 启动应用**

```bash
pm2 start pnpm --name "agent-management" -- start
pm2 save
pm2 startup
```

---

## 📊 比较与推荐

### 功能对比

| 特性 | Vercel | Netlify | Docker + 云服务器 |
|------|--------|---------|------------------|
| 部署难度 | ⭐ 简单 | ⭐ 简单 | ⭐⭐⭐ 中等 |
| 免费额度 | 100GB/月 | 300GB/月 | 按需付费 |
| 自定义程度 | 中 | 中 | 高 |
| 性能 | 全球 CDN | 全球 CDN | 取决于服务器 |
| 运维需求 | 低 | 低 | 高 |
| 适合场景 | 快速上线 | 快速上线 | 高可用、自定义 |

### 推荐选择

#### 🌟 新手推荐：Vercel
- **优点**：零配置、自动 HTTPS、全球加速
- **缺点**：功能限制较多
- **适用**：个人项目、小团队

#### 💼 企业推荐：Docker + 云服务器
- **优点**：完全控制、高可用、易扩展
- **缺点**：需要运维知识
- **适用**：生产环境、高并发

#### 🎯 折中选择：Netlify
- **优点**：免费额度大、功能灵活
- **缺点**：Next.js 支持不如 Vercel 完美
- **适用**：中等规模项目

---

## 🔧 故障排查

### Vercel 部署问题

**问题：构建失败**

```bash
# 检查构建日志
vercel logs

# 常见原因：
# 1. 环境变量未配置 → 检查 Dashboard
# 2. 依赖安装失败 → 检查 package.json
# 3. 端口冲突 → 确保应用监听 5000 端口
```

**问题：环境变量不生效**

```bash
# 重新设置环境变量
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production

# 重新部署
vercel --prod
```

### Docker 部署问题

**问题：容器无法启动**

```bash
# 查看容器日志
docker-compose logs -f app

# 检查环境变量
docker-compose config

# 重启容器
docker-compose restart app
```

**问题：数据库连接失败**

```bash
# 检查数据库是否运行
docker-compose ps postgres

# 进入数据库容器
docker-compose exec postgres psql -U postgres -d agentdb

# 检查连接字符串
echo $DATABASE_URL
```

### 云服务器问题

**问题：端口无法访问**

```bash
# 检查防火墙
ufw status
ufw allow 5000/tcp

# 检查服务状态
systemctl status nginx
```

**问题：内存不足**

```bash
# 查看内存使用
free -h

# 添加 Swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

## 📚 相关文档

- [环境变量配置指南](DEPLOYMENT_ENV.md)
- [Docker 部署指南](DEPLOYMENT.md)
- [GitHub 推送指南](PUSH_TO_GITHUB.md)

---

## 💡 最佳实践

1. **使用环境变量**：永远不要硬编码敏感信息
2. **版本控制**：使用 Git 分支管理不同环境
3. **监控告警**：配置日志监控和告警
4. **定期备份**：备份数据库和配置
5. **安全加固**：启用 HTTPS、配置防火墙
6. **性能优化**：使用 CDN、压缩资源
7. **自动部署**：配置 CI/CD 自动化部署

---

## 🆘 获取帮助

- 📖 查看详细文档
- 💬 提交 Issue
- 📧 联系支持团队

祝您部署顺利！ 🎉
