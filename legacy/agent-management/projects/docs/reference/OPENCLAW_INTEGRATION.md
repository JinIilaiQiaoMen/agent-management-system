# OpenClaw 集成文档

## 概述

OpenClaw 可以作为您的任务调度中心，通过 API 触发系统中的任务执行。本文档介绍如何将您的系统连接到 OpenClaw，实现自动化任务调度和管理。

## 快速开始

### 1. 配置 OpenClaw 连接

访问 `/openclaw-integration` 页面，配置以下信息：

- **Webhook URL**: OpenClaw 接收回调通知的 URL 地址
- **API Key**: 用于身份验证的密钥
- **通知设置**: 选择要接收的通知类型

### 2. 测试连接

配置完成后，点击"测试连接"按钮验证配置是否正确。

### 3. 启用自动触发

在配置页面中，开启"自动触发"开关，允许 OpenClaw 自动触发任务执行。

## API 端点

### 触发任务

创建并触发一个新任务。

**端点**: `POST /api/openclaw/trigger-task`

**请求头**:
```
Content-Type: application/json
X-API-Key: your-api-key
```

**请求体**:
```json
{
  "taskId": "task-uuid",
  "title": "任务标题",
  "description": "任务描述",
  "priority": "high|medium|low",
  "assigneeIds": ["agent-1", "agent-2"],
  "autoExecute": true
}
```

**响应**:
```json
{
  "success": true,
  "message": "任务已创建并开始执行",
  "task": {
    "id": "task-uuid",
    "title": "任务标题",
    "status": "in_progress",
    "executionUrl": "http://localhost:5000/api/tasks/task-uuid/auto-execute-stream"
  }
}
```

### 查询任务状态

查询任务的执行状态。

**端点**: `GET /api/openclaw/task-status/:taskId`

**请求头**:
```
X-API-Key: your-api-key
```

**响应**:
```json
{
  "success": true,
  "task": {
    "id": "task-uuid",
    "title": "任务标题",
    "status": "completed",
    "priority": "high",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T01:00:00Z",
    "results": [
      {
        "id": "result-uuid",
        "agentId": "agent-1",
        "title": "成果标题",
        "type": "report",
        "content": "成果内容",
        "status": "approved",
        "createdAt": "2025-01-01T00:30:00Z"
      }
    ]
  }
}
```

## Webhook 通知

系统会在任务状态变更时向配置的 Webhook URL 发送通知。

### 事件类型

- `task.created`: 任务已创建
- `task.started`: 任务开始执行
- `task.completed`: 任务执行完成
- `task.failed`: 任务执行失败

### 通知格式

```json
{
  "event": "task.completed",
  "taskId": "task-uuid",
  "status": "completed",
  "message": "任务执行完成",
  "timestamp": "2025-01-01T01:00:00Z",
  "data": {
    "title": "任务标题",
    "description": "任务描述",
    "priority": "high",
    "assignees": [
      {
        "id": "agent-1",
        "name": "智能体名称",
        "role": "leader"
      }
    ]
  }
}
```

## 示例代码

### Node.js / JavaScript

```javascript
// 触发任务
async function triggerTask() {
  const response = await fetch('http://your-system.com/api/openclaw/trigger-task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key',
    },
    body: JSON.stringify({
      title: '分析市场数据',
      description: '分析2025年第一季度市场数据，生成报告',
      priority: 'high',
      assigneeIds: ['leader-agent-id', 'analyst-agent-id'],
      autoExecute: true,
    }),
  });

  const result = await response.json();
  console.log(result);
}

// 查询任务状态
async function getTaskStatus(taskId) {
  const response = await fetch(`http://your-system.com/api/openclaw/task-status/${taskId}`, {
    headers: {
      'X-API-Key': 'your-api-key',
    },
  });

  const result = await response.json();
  console.log(result);
}
```

### Python

```python
import requests
import json

API_KEY = 'your-api-key'
BASE_URL = 'http://your-system.com'

def trigger_task():
    url = f'{BASE_URL}/api/openclaw/trigger-task'
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
    }
    data = {
        'title': '分析市场数据',
        'description': '分析2025年第一季度市场数据，生成报告',
        'priority': 'high',
        'assigneeIds': ['leader-agent-id', 'analyst-agent-id'],
        'autoExecute': True,
    }

    response = requests.post(url, headers=headers, json=data)
    print(response.json())

def get_task_status(task_id):
    url = f'{BASE_URL}/api/openclaw/task-status/{task_id}'
    headers = {
        'X-API-Key': API_KEY,
    }

    response = requests.get(url, headers=headers)
    print(response.json())
```

### cURL

```bash
# 触发任务
curl -X POST http://your-system.com/api/openclaw/trigger-task \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "title": "分析市场数据",
    "description": "分析2025年第一季度市场数据，生成报告",
    "priority": "high",
    "assigneeIds": ["leader-agent-id", "analyst-agent-id"],
    "autoExecute": true
  }'

# 查询任务状态
curl http://your-system.com/api/openclaw/task-status/task-uuid \
  -H "X-API-Key: your-api-key"
```

## 错误处理

所有 API 端点都遵循标准的 HTTP 状态码：

- `200 OK`: 请求成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: API Key 无效或缺失
- `403 Forbidden`: 自动触发未启用
- `404 Not Found`: 任务不存在
- `500 Internal Server Error`: 服务器内部错误

错误响应格式：
```json
{
  "error": "错误描述"
}
```

## 安全建议

1. **保护 API Key**: 不要在客户端代码中暴露 API Key
2. **使用 HTTPS**: 在生产环境中使用 HTTPS 加密传输
3. **定期更换密钥**: 定期更换 API Key 以提高安全性
4. **限制访问范围**: 如果可能，限制 API Key 的访问范围和有效期

## 常见问题

### Q: 如何获取智能体 ID？
A: 在系统首页的"智能体架构"页面，点击智能体可以查看其 ID。

### Q: autoExecute 参数是什么？
A: 设置为 `true` 时，任务创建后会自动开始执行；设置为 `false` 时，任务进入等待状态，需要手动触发。

### Q: 如何处理 Webhook 通知？
A: 在 OpenClaw 平台配置 Webhook 端点，接收系统发送的 JSON 格式通知，并根据事件类型执行相应操作。

### Q: 任务执行失败怎么办？
A: 检查任务状态 API 返回的错误信息，查看系统日志，确认智能体配置是否正确。

## 支持

如有问题或建议，请联系技术支持团队。
