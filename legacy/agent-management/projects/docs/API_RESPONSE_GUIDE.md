# API 响应格式统一指南

## 概述

本项目使用统一的API响应格式，确保所有API路由返回一致的JSON结构，便于前端处理和错误追踪。

## 统一响应格式

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

## 使用方法

### 1. 导入响应工具

```typescript
import { jsonResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
```

### 2. 使用 jsonResponse

```typescript
import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const data = {
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  };

  return jsonResponse(data, '获取用户列表成功');
}
```

### 3. 使用 errorResponse

```typescript
import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 验证输入
  if (!body.email) {
    return errorResponse('邮箱不能为空', 'VALIDATION_ERROR', 400);
  }

  // 业务逻辑
  try {
    const user = await createUser(body);
    return jsonResponse(user, '用户创建成功');
  } catch (error) {
    return errorResponse('用户创建失败', 'CREATE_USER_ERROR', 500);
  }
}
```

### 4. 使用 withErrorHandler 包装器

`withErrorHandler` 可以自动捕获错误并返回统一的错误响应：

```typescript
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api-response';

async function handleGetUsers(request: NextRequest) {
  // 这里可能抛出错误
  const users = await getUsers();
  return jsonResponse(users);
}

// 包装函数
export const GET = withErrorHandler(handleGetUsers);
```

### 5. 使用前端 API 调用工具

在前端组件中，使用统一的API调用工具：

```typescript
import { apiClient } from '@/lib/api';

async function fetchUsers() {
  try {
    const response = await apiClient.get('/api/users');
    // response.data 包含响应数据
    console.log(response.data);
  } catch (error) {
    // error 包含错误信息
    console.error(error.message);
  }
}
```

## 常见场景

### 分页响应

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const { items, total } = await getPaginatedUsers(page, limit);

  return jsonResponse({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### 验证错误

```typescript
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(10, '内容至少10个字符'),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 验证
  const result = createPostSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return errorResponse('参数验证失败', 'VALIDATION_ERROR', 400, {
      validationErrors: errors,
    });
  }

  const post = await createPost(result.data);
  return jsonResponse(post, '文章创建成功');
}
```

### 404 错误

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserById(params.id);

  if (!user) {
    return errorResponse('用户不存在', 'USER_NOT_FOUND', 404);
  }

  return jsonResponse(user);
}
```

### 权限错误

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.isAdmin) {
    return errorResponse('没有权限执行此操作', 'PERMISSION_DENIED', 403);
  }

  await deleteUser(params.id);
  return jsonResponse(null, '用户删除成功');
}
```

## 错误码规范

建议使用有意义的错误码，便于前端识别和处理：

| 错误码 | HTTP状态码 | 描述 |
|--------|-----------|------|
| VALIDATION_ERROR | 400 | 参数验证失败 |
| UNAUTHORIZED | 401 | 未授权 |
| PERMISSION_DENIED | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 测试

### 运行API测试

```bash
# 测试所有API路由
pnpm test:api

# 或
npm run test:api
```

### 测试单个API

```bash
curl http://localhost:5000/api/users
```

## 迁移现有API

如果需要将现有API迁移到统一格式，可以使用迁移工具：

```bash
# 自动迁移所有API路由
pnpm migrate:api

# 或
npm run migrate:api
```

## 最佳实践

1. **始终使用统一响应格式**: 所有API路由都应该使用 `jsonResponse` 或 `errorResponse`
2. **使用有意义的错误码**: 错误码应该清晰地标识错误类型
3. **提供详细的错误信息**: 在开发环境下，可以返回详细的错误堆栈
4. **使用 withErrorHandler**: 对于可能抛出错误的函数，使用 `withErrorHandler` 包装
5. **验证输入**: 在处理请求前，验证所有输入参数
6. **使用前端API工具**: 在前端组件中，使用 `apiClient` 调用API，自动处理错误

## 前端错误处理

```typescript
import { apiClient } from '@/lib/api';
import { toast } from '@/components/Toast';

async function handleAction() {
  try {
    const response = await apiClient.post('/api/action', data);
    toast.success(response.message || '操作成功');
  } catch (error) {
    if (error.status === 401) {
      toast.error('请先登录');
      // 跳转到登录页
      router.push('/login');
    } else if (error.status === 403) {
      toast.error('没有权限执行此操作');
    } else {
      toast.error(error.message || '操作失败');
    }
  }
}
```

## 相关文件

- `src/lib/api-response.ts` - 响应格式定义
- `src/lib/api.ts` - 前端API调用工具
- `src/lib/global-error-handler.ts` - 全局错误处理
- `scripts/test-api-routes.mjs` - API测试工具
- `scripts/migrate-api-routes.mjs` - API迁移工具
