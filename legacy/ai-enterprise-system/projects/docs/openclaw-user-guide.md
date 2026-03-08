# OpenClaw 自动化办公集成指南

## 概述

本文档介绍如何将 OpenClaw 集成到 AI 智能化企业系统中，实现自动化办公。OpenClaw 可以通过统一 API 网关调用系统的各个模块，实现工作流自动化。

## 目录

- [快速开始](#快速开始)
- [API 网关](#api-网关)
- [场景化 API](#场景化-api)
- [工作流模板](#工作流模板)
- [使用示例](#使用示例)
- [Webhook 配置](#webhook-配置)
- [最佳实践](#最佳实践)

---

## 快速开始

### 1. 初始化工作流

系统提供了预设工作流模板，首次使用时需要初始化：

```typescript
// 在项目启动时调用
import { initOpenClawWorkflows } from '@/lib/automation/openclaw-workflows';

await initOpenClawWorkflows();
```

### 2. 配置 OpenClaw

在 OpenClaw 中添加以下配置：

```json
{
  "apiBaseUrl": "http://your-domain.com/api/openclaw",
  "apiKey": "your-api-key",
  "webhookBaseUrl": "http://your-domain.com/api/openclaw/webhooks"
}
```

### 3. 测试连接

使用以下命令测试连接：

```bash
curl -X GET http://localhost:5000/api/openclaw
```

预期返回：

```json
{
  "success": true,
  "modules": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## API 网关

### 统一调用接口

所有模块都通过统一的 API 网关调用，格式如下：

```bash
POST /api/openclaw
```

### 请求格式

```json
{
  "module": "模块名称",
  "action": "动作名称",
  "data": {
    // 模块特定参数
  },
  "options": {
    // 可选参数
  }
}
```

### 支持的模块

#### 1. 客户分析 (customer-analysis)

| 动作 | 描述 |
|------|------|
| analyze | 分析客户信息 |
| chat | 客户对话分析 |
| export | 导出分析报告 |
| suggestions | 获取改进建议 |

**示例：**

```bash
curl -X POST http://localhost:5000/api/openclaw \
  -H "Content-Type: application/json" \
  -d '{
    "module": "customer-analysis",
    "action": "analyze",
    "data": {
      "companyName": "示例公司",
      "website": "example.com",
      "industry": "科技",
      "country": "中国"
    }
  }'
```

#### 2. 邮件生成 (email-generator)

| 动作 | 描述 |
|------|------|
| generate | 生成邮件 |
| analyze-intent | 分析邮件意图 |

**示例：**

```bash
curl -X POST http://localhost:5000/api/openclaw \
  -H "Content-Type: application/json" \
  -d '{
    "module": "email-generator",
    "action": "generate",
    "data": {
      "recipientName": "张三",
      "companyName": "示例公司",
      "stage": "initial",
      "type": "followup",
      "language": "zh-CN"
    }
  }'
```

#### 3. 线索评分 (lead-scoring)

| 动作 | 描述 |
|------|------|
| score | 评分线索 |
| get | 获取评分结果 |

#### 4. 社媒运营 (social-media)

| 动作 | 描述 |
|------|------|
| publish | 发布内容 |
| analyze | 分析内容效果 |
| get-comments | 获取评论 |
| get-history | 获取历史记录 |

#### 5. 供应链管理 (supply-chain)

| 动作 | 描述 |
|------|------|
| forecast | 预测需求 |
| inventory | 库存管理 |
| quality | 质量检查 |
| cost | 成本分析 |
| collaboration | 协同管理 |

#### 6. 合规检查 (compliance-check)

| 动作 | 描述 |
|------|------|
| check | 检查内容合规性 |

#### 7. AI 内容生成 (ai-content)

| 动作 | 描述 |
|------|------|
| generate | 生成内容 |

#### 8. 聊天助手 (chat-assistant)

| 动作 | 描述 |
|------|------|
| chat | 对话交互 |

#### 9. 知识库 (knowledge)

| 动作 | 描述 |
|------|------|
| search | 搜索知识 |
| add | 添加知识 |
| delete | 删除知识 |
| update | 更新知识 |

#### 10. 宠物内容 (pet-content)

| 动作 | 描述 |
|------|------|
| generate | 生成宠物内容 |
| translate | 翻译内容 |
| multi-generate | 批量生成 |

#### 11. 离线赋能 (offline-empowerment)

| 动作 | 描述 |
|------|------|
| forecast | 需求预测 |
| inventory | 库存管理 |
| scheduling | 排班管理 |
| audit | 审核管理 |
| heatmap | 热力图分析 |

#### 12. 财务审计 (finance-audit)

| 动作 | 描述 |
|------|------|
| audit | 审计检查 |
| expenses | 费用管理 |
| reconciliation | 对账管理 |
| standards | 标准管理 |

#### 13. 国内平台 (domestic-platforms)

| 动作 | 描述 |
|------|------|
| publish | 发布内容 |
| analyze | 分析效果 |
| batch-publish | 批量发布 |
| collaboration | 协同管理 |

---

## 场景化 API

场景化 API 提供了常用业务场景的封装，调用更简单。

### 接口

```bash
POST /api/openclaw/scenarios
```

### 支持的场景

#### 1. 新客户自动分析 (customer_analyze)

当有新客户时，自动分析客户信息。

```json
{
  "scenario": "customer_analyze",
  "companyName": "示例公司",
  "website": "example.com",
  "industry": "科技",
  "country": "中国"
}
```

#### 2. 生成跟进邮件 (generate_followup_email)

根据客户信息生成跟进邮件。

```json
{
  "scenario": "generate_followup_email",
  "customerName": "张三",
  "companyName": "示例公司",
  "stage": "initial",
  "lastContact": "2024-01-01T00:00:00Z"
}
```

#### 3. 线索自动评分 (score_lead)

评估线索质量和价值。

```json
{
  "scenario": "score_lead",
  "leadData": {
    "companyName": "示例公司",
    "website": "example.com",
    "industry": "科技",
    "contactName": "张三"
  }
}
```

#### 4. 发布社媒内容 (publish_social_content)

生成并发布社媒内容。

```json
{
  "scenario": "publish_social_content",
  "platform": "instagram",
  "content": "这是一条社媒内容",
  "mediaUrls": ["https://example.com/image.jpg"],
  "hashtags": ["#pet", "#cute"]
}
```

#### 5. 内容合规检查 (check_compliance)

检查内容是否符合规则。

```json
{
  "scenario": "check_compliance",
  "content": "这是一段要检查的内容",
  "platform": "instagram"
}
```

#### 6. 库存预警检查 (inventory_alert)

检查库存并发送预警。

```json
{
  "scenario": "inventory_alert",
  "productId": "PROD-001",
  "minStock": 10
}
```

#### 7. AI 对话助手 (chat_assistant)

智能对话，处理客户咨询。

```json
{
  "scenario": "chat_assistant",
  "messages": [
    {
      "role": "user",
      "content": "你好，我想了解你们的产品"
    }
  ],
  "useKnowledgeBase": true
}
```

#### 8. 趋势预测 (forecast_trend)

预测销售趋势、库存需求等。

```json
{
  "scenario": "forecast_trend",
  "type": "sales",
  "historicalData": [...],
  "period": 30
}
```

#### 9. 宠物内容生成 (generate_pet_content)

为宠物产品生成营销内容。

```json
{
  "scenario": "generate_pet_content",
  "sku": "PET-001",
  "platform": "instagram",
  "language": "zh-CN",
  "contentType": "marketing"
}
```

#### 10. 质量检查 (quality_check)

检查产品质量。

```json
{
  "scenario": "quality_check",
  "productId": "PROD-001",
  "batchNumber": "BATCH-001",
  "inspectionData": {...}
}
```

---

## 工作流模板

系统提供了以下预设工作流模板：

### 1. 新客户自动分析

**触发方式**: Webhook

**触发 URL**: `/api/openclaw/webhooks/customer-created`

**流程**:
1. 分析客户信息
2. 评分线索质量
3. 生成跟进邮件

**使用方法**:

```bash
curl -X POST http://localhost:5000/api/openclaw/webhooks/customer-created \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "示例公司",
    "website": "example.com",
    "industry": "科技",
    "country": "中国",
    "contactName": "张三"
  }'
```

### 2. 社媒评论自动回复

**触发方式**: Webhook

**触发 URL**: `/api/openclaw/webhooks/comment-received`

**流程**:
1. 检查评论合规性
2. 如果合规，生成 AI 回复
3. 如果不合规，发送警告邮件

**使用方法**:

```bash
curl -X POST http://localhost:5000/api/openclaw/webhooks/comment-received \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "commentText": "这条产品太棒了！",
    "commenter": "user123"
  }'
```

### 3. 库存预警通知

**触发方式**: 定时触发 (每 6 小时)

**流程**:
1. 检查所有库存
2. 如果有库存不足，发送邮件预警

**自动运行，无需手动触发**

### 4. 客户跟进提醒

**触发方式**: 定时触发 (每周一早上 9 点)

**流程**:
1. 查找超过 7 天未跟进的客户
2. 为每个客户生成跟进邮件

**自动运行，无需手动触发**

### 5. 社媒内容自动发布

**触发方式**: 定时触发 (每天早上 10 点)

**流程**:
1. 生成社媒内容
2. 检查合规性
3. 如果合规，发布到平台

**自动运行，无需手动触发**

### 6. 销售趋势预测

**触发方式**: 定时触发 (每月 1 号)

**流程**:
1. 分析历史销售数据
2. 预测未来 30 天趋势
3. 发送报告邮件

**自动运行，无需手动触发**

### 7. 质量检查自动报告

**触发方式**: 定时触发 (每周五早上 9 点)

**流程**:
1. 执行质量检查
2. 生成报告
3. 发送邮件

**自动运行，无需手动触发**

### 8. 成本分析报告

**触发方式**: 定时触发 (每天早上 8 点)

**流程**:
1. 分析供应链成本
2. 如果超支，发送预警

**自动运行，无需手动触发**

---

## 使用示例

### 示例 1: OpenClaw 调用客户分析

在 OpenClaw 中配置一个 HTTP 任务：

```json
{
  "url": "http://your-domain.com/api/openclaw",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "module": "customer-analysis",
    "action": "analyze",
    "data": {
      "companyName": "{{companyName}}",
      "website": "{{website}}",
      "industry": "{{industry}}",
      "country": "{{country}}"
    }
  }
}
```

### 示例 2: 使用场景化 API

```json
{
  "url": "http://your-domain.com/api/openclaw/scenarios",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "scenario": "generate_followup_email",
    "customerName": "{{customerName}}",
    "companyName": "{{companyName}}",
    "stage": "initial",
    "lastContact": "{{lastContactDate}}"
  }
}
```

### 示例 3: 触发工作流

```json
{
  "url": "http://your-domain.com/api/automation/trigger",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "workflowId": "workflow-uuid-here",
    "payload": {
      "companyName": "示例公司",
      "contactName": "张三"
    }
  }
}
```

### 示例 4: Webhook 触发

```bash
# 当新客户创建时，调用 Webhook
curl -X POST http://your-domain.com/api/openclaw/webhooks/customer-created \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "示例公司",
    "website": "example.com",
    "industry": "科技",
    "country": "中国",
    "contactName": "张三",
    "email": "zhangsan@example.com"
  }'
```

---

## Webhook 配置

### Webhook 格式

系统会向 OpenClaw 发送 Webhook 通知，格式如下：

```json
{
  "event": "workflow.completed",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "workflowId": "uuid",
    "workflowName": "新客户自动分析",
    "status": "success",
    "result": {...}
  }
}
```

### 配置 Webhook URL

在系统配置中设置：

```typescript
// .env.local
OPENCLAW_WEBHOOK_URL=https://your-openclaw-webhook-url.com
```

### 安全性

建议在 Webhook URL 中添加签名验证：

```typescript
// 验证签名
const signature = request.headers.get('x-openclaw-signature');
const expectedSignature = crypto
  .createHmac('sha256', process.env.OPENCLAW_WEBHOOK_SECRET!)
  .update(JSON.stringify(body))
  .digest('hex');

if (signature !== expectedSignature) {
  return new Response('Invalid signature', { status: 401 });
}
```

---

## 最佳实践

### 1. 错误处理

在 OpenClaw 中配置错误处理：

```json
{
  "onError": {
    "action": "retry",
    "maxRetries": 3,
    "retryDelay": 1000,
    "fallback": {
      "action": "notify",
      "recipients": ["admin@example.com"]
    }
  }
}
```

### 2. 超时设置

为 API 调用设置合理的超时时间：

```json
{
  "timeout": 30000
}
```

### 3. 批量处理

对于批量任务，使用场景化 API：

```json
{
  "scenario": "generate_pet_content",
  "skuList": ["PET-001", "PET-002", "PET-003"],
  "platform": "instagram",
  "language": "zh-CN"
}
```

### 4. 监控和日志

使用自动化管理页面监控工作流状态：

- 访问 `/automation` 页面
- 查看工作流列表
- 监控执行历史
- 查看日志和错误

### 5. 性能优化

- 对于耗时操作，使用异步任务
- 定期清理执行历史
- 使用缓存减少重复调用

---

## 故障排除

### 问题 1: API 返回 400 错误

**原因**: 参数错误或不支持的模块/动作

**解决**:
- 检查模块名称是否正确
- 检查动作是否支持
- 检查必需参数是否提供

### 问题 2: Webhook 未触发

**原因**: 工作流未启用或触发器配置错误

**解决**:
- 检查工作流是否启用
- 检查触发器配置是否正确
- 查看执行日志

### 问题 3: 工作流执行失败

**原因**: 动作执行出错

**解决**:
- 查看执行日志
- 检查各个动作的配置
- 验证 API 端点是否可用

---

## 支持

如有问题，请联系技术支持或查看其他文档：

- [自动化办公使用指南](./openclaw-automation-guide.md)
- [集成文档](./openclaw-integration.md)
- [API 文档](./api-docs.md)
