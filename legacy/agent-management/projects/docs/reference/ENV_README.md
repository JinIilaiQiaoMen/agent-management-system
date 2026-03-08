# 项目环境变量配置完整指南

本指南提供了智能体管理系统所有环境变量的完整配置说明。

## 📁 配置文件清单

### 1. `.env.example`
开发环境配置示例文件，包含所有可配置的环境变量及其说明。

### 2. `.env.production.example`
生产环境配置示例文件，包含生产环境的推荐配置和安全建议。

### 3. `.env`
实际使用的环境变量文件（不应提交到版本控制）。

### 4. `.env.production`
生产环境的环境变量文件（不应提交到版本控制）。

### 5. `docs/ENVIRONMENT_VARIABLES.md`
详细的环境变量配置文档，包含每个变量的说明、默认值和配置建议。

### 6. `ENV_SETUP.md`
快速配置指南，帮助用户快速配置环境变量。

### 7. `scripts/validate-env.mjs`
环境变量验证脚本，用于检查配置是否正确。

## 🚀 快速开始

### 配置开发环境

```bash
# 1. 复制示例文件
cp .env.example .env

# 2. 编辑配置文件（使用你喜欢的编辑器）
nano .env
# 或
vim .env

# 3. 验证配置
pnpm validate:env
```

### 配置生产环境

```bash
# 1. 复制生产环境示例文件
cp .env.production.example .env.production

# 2. 编辑配置文件（⚠️ 所有密钥必须修改！）
nano .env.production

# 3. 验证配置
pnpm validate:env:prod
```

## 🔍 验证命令

### 验证开发环境
```bash
pnpm validate:env
```

### 验证生产环境
```bash
pnpm validate:env:prod
```

验证脚本会检查：
- ✅ 必填的环境变量是否已配置
- ✅ 环境变量格式是否正确
- ⚠️  生产环境的安全配置建议
- 🔒 敏感信息（密钥、密码）自动隐藏

## 📋 必填环境变量清单

以下环境变量必须配置，否则应用无法启动：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 数据库连接字符串 | `postgresql://user:pass@host:5432/db` |
| `COZE_API_KEY` | Coze API 密钥 | `your_api_key` |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | `https://s3.amazonaws.com` |
| `COZE_BUCKET_NAME` | 对象存储桶名 | `agent-management` |
| `COZE_BUCKET_REGION` | 对象存储区域 | `us-east-1` |
| `COZE_LLM_API_KEY` | 大模型 API 密钥 | `your_llm_api_key` |
| `COZE_LLM_BASE_URL` | 大模型 API 地址 | `https://api.example.com` |
| `COZE_WEB_SEARCH_API_KEY` | 联网搜索 API 密钥 | `your_search_api_key` |
| `JWT_SECRET` | JWT 密钥（至少32字符） | `very_long_random_secret` |
| `API_SECRET_KEY` | API 密钥 | `random_secret_key` |
| `SESSION_SECRET` | Session 密钥 | `another_secret_key` |
| `PASSWORD_SALT` | 密码加密盐值 | `salt_value` |
| `ALLOWED_ORIGINS` | 允许的源（CORS） | `https://your-domain.com` |

## 🔒 安全最佳实践

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

- ✅ 不要将 `.env` 文件提交到版本控制（已在 .gitignore 中配置）
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

## 📚 配置分类

### 应用配置
- `NODE_ENV` - 运行环境
- `PORT` - 应用端口
- `APP_NAME` - 应用名称
- `APP_VERSION` - 应用版本
- `APP_URL` - 应用URL

### 数据库配置
- `DATABASE_URL` - PostgreSQL 连接字符串
- `DATABASE_POOL_MIN` - 连接池最小连接数
- `DATABASE_POOL_MAX` - 连接池最大连接数

### Coze Coding SDK配置
- `COZE_API_KEY` - Coze API 密钥
- `COZE_BUCKET_ENDPOINT_URL` - 对象存储端点
- `COZE_BUCKET_NAME` - 对象存储桶名
- `COZE_BUCKET_REGION` - 对象存储区域
- `COZE_KNOWLEDGE_BASE_ID` - 知识库ID
- `COZE_LLM_MODEL` - 大模型名称
- `COZE_LLM_API_KEY` - 大模型API密钥
- `COZE_LLM_BASE_URL` - 大模型API地址
- `COZE_WEB_SEARCH_ENABLED` - 是否启用联网搜索
- `COZE_WEB_SEARCH_API_KEY` - 联网搜索API密钥

### Redis配置
- `REDIS_URL` - Redis 连接字符串
- `REDIS_PASSWORD` - Redis 密码
- `REDIS_DB` - Redis 数据库编号

### 安全配置
- `JWT_SECRET` - JWT 密钥
- `API_SECRET_KEY` - API 密钥
- `SESSION_SECRET` - Session 密钥
- `PASSWORD_SALT` - 密码加密盐值
- `ALLOWED_ORIGINS` - 允许的源（CORS）

### 日志配置
- `LOG_LEVEL` - 日志级别
- `LOG_FILE` - 日志文件路径
- `LOG_MAX_SIZE` - 单个日志文件最大大小
- `LOG_MAX_FILES` - 日志文件保留数量

### API配置
- `API_TIMEOUT` - API 请求超时
- `API_RETRY_COUNT` - API 默认重试次数
- `API_RATE_LIMIT` - API 速率限制

### 文件上传配置
- `MAX_FILE_SIZE` - 最大文件大小
- `ALLOWED_FILE_TYPES` - 允许的文件类型
- `FILE_STORAGE_PATH` - 文件存储路径

### 知识库配置
- `KNOWLEDGE_BASE_MAX_FILE_SIZE` - 知识库文件大小限制
- `KNOWLEDGE_BASE_ALLOWED_TYPES` - 知识库允许的文件类型
- `DOCUMENT_PARSE_TIMEOUT` - 文档解析超时

### 任务配置
- `TASK_DEFAULT_PRIORITY` - 任务默认优先级
- `TASK_AUTO_ASSIGN_ENABLED` - 是否自动分配任务
- `TASK_TIMEOUT` - 任务超时时间

### 智能体配置
- `AGENT_DEFAULT_SYSTEM_PROMPT` - 默认系统提示词
- `AGENT_CONTEXT_WINDOW` - 上下文窗口大小
- `AGENT_MAX_RESPONSE_LENGTH` - 最大响应长度

### API调整模块配置
- `API_CONFIG_DEFAULT_TIMEOUT` - API配置默认超时
- `API_CONFIG_DEFAULT_RETRY` - API配置默认重试次数
- `API_CONFIG_DEFAULT_RATE_LIMIT` - API配置默认速率限制

### 监控和告警
- `SENTRY_DSN` - Sentry DSN
- `MONITORING_ENDPOINT` - 监控端点
- `HEALTH_CHECK_ENABLED` - 启用健康检查
- `HEALTH_CHECK_PATH` - 健康检查路径

### 备份配置
- `BACKUP_ENABLED` - 启用备份
- `BACKUP_SCHEDULE` - 备份计划任务
- `BACKUP_RETENTION_DAYS` - 备份保留天数
- `BACKUP_PATH` - 备份存储路径

### 功能开关
- `ENABLE_RATE_LIMIT` - 启用限流
- `ENABLE_CACHING` - 启用缓存
- `ENABLE_LOGGING` - 启用日志
- `ENABLE_ERROR_REPORTING` - 启用错误报告
- `ENABLE_FILE_UPLOAD` - 启用文件上传
- `ENABLE_KNOWLEDGE_BASE` - 启用知识库
- `ENABLE_API_CONFIG` - 启用API配置
- `ENABLE_TASK_DELIVERABLE` - 启用任务成果

## ❓ 常见问题

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

### Q: 为什么验证脚本显示警告？

A: 警告通常是因为：
- 生产环境使用了默认密码
- 密钥长度不足
- 使用了示例密钥
- 未配置推荐的生产环境配置

## 📖 相关文档

- [环境变量配置详细文档](/docs/ENVIRONMENT_VARIABLES.md)
- [快速配置指南](/ENV_SETUP.md)
- [API 响应格式统一指南](/docs/API_RESPONSE_GUIDE.md)
- [API 调整模块使用文档](/docs/API_CONFIG_MODULE.md)
- [部署文档](/DEPLOYMENT.md)
- [项目 README](/README.md)

## 💡 提示

1. 首次配置时，建议从 `.env.example` 开始，逐步填写实际值
2. 生产环境配置完成后，务必运行 `pnpm validate:env:prod` 验证
3. 定期检查和更新密钥，确保系统安全
4. 将 `.env` 文件添加到 `.gitignore`，防止敏感信息泄露
5. 使用环境变量管理工具（如 direnv）自动加载环境变量

## 🆘 获取帮助

如有问题，请查看：
1. [环境变量配置详细文档](/docs/ENVIRONMENT_VARIABLES.md)
2. [快速配置指南](/ENV_SETUP.md)
3. 运行 `pnpm validate:env` 检查配置
4. 查看应用日志获取详细错误信息
