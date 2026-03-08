# 🚀 快速部署指南

欢迎使用公司智能体管理系统！本指南将帮助您在 5 分钟内完成部署。

## 📋 部署前准备

### 1. 必需服务账号

- ✅ [GitHub 账号](https://github.com/)（免费）
- ✅ [Coze API 密钥](https://www.coze.cn/)（免费）
- ✅ [S3 对象存储](https://aws.amazon.com/s3/)（推荐 AWS S3 或阿里云 OSS）
- ✅ [PostgreSQL 数据库](https://supabase.com/)（推荐 Supabase 或 Neon）

### 2. 获取 API 密钥

#### Coze API
1. 访问 [Coze 控制台](https://www.coze.cn/)
2. 创建工作区
3. 进入设置 → API Keys → 生成密钥

#### PostgreSQL 数据库
1. 访问 [Supabase](https://supabase.com/)（免费）
2. 创建新项目
3. Settings → Database → Connection String

#### S3 存储
**AWS S3**:
1. 登录 AWS 控制台
2. 创建 S3 Bucket
3. IAM → 创建 Access Key

**阿里云 OSS**:
1. 登录阿里云控制台
2. 创建 OSS Bucket
3. AccessKey 管理

---

## 🌟 三种快速部署方式

### 方式 1️⃣: Vercel（推荐新手）

**优点**：零配置、免费、全球加速、自动 HTTPS

**步骤**：

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 运行部署脚本
bash scripts/deploy-vercel.sh
```

**手动部署**：

1. 访问 [Vercel](https://vercel.com)
2. 点击 `Add New` → `Project`
3. 选择 GitHub 仓库
4. 配置环境变量（参考下方）
5. 点击 `Deploy`

**环境变量配置**：

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
COZE_API_KEY=your-coze-api-key
COZE_API_SECRET=your-coze-api-secret
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
```

**完成时间**：⏱️ 3-5 分钟

---

### 方式 2️⃣: Docker（推荐开发者）

**优点**：完全控制、本地开发、易于扩展

**步骤**：

```bash
# 1. 复制环境变量模板
cp .env.docker.example .env

# 2. 编辑环境变量
nano .env

# 3. 运行部署脚本
bash scripts/deploy-docker.sh
```

**手动部署**：

```bash
# 构建镜像
docker build -t agent-management .

# 运行容器
docker run -d \
  --name agent-management \
  -p 5000:5000 \
  --env-file .env \
  agent-management
```

**访问**：http://localhost:5000

**完成时间**：⏱️ 5-8 分钟

---

### 方式 3️⃣: Netlify

**优点**：免费额度大、功能灵活

**步骤**：

1. 访问 [Netlify](https://app.netlify.com/)
2. 点击 `Add new site` → `Import an existing project`
3. 选择 GitHub 仓库
4. 配置构建设置（自动读取 `netlify.toml`）
5. 添加环境变量（同 Vercel）
6. 点击 `Deploy`

**完成时间**：⏱️ 3-5 分钟

---

## 🎯 部署后验证

### 1. 检查服务状态

```bash
# Vercel
vercel ls

# Docker
docker-compose ps

# Netlify
# 查看 Dashboard 中的部署状态
```

### 2. 访问应用

- Vercel: `https://your-project.vercel.app`
- Docker: `http://localhost:5000`
- Netlify: `https://your-site.netlify.app`

### 3. 测试核心功能

- ✅ 页面正常加载
- ✅ 创建智能体
- ✅ 流式对话
- ✅ 上传文档

---

## 📚 详细文档

- [🌐 多平台部署指南](MULTI_PLATFORM_DEPLOYMENT.md) - 完整的部署方案
- [⚙️ 环境变量配置](DEPLOYMENT_ENV.md) - 详细的环境变量说明
- [🐳 Docker 部署](DEPLOYMENT.md) - Docker 高级配置
- [📤 GitHub 推送](PUSH_TO_GITHUB.md) - 将代码推送到 GitHub

---

## 🆘 常见问题

### Q: 部署失败怎么办？

A: 查看部署日志：
- Vercel: `vercel logs`
- Docker: `docker-compose logs -f`
- Netlify: Dashboard → Deploys → 选择部署 → View logs

### Q: 环境变量不生效？

A: 重新部署：
- Vercel: `vercel --prod`
- Docker: `docker-compose restart`
- Netlify: 手动触发部署

### Q: 数据库连接失败？

A: 检查：
1. 数据库是否在线
2. 连接字符串是否正确
3. IP 白名单是否配置

### Q: 文件上传失败？

A: 检查：
1. S3 配置是否正确
2. Bucket 权限是否设置
3. 存储空间是否足够

---

## 🔐 安全建议

1. ✅ 不要将 `.env` 文件提交到 Git
2. ✅ 使用强密码和随机密钥
3. ✅ 定期轮换 API 密钥
4. ✅ 启用 HTTPS（Vercel/Netlify 自动启用）
5. ✅ 配置数据库访问白名单

---

## 💡 下一步

1. ✅ 配置自定义域名
2. ✅ 设置监控告警
3. ✅ 配置自动备份
4. ✅ 优化性能和缓存

---

## 📞 获取帮助

- 📖 查看详细文档
- 💬 提交 Issue
- 📧 联系支持团队

**祝您部署顺利！** 🎉
