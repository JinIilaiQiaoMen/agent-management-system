# API 响应格式统一修复完成

## 修复内容

本次修复解决了 API 返回 HTML 而非 JSON 导致前端解析错误的问题。

### 新增文件

#### 核心工具

1. **`src/lib/api-response.ts`** - 统一API响应处理工具
   - `jsonResponse()` - 成功响应
   - `errorResponse()` - 错误响应
   - `withErrorHandler()` - 错误处理包装器
   - `ApiResponse<T>` - 响应类型定义

2. **`src/lib/api.ts`** - 前端API调用工具
   - `apiClient` - 统一的API客户端
   - 自动处理错误响应
   - 检测HTML错误页面
   - 类型安全的API调用方法

3. **`src/lib/global-error-handler.ts`** - 全局错误处理
   - 捕获未处理的Promise rejection
   - 捕获全局错误
   - 通过toast显示友好提示

#### 错误页面

4. **`src/app/global-error.tsx`** - 全局错误页面
5. **`src/app/not-found.tsx`** - 404页面

#### 中间件

6. **`src/middleware/error-handler.ts`** - 错误状态码监控中间件

#### 测试工具

7. **`scripts/test-api-routes.mjs`** - API路由测试工具
8. **`scripts/migrate-api-routes.mjs`** - API路由迁移工具
9. **`scripts/generate-api-report.ts`** - 测试报告生成器

#### 监控页面

10. **`src/app/api-monitor/page.tsx`** - API状态监控面板

#### 文档

11. **`docs/API_RESPONSE_GUIDE.md`** - API响应格式使用指南

### 修改文件

1. **`src/app/api/health/route.ts`** - 使用统一响应格式
2. **`src/app/api/knowledge-bases/search/route.ts`** - 使用统一响应格式
3. **`src/components/DocumentSearch.tsx`** - 使用统一API调用工具
4. **`next.config.ts`** - 添加Docker部署优化
5. **`src/app/layout.tsx`** - 导入全局错误处理器
6. **`package.json`** - 添加测试和迁移命令

## 使用方法

### 1. 在API路由中使用统一响应格式

```typescript
import { jsonResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

// 成功响应
export async function GET() {
  const data = { message: 'Hello' };
  return jsonResponse(data, '操作成功');
}

// 错误响应
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 业务逻辑
    return jsonResponse(result);
  } catch (error) {
    return errorResponse('操作失败', 'ERROR_CODE', 500);
  }
}

// 使用错误处理包装器
async function handleRequest(request: NextRequest) {
  // 业务逻辑
  return jsonResponse(data);
}

export const GET = withErrorHandler(handleRequest);
```

### 2. 在前端组件中使用统一API调用工具

```typescript
import { apiClient } from '@/lib/api';

async function fetchData() {
  try {
    const response = await apiClient.get('/api/data');
    console.log(response.data);
  } catch (error) {
    console.error(error.message);
  }
}
```

### 3. 测试API路由

```bash
# 测试所有API路由
pnpm test:api

# 或
npm run test:api
```

### 4. 迁移现有API路由

```bash
# 自动迁移所有API路由
pnpm migrate:api

# 或
npm run migrate:api
```

### 5. 查看API状态监控

访问 `/api-monitor` 页面，可以实时查看所有API路由的运行状态。

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功（可选）",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息（可选）",
    "status": 400
  },
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 错误处理

### 全局错误处理

全局错误处理器会自动捕获所有未处理的错误，并通过toast显示友好提示。

```typescript
// src/lib/global-error-handler.ts

// Promise rejection 错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  event.preventDefault();
  // 显示toast
});

// 全局错误
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
  // 显示toast
});
```

### API错误处理

前端API调用工具会自动检测HTML错误页面，并转换为统一的错误响应。

```typescript
try {
  const response = await apiClient.get('/api/data');
  // 成功处理
} catch (error) {
  // 错误处理
  if (error.status === 401) {
    // 未授权
  } else if (error.status === 403) {
    // 权限不足
  } else if (error.status === 404) {
    // 资源不存在
  } else {
    // 其他错误
  }
}
```

## 部署说明

项目已配置完整的Docker部署环境，包括：

- `Dockerfile` - Docker镜像构建
- `docker-compose.yml` - Docker服务编排
- `nginx/nginx.conf` - Nginx配置
- `init-db.sql` - 数据库初始化脚本
- `deploy.sh` - Linux/macOS部署脚本
- `deploy.bat` - Windows部署脚本

详细部署文档请参考：
- `DEPLOYMENT.md` - 完整部署文档
- `QUICK_START.md` - 快速部署指南
- `DEPLOYMENT_README.md` - 部署包说明

## 最佳实践

1. **始终使用统一响应格式**: 所有API路由都应该使用 `jsonResponse` 或 `errorResponse`
2. **使用有意义的错误码**: 错误码应该清晰地标识错误类型
3. **提供详细的错误信息**: 在开发环境下，可以返回详细的错误堆栈
4. **使用 withErrorHandler**: 对于可能抛出错误的函数，使用 `withErrorHandler` 包装
5. **验证输入**: 在处理请求前，验证所有输入参数
6. **使用前端API工具**: 在前端组件中，使用 `apiClient` 调用API，自动处理错误

## 后续工作

1. **更新所有API路由**: 将所有API路由迁移到使用统一响应格式
2. **更新前端组件**: 更新所有前端组件使用统一API调用工具
3. **测试部署流程**: 验证Docker部署配置是否正常工作
4. **性能优化**: 根据监控数据优化API性能
5. **文档完善**: 完善API文档和部署文档

## 常见问题

### Q: 为什么API会返回HTML而不是JSON?

A: 当API路由发生错误时，Next.js默认会返回HTML错误页面。使用 `jsonResponse` 和 `errorResponse` 可以确保始终返回JSON格式的响应。

### Q: 如何处理验证错误?

A: 使用 `errorResponse` 返回验证错误，并包含详细的验证信息：

```typescript
return errorResponse('参数验证失败', 'VALIDATION_ERROR', 400, {
  validationErrors: errors,
});
```

### Q: 如何处理404错误?

A: 在API路由中检查资源是否存在，如果不存在则返回404错误：

```typescript
const user = await getUserById(id);
if (!user) {
  return errorResponse('用户不存在', 'USER_NOT_FOUND', 404);
}
```

### Q: 前端如何处理错误?

A: 使用 `apiClient` 调用API，它会自动处理错误响应：

```typescript
try {
  const response = await apiClient.get('/api/data');
} catch (error) {
  toast.error(error.message);
}
```

## 联系支持

如有问题，请参考：
- `docs/API_RESPONSE_GUIDE.md` - API响应格式使用指南
- `DEPLOYMENT.md` - 完整部署文档
- `README.md` - 项目文档
