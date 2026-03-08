# 环境变量配置指南

## 快速开始

### 1. 配置开发环境

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑配置文件
nano .env

# 验证配置
pnpm validate:env
```

### 2. 配置生产环境

```bash
# 复制生产环境配置文件
cp .env.production.example .env.production

# 编辑配置文件
nano .env.production

# 验证配置
pnpm validate:env:prod
```

## 配置文件说明

### .env.example
开发环境配置示例文件，包含所有可配置的环境变量及其说明。

### .env.production.example
生产环境配置示例文件，包含生产环境的推荐配置和安全建议。

### .env
实际使用的环境变量文件（不应提交到版本控制）。

### .env.production
生产环境的环境变量文件（不应提交到版本控制）。

## 验证命令

### 验证开发环境配置
```bash
pnpm validate:env
```

### 验证生产环境配置
```bash
pnpm validate:env:prod
```

验证脚本会检查：
- ✅ 必填的环境变量是否已配置
- ✅ 环境变量格式是否正确
- ⚠️  生产环境的安全配置建议

## 必填环境变量

以下环境变量必须配置，否则应用无法启动：

- `DATABASE_URL` - PostgreSQL 数据库连接字符串
- `COZE_API_KEY` - Coze API 密钥
- `COZE_BUCKET_ENDPOINT_URL` - 对象存储端点
- `COZE_BUCKET_NAME` - 对象存储桶名
- `COZE_BUCKET_REGION` - 对象存储区域
- `COZE_LLM_API_KEY` - 大模型 API 密钥
- `COZE_LLM_BASE_URL` - 大模型 API 地址
- `COZE_WEB_SEARCH_API_KEY` - 联网搜索 API 密钥
- `JWT_SECRET` - JWT 密钥（至少32字符）
- `API_SECRET_KEY` - API 密钥
- `SESSION_SECRET` - Session 密钥
- `PASSWORD_SALT` - 密码加密盐值
- `ALLOWED_ORIGINS` - 允许的源（CORS）

## 安全建议

### 1. 密钥生成

生成强密钥的方法：
```bash
# 生成 JWT 密钥
openssl rand -base64 64

# 生成随机密钥
openssl rand -hex 32

# 生成 API 密钥
openssl rand -hex 32
```

### 2. 密钥管理

- ✅ 不要将 `.env` 文件提交到版本控制
- ✅ 使用强随机字符串（至少32字符）
- ✅ 定期更换密钥
- ✅ 生产环境使用独立的生产环境密钥
- ✅ 考虑使用密钥管理服务（如 HashiCorp Vault）

### 3. 生产环境配置

生产环境必须修改的配置：
- 🔒 所有密钥和密码（不能使用示例值）
- 🔒 `ALLOWED_ORIGINS`（不能使用通配符）
- 🔒 `DEVTOOLS_ENABLED=false`
- 🔒 `SHOW_DETAILED_ERRORS=false`
- 🔒 数据库密码（使用强密码）
- 🔒 启用备份 `BACKUP_ENABLED=true`

### 4. 敏感信息保护

以下变量包含敏感信息，已在验证脚本中自动隐藏：
- 包含 `SECRET` 的变量
- 包含 `PASSWORD` 的变量
- 包含 `TOKEN` 的变量
- 包含 `KEY` 的变量
- 包含 `AUTH` 的变量
- 包含 `SALT` 的变量

## 常见问题

### Q: 如何配置数据库连接？

A: 格式为 `postgresql://用户名:密码@主机:端口/数据库名`

示例：
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agent_management
```

### Q: 如何配置对象存储？

A: 需要配置以下变量：

```bash
COZE_BUCKET_ENDPOINT_URL=https://s3.amazonaws.com
COZE_BUCKET_NAME=your-bucket-name
COZE_BUCKET_REGION=us-east-1
```

### Q: 如何生成强密钥？

A: 使用 OpenSSL 生成：

```bash
openssl rand -base64 64
```

### Q: 生产环境必须配置哪些变量？

A: 生产环境除了必填变量外，还必须配置：
- `SENTRY_DSN` - 错误追踪
- `BACKUP_ENABLED=true` - 启用备份
- 强密码和密钥

### Q: 如何验证配置是否正确？

A: 运行验证命令：

```bash
# 开发环境
pnpm validate:env

# 生产环境
pnpm validate:env:prod
```

## 相关文档

- [环境变量配置详细文档](/docs/ENVIRONMENT_VARIABLES.md)
- [API 响应格式统一指南](/docs/API_RESPONSE_GUIDE.md)
- [API 调整模块使用文档](/docs/API_CONFIG_MODULE.md)
- [部署文档](/DEPLOYMENT.md)

## 支持和帮助

如有问题，请查看：
1. [环境变量配置详细文档](/docs/ENVIRONMENT_VARIABLES.md)
2. 运行 `pnpm validate:env` 检查配置
3. 查看应用日志获取详细错误信息
