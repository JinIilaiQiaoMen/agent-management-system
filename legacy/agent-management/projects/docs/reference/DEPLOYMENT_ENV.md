# 部署环境变量配置指南

本文档详细说明了在不同平台部署时需要配置的环境变量。

## 📋 环境变量清单

### 必需配置项

| 变量名 | 说明 | 示例值 | 敏感度 |
|--------|------|--------|--------|
| `DATABASE_URL` | PostgreSQL 数据库连接字符串 | `postgresql://user:pass@host:5432/dbname` | 🔴 高 |
| `NEXT_PUBLIC_API_BASE_URL` | API 基础地址（前端访问） | `https://api.example.com` | 🟢 低 |
| `COZE_API_KEY` | Coze API 密钥 | `your-coze-api-key` | 🔴 高 |
| `COZE_API_SECRET` | Coze API 密钥 | `your-coze-api-secret` | 🔴 高 |
| `COZE_WORKSPACE_ID` | Coze 工作区 ID | `your-workspace-id` | 🟡 中 |
| `S3_ACCESS_KEY_ID` | S3 对象存储 Access Key | `your-access-key-id` | 🔴 高 |
| `S3_SECRET_ACCESS_KEY` | S3 对象存储 Secret Key | `your-secret-access-key` | 🔴 高 |
| `S3_BUCKET_NAME` | S3 存储桶名称 | `your-bucket-name` | 🟢 低 |
| `S3_REGION` | S3 区域 | `us-east-1` | 🟢 低 |
| `S3_ENDPOINT` | S3 服务端点 | `https://s3.example.com` | 🟢 低 |

### 可选配置项

| 变量名 | 说明 | 默认值 | 推荐值 |
|--------|------|--------|--------|
| `NODE_ENV` | 运行环境 | `development` | `production` |
| `PORT` | 服务端口 | `3000` | `5000` |
| `REDIS_URL` | Redis 缓存连接字符串 | 无 | `redis://localhost:6379` |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `Company Agent Management` | 自定义 |
| `NEXT_PUBLIC_APP_URL` | 应用完整 URL | `http://localhost:5000` | 生产域名 |

---

## 🚀 Vercel 部署配置

### Step 1: 安装 Vercel CLI

```bash
npm install -g vercel
```

### Step 2: 登录 Vercel

```bash
vercel login
```

### Step 3: 创建项目

```bash
vercel link
```

### Step 4: 配置环境变量

#### 通过 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 `Settings` → `Environment Variables`
4. 添加所有必需的环境变量

#### 通过 CLI

```bash
# 添加环境变量
vercel env add DATABASE_URL production
vercel env add COZE_API_KEY production
vercel env add COZE_API_SECRET production
vercel env add S3_ACCESS_KEY_ID production
vercel env add S3_SECRET_ACCESS_KEY production
```

### Step 5: 部署到生产环境

```bash
vercel --prod
```

---

## 🌊 Netlify 部署配置

### Step 1: 连接 GitHub 仓库

1. 登录 [Netlify](https://app.netlify.com/)
2. 点击 `Add new site` → `Import an existing project`
3. 选择你的 GitHub 仓库

### Step 2: 配置构建设置

Netlify 会自动读取 `netlify.toml`，配置如下：

```toml
[build]
  command = "pnpm install && pnpm build"
  publish = ".next"
```

### Step 3: 配置环境变量

1. 进入 `Site settings` → `Environment variables`
2. 添加所有必需的环境变量

```bash
# 必需变量
DATABASE_URL=
COZE_API_KEY=
COZE_API_SECRET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
S3_REGION=
S3_ENDPOINT=
```

### Step 4: 部署

- 推送到 `main` 分支会自动触发部署
- 或手动点击 `Deploy site` → `Deploy`

---

## 🐳 Docker 部署配置

### Step 1: 创建 `.env` 文件

```bash
cp .env.docker.example .env
```

### Step 2: 配置 `.env` 文件

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

### Step 3: 使用 Docker Compose 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### Step 4: 推送到 Docker Hub

```bash
# 构建镜像
docker build -t your-username/company-agent-management:latest .

# 登录 Docker Hub
docker login

# 推送镜像
docker push your-username/company-agent-management:latest
```

---

## 🔐 GitHub Secrets 配置（用于 CI/CD）

### Vercel 部署需要

在 GitHub 仓库 `Settings` → `Secrets and variables` → `Actions` 中添加：

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

### Docker 部署需要

```
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password-or-token
```

### 其他敏感配置

```
DATABASE_URL=
COZE_API_KEY=
COZE_API_SECRET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

---

## 🔑 获取配置值

### 1. Coze API

1. 访问 [Coze 控制台](https://www.coze.cn/)
2. 创建工作区或进入现有工作区
3. 在设置中获取 API Key 和 Secret

### 2. S3 存储配置

#### AWS S3
1. 登录 AWS 控制台
2. 进入 IAM 创建 Access Key
3. 进入 S3 创建存储桶

#### 阿里云 OSS
1. 登录阿里云控制台
2. 创建 AccessKey
3. 创建 OSS Bucket

#### 腾讯云 COS
1. 登录腾讯云控制台
2. 创建密钥
3. 创建存储桶

### 3. PostgreSQL 数据库

#### 云数据库推荐
- [Supabase](https://supabase.com/) - 免费版足够
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [PlanetScale](https://planetscale.com/) - 兼容 MySQL

#### 本地开发
```bash
# 使用 Docker 运行 PostgreSQL
docker run --name postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -d postgres:15

# 连接字符串
postgresql://postgres:yourpassword@localhost:5432/agentdb
```

---

## ⚠️ 安全提示

1. **永远不要**将 `.env` 文件提交到 Git
2. **永远不要**在代码中硬编码敏感信息
3. 定期轮换 API 密钥和密码
4. 使用不同环境的独立配置
5. 生产环境使用强密码
6. 启用数据库访问白名单

---

## 🧪 本地开发环境配置

创建 `.env.local` 文件：

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/agentdb_dev
COZE_API_KEY=your-dev-api-key
COZE_API_SECRET=your-dev-api-secret
S3_ACCESS_KEY_ID=your-dev-access-key
S3_SECRET_ACCESS_KEY=your-dev-secret-key
S3_BUCKET_NAME=dev-bucket
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
PORT=5000
```

运行开发服务器：

```bash
pnpm dev
```

---

## 📚 相关文档

- [Vercel 官方文档](https://vercel.com/docs)
- [Netlify 官方文档](https://docs.netlify.com/)
- [Docker 官方文档](https://docs.docker.com/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)

---

## 💡 常见问题

### Q: 如何在不同环境使用不同配置？

A: 为每个环境创建独立的 `.env` 文件：
- `.env.development` - 开发环境
- `.env.staging` - 测试环境
- `.env.production` - 生产环境

### Q: 环境变量更新后如何生效？

A:
- **Vercel**: 重新部署 `vercel --prod`
- **Netlify**: 重新部署或触发构建
- **Docker**: 重启容器 `docker-compose restart`

### Q: 如何验证环境变量是否正确配置？

A: 在应用启动时添加检查代码：

```typescript
// 验证必需环境变量
const requiredEnvVars = [
  'DATABASE_URL',
  'COZE_API_KEY',
  'S3_ACCESS_KEY_ID',
];

const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}
```
