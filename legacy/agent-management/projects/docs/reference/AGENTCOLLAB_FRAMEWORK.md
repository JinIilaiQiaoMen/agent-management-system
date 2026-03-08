# AgentCollab 多智能体协作框架文档

## 框架概述

AgentCollab 是一个基于 TypeScript 的多智能体协作框架，实现了消息驱动、任务协调、记忆共享和工具集成等核心功能，用于构建复杂的多智能体协作系统。

## 核心设计理念

### 1. 角色分工
每个智能体（Agent）有明确的角色和职责：
- **Coordinator（协调者）**：负责任务拆解、分配和流程管控
- **Planner（规划者）**：制定执行计划和策略
- **Executor（执行者）**：执行具体任务（Developer, Designer, Researcher等）
- **Reviewer（审核者）**：审核工作成果并提供反馈
- **Specialist（专家）**：领域专家，提供专业知识支持

### 2. 消息驱动
通过 MessageBus 实现 Agent 之间的异步通信：
- 发布-订阅模式
- 异步消息队列
- 支持多种消息类型（任务分配、响应、协调、错误等）

### 3. 任务协调
中央协调器（Coordinator）负责任务全流程管理：
- 任务拆解
- 角色分配
- 流程调度
- 结果汇总
- 冲突解决

### 4. 工具集成
支持 Agent 调用外部工具：
- 网络搜索（web_search）
- 代码执行（code_execute）
- 文件操作（file_read, file_write）
- 知识库搜索（knowledge_search）
- 自定义工具

### 5. 记忆共享
全局记忆模块（Memory）保存：
- 任务上下文
- 历史交互
- Agent 对话记录
- 执行结果
- 工具调用记录

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    用户接口层                             │
│          (任务输入/结果展示/流程监控)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 任务协调层 (Coordinator)                  │
│    任务拆解 → 角色分配 → 流程调度 → 结果汇总 → 冲突解决      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌─▼─────────────┐
│  Coordinator │ │  Executor    │ │  Specialist   │
│  (协调者)    │ │  (执行者)    │ │  (专家)       │
└───────┬──────┘ └──┬───────────┘ └─┬─────────────┘
        │            │                │
        └────────────┼────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  通信层 (MessageBus)                      │
│              异步消息队列 / 发布-订阅模式                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────────┐ ┌─▼─────────────┐
│  记忆模块     │ │  工具注册表  │ │  大模型接口     │
│  (Memory)    │ │ (ToolRegistry)│ │ (LLM Client)  │
└──────────────┘ └─────────────┘ └────────────────┘
```

## 核心模块

### 1. MessageBus（消息总线）

**功能**：实现 Agent 之间的异步消息传递

**核心方法**：
```typescript
class MessageBus {
  // 发布消息
  publish(from: string, to: string, content: any, type?: MessageType, taskId?: string): Promise<void>
  
  // 订阅消息
  subscribe(agentId: string): AsyncGenerator<AgentMessage>
  
  // 消费消息（非阻塞）
  consume(agentId: string): Promise<AgentMessage[]>
  
  // 获取队列大小
  getQueueSize(agentId: string): number
  
  // 获取消息历史
  getHistory(agentId?: string, limit?: number): AgentMessage[]
}
```

**使用示例**：
```typescript
import { getMessageBus } from "@/lib/agent-collab";

const messageBus = getMessageBus();

// 发送消息
await messageBus.publish("agent1", "agent2", { text: "你好" }, "message", "task_123");

// 接收消息
const messages = await messageBus.consume("agent2");
```

### 2. Memory（记忆模块）

**功能**：存储任务上下文和历史交互

**核心方法**：
```typescript
class Memory {
  // 存储记忆条目
  store(entry: MemoryEntry): Promise<void>
  
  // 检索任务记忆
  retrieve(taskId: string): Promise<MemoryEntry[]>
  
  // 检索Agent记忆
  retrieveByAgent(agentId: string): Promise<MemoryEntry[]>
  
  // 获取对话历史
  getConversationHistory(taskId: string, agentId?: string, limit?: number): Promise<any[]>
  
  // 添加对话消息
  addMessage(taskId: string, agentId: string, role: string, content: string): Promise<void>
  
  // 添加任务结果
  addResult(taskId: string, agentId: string, result: any): Promise<void>
}
```

**使用示例**：
```typescript
import { getMemory } from "@/lib/agent-collab";

const memory = getMemory();

// 保存对话
await memory.addMessage("task_123", "agent1", "user", "你好");

// 获取对话历史
const history = await memory.getConversationHistory("task_123", 10);
```

### 3. ToolRegistry（工具注册表）

**功能**：管理和调用外部工具

**核心方法**：
```typescript
class ToolRegistry {
  // 注册工具
  register(tool: Tool): void
  
  // 调用工具
  call(toolName: string, params: any): Promise<any>
  
  // 获取工具
  get(toolName: string): Tool | undefined
  
  // 获取所有工具
  getAll(): Tool[]
  
  // 按类型获取工具
  getByType(type: "search" | "code" | "file" | "api" | "custom"): Tool[]
}
```

**使用示例**：
```typescript
import { getToolRegistry } from "@/lib/agent-collab";

const toolRegistry = getToolRegistry();

// 调用工具
const result = await toolRegistry.call("web_search", {
  query: "人工智能",
  numResults: 10
});
```

**内置工具**：
- `web_search`: 网络搜索
- `code_execute`: 代码执行
- `file_read`: 读取文件
- `file_write`: 写入文件
- `knowledge_search`: 知识库搜索

### 4. BaseAgent（智能体基类）

**功能**：提供智能体的基础功能

**核心方法**：
```typescript
abstract class BaseAgent {
  // 处理任务（子类实现）
  abstract process(task: AgentTask): Promise<AgentResult>
  
  // 发送消息
  sendMessage(toAgent: string, content: any, type?: MessageType, taskId?: string): Promise<void>
  
  // 接收消息
  receiveMessages(): Promise<AgentMessage[]>
  
  // 绑定基础设施
  bindMessageBus(messageBus: MessageBus): void
  bindMemory(memory: Memory): void
  bindTools(tools: Tool[]): void
  
  // 调用LLM
  protected callLLM(prompt: string, systemPrompt?: string): Promise<string>
  protected callLLMStream(prompt: string, systemPrompt?: string): AsyncGenerator<string>
}
```

**具体角色类**：
- `CoordinatorAgent`: 协调者Agent
- `PlannerAgent`: 规划者Agent
- `ExecutorAgent`: 执行者Agent
- `ReviewerAgent`: 审核者Agent

### 5. Coordinator（任务协调器）

**功能**：管理Agent和执行任务流程

**核心方法**：
```typescript
class Coordinator {
  // 注册Agent
  registerAgent(agent: IAgent): void
  
  // 执行任务
  executeTask(task: AgentTask): Promise<any>
  
  // 流式执行任务
  executeTaskStream(task: AgentTask, onEvent?: (event: any) => void): AsyncGenerator<any>
  
  // 分配任务
  distributeTask(task: AgentTask): Promise<void>
  
  // 收集结果
  collectResults(taskId: string): Promise<AgentResult[]>
  
  // 监控进度
  monitorProgress(taskId: string): AsyncGenerator<any>
  
  // 解决冲突
  resolveConflicts(taskId: string): Promise<void>
}
```

**执行流程**（5个阶段）：
1. **规划阶段**：分析任务、制定执行计划
2. **执行阶段**：多个Executor并行执行子任务
3. **协调阶段**：Coordinator协调各Agent的工作、解决冲突
4. **最终执行**：根据协调结果执行最终方案
5. **汇总阶段**：汇总所有执行成果

## 使用指南

### 快速开始

#### 1. 创建框架实例

```typescript
import { createAgentCollabFramework } from "@/lib/agent-collab";

const framework = createAgentCollabFramework();
const { messageBus, memory, toolRegistry, coordinator } = framework;
```

#### 2. 创建和注册Agent

```typescript
import { CoordinatorAgent, ExecutorAgent, AgentRole } from "@/lib/agent-collab";

// 创建协调者Agent
const coordinatorAgent = new CoordinatorAgent(
  "coordinator_1",
  "项目经理",
  llmClient
);
coordinator.registerAgent(coordinatorAgent);

// 创建执行者Agent
const developerAgent = new ExecutorAgent(
  "dev_1",
  "技术专家",
  AgentRole.DEVELOPER,
  llmClient
);
coordinator.registerAgent(developerAgent);

const designerAgent = new ExecutorAgent(
  "design_1",
  "设计师",
  AgentRole.DESIGNER,
  llmClient
);
coordinator.registerAgent(designerAgent);
```

#### 3. 执行任务

```typescript
// 同步执行
const result = await coordinator.executeTask({
  id: "task_123",
  description: "开发一个登录页面",
  type: "development",
  priority: "high",
  status: "processing",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 流式执行
for await (const event of coordinator.executeTaskStream(task)) {
  console.log(event);
  // 处理事件：step_start, step_complete, agent_progress, etc.
}
```

### API集成示例

#### 集成豆包大模型

```typescript
import { LLMClient, Config } from "coze-coding-dev-sdk";

const config = new Config();
const llmClient = new LLMClient(config);

// Agent会自动使用这个LLM客户端
const agent = new CoordinatorAgent("agent_1", "AI助手", llmClient);
```

#### 集成自定义工具

```typescript
const toolRegistry = framework.toolRegistry;

// 注册自定义搜索工具
toolRegistry.register({
  name: "custom_search",
  description: "自定义搜索引擎",
  type: "search",
  parameters: {
    query: {
      type: "string",
      description: "搜索查询",
      required: true,
    },
  },
  execute: async (params) => {
    // 实现自定义搜索逻辑
    const results = await customSearchAPI(params.query);
    return { results };
  },
});
```

### SSE流式输出示例

```typescript
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: any) => {
        const event = JSON.stringify({ type, data, timestamp: Date.now() });
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      };

      const framework = createAgentCollabFramework();
      const task = { /* ... */ };

      for await (const event of framework.coordinator.executeTaskStream(task)) {
        sendEvent('framework_event', event);
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

## 类型定义

### AgentTask（任务）

```typescript
interface AgentTask {
  id: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high";
  context?: any;
  parentId?: string;
  dependencies?: string[];
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: number;
  updatedAt: number;
}
```

### AgentResult（结果）

```typescript
interface AgentResult {
  taskId: string;
  agentId: string;
  status: "success" | "failed" | "partial";
  output: any;
  metadata?: {
    executionTime?: number;
    toolsUsed?: string[];
    tokenCount?: number;
  };
  error?: string;
}
```

### AgentMessage（消息）

```typescript
interface AgentMessage {
  id: string;
  from: string;
  to: string;
  content: any;
  type: MessageType;
  timestamp: number;
  taskId?: string;
  metadata?: any;
}
```

## 最佳实践

### 1. Agent角色设计

**原则**：
- 单一职责：每个Agent专注于特定领域
- 角色明确：使用 `AgentRole` 枚举明确定义
- 描述清晰：提供详细的 description 字段

**示例**：
```typescript
// ✅ 好的设计
const devAgent = new ExecutorAgent(
  "dev_1",
  "技术专家",
  AgentRole.DEVELOPER,
  llmClient
);
devAgent.description = "负责前端开发和代码实现，熟悉React、TypeScript和现代Web技术";

// ❌ 不好的设计
const agent = new ExecutorAgent(
  "agent_1",
  "全能助手",
  AgentRole.EXECUTOR,
  llmClient
);
agent.description = "什么都做";
```

### 2. 任务拆分

**原则**：
- 每个子任务应独立可执行
- 明确任务依赖关系
- 设置合理的优先级

**示例**：
```typescript
const mainTask: AgentTask = {
  id: "task_1",
  description: "开发电商网站",
  type: "development",
  priority: "high",
  context: {
    requirements: ["用户注册", "商品展示", "购物车"],
  },
  status: "processing",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

### 3. 消息传递

**原则**：
- 使用合适的数据结构
- 包含必要的元数据
- 处理异步和并发

**示例**：
```typescript
// ✅ 好的消息结构
await messageBus.publish(
  "agent1",
  "agent2",
  { 
    type: "task_assign",
    taskId: "task_1",
    description: "实现登录功能",
    requirements: ["用户名", "密码"],
    deadline: Date.now() + 86400000
  },
  MessageType.TASK_ASSIGN,
  "task_1"
);

// ❌ 不好的消息结构
await messageBus.publish(
  "agent1",
  "agent2",
  "做这个任务",
  MessageType.MESSAGE
);
```

### 4. 记忆管理

**原则**：
- 及时保存重要信息
- 定期清理过期数据
- 使用合适的类型标记

**示例**：
```typescript
// 保存对话
await memory.addMessage("task_1", "agent1", "user", "任务要求");

// 保存结果
await memory.addResult("task_1", "agent1", {
  status: "success",
  output: "代码实现完成",
});

// 获取历史
const history = await memory.getConversationHistory("task_1", undefined, 10);
```

## 性能优化

### 1. 并发执行

框架自动支持并发执行多个Executor：

```typescript
// 所有Executor会并行执行
const executionPromises = executors.map(async (executor) => {
  const result = await executor.process(task);
  return result;
});

const results = await Promise.all(executionPromises);
```

### 2. 流式输出

使用流式输出减少延迟：

```typescript
// 使用流式执行
for await (const event of coordinator.executeTaskStream(task)) {
  // 实时处理事件
  console.log(event);
}
```

### 3. 记忆优化

限制记忆大小：

```typescript
// Memory内部自动管理
private maxGlobalSize = 5000;
private maxTaskSize = 1000;

// 超过限制时自动清理旧数据
```

## 故障处理

### 1. 异常捕获

```typescript
try {
  const result = await coordinator.executeTask(task);
} catch (error) {
  console.error("任务执行失败:", error);
  // 处理错误
}
```

### 2. 重试机制

```typescript
async function executeWithRetry(
  coordinator: Coordinator,
  task: AgentTask,
  maxRetries: number = 3
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await coordinator.executeTask(task);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`重试 ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. 超时处理

```typescript
async function executeWithTimeout(
  coordinator: Coordinator,
  task: AgentTask,
  timeout: number = 60000
): Promise<any> {
  return Promise.race([
    coordinator.executeTask(task),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("任务超时")), timeout)
    ),
  ]);
}
```

## 扩展开发

### 1. 自定义Agent

```typescript
import { BaseAgent, AgentRole, AgentTask, AgentResult } from "@/lib/agent-collab";

class CustomAgent extends BaseAgent {
  constructor(id: string, name: string, llmClient: any) {
    super(
      id,
      name,
      AgentRole.SPECIALIST,
      "自定义智能体",
      llmClient
    );
  }

  async process(task: AgentTask): Promise<AgentResult> {
    // 自定义处理逻辑
    try {
      const result = await this.callLLM(
        `任务: ${task.description}`,
        `你是${this.name}`
      );

      return this.createResult(task.id, "success", result);
    } catch (error) {
      return this.createResult(
        task.id,
        "failed",
        null,
        error instanceof Error ? error.message : "处理失败"
      );
    }
  }
}
```

### 2. 自定义工具

```typescript
toolRegistry.register({
  name: "custom_tool",
  description: "自定义工具描述",
  type: "custom",
  parameters: {
    param1: {
      type: "string",
      description: "参数1",
      required: true,
    },
  },
  execute: async (params) => {
    // 自定义工具逻辑
    return { success: true, data: params.param1 };
  },
});
```

### 3. 自定义工作流

```typescript
// 创建自定义工作流
async function customWorkflow(
  coordinator: Coordinator,
  task: AgentTask
): Promise<any> {
  // 阶段1
  const step1 = await coordinator.getAgentsByRole(AgentRole.PLANNER)[0].process(task);
  
  // 阶段2
  const executors = coordinator.getAgentsByRole(AgentRole.EXECUTOR);
  const step2 = await Promise.all(
    executors.map(agent => agent.process(task))
  );
  
  // 阶段3
  const step3 = await coordinator.getAgentsByRole(AgentRole.REVIEWER)[0].process(task);
  
  return { step1, step2, step3 };
}
```

## 监控和调试

### 1. 获取统计信息

```typescript
const stats = coordinator.getStats();
console.log("框架统计:", stats);

// 输出:
// {
//   totalAgents: 5,
//   totalTasks: 10,
//   agentRoles: { coordinator: 1, specialist: 4 },
//   messageBusStats: { ... },
//   memoryStats: { ... }
// }
```

### 2. 查看消息历史

```typescript
const history = messageBus.getHistory("agent1", 10);
console.log("Agent1的消息历史:", history);
```

### 3. 查看记忆

```typescript
const taskMemory = await memory.retrieve("task_1");
console.log("任务记忆:", taskMemory);
```

## 常见问题

### Q1: 如何处理Agent之间的冲突？

**A**: 使用 Coordinator 的 `resolveConflicts` 方法：

```typescript
await coordinator.resolveConflicts("task_1");
```

### Q2: 如何限制Agent的执行时间？

**A**: 使用超时包装器：

```typescript
const result = await executeWithTimeout(coordinator, task, 60000);
```

### Q3: 如何保存和恢复任务状态？

**A**: 使用 Memory 的导出/导入功能：

```typescript
// 导出
const taskMemory = memory.exportTaskMemory("task_1");

// 导入
memory.importTaskMemory("task_1", taskMemory);
```

### Q4: 如何监控任务进度？

**A**: 使用 `monitorProgress` 方法：

```typescript
for await (const progress of coordinator.monitorProgress("task_1")) {
  console.log("进度:", progress);
}
```

## 总结

AgentCollab 框架提供了一个完整的多智能体协作解决方案，具有以下特点：

✅ **模块化设计**：各模块职责清晰，易于扩展  
✅ **消息驱动**：异步通信，支持高并发  
✅ **记忆共享**：全局记忆管理，支持上下文传递  
✅ **工具集成**：灵活的工具调用机制  
✅ **流式输出**：实时反馈，提升用户体验  
✅ **类型安全**：完整的 TypeScript 类型定义  

适用于以下场景：
- 多智能体协作任务
- 复杂工作流自动化
- 分布式任务执行
- AI Agent系统开发

## 相关文件

- `src/lib/agent-collab/types.ts` - 类型定义
- `src/lib/agent-collab/MessageBus.ts` - 消息总线
- `src/lib/agent-collab/Memory.ts` - 记忆模块
- `src/lib/agent-collab/ToolRegistry.ts` - 工具注册表
- `src/lib/agent-collab/BaseAgent.ts` - Agent基类
- `src/lib/agent-collab/Coordinator.ts` - 任务协调器
- `src/lib/agent-collab/index.ts` - 统一导出
- `src/app/api/tasks/[id]/auto-execute-stream/route.ts` - API集成示例

## 更新日志

### v2.0.0 (2026-03-05)
- ✅ 重构为 AgentCollab 框架
- ✅ 实现消息总线（MessageBus）
- ✅ 实现记忆模块（Memory）
- ✅ 实现工具注册表（ToolRegistry）
- ✅ 实现任务协调器（Coordinator）
- ✅ 实现多种Agent角色（Coordinator, Planner, Executor, Reviewer）
- ✅ 支持流式执行和SSE输出
- ✅ 完整的TypeScript类型定义

### v1.0.0
- 初始版本：简单的多轮对话协作
