# 🚀 一键部署到网页平台

本文档将帮助您在 **10 分钟内** 将公司智能体管理系统部署到网页平台。

---

## 📋 部署前准备（5 分钟）

### 1. 准备服务账号

需要以下服务的账号（全部免费）：

| 服务 | 用途 | 获取方式 | 耗时 |
|------|------|---------|------|
| **GitHub** | 代码托管 | https://github.com | 1 分钟 |
| **Vercel** | 网页托管（推荐） | https://vercel.com | 2 分钟 |
| **Supabase** | PostgreSQL 数据库 | https://supabase.com | 1 分钟 |
| **Coze** | AI 模型服务 | https://www.coze.cn | 1 分钟 |

### 2. 获取必需的密钥

#### 步骤 1: Supabase 数据库（1 分钟）

1. 访问 https://supabase.com
2. 点击 `New Project`
3. 填写信息后创建
4. 进入 `Settings` → `Database`
5. 复制 `Connection string`
   - 格式：`postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### 步骤 2: Coze API（1 分钟）

1. 访问 https://www.coze.cn
2. 登录后进入任意工作区
3. 点击右上角 `设置` 图标
4. 选择 `API Tokens` → `Create new token`
5. 复制生成的 Token（这就是 COZE_API_KEY）

#### 步骤 3: S3 存储（2 分钟）

**最简单方案：使用 AWS S3**

1. 访问 https://aws.amazon.com/s3/
2. 注册 AWS 账号（免费）
3. 进入 S3 控制台 → `Create bucket`
4. 填写 bucket 名称（如：`agent-management-files`）
5. 其他选项保持默认，点击 `Create bucket`
6. 进入 IAM → `Users` → `Create user`
7. 用户名：`s3-user`，勾选 `Attach policies directly`
8. 搜索并选择 `AmazonS3FullAccess`
9. 创建后，点击用户 → `Security credentials` → `Create access key`
10. 记录 `Access Key ID` 和 `Secret access key`

---

## 🌟 推荐方案：Vercel（最简单）

**总耗时**：10 分钟
**成本**：免费
**难度**：⭐ 简单

### 方法 A: 通过 Vercel Dashboard 部署（推荐新手）

#### Step 1: 推送代码到 GitHub（2 分钟）

```bash
# 1. 在 GitHub 创建新仓库
# 访问 https://github.com/new
# 仓库名：company-agent-management
# 创建后复制仓库 URL

# 2. 推送代码（在项目目录下执行）
bash scripts/push-to-github.sh <你的GitHub仓库URL>

# 示例：
# bash scripts/push-to-github.sh https://github.com/yourusername/company-agent-management.git
```

#### Step 2: 导入到 Vercel（3 分钟）

1. 访问 https://vercel.com/signup
2. 使用 GitHub 账号登录
3. 点击 `Add New` → `Project`
4. 在 `Import Git Repository` 中找到你的仓库
5. 点击 `Import`

#### Step 3: 配置环境变量（3 分钟）

在 Vercel 项目配置页面，添加以下环境变量：

| 环境变量 | 值 | 说明 |
|---------|-----|------|
| `DATABASE_URL` | Supabase 连接字符串 | 从步骤 1 获取 |
| `COZE_API_KEY` | Coze API Token | 从步骤 2 获取 |
| `S3_ACCESS_KEY_ID` | AWS Access Key ID | 从步骤 3 获取 |
| `S3_SECRET_ACCESS_KEY` | AWS Secret Key | 从步骤 3 获取 |
| `S3_BUCKET_NAME` | S3 Bucket 名称 | 如：agent-management-files |
| `S3_REGION` | `us-east-1` 或其他区域 | AWS 区域 |
| `S3_ENDPOINT` | `https://s3.amazonaws.com` | S3 端点 |

#### Step 4: 部署（2 分钟）

1. 点击 `Deploy` 按钮
2. 等待 2-3 分钟
3. 部署完成后，点击访问 URL

**完成！** 🎉 你的应用已经在线了！

---

### 方法 B: 通过 CLI 部署（推荐开发者）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署
bash scripts/deploy-vercel.sh
```

---

## 🌊 备选方案：Netlify

**总耗时**：10 分钟
**成本**：免费
**难度**：⭐ 简单

### 部署步骤

1. **推送到 GitHub**（同 Vercel 方法 A 的 Step 1）

2. **连接 Netlify**
   - 访问 https://app.netlify.com/signup
   - 使用 GitHub 账号登录
   - 点击 `Add new site` → `Import an existing project`

3. **配置构建设置**
   - 选择你的 GitHub 仓库
   - 构建命令：`pnpm install && pnpm build`
   - 发布目录：`.next`

4. **添加环境变量**
   - 点击 `Site settings` → `Environment variables`
   - 添加与 Vercel 相同的环境变量

5. **部署**
   - 点击 `Deploy site`

---

## 🐳 高级方案：Docker

适合需要完全控制部署环境的场景。

```bash
# 1. 配置环境变量
cp .env.docker.example .env
nano .env  # 编辑配置

# 2. 一键部署
bash scripts/deploy-docker.sh

# 3. 访问应用
open http://localhost:5000
```

---

## ✅ 部署后验证

访问你的应用 URL，检查以下功能：

- [ ] 页面能正常加载
- [ ] 点击"智能体管理"可以创建智能体
- [ ] 流式对话功能正常
- [ ] 文档上传功能正常

---

## 📊 三种方案对比

| 方案 | 耗时 | 难度 | 免费 | 自定义 | 推荐人群 |
|------|------|------|------|--------|---------|
| **Vercel** | 10 分钟 | ⭐ | ✅ | ⭐⭐ | 新手 |
| **Netlify** | 10 分钟 | ⭐ | ✅ | ⭐⭐⭐ | 中级 |
| **Docker** | 15 分钟 | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | 高级 |

---

## 🔧 常见问题

### Q1: 推送代码到 GitHub 失败？

**A:** 确保你已经在 GitHub 创建了仓库，并复制了正确的 URL。

### Q2: Vercel 部署失败？

**A:** 检查以下几点：
1. 环境变量是否全部配置
2. 数据库连接字符串是否正确
3. Vercel Dashboard 的部署日志中的错误信息

### Q3: 如何更新应用？

**A:** 推送代码到 GitHub 后，Vercel 会自动重新部署。

### Q4: 如何配置自定义域名？

**A:** 在 Vercel Dashboard 中：
1. 进入项目 → `Settings` → `Domains`
2. 添加你的域名
3. 按提示配置 DNS 记录

### Q5: 如何查看应用日志？

**A:**
```bash
# Vercel CLI
vercel logs

# Vercel Dashboard
# 进入项目 → Deployments → 选择部署 → View logs
```

---

## 📚 相关文档

- [详细多平台部署指南](MULTI_PLATFORM_DEPLOYMENT.md)
- [环境变量详细配置](DEPLOYMENT_ENV.md)
- [Docker 高级部署](DEPLOYMENT.md)
- [GitHub 推送指南](PUSH_TO_GITHUB.md)

---

## 💡 快速决策指南

**我是新手，只想快速上线** → 使用 **Vercel 方法 A**
**我是开发者，喜欢命令行** → 使用 **Vercel 方法 B**
**我需要更多自定义选项** → 使用 **Netlify**
**我需要完全控制服务器** → 使用 **Docker**

---

## 🎉 开始部署！

选择上方任意一种方案，按照步骤操作，10 分钟后你的应用就会在线！

**遇到问题？** 查看各平台的官方文档或提交 Issue。

**祝你部署顺利！** 🚀
