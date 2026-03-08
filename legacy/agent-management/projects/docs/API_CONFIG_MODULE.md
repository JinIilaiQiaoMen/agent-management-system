# API 调整模块使用文档

## 概述

API 调整模块允许为智能体配置和管理外部 API 接口，支持 REST、GraphQL 等多种协议，并提供完整的 CRUD 操作、测试功能、执行日志和智能体自动调用能力。

## 功能特性

- ✅ **API 配置管理** - 创建、编辑、删除、查询 API 配置
- ✅ **多种认证方式** - 支持 API Key、Bearer Token、Basic Auth、OAuth 2.0
- ✅ **API 测试** - 在线测试 API 配置是否正常工作
- ✅ **执行日志** - 记录所有 API 调用的详细信息
- ✅ **智能体集成** - 智能体可以自动调用配置的 API
- ✅ **请求配置** - 自定义请求头、查询参数、请求体模板
- ✅ **重试机制** - 支持自动重试失败的请求
- ✅ **超时控制** - 可配置的请求超时时间

## 数据库表结构

### agent_api_configs

存储智能体的 API 配置信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| agentId | VARCHAR(36) | 关联的智能体ID |
| name | VARCHAR(128) | API名称 |
| type | VARCHAR(20) | API类型（REST、GraphQL、WebSocket） |
| url | TEXT | API地址 |
| method | VARCHAR(10) | HTTP方法 |
| headers | JSONB | 请求头 |
| queryParams | JSONB | 查询参数 |
| bodyTemplate | TEXT | 请求体模板 |
| authType | VARCHAR(20) | 认证类型 |
| authConfig | JSONB | 认证配置 |
| description | TEXT | 描述 |
| isActive | BOOLEAN | 是否启用 |
| timeout | INTEGER | 超时时间（毫秒） |
| retryCount | INTEGER | 重试次数 |
| rateLimit | INTEGER | 速率限制 |
| metadata | JSONB | 元数据 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

### api_execution_logs

存储 API 执行日志。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| apiConfigId | VARCHAR(36) | 关联的API配置ID |
| taskId | VARCHAR(36) | 关联的任务ID |
| agentId | VARCHAR(36) | 调用该API的智能体ID |
| requestUrl | TEXT | 请求URL |
| requestMethod | VARCHAR(10) | 请求方法 |
| requestHeaders | JSONB | 请求头 |
| requestBody | TEXT | 请求体 |
| responseStatus | INTEGER | 响应状态码 |
| responseHeaders | JSONB | 响应头 |
| responseBody | TEXT | 响应体 |
| status | VARCHAR(20) | 执行状态 |
| errorMessage | TEXT | 错误信息 |
| executionTime | INTEGER | 执行耗时（毫秒） |
| retries | INTEGER | 重试次数 |
| metadata | JSONB | 元数据 |
| createdAt | TIMESTAMP | 创建时间 |

## API 接口

### 1. 获取 API 配置列表

```
GET /api/agent-api-configs
```

查询参数：
- `agentId` (可选) - 筛选特定智能体的配置
- `isActive` (可选) - 筛选启用状态（true/false）

响应：
```json
{
  "success": true,
  "data": {
    "configs": [...]
  }
}
```

### 2. 创建 API 配置

```
POST /api/agent-api-configs
```

请求体：
```json
{
  "agentId": "智能体ID",
  "name": "API名称",
  "type": "REST",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "Content-Type": "application/json"
  },
  "queryParams": {},
  "bodyTemplate": "{ \"name\": \"{{userName}}\" }",
  "authType": "bearer",
  "authConfig": {
    "token": "your-token"
  },
  "description": "用户信息API",
  "isActive": true,
  "timeout": 30000,
  "retryCount": 3,
  "rateLimit": 60
}
```

### 3. 获取单个 API 配置

```
GET /api/agent-api-configs/:id
```

### 4. 更新 API 配置

```
PUT /api/agent-api-configs/:id
```

### 5. 删除 API 配置

```
DELETE /api/agent-api-configs/:id
```

### 6. 获取智能体的所有 API 配置

```
GET /api/agent-api-configs/agent/:agentId
```

### 7. 测试 API 配置

```
POST /api/agent-api-configs/:id/test
```

请求体：
```json
{
  "testData": {
    "userName": "张三"
  }
}
```

### 8. 执行智能体的所有 API

```
POST /api/agents/:agentId/execute-apis
```

请求体：
```json
{
  "taskId": "任务ID（可选）",
  "testData": {}
}
```

### 9. 获取 API 执行日志

```
GET /api/api-execution-logs
```

查询参数：
- `apiConfigId` (可选) - 筛选特定API配置的日志
- `taskId` (可选) - 筛选特定任务的日志
- `agentId` (可选) - 筛选特定智能体的日志
- `status` (可选) - 筛选状态（success、failed、error）
- `page` (可选) - 页码
- `limit` (可选) - 每页数量

## 前端使用

### 1. 访问 API 配置管理页面

访问 `/api-configs` 页面可以管理所有 API 配置。

### 2. 添加 API 配置

点击"添加API配置"按钮，填写配置信息：
- **基本信息**：名称、类型、地址、方法
- **请求配置**：请求头、查询参数、请求体模板
- **认证配置**：选择认证类型并填写相应信息

### 3. 测试 API

在配置列表中，点击"测试API"按钮可以测试配置是否正常。

## 认证类型

### API Key

在请求头中添加 API Key：

```json
{
  "authType": "api_key",
  "authConfig": {
    "apiKey": "your-api-key",
    "apiKeyHeader": "X-API-Key"
  }
}
```

### Bearer Token

在 Authorization 头中添加 Bearer Token：

```json
{
  "authType": "bearer",
  "authConfig": {
    "token": "your-bearer-token"
  }
}
```

### Basic Auth

使用 Basic 认证：

```json
{
  "authType": "basic",
  "authConfig": {
    "username": "your-username",
    "password": "your-password"
  }
}
```

## 请求体模板

支持变量替换，使用 `{{variableName}}` 格式：

```json
{
  "bodyTemplate": "{ \"name\": \"{{userName}}\", \"email\": \"{{userEmail}}\" }"
}
```

调用时传入测试数据：
```json
{
  "testData": {
    "userName": "张三",
    "userEmail": "zhangsan@example.com"
  }
}
```

## 智能体调用 API

智能体可以通过以下方式调用配置的 API：

```typescript
import { executeAgentApiCalls } from '@/lib/api-executor';

// 执行智能体的所有API调用
const results = await executeAgentApiCalls(agentId, {
  taskId: 'task-123',
  testData: {
    userName: '张三'
  }
});

// 执行单个API调用
import { executeApiCall } from '@/lib/api-executor';
const result = await executeApiCall(apiConfigId, {
  testData: {}
});
```

## 数据库迁移

首次使用需要创建数据库表：

```bash
# 执行迁移脚本
psql $DATABASE_URL -f init-api-configs-tables.sql
```

## 使用示例

### 示例1：配置一个用户信息 API

```json
{
  "agentId": "agent-123",
  "name": "用户信息API",
  "type": "REST",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "Content-Type": "application/json"
  },
  "authType": "bearer",
  "authConfig": {
    "token": "your-token"
  },
  "isActive": true,
  "timeout": 30000
}
```

### 示例2：配置一个创建用户 API

```json
{
  "agentId": "agent-123",
  "name": "创建用户API",
  "type": "REST",
  "url": "https://api.example.com/users",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "bodyTemplate": "{ \"name\": \"{{userName}}\", \"email\": \"{{userEmail}}\" }",
  "authType": "bearer",
  "authConfig": {
    "token": "your-token"
  },
  "isActive": true,
  "timeout": 30000,
  "retryCount": 3
}
```

### 示例3：测试 API

```bash
curl -X POST http://localhost:5000/api/agent-api-configs/xxx/test \
  -H "Content-Type: application/json" \
  -d '{"testData": {"userName": "张三"}}'
```

## 注意事项

1. **数据库迁移**：首次使用前需要执行数据库迁移脚本
2. **认证安全**：认证信息（如 API Key、Token）会加密存储在数据库中
3. **速率限制**：合理设置速率限制，避免触发目标 API 的限流
4. **超时设置**：根据目标 API 的响应时间设置合适的超时时间
5. **重试策略**：合理设置重试次数，避免无限重试
6. **错误处理**：查看执行日志了解 API 调用失败的原因

## 后续优化

- [ ] 支持更多认证方式（OAuth 2.0 完整流程）
- [ ] 支持请求/响应转换器
- [ ] 支持批量 API 调用
- [ ] 支持 GraphQL 查询构建器
- [ ] 支持 WebSocket 长连接
- [ ] 添加 API 调用监控和报警
- [ ] 支持 Mock 测试
- [ ] 添加 API 文档生成

## 相关文档

- [API 响应格式统一指南](/docs/API_RESPONSE_GUIDE.md)
- [部署文档](/DEPLOYMENT.md)
- [项目 README](/README.md)
