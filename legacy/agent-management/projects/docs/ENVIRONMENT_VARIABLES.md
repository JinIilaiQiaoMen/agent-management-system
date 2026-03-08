# 环境变量配置文档

## 概述

本文档详细说明了智能体管理系统的所有环境变量配置项，包括开发环境和生产环境的配置建议。

## 快速开始

### 1. 开发环境配置

```bash
# 复制环境变量示例文件
cp .env.example .env

# 根据实际情况修改 .env 文件中的配置值
nano .env
```

### 2. 生产环境配置

```bash
# 复制生产环境配置文件
cp .env.production.example .env.production

# 根据实际情况修改配置值
nano .env.production

# ⚠️ 重要：所有密钥和密码必须更改为强密码！
```

## 配置分类

### 1. 应用配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `NODE_ENV` | 运行环境 | `development` | 否 | `production` |
| `PORT` | 应用端口 | `5000` | 否 | `5000` |
| `APP_NAME` | 应用名称 | - | 否 | `Agent Management System` |
| `APP_VERSION` | 应用版本 | `1.0.0` | 否 | `1.0.0` |
| `APP_URL` | 应用URL | - | 是 | `https://your-domain.com` |

**配置建议**：
- 开发环境：`NODE_ENV=development`, `APP_URL=http://localhost:5000`
- 生产环境：`NODE_ENV=production`, `APP_URL=https://your-domain.com`

### 2. 数据库配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `DATABASE_URL` | PostgreSQL连接字符串 | - | 是 | `postgresql://user:pass@host:5432/db` |
| `DATABASE_POOL_MIN` | 连接池最小连接数 | `2` | 否 | `5` |
| `DATABASE_POOL_MAX` | 连接池最大连接数 | `10` | 否 | `20` |

**配置建议**：
- 开发环境：`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agent_management`
- 生产环境：使用强密码，连接池设置为 5-20

### 3. Coze Coding SDK配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `COZE_API_KEY` | Coze API密钥 | - | 是 | `your_api_key` |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | - | 是 | `https://s3.amazonaws.com` |
| `COZE_BUCKET_NAME` | 对象存储桶名 | - | 是 | `agent-management` |
| `COZE_BUCKET_REGION` | 对象存储区域 | - | 是 | `us-east-1` |
| `COZE_KNOWLEDGE_BASE_ID` | 知识库ID | - | 否 | `kb_123` |
| `COZE_LLM_MODEL` | 大模型名称 | `doubao-pro-32k` | 否 | `doubao-pro-32k` |
| `COZE_LLM_API_KEY` | 大模型API密钥 | - | 是 | `your_llm_api_key` |
| `COZE_LLM_BASE_URL` | 大模型API地址 | - | 是 | `https://api.example.com` |
| `COZE_WEB_SEARCH_ENABLED` | 是否启用联网搜索 | `true` | 否 | `true` |
| `COZE_WEB_SEARCH_API_KEY` | 联网搜索API密钥 | - | 是 | `your_search_api_key` |

**配置建议**：
- 所有 API Key 必须从相关平台获取
- 生产环境使用独立的生产环境密钥
- 大模型选择根据需求和预算决定

### 4. Redis配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `REDIS_URL` | Redis连接字符串 | - | 否 | `redis://localhost:6379` |
| `REDIS_PASSWORD` | Redis密码 | - | 否 | `your_password` |
| `REDIS_DB` | Redis数据库编号 | `0` | 否 | `0` |

**配置建议**：
- 开发环境：可以不配置，应用会自动降级
- 生产环境：强烈建议配置，用于缓存和会话管理

### 5. 安全配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `JWT_SECRET` | JWT密钥（至少32字符） | - | 是 | `very_long_random_secret...` |
| `API_SECRET_KEY` | API密钥 | - | 是 | `random_secret_key` |
| `SESSION_SECRET` | Session密钥 | - | 是 | `another_secret_key` |
| `PASSWORD_SALT` | 密码加密盐值 | - | 是 | `salt_value` |
| `ALLOWED_ORIGINS` | 允许的源（CORS） | - | 是 | `https://your-domain.com` |

**配置建议**：
- ⚠️ 所有密钥必须使用强随机字符串（至少32字符）
- 生产环境不要使用示例中的密钥
- `ALLOWED_ORIGINS` 不要使用通配符 `*`

生成强密钥的方法：
```bash
# 生成JWT密钥
openssl rand -base64 64

# 生成随机密钥
openssl rand -hex 32
```

### 6. 日志配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `LOG_LEVEL` | 日志级别 | `info` | 否 | `warn` |
| `LOG_FILE` | 日志文件路径 | - | 否 | `/var/log/app.log` |
| `LOG_MAX_SIZE` | 单个日志文件最大大小 | `10m` | 否 | `50m` |
| `LOG_MAX_FILES` | 日志文件保留数量 | `10` | 否 | `30` |

**配置建议**：
- 开发环境：`LOG_LEVEL=debug` 或 `info`
- 生产环境：`LOG_LEVEL=warn` 或 `error`

### 7. 外部服务配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `SMTP_HOST` | SMTP服务器地址 | - | 否 | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP端口 | `587` | 否 | `587` |
| `SMTP_USER` | SMTP用户名 | - | 否 | `user@gmail.com` |
| `SMTP_PASSWORD` | SMTP密码 | - | 否 | `app_password` |
| `SMTP_FROM` | 发件人地址 | - | 否 | `noreply@domain.com` |

**配置建议**：
- 仅在需要发送邮件通知时配置
- Gmail 需要使用应用专用密码

### 8. API配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `API_TIMEOUT` | API请求超时（毫秒） | `30000` | 否 | `30000` |
| `API_RETRY_COUNT` | API默认重试次数 | `3` | 否 | `3` |
| `API_RATE_LIMIT` | API速率限制（请求/分钟） | `60` | 否 | `60` |

### 9. 限流配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `ENABLE_RATE_LIMIT` | 是否启用限流 | `true` | 否 | `true` |
| `RATE_LIMIT_MAX_REQUESTS` | 全局限流请求数 | `100` | 否 | `100` |
| `RATE_LIMIT_WINDOW_MS` | 限流时间窗口（毫秒） | `60000` | 否 | `60000` |
| `API_RATE_LIMIT_ENABLED` | API限流开关 | `true` | 否 | `true` |
| `API_RATE_LIMIT_MAX` | API限流请求数 | `60` | 否 | `60` |
| `API_RATE_LIMIT_WINDOW` | API限流时间窗口 | `60000` | 否 | `60000` |

### 10. 文件上传配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `MAX_FILE_SIZE` | 最大文件大小（字节） | `52428800` | 否 | `52428800` |
| `ALLOWED_FILE_TYPES` | 允许的文件类型 | - | 否 | `.txt,.pdf,.jpg` |
| `FILE_STORAGE_PATH` | 文件存储路径 | - | 否 | `/var/uploads` |

**配置建议**：
- `MAX_FILE_SIZE=52428800` (50MB)
- 根据需求调整允许的文件类型

### 11. 知识库配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `KNOWLEDGE_BASE_MAX_FILE_SIZE` | 知识库文件大小限制 | `20971520` | 否 | `20971520` |
| `KNOWLEDGE_BASE_ALLOWED_TYPES` | 知识库允许的文件类型 | - | 否 | `.txt,.pdf,.docx` |
| `DOCUMENT_PARSE_TIMEOUT` | 文档解析超时（毫秒） | `60000` | 否 | `60000` |

### 12. 任务配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `TASK_DEFAULT_PRIORITY` | 任务默认优先级 | `medium` | 否 | `high` |
| `TASK_AUTO_ASSIGN_ENABLED` | 是否自动分配任务 | `true` | 否 | `true` |
| `TASK_TIMEOUT` | 任务超时时间（毫秒） | `3600000` | 否 | `3600000` |

### 13. 智能体配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `AGENT_DEFAULT_SYSTEM_PROMPT` | 默认系统提示词 | - | 否 | `You are a helpful AI assistant.` |
| `AGENT_CONTEXT_WINDOW` | 上下文窗口大小 | `8192` | 否 | `8192` |
| `AGENT_MAX_RESPONSE_LENGTH` | 最大响应长度 | `4096` | 否 | `4096` |

### 14. API调整模块配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `API_CONFIG_DEFAULT_TIMEOUT` | API配置默认超时 | `30000` | 否 | `30000` |
| `API_CONFIG_DEFAULT_RETRY` | API配置默认重试次数 | `0` | 否 | `0` |
| `API_CONFIG_DEFAULT_RATE_LIMIT` | API配置默认速率限制 | `60` | 否 | `60` |

### 15. 缓存配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `ENABLE_CACHING` | 是否启用缓存 | `true` | 否 | `true` |
| `CACHE_TTL` | 缓存过期时间（秒） | `3600` | 否 | `3600` |

### 16. 功能开关

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `ENABLE_RATE_LIMIT` | 启用限流 | `true` | 否 | `true` |
| `ENABLE_CACHING` | 启用缓存 | `true` | 否 | `true` |
| `ENABLE_LOGGING` | 启用日志 | `true` | 否 | `true` |
| `ENABLE_ERROR_REPORTING` | 启用错误报告 | `true` | 否 | `true` |
| `ENABLE_FILE_UPLOAD` | 启用文件上传 | `true` | 否 | `true` |
| `ENABLE_KNOWLEDGE_BASE` | 启用知识库 | `true` | 否 | `true` |
| `ENABLE_API_CONFIG` | 启用API配置 | `true` | 否 | `true` |
| `ENABLE_TASK_DELIVERABLE` | 启用任务成果 | `true` | 否 | `true` |

### 17. 监控和告警

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `SENTRY_DSN` | Sentry DSN | - | 否 | `https://sentry.io/project-id` |
| `MONITORING_ENDPOINT` | 监控端点 | - | 否 | `https://monitoring.com/webhook` |
| `HEALTH_CHECK_ENABLED` | 启用健康检查 | `true` | 否 | `true` |
| `HEALTH_CHECK_PATH` | 健康检查路径 | `/api/health` | 否 | `/api/health` |

**配置建议**：
- 生产环境强烈建议配置 Sentry
- 健康检查用于负载均衡器探测

### 18. 备份配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `BACKUP_ENABLED` | 启用备份 | `false` | 否 | `true` |
| `BACKUP_SCHEDULE` | 备份计划任务 | - | 否 | `0 2 * * *` |
| `BACKUP_RETENTION_DAYS` | 备份保留天数 | `7` | 否 | `30` |
| `BACKUP_PATH` | 备份存储路径 | - | 否 | `/var/backups` |

**配置建议**：
- 开发环境：`BACKUP_ENABLED=false`
- 生产环境：`BACKUP_ENABLED=true`，至少保留30天备份

### 19. 开发工具

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `DEVTOOLS_ENABLED` | 启用开发工具 | `true` | 否 | `false` |
| `SHOW_DETAILED_ERRORS` | 显示详细错误 | `true` | 否 | `false` |

**配置建议**：
- 开发环境：`DEVTOOLS_ENABLED=true`, `SHOW_DETAILED_ERRORS=true`
- 生产环境：`DEVTOOLS_ENABLED=false`, `SHOW_DETAILED_ERRORS=false`

### 20. 其他配置

| 变量名 | 说明 | 默认值 | 必填 | 示例 |
|--------|------|--------|------|------|
| `TZ` | 时区 | `Asia/Shanghai` | 否 | `Asia/Shanghai` |
| `LANG` | 语言 | `zh_CN.UTF-8` | 否 | `zh_CN.UTF-8` |
| `TIMEZONE_OFFSET` | 时区偏移（小时） | `8` | 否 | `8` |

## 安全最佳实践

### 1. 密钥管理

- ✅ 使用强随机字符串（至少32字符）
- ✅ 定期更换密钥
- ✅ 不要将 `.env` 文件提交到版本控制
- ✅ 使用密钥管理服务（如 HashiCorp Vault）

### 2. 数据库安全

- ✅ 使用强密码
- ✅ 限制数据库访问IP
- ✅ 定期备份数据库
- ✅ 启用 SSL 连接

### 3. API安全

- ✅ 启用速率限制
- ✅ 使用 HTTPS
- ✅ 配置 CORS 白名单
- ✅ 定期轮换 API 密钥

### 4. 文件安全

- ✅ 限制上传文件大小
- ✅ 验证文件类型
- ✅ 扫描恶意文件
- ✅ 设置文件权限

## 环境变量验证

在应用启动时，会验证所有必填的环境变量是否已配置。如果缺少必填变量，应用将无法启动。

### 必填环境变量清单

- `DATABASE_URL`
- `COZE_API_KEY`
- `COZE_BUCKET_ENDPOINT_URL`
- `COZE_BUCKET_NAME`
- `COZE_BUCKET_REGION`
- `COZE_LLM_API_KEY`
- `COZE_LLM_BASE_URL`
- `COZE_WEB_SEARCH_API_KEY`
- `JWT_SECRET`
- `API_SECRET_KEY`
- `SESSION_SECRET`
- `PASSWORD_SALT`
- `ALLOWED_ORIGINS`

## 故障排查

### 问题：应用无法启动

**可能原因**：
- 缺少必填的环境变量
- 环境变量格式错误
- 数据库连接失败

**解决方案**：
1. 检查 `.env` 文件是否存在
2. 验证所有必填变量已配置
3. 检查数据库连接字符串是否正确

### 问题：API调用失败

**可能原因**：
- API密钥配置错误
- 速率限制触发
- 网络连接问题

**解决方案**：
1. 验证 API 密钥是否正确
2. 检查速率限制配置
3. 查看日志文件获取详细错误信息

### 问题：文件上传失败

**可能原因**：
- 文件大小超过限制
- 文件类型不允许
- 存储空间不足

**解决方案**：
1. 检查 `MAX_FILE_SIZE` 配置
2. 验证 `ALLOWED_FILE_TYPES` 配置
3. 检查磁盘空间

## 相关文档

- [API 响应格式统一指南](/docs/API_RESPONSE_GUIDE.md)
- [API 调整模块使用文档](/docs/API_CONFIG_MODULE.md)
- [部署文档](/DEPLOYMENT.md)
- [项目 README](/README.md)
