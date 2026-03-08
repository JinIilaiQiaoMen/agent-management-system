# 多智能体对话盒子使用指南

## 概述

多智能体对话盒子是一个支持多个智能体同时参与协作对话的功能。用户可以在一个盒子中邀请多个智能体，所有智能体会依次对用户的消息做出响应，形成一个多智能体协作讨论的场景。

## 数据结构

### 1. 对话盒子 (conversation_boxes)
- `id`: 盒子唯一标识
- `title`: 盒子标题
- `description`: 盒子描述
- `taskId`: 关联的任务ID（可选）
- `createdBy`: 创建者
- `status`: 状态（active/archived）
- `metadata`: 元数据

### 2. 盒子智能体关联 (conversation_box_agents)
- `boxId`: 对话盒子ID
- `agentId`: 智能体ID
- `role`: 角色（owner/participant）
- `joinedAt`: 加入时间

### 3. 盒子消息 (conversation_box_messages)
- `boxId`: 对话盒子ID
- `content`: 消息内容
- `senderType`: 发送者类型（user/agent）
- `senderAgentId`: 如果是智能体发送，记录智能体ID
- `replyToId`: 回复的消息ID（可选）
- `metadata`: 元数据

### 4. 智能体响应 (conversation_box_agent_responses)
- `messageId`: 消息ID
- `agentId`: 智能体ID
- `content`: 响应内容
- `isHidden`: 是否隐藏（用于内部智能体间对话）
- `metadata`: 元数据

## API 接口

### 1. 创建对话盒子
```
POST /api/conversation-boxes
```

**请求体**:
```json
{
  "title": "产品规划讨论",
  "description": "讨论新产品的功能规划",
  "createdBy": "用户",
  "agentIds": ["agent-id-1", "agent-id-2", "agent-id-3"],
  "role": "participant"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "box-id",
    "title": "产品规划讨论",
    "description": "讨论新产品的功能规划",
    "agents": [...],
    "messages": [],
    "createdAt": "2026-03-04T16:20:52.095Z"
  }
}
```

### 2. 获取对话盒子列表
```
GET /api/conversation-boxes?taskId=xxx&status=active&limit=100&skip=0
```

### 3. 获取对话盒子详情
```
GET /api/conversation-boxes/{id}
```

**响应包含**:
- 盒子基本信息
- 盒子中的智能体列表
- 所有消息及其响应

### 4. 更新对话盒子
```
PUT /api/conversation-boxes/{id}
```

**请求体**:
```json
{
  "title": "新标题",
  "description": "新描述",
  "status": "archived"
}
```

### 5. 删除对话盒子
```
DELETE /api/conversation-boxes/{id}
```

### 6. 添加智能体到盒子
```
POST /api/conversation-boxes/{id}/agents
```

**请求体**:
```json
{
  "agentIds": ["agent-id-1", "agent-id-2"],
  "role": "participant"
}
```

### 7. 移除盒子中的智能体
```
DELETE /api/conversation-boxes/{id}/agents/{agentId}
```

### 8. 获取盒子中的智能体列表
```
GET /api/conversation-boxes/{id}/agents
```

### 9. 获取盒子消息列表
```
GET /api/conversation-boxes/{id}/messages?limit=100
```

### 10. 发送消息到盒子
```
POST /api/conversation-boxes/{id}/messages
```

**请求体**:
```json
{
  "content": "消息内容",
  "senderType": "user",
  "senderAgentId": "agent-id", // 如果是智能体发送
  "replyToId": "message-id", // 可选，回复某条消息
  "metadata": {}
}
```

### 11. 多智能体协作聊天（流式）⭐
```
POST /api/conversation-boxes/{id}/chat
```

**请求体**:
```json
{
  "content": "我们需要讨论新产品的技术方案",
  "triggerAllAgents": true
}
```

**响应格式** (SSE 事件流):
```
data: {"type":"start","data":{"boxId":"xxx","message":"开始多智能体协作聊天"},"timestamp":1772641400000}

data: {"type":"box_info","data":{"title":"xxx","agentCount":3},"timestamp":1772641400000}

data: {"type":"message_sent","data":{"messageId":"xxx","content":"xxx"},"timestamp":1772641400000}

data: {"type":"agent_start","data":{"agentId":"xxx","agentName":"CEO","agentRole":"CEO","index":1,"total":3},"timestamp":1772641400000}

data: {"type":"agent_progress","data":{"agentId":"xxx","agentName":"CEO","content":"从商业角..."}}...

data: {"type":"agent_complete","data":{"agentId":"xxx","agentName":"CEO","responseId":"xxx"},"timestamp":1772641400000}

data: {"type":"agent_start","data":{"agentId":"xxx","agentName":"CTO","agentRole":"CTO","index":2,"total":3},"timestamp":1772641400000}

data: {"type":"agent_progress","data":{"agentId":"xxx","agentName":"CTO","content":"技术方案..."}}...

data: {"type":"agent_complete","data":{"agentId":"xxx","agentName":"CTO","responseId":"xxx"},"timestamp":1772641400000}

data: {"type":"agent_start","data":{"agentId":"xxx","agentName":"产品经理","agentRole":"产品经理","index":3,"total":3},"timestamp":1772641400000}

data: {"type":"agent_progress","data":{"agentId":"xxx","agentName":"产品经理","content":"从用户体..."}}...

data: {"type":"agent_complete","data":{"agentId":"xxx","agentName":"产品经理","responseId":"xxx"},"timestamp":1772641400000}

data: {"type":"complete","data":{"messageId":"xxx","responseCount":3,"responses":[...]},"timestamp":1772641400000}

data: [DONE]
```

**事件类型说明**:
- `start`: 开始多智能体协作
- `box_info`: 盒子信息
- `message_sent`: 用户消息已保存
- `agent_start`: 某个智能体开始响应
- `agent_progress`: 智能体响应进度（增量）
- `agent_complete`: 智能体响应完成
- `agent_error`: 智能体响应错误
- `complete`: 所有智能体响应完成
- `[DONE]`: 流结束

## 前端组件

### ConversationBoxChat 组件

位置: `src/components/conversation-box-chat.tsx`

**功能**:
- 对话盒子列表管理
- 创建新对话盒子
- 添加/移除智能体
- 多智能体协作聊天（流式）
- 实时显示智能体响应进度
- 消息历史查看

**使用方法**:
```tsx
import ConversationBoxChat from "@/components/conversation-box-chat";

// 在页面中使用
<ConversationBoxChat />
```

**Props**:
- `boxId?`: 可选，指定初始盒子ID

## 工作流程

### 创建对话盒子流程

1. 用户创建对话盒子
2. 选择要参与的智能体（至少1个）
3. 设置盒子的标题和描述
4. 保存盒子，智能体自动加入

### 多智能体协作聊天流程

1. 用户发送消息到盒子
2. 系统保存用户消息
3. 按顺序触发每个智能体响应：
   - 获取对话上下文
   - 智能体分析消息
   - 智能体生成响应
   - 保存响应到数据库
   - 下一个智能体可以看到之前智能体的回复
4. 所有智能体响应完成
5. 返回完整响应列表

### 智能体协作机制

智能体之间可以互相看到彼此的回复，形成递进式的讨论：

```
用户: "我们需要开发一个智能客服系统"

CEO (第1个响应): "从商业角度看，这需要考虑市场竞品和用户需求..."

CTO (第2个响应，可以看到CEO的回复): "CEO说得对。从技术角度看，我们需要选择合适的大模型和架构..."

产品经理 (第3个响应，可以看到CEO和CTO的回复): "两位都提到了重要点。从产品角度，我们需要设计用户友好的交互界面..."
```

## 使用场景

### 1. 产品规划讨论
- **参与者**: CEO、CTO、产品经理
- **用途**: 讨论新产品的功能、技术方案、市场定位

### 2. 技术方案评审
- **参与者**: CTO、架构师、开发组长
- **用途**: 评审技术架构、技术选型、实现方案

### 3. 市场营销策略
- **参与者**: CMO、市场经理、品牌经理
- **用途**: 讨论市场策略、营销方案、品牌定位

### 4. 危机应对会议
- **参与者**: CEO、PR总监、法务
- **用途**: 应对公司危机、制定应对策略

## 测试

### 运行测试脚本

```bash
bash /scripts/test-conversation-box.sh
```

测试脚本会：
1. 创建测试智能体（CEO、CTO、产品经理）
2. 创建对话盒子
3. 添加智能体到盒子
4. 发送消息并获取多智能体响应（流式）
5. 查看消息历史

### 手动测试

1. 创建智能体：
```bash
curl -X POST http://localhost:5000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试CEO",
    "role": "CEO",
    "department": "管理层",
    "systemPrompt": "你是CEO，负责战略决策。",
    "capabilities": ["战略决策", "团队管理"],
    "isActive": true
  }'
```

2. 创建对话盒子：
```bash
curl -X POST http://localhost:5000/api/conversation-boxes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "产品讨论",
    "description": "讨论新产品功能",
    "createdBy": "用户",
    "agentIds": ["agent-id-1", "agent-id-2"]
  }'
```

3. 发送消息（流式）：
```bash
curl -X POST http://localhost:5000/api/conversation-boxes/{box-id}/chat \
  -H "Content-Type: application/json" \
  -d '{
    "content": "我们计划开发一个新产品，你们有什么建议？"
  }'
```

## 前端使用示例

```tsx
import { useState, useEffect } from 'react';

function ChatExample() {
  const [boxId, setBoxId] = useState('');

  const startChat = async () => {
    const response = await fetch('/api/conversation-boxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '产品讨论',
        createdBy: '用户',
        agentIds: ['agent-id-1', 'agent-id-2'],
      }),
    });
    const result = await response.json();
    setBoxId(result.data.id);
  };

  const sendMessage = async (message: string) => {
    const response = await fetch(`/api/conversation-boxes/${boxId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        triggerAllAgents: true,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') break;

          const event = JSON.parse(dataStr);
          console.log('Event:', event.type, event.data);

          // 处理不同事件类型
          if (event.type === 'agent_progress') {
            // 实时显示智能体响应
          } else if (event.type === 'complete') {
            // 完成
          }
        }
      }
    }
  };

  return (
    <div>
      <button onClick={startChat}>创建对话盒子</button>
      {boxId && (
        <div>
          <button onClick={() => sendMessage('你好')}>
            发送消息
          </button>
        </div>
      )}
    </div>
  );
}
```

## 注意事项

1. **执行时间**: 多智能体协作聊天可能需要较时间，取决于智能体数量和消息复杂度
2. **API 依赖**: 需要配置 LLM、联网搜索等集成服务
3. **智能体顺序**: 智能体会按加入盒子的顺序依次响应
4. **上下文累积**: 后续智能体可以看到前面智能体的回复
5. **错误处理**: 如果某个智能体响应失败，其他智能体仍会继续响应

## 后续优化方向

1. **并行响应**: 支持多个智能体同时响应（而非顺序）
2. **智能体间对话**: 支持智能体之间互相发起对话
3. **投票机制**: 支持多智能体投票决策
4. **动态加入/退出**: 支持聊天过程中动态添加/移除智能体
5. **对话分支**: 支持创建对话分支，探索不同讨论路径
6. **可视化讨论**: 提供讨论图谱，展示智能体之间的关系和观点
