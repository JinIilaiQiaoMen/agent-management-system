# 模块接入 OpenClaw 指南

## 概述

本文档说明如何将各个模块接入 OpenClaw 系统，实现统一调用和管理。

## 目录

- [模块接入规范](#模块接入规范)
- [接入步骤](#接入步骤)
- [已接入模块](#已接入模块)
- [模块接口定义](#模块接口定义)
- [测试指南](#测试指南)

---

## 模块接入规范

### 1. API 规范

每个模块需要提供符合规范的 API 接口：

```typescript
// 标准响应格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// 标准请求格式
interface ApiRequest {
  // 模块特定参数
  [key: string]: any;
}
```

### 2. 错误处理

统一的错误码和错误消息：

```typescript
enum ErrorCode {
  INVALID_PARAMS = 'INVALID_PARAMS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### 3. 日志记录

每个模块需要记录调用日志：

```typescript
console.log(`[${module.name}] API调用: ${action}`, {
  params: data,
  timestamp: new Date().toISOString()
});
```

---

## 接入步骤

### 步骤 1: 定义模块信息

在 `/api/openclaw/route.ts` 中添加模块定义：

```typescript
const MODULE_ROUTES = {
  'your-module': '/api/your-module',
  // ... 其他模块
};

const SUPPORTED_ACTIONS = {
  'your-module': ['action1', 'action2', 'action3'],
  // ... 其他模块
};
```

### 步骤 2: 实现路由处理

添加模块的路由处理函数：

```typescript
async function handleYourModule(action: string, data: any, options: any) {
  switch (action) {
    case 'action1':
      return await handleAction1(data, options);
    case 'action2':
      return await handleAction2(data, options);
    case 'action3':
      return await handleAction3(data, options);
    default:
      throw new Error(`未实现动作: ${action}`);
  }
}

async function handleAction1(data: any, options: any) {
  // 实现逻辑
  const result = await fetch('http://localhost:5000/api/your-module/action1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await result.json();
}
```

### 步骤 3: 注册路由

在 `routeToModule` 函数中添加路由：

```typescript
async function routeToModule(module: string, action: string, data: any, options: any) {
  switch (module) {
    // ... 其他模块
    case 'your-module':
      return await handleYourModule(action, data, options);
    default:
      throw new Error(`未知模块: ${module}`);
  }
}
```

### 步骤 4: 测试接口

使用 curl 测试接口：

```bash
curl -X POST http://localhost:5000/api/openclaw \
  -H "Content-Type: application/json" \
  -d '{
    "module": "your-module",
    "action": "action1",
    "data": {
      "param1": "value1",
      "param2": "value2"
    }
  }'
```

### 步骤 5: 添加场景化 API (可选)

如果模块有常用场景，可以添加场景化 API：

```typescript
// 在 /api/openclaw/scenarios/route.ts 中添加
export async function POST_your_scenario(request: NextRequest) {
  try {
    const body = await request.json();
    const { param1, param2 } = body;

    const response = await fetch('http://localhost:5000/api/your-module/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      scenario: 'your_scenario',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('场景执行失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 添加到 scenarioHandlers
export const scenarioHandlers = {
  // ... 其他场景
  your_scenario: POST_your_scenario
};
```

### 步骤 6: 创建工作流模板 (可选)

如果模块需要自动化，可以创建工作流模板：

```typescript
// 在 /lib/automation/openclaw-workflows.ts 中添加
const WORKFLOW_TEMPLATES = [
  // ... 其他模板
  {
    name: '你的工作流名称',
    description: '工作流描述',
    enabled: true,
    triggers: [
      {
        type: 'webhook',
        config: {
          webhookUrl: '/api/openclaw/webhooks/your-webhook',
          method: 'POST',
          headers: {}
        }
      }
    ],
    actions: [
      {
        type: 'api',
        order: 1,
        config: {
          url: '/api/openclaw/scenarios',
          method: 'POST',
          headers: {},
          bodyTemplate: {
            scenario: 'your_scenario',
            param1: '{{param1}}',
            param2: '{{param2}}'
          }
        }
      }
    ]
  }
];
```

### 步骤 7: 更新文档

在用户指南中添加模块说明：

```markdown
#### 你的模块 (your-module)

| 动作 | 描述 |
|------|------|
| action1 | 动作1描述 |
| action2 | 动作2描述 |
| action3 | 动作3描述 |

**示例：**

\`\`\`bash
curl -X POST http://localhost:5000/api/openclaw \
  -H "Content-Type: application/json" \
  -d '{
    "module": "your-module",
    "action": "action1",
    "data": {...}
  }'
\`\`\`
```

---

## 已接入模块

### 1. 客户分析模块 (customer-analysis)

**路由**: `/api/customer-analysis`

**支持动作**:
- `analyze`: 分析客户信息
- `chat`: 客户对话分析
- `export`: 导出分析报告
- `suggestions`: 获取改进建议

**状态**: ✅ 已接入

### 2. 邮件生成模块 (email-generator)

**路由**: `/api/email-generator`

**支持动作**:
- `generate`: 生成邮件
- `analyze-intent`: 分析邮件意图

**状态**: ✅ 已接入

### 3. 线索评分模块 (lead-scoring)

**路由**: `/api/lead-scoring`

**支持动作**:
- `score`: 评分线索
- `get`: 获取评分结果

**状态**: ✅ 已接入

### 4. 社媒运营模块 (social-media)

**路由**: `/api/social-media`

**支持动作**:
- `publish`: 发布内容
- `analyze`: 分析内容效果
- `get-comments`: 获取评论
- `get-history`: 获取历史记录

**状态**: ✅ 已接入

### 5. 供应链管理模块 (supply-chain)

**路由**: `/api/supply-chain`

**支持动作**:
- `forecast`: 预测需求
- `inventory`: 库存管理
- `quality`: 质量检查
- `cost`: 成本分析
- `collaboration`: 协同管理

**状态**: ✅ 已接入

### 6. 合规检查模块 (compliance-check)

**路由**: `/api/compliance/check`

**支持动作**:
- `check`: 检查内容合规性

**状态**: ✅ 已接入

### 7. AI 内容生成模块 (ai-content)

**路由**: `/api/ai/generate-content`

**支持动作**:
- `generate`: 生成内容

**状态**: ✅ 已接入

### 8. 聊天助手模块 (chat-assistant)

**路由**: `/api/chat-assistant`

**支持动作**:
- `chat`: 对话交互

**状态**: ✅ 已接入

### 9. 知识库模块 (knowledge)

**路由**: `/api/knowledge-documents`

**支持动作**:
- `search`: 搜索知识
- `add`: 添加知识
- `delete`: 删除知识
- `update`: 更新知识

**状态**: ✅ 已接入

### 10. 宠物内容模块 (pet-content)

**路由**: `/api/pet-content`

**支持动作**:
- `generate`: 生成宠物内容
- `translate`: 翻译内容
- `multi-generate`: 批量生成

**状态**: ✅ 已接入

### 11. 离线赋能模块 (offline-empowerment)

**路由**: `/api/offline-empowerment`

**支持动作**:
- `forecast`: 需求预测
- `inventory`: 库存管理
- `scheduling`: 排班管理
- `audit`: 审核管理
- `heatmap`: 热力图分析

**状态**: ✅ 已接入

### 12. 财务审计模块 (finance-audit)

**路由**: `/api/finance-audit`

**支持动作**:
- `audit`: 审计检查
- `expenses`: 费用管理
- `reconciliation`: 对账管理
- `standards`: 标准管理

**状态**: ✅ 已接入

### 13. 国内平台模块 (domestic-platforms)

**路由**: `/api/domestic-platforms`

**支持动作**:
- `publish`: 发布内容
- `analyze`: 分析效果
- `batch-publish`: 批量发布
- `collaboration`: 协同管理

**状态**: ✅ 已接入

---

## 模块接口定义

### 客户分析模块

```typescript
// analyze
interface CustomerAnalyzeRequest {
  companyName: string;
  website?: string;
  industry?: string;
  country?: string;
  analysisType?: 'basic' | 'full';
}

// chat
interface CustomerChatRequest {
  customerContext: string;
  question: string;
  conversationHistory?: Message[];
}
```

### 邮件生成模块

```typescript
// generate
interface EmailGenerateRequest {
  recipientName: string;
  companyName: string;
  stage: 'initial' | 'followup' | 'closing' | 'proposal';
  type: 'outreach' | 'followup' | 'reminder';
  language: 'zh-CN' | 'en-US';
  customInstructions?: string;
}

// analyze-intent
interface EmailIntentRequest {
  emailContent: string;
  senderName: string;
  senderCompany: string;
}
```

### 社媒运营模块

```typescript
// publish
interface SocialPublishRequest {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];
  scheduledAt?: string;
}

// analyze
interface SocialAnalyzeRequest {
  platform: string;
  postId: string;
  metrics?: string[];
}
```

### 供应链管理模块

```typescript
// forecast
interface ForecastRequest {
  type: 'sales' | 'demand' | 'inventory';
  period: number;
  historicalData: any[];
}

// inventory
interface InventoryRequest {
  action: 'check' | 'update' | 'check-all';
  productId?: string;
  minStock?: number;
  quantity?: number;
}

// quality
interface QualityCheckRequest {
  productId: string;
  batchNumber: string;
  inspectionType: 'routine' | 'special';
  inspectionData?: any;
}

// cost
interface CostAnalysisRequest {
  period: 'daily' | 'weekly' | 'monthly';
  includeTransport: boolean;
  includeStorage: boolean;
  includeLabor: boolean;
}
```

---

## 测试指南

### 单元测试

为每个模块编写单元测试：

```typescript
// src/__tests__/api/openclaw/module.test.ts
import { POST } from '@/app/api/openclaw/route';

describe('Your Module API', () => {
  it('should handle action1 correctly', async () => {
    const request = new Request('http://localhost:5000/api/openclaw', {
      method: 'POST',
      body: JSON.stringify({
        module: 'your-module',
        action: 'action1',
        data: { param1: 'value1' }
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });
});
```

### 集成测试

测试完整的 OpenClaw 调用流程：

```bash
# 测试模块调用
curl -X POST http://localhost:5000/api/openclaw \
  -H "Content-Type: application/json" \
  -d '{
    "module": "your-module",
    "action": "action1",
    "data": {...}
  }'

# 测试场景调用
curl -X POST http://localhost:5000/api/openclaw/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "your_scenario",
    "param1": "value1"
  }'

# 测试工作流触发
curl -X POST http://localhost:5000/api/openclaw/webhooks/your-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "param1": "value1"
  }'
```

### 压力测试

测试模块在高并发下的表现：

```bash
# 使用 Apache Bench
ab -n 1000 -c 10 -p request.json -T application/json \
  http://localhost:5000/api/openclaw
```

---

## 最佳实践

1. **统一响应格式**: 所有模块返回统一的响应格式
2. **详细日志**: 记录所有 API 调用和错误
3. **错误处理**: 提供清晰的错误消息和错误码
4. **性能优化**: 对于耗时操作，使用异步处理
5. **文档完整**: 保持文档与代码同步
6. **测试覆盖**: 确保所有功能都有测试覆盖
7. **版本管理**: 为 API 添加版本控制
8. **安全验证**: 验证所有输入参数

---

## 支持

如有问题，请查看相关文档：

- [OpenClaw 用户指南](./openclaw-user-guide.md)
- [集成文档](./openclaw-integration.md)
- [API 文档](./api-docs.md)
