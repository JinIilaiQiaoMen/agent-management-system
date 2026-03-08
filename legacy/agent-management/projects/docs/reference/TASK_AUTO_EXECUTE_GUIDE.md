# 任务自动执行功能说明

## 概述

任务自动执行功能允许系统自动完成任务，无需人工干预。系统会：
1. 生成智能体团队
2. 负责人智能体分析任务并拆解
3. 专业智能体自主学习并执行子任务
4. 负责人智能体汇总成果并交付

## API 接口

### 1. 非流式自动执行

**接口**: `POST /api/tasks/[id]/auto-execute`

**说明**: 一次性完成整个任务执行流程，等待所有步骤完成后返回结果。

**请求**:
```bash
curl -X POST http://localhost:5000/api/tasks/[TASK_ID]/auto-execute \
  -H "Content-Type: application/json"
```

**响应**:
```json
{
  "success": true,
  "message": "任务自动执行完成",
  "data": {
    "taskId": "xxx",
    "taskAnalysis": "...",
    "executionResults": [...],
    "finalSummary": "...",
    "executedAt": "2026-03-04T16:20:52.095Z"
  }
}
```

**注意**: 此接口可能需要较长时间（几分钟到十几分钟），建议使用流式接口。

---

### 2. 流式自动执行（推荐）

**接口**: `POST /api/tasks/[id]/auto-execute-stream`

**说明**: 使用 Server-Sent Events (SSE) 实时推送执行进度，可以实时看到任务执行的每一步。

**请求**:
```bash
curl -X POST http://localhost:5000/api/tasks/[TASK_ID]/auto-execute-stream \
  -H "Content-Type: application/json"
```

**响应格式** (SSE 事件流):
```
data: {"type":"start","data":{"taskId":"xxx","message":"开始执行任务"},"timestamp":1772641400000}

data: {"type":"task_info","data":{"title":"xxx","description":"xxx"},"timestamp":1772641400000}

data: {"type":"status_update","data":{"status":"in_progress","message":"任务状态已更新为执行中"},"timestamp":1772641400000}

data: {"type":"agents_info","data":{"leader":"CEO","specialists":["CTO","产品经理"],"count":2},"timestamp":1772641400000}

data: {"type":"step","data":{"step":2,"name":"分析任务","message":"负责人智能体正在分析任务..."},"timestamp":1772641400000}

data: {"type":"analysis_progress","data":{"content":"任务核心目标..."}}...

data: {"type":"step_complete","data":{"step":2,"name":"分析任务","message":"任务分析完成"},"timestamp":1772641400000}

data: {"type":"agent_start","data":{"agentName":"CTO","agentRole":"CTO","index":1,"total":2},"timestamp":1772641400000}

data: {"type":"agent_progress","data":{"agentName":"CTO","content":"技术架构方案..."}}...

data: {"type":"agent_complete","data":{"agentName":"CTO","knowledgeCount":5},"timestamp":1772641400000}

data: {"type":"complete","data":{"taskId":"xxx","completedAt":"2026-03-04T16:20:52.095Z"},"timestamp":1772641400000}

data: [DONE]
```

**事件类型说明**:
- `start`: 任务执行开始
- `task_info`: 任务基本信息
- `status_update`: 状态更新
- `agents_info`: 智能体团队信息
- `step`: 进入某个执行步骤
- `step_complete`: 步骤完成
- `analysis_progress`: 任务分析进度（增量）
- `agent_start`: 某个智能体开始执行
- `agent_progress`: 智能体执行进度（增量）
- `agent_learning`: 智能体正在自主学习
- `agent_complete`: 智能体执行完成
- `summary_progress`: 成果汇总进度（增量）
- `complete`: 任务执行完成
- `error`: 执行错误
- `[DONE]`: 流结束

**前端使用示例**:
```typescript
const taskId = "xxx";
const response = await fetch(`/api/tasks/${taskId}/auto-execute-stream`, {
  method: "POST",
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const dataStr = line.slice(6);
      
      if (dataStr === "[DONE]") {
        console.log("执行完成");
        break;
      }

      const event = JSON.parse(dataStr);
      console.log("Event:", event.type, event.data);

      // 根据事件类型更新UI
      switch (event.type) {
        case "analysis_progress":
          // 更新分析内容
          break;
        case "agent_progress":
          // 更新智能体执行内容
          break;
        case "complete":
          // 显示完成状态
          break;
      }
    }
  }
}
```

---

## 前端组件

### TaskExecution 组件

位置: `src/components/task-execution.tsx`

功能:
- 任务执行状态可视化
- 实时显示执行步骤进度
- 分别展示任务分析、智能体执行、成果汇总
- 事件日志记录

使用方法:
```tsx
import TaskExecution from "@/components/task-execution";

// 在任务详情页面中使用
<TaskExecution taskId={taskId} />
```

---

## 执行流程详解

### 步骤 1: 生成智能体团队
- 检查是否有可用的智能体
- 如果没有，自动生成智能体团队
- 根据任务需求分配角色（CEO、CTO、产品经理等）

### 步骤 2: 分析任务
- 负责人智能体分析任务
- 拆解为可执行的子任务
- 生成工作流程和关键需求

### 步骤 3: 专业智能体执行
- 每个专业智能体执行相关子任务
- 通过联网搜索获取最新信息
- 将重要知识点添加到知识库
- 生成具体成果（代码、文档、方案等）

### 步骤 4: 汇总成果
- 负责人智能体整合所有成果
- 生成最终可交付报告
- 保存到任务成果表

---

## 测试

### 使用测试脚本

运行测试脚本：
```bash
bash /scripts/test-auto-execute.sh
```

测试脚本会：
1. 创建测试智能体（CEO、CTO、产品经理）
2. 创建测试任务
3. 调用流式自动执行接口
4. 查看任务状态和成果

### 手动测试

1. 创建智能体：
```bash
curl -X POST http://localhost:5000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试CEO",
    "role": "CEO",
    "department": "管理层",
    "description": "负责公司整体战略决策",
    "systemPrompt": "你是公司的CEO，负责制定战略、分配任务、监督执行。你需要善于分析和总结。",
    "capabilities": ["战略决策", "团队管理", "任务分配", "成果评估"],
    "isActive": true
  }'
```

2. 创建任务：
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "开发一个在线协作平台",
    "description": "我们需要开发一个支持多人实时协作的在线平台...",
    "priority": "high",
    "createdBy": "测试用户"
  }'
```

3. 执行任务（流式）：
```bash
curl -X POST http://localhost:5000/api/tasks/[TASK_ID]/auto-execute-stream \
  -H "Content-Type: application/json"
```

---

## 注意事项

1. **执行时间**: 任务自动执行可能需要较长时间（几分钟到十几分钟），请耐心等待
2. **资源消耗**: 执行过程中会调用多次 LLM 和联网搜索，需要确保有足够的 API 配额
3. **网络环境**: 联网搜索需要稳定的网络连接
4. **知识库**: 智能体会将学习到的知识点存储到知识库中，后续任务可以复用这些知识
5. **错误处理**: 如果执行失败，任务状态会更新为 "failed"，错误信息会保存在 metadata 中

---

## 故障排查

### 问题 1: 任务一直处于 "in_progress" 状态

**可能原因**:
- LLM API 调用超时
- 联网搜索失败
- 知识库 API 错误

**解决方法**:
1. 检查后端日志: `tail -f /app/work/logs/bypass/app.log`
2. 检查控制台日志: `tail -f /app/work/logs/bypass/console.log`
3. 检查 API 配置是否正确
4. 重新执行任务

### 问题 2: 流式接口没有返回

**可能原因**:
- 浏览器不支持 SSE
- 网络中断
- 服务端错误

**解决方法**:
1. 使用非流式接口作为备选方案
2. 检查浏览器控制台错误
3. 检查网络连接

### 问题 3: 智能体没有生成成果

**可能原因**:
- 智能体配置不正确
- 任务描述不清晰
- LLM 返回格式异常

**解决方法**:
1. 检查智能体的 systemPrompt 和 capabilities
2. 优化任务描述，使其更清晰具体
3. 查看 agent_progress 事件中的详细内容

---

## 后续优化方向

1. **断点续传**: 支持中断后继续执行
2. **并行执行**: 多个智能体并行执行子任务
3. **进度保存**: 实时保存执行进度到数据库
4. **智能调度**: 根据任务复杂度动态调整执行策略
5. **人工干预**: 支持在执行过程中人工干预和调整
