# OpenClaw 自动化办公集成指南

## 概述

本指南介绍如何将 AI 智能化企业系统接入 OpenClaw 或其他自动化办公平台，实现工作流自动化。

## 功能特性

### 1. 工作流引擎
- 支持多种触发方式（Webhook、定时任务、事件触发、手动触发）
- 支持多种动作类型（API 调用、邮件、通知、数据库操作、AI 任务）
- 条件判断和模板变量替换
- 执行记录和状态追踪

### 2. 预置工作流

#### 新线索自动分配
- **触发**: 新线索创建事件
- **动作**: 自动分配给销售团队、发送邮件通知、应用内通知
- **用途**: 提高线索响应速度，自动跟进

#### 社媒评论自动回复
- **触发**: 接收到新评论
- **动作**: AI 生成回复、更新数据库
- **用途**: 自动化社媒运营，提高互动率

#### 库存预警通知
- **触发**: 定时检查（每2小时）
- **动作**: 查询库存、发送预警邮件
- **用途**: 及时补货，避免缺货

#### 客户跟进提醒
- **触发**: 定时执行（每周一）
- **动作**: 查询需要跟进的客户、发送提醒
- **用途**: 定期跟进，维护客户关系

## API 文档

### 1. Webhook 接收端点

**端点**: `POST /api/automation/webhooks`

**请求体**:
```json
{
  "workflowId": "workflow_id",
  "event": "event_name",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "timestamp": "2024-03-01T00:00:00Z"
}
```

**响应**:
```json
{
  "success": true,
  "executionId": "exec_xxx",
  "workflowId": "workflow_id",
  "status": "completed",
  "message": "工作流已触发"
}
```

### 2. 工作流管理

#### 获取工作流列表
**端点**: `GET /api/automation/workflows`

**响应**:
```json
{
  "success": true,
  "workflows": [...],
  "total": 10
}
```

#### 创建工作流
**端点**: `POST /api/automation/workflows`

**请求体**:
```json
{
  "name": "工作流名称",
  "description": "工作流描述",
  "triggers": [
    {
      "id": "trigger_1",
      "type": "webhook",
      "config": { "path": "/webhooks/custom" },
      "enabled": true
    }
  ],
  "actions": [
    {
      "id": "action_1",
      "type": "email",
      "config": {
        "to": "{{email}}",
        "subject": "通知",
        "bodyTemplate": "内容: {{content}}"
      },
      "enabled": true
    }
  ],
  "conditions": [
    {
      "id": "condition_1",
      "field": "status",
      "operator": "equals",
      "value": "active"
    }
  ]
}
```

#### 更新工作流
**端点**: `PUT /api/automation/workflows`

**请求体**:
```json
{
  "id": "workflow_id",
  "enabled": true
}
```

#### 删除工作流
**端点**: `DELETE /api/automation/workflows?id=workflow_id`

### 3. 手动触发工作流

**端点**: `POST /api/automation/trigger`

**请求体**:
```json
{
  "workflowId": "workflow_id",
  "input": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

## 集成步骤

### 步骤 1: 配置 Webhook

在 OpenClaw 或其他自动化平台中配置 Webhook：

```
URL: https://your-domain.com/api/automation/webhooks
Method: POST
Headers:
  Content-Type: application/json
Body:
  {
    "workflowId": "your_workflow_id",
    "event": "event_name",
    "data": {...}
  }
```

### 步骤 2: 创建工作流

1. 访问自动化办公页面: `/automation`
2. 点击"新建工作流"
3. 配置触发器
4. 配置动作
5. 保存并启用

### 步骤 3: 测试集成

使用 curl 测试 Webhook:

```bash
curl -X POST https://your-domain.com/api/automation/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "workflow_id",
    "event": "test",
    "data": {
      "message": "Hello from OpenClaw"
    }
  }'
```

## 使用场景

### 场景 1: 新客户自动欢迎

**配置**:
- 触发: Webhook（客户注册事件）
- 动作:
  1. AI 生成欢迎消息
  2. 发送欢迎邮件
  3. 创建跟进任务

**OpenClaw 配置**:
```
触发: 当新用户注册时
动作: 发送 Webhook 到 /api/automation/webhooks
```

### 场景 2: 订单自动处理

**配置**:
- 触发: Webhook（订单创建事件）
- 动作:
  1. 检查库存
  2. 生成发货单
  3. 发送确认邮件
  4. 更新 CRM

**OpenClaw 配置**:
```
触发: 当订单创建时
动作: 发送 Webhook 到 /api/automation/webhooks
```

### 场景 3: 社媒内容自动发布

**配置**:
- 触发: 定时任务（每天9点）
- 动作:
  1. AI 生成内容
  2. 调用社媒 API 发布
  3. 记录发布日志

**OpenClaw 配置**:
```
触发: 每天上午 9:00
动作: 发送 Webhook 到 /api/automation/webhooks
```

### 场景 4: 客户流失预警

**配置**:
- 触发: 定时任务（每周）
- 动作:
  1. 分析客户活跃度
  2. 识别流失风险
  3. 发送预警通知
  4. 创建挽回任务

**OpenClaw 配置**:
```
触发: 每周一 10:00
动作: 发送 Webhook 到 /api/automation/webhooks
```

## 模板变量

在工作流中，可以使用以下模板变量：

### 基础变量
- `{{variable}}`: 基础变量
- `{{nested.path}}`: 嵌套路径
- `{{now}}`: 当前时间
- `{{timestamp}}`: 时间戳

### 数据变量
从 Webhook 或事件中传入的数据可直接使用，如：
- `{{customerName}}`: 客户名称
- `{{email}}`: 邮箱地址
- `{{orderId}}`: 订单ID

### 示例
```
模板: 您好 {{customerName}}，您的订单 {{orderId}} 已确认
输入: { customerName: "张三", orderId: "12345" }
结果: 您好 张三，您的订单 12345 已确认
```

## 条件判断

支持以下条件操作符：

- `equals`: 等于
- `not_equals`: 不等于
- `contains`: 包含
- `greater_than`: 大于
- `less_than`: 小于

### 示例
```json
{
  "field": "status",
  "operator": "equals",
  "value": "active"
}
```

## 最佳实践

### 1. 错误处理
- 在工作流中添加错误处理动作
- 记录执行日志
- 设置失败重试

### 2. 性能优化
- 使用异步动作
- 合理设置定时任务频率
- 定期清理旧记录

### 3. 安全性
- 验证 Webhook 来源
- 使用 HTTPS
- 限制敏感操作

### 4. 监控
- 监控工作流执行状态
- 设置告警通知
- 定期审查工作流

## 故障排查

### 问题 1: Webhook 未触发

**检查**:
- Workflow ID 是否正确
- 工作流是否已启用
- 条件是否满足
- 查看执行日志

### 问题 2: 动作执行失败

**检查**:
- 动作配置是否正确
- API 凭证是否有效
- 网络连接是否正常
- 查看错误日志

### 问题 3: 模板变量未替换

**检查**:
- 变量名是否正确
- 数据中是否包含该变量
- 模板语法是否正确

## 高级功能

### 1. 工作流嵌套
可以在一个工作流中触发另一个工作流。

### 2. 并行执行
多个动作可以并行执行，提高效率。

### 3. 条件分支
根据条件执行不同的动作分支。

### 4. 数据转换
在动作之间转换和处理数据。

## 扩展集成

### 集成其他系统

通过 API 调用动作可以集成任何系统：

```json
{
  "type": "api_call",
  "config": {
    "url": "https://api.example.com/endpoint",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{token}}"
    },
    "bodyTemplate": {
      "data": "{{inputData}}"
    }
  }
}
```

### 集成第三方服务

- **邮件服务**: 使用 email 动作
- **短信服务**: 使用 API 调用动作
- **CRM 系统**: 使用 API 调用动作
- **数据分析**: 使用 AI 任务动作

## 支持

如有问题，请：

1. 查看执行日志
2. 检查 API 文档
3. 参考示例工作流
4. 联系技术支持

## 更新日志

### v1.0.0 (2024-03-01)
- 初始版本发布
- 支持基础工作流功能
- 预置 4 个工作流模板
- Webhook 集成支持
