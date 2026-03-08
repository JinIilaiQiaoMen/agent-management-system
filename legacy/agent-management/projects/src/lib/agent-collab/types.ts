// AgentCollab Framework - Core Type Definitions

/**
 * 智能体角色类型
 */
export enum AgentRole {
  PLANNER = "planner",       // 规划者 - 任务规划和拆解
  EXECUTOR = "executor",     // 执行者 - 具体任务执行
  REVIEWER = "reviewer",     // 审核者 - 结果审核和反馈
  RESEARCHER = "researcher", // 研究员 - 信息收集和分析
  DEVELOPER = "developer",   // 开发者 - 代码开发和实现
  DESIGNER = "designer",     // 设计师 - 界面和视觉设计
  TESTER = "tester",         // 测试者 - 质量保证
  COORDINATOR = "coordinator", // 协调者 - 负责人
  SPECIALIST = "specialist", // 专家 - 领域专家
}

/**
 * 消息类型
 */
export enum MessageType {
  TASK_ASSIGN = "task_assign",       // 任务分配
  TASK_UPDATE = "task_update",       // 任务更新
  TASK_COMPLETE = "task_complete",   // 任务完成
  MESSAGE = "message",               // 普通消息
  RESPONSE = "response",             // 响应消息
  ERROR = "error",                   // 错误消息
  COORDINATION = "coordination",     // 协调消息
  TOOL_CALL = "tool_call",           // 工具调用
  TOOL_RESULT = "tool_result",       // 工具执行结果
}

/**
 * Agent接口
 */
export interface IAgent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  llmClient: any; // LLM客户端
  messageBus?: MessageBus;
  memory?: Memory;
  tools?: Tool[];
  process(task: AgentTask): Promise<AgentResult>;
  processStream(task: AgentTask): AsyncGenerator<string>;
  sendMessage(toAgent: string, content: any, type?: MessageType): Promise<void>;
  receiveMessages(): Promise<AgentMessage[]>;
  bindMessageBus(messageBus: MessageBus): void;
  bindMemory(memory: Memory): void;
  bindTools(tools: Tool[]): void;
}

/**
 * 任务类型
 */
export interface AgentTask {
  id: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high";
  context?: any;
  parentId?: string; // 子任务关联父任务
  dependencies?: string[]; // 依赖的任务ID
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: number;
  updatedAt: number;
}

/**
 * 任务结果
 */
export interface AgentResult {
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

/**
 * 消息对象
 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  content: any;
  type: MessageType;
  timestamp: number;
  taskId?: string;
  metadata?: any;
}

/**
 * 消息总线接口
 */
export interface MessageBus {
  publish(from: string, to: string, content: any, type?: MessageType, taskId?: string): Promise<void>;
  subscribe(agentId: string): AsyncGenerator<AgentMessage>;
  consume(agentId: string): Promise<AgentMessage[]>;
  getQueueSize(agentId: string): number;
  clearQueue(agentId: string): void;
}

/**
 * 记忆条目
 */
export interface MemoryEntry {
  id: string;
  type: "task" | "message" | "result" | "tool" | "context";
  content: any;
  taskId?: string;
  agentId?: string;
  timestamp: number;
  metadata?: any;
}

/**
 * 记忆模块接口
 */
export interface Memory {
  store(entry: MemoryEntry): Promise<void>;
  retrieve(taskId: string): Promise<MemoryEntry[]>;
  retrieveByAgent(agentId: string): Promise<MemoryEntry[]>;
  retrieveByType(type: string): Promise<MemoryEntry[]>;
  search(query: string): Promise<MemoryEntry[]>;
  clear(): void;
}

/**
 * 工具定义
 */
export interface Tool {
  name: string;
  description: string;
  type: "search" | "code" | "file" | "api" | "custom";
  parameters: {
    [key: string]: {
      type: "string" | "number" | "boolean" | "object";
      description: string;
      required: boolean;
      default?: any;
    };
  };
  execute: (params: any) => Promise<any>;
}

/**
 * 工具注册表
 */
export interface ToolRegistry {
  register(tool: Tool): void;
  unregister(toolName: string): void;
  get(toolName: string): Tool | undefined;
  getAll(): Tool[];
  getByType(type: Tool["type"]): Tool[];
  call(toolName: string, params: any): Promise<any>;
}

/**
 * 协调器接口
 */
export interface Coordinator {
  registerAgent(agent: IAgent): void;
  unregisterAgent(agentId: string): void;
  executeTask(task: AgentTask): Promise<any>;
  distributeTask(task: AgentTask): Promise<void>;
  collectResults(taskId: string): Promise<AgentResult[]>;
  monitorProgress(taskId: string): AsyncGenerator<any>;
  resolveConflicts(taskId: string): Promise<void>;
}

/**
 * 工作流定义
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  dependencies?: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentRole: AgentRole;
  description: string;
  inputMapping?: any;
  outputMapping?: any;
  parallel?: boolean;
  retryCount?: number;
  timeout?: number;
}

/**
 * 工作流引擎
 */
export interface WorkflowEngine {
  registerWorkflow(workflow: Workflow): void;
  executeWorkflow(workflowId: string, input: any): Promise<any>;
  getWorkflowStatus(workflowId: string): any;
}
