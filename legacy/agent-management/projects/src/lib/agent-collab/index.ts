// AgentCollab Framework - Core Export

// Types
export * from "./types";

// MessageBus
export { MessageBus, getMessageBus, resetMessageBus } from "./MessageBus";

// Memory
export { Memory, getMemory, resetMemory } from "./Memory";

// ToolRegistry
export { ToolRegistry, getToolRegistry, resetToolRegistry } from "./ToolRegistry";

// Base Agents
export {
  BaseAgent,
  PlannerAgent,
  ExecutorAgent,
  ReviewerAgent,
  CoordinatorAgent,
} from "./BaseAgent";

// Coordinator
export { Coordinator } from "./Coordinator";

// OpenClaw Kernel (深度集成V2)
export { 
  OpenClawKernel, 
  openclawKernel,
  DEFAULT_KERNEL_CONFIG,
  type OpenClawKernelConfig,
  type KernelResult 
} from "./OpenClawKernel";

// OpenClaw Agent (深度融合智能体)
export { 
  OpenClawAgent, 
  createOpenClawAgent,
  type OpenClawAgentConfig 
} from "./OpenClawAgent";

// Helper function to create a complete framework instance
import { MessageBus } from "./MessageBus";
import { Memory } from "./Memory";
import { ToolRegistry } from "./ToolRegistry";
import { Coordinator } from "./Coordinator";
import { IAgent } from "./types";

export interface AgentCollabFramework {
  messageBus: MessageBus;
  memory: Memory;
  toolRegistry: ToolRegistry;
  coordinator: Coordinator;
}

/**
 * 创建AgentCollab框架实例
 */
export function createAgentCollabFramework(): AgentCollabFramework {
  const messageBus = new MessageBus();
  const memory = new Memory();
  const toolRegistry = new ToolRegistry();
  const coordinator = new Coordinator(messageBus, memory, toolRegistry);

  return {
    messageBus,
    memory,
    toolRegistry,
    coordinator,
  };
}

/**
 * 使用框架执行任务
 */
export async function executeTaskWithFramework(
  agents: IAgent[],
  task: any
): Promise<any> {
  const framework = createAgentCollabFramework();

  // 注册所有Agent
  for (const agent of agents) {
    framework.coordinator.registerAgent(agent);
  }

  // 执行任务
  return await framework.coordinator.executeTask(task);
}
