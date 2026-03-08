import {
  Coordinator as ICoordinator,
  IAgent,
  AgentTask,
  AgentResult,
  AgentRole,
  MessageType,
} from "./types";
import { MessageBus } from "./MessageBus";
import { Memory } from "./Memory";
import { ToolRegistry } from "./ToolRegistry";

/**
 * 任务协调器
 * 负责管理Agent、分配任务、协调流程、汇总结果
 */
export class Coordinator implements ICoordinator {
  private agents: Map<string, IAgent> = new Map();
  private messageBus: MessageBus;
  private memory: Memory;
  private toolRegistry: ToolRegistry;
  private tasks: Map<string, AgentTask> = new Map();
  private results: Map<string, AgentResult[]> = new Map();

  constructor(
    messageBus: MessageBus,
    memory: Memory,
    toolRegistry: ToolRegistry
  ) {
    this.messageBus = messageBus;
    this.memory = memory;
    this.toolRegistry = toolRegistry;
  }

  /**
   * 注册Agent
   */
  registerAgent(agent: IAgent): void {
    this.agents.set(agent.id, agent);

    // 绑定基础设施
    agent.bindMessageBus(this.messageBus);
    agent.bindMemory(this.memory);
    agent.bindTools(this.toolRegistry.getAll());

    console.log(`Agent registered: ${agent.name} (${agent.role})`);
  }

  /**
   * 注销Agent
   */
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.messageBus.clearQueue(agentId);
      console.log(`Agent unregistered: ${agent.name}`);
    }
  }

  /**
   * 获取Agent
   */
  getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * 获取所有Agent
   */
  getAllAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * 按角色获取Agent
   */
  getAgentsByRole(role: AgentRole): IAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.role === role);
  }

  /**
   * 执行完整任务流程
   */
  async executeTask(task: AgentTask): Promise<any> {
    console.log(`\n========== 开始执行任务: ${task.id} ==========`);
    console.log(`任务描述: ${task.description}`);
    console.log(`任务类型: ${task.type}`);

    // 保存任务
    this.tasks.set(task.id, task);

    // 保存任务上下文到记忆
    await this.memory.addTaskContext(task.id, {
      description: task.description,
      type: task.type,
      priority: task.priority,
      createdAt: task.createdAt,
    });

    try {
      // 1. 规划阶段
      console.log("\n--- 阶段1: 任务规划 ---");
      const planners = this.getAgentsByRole(AgentRole.COORDINATOR);
      if (planners.length === 0) {
        throw new Error("没有可用的协调者Agent");
      }
      const planner = planners[0];
      const planResult = await planner.process(task);
      this.collectResult(task.id, planResult);

      // 发送规划结果给所有执行者
      const executors = this.getAgentsByRole(AgentRole.SPECIALIST);
      for (const executor of executors) {
        await this.messageBus.publish(
          planner.id,
          executor.id,
          { type: "plan", plan: planResult.output },
          MessageType.TASK_ASSIGN,
          task.id
        );
      }

      // 2. 执行阶段（多Agent并行）
      console.log("\n--- 阶段2: 并行执行 ---");
      const executionPromises = executors.map(async (executor) => {
        const execTask: AgentTask = {
          ...task,
          context: {
            ...task.context,
            plan: planResult.output,
            originalTask: task.description,
          },
        };
        const result = await executor.process(execTask);
        this.collectResult(task.id, result);
        return result;
      });

      const executionResults = await Promise.all(executionPromises);

      // 3. 协调阶段
      console.log("\n--- 阶段3: 协调反馈 ---");
      const coordinationTask: AgentTask = {
        ...task,
        context: {
          ...task.context,
          executionResults: executionResults.map(r => r.output),
          originalTask: task.description,
        },
      };
      const coordinationResult = await planner.process(coordinationTask);
      this.collectResult(task.id, coordinationResult);

      // 发送协调结果给执行者
      for (const executor of executors) {
        await this.messageBus.publish(
          planner.id,
          executor.id,
          { type: "coordination", coordination: coordinationResult.output },
          MessageType.TASK_UPDATE,
          task.id
        );
      }

      // 4. 最终执行
      console.log("\n--- 阶段4: 最终执行 ---");
      const finalPromises = executors.map(async (executor) => {
        const finalTask: AgentTask = {
          ...task,
          context: {
            ...task.context,
            coordination: coordinationResult.output,
            executionResults: executionResults.map(r => r.output),
            originalTask: task.description,
          },
        };
        const result = await executor.process(finalTask);
        this.collectResult(task.id, result);
        return result;
      });

      const finalResults = await Promise.all(finalPromises);

      // 5. 汇总阶段
      console.log("\n--- 阶段5: 结果汇总 ---");
      const summaryTask: AgentTask = {
        ...task,
        context: {
          ...task.context,
          finalResults: finalResults.map(r => r.output),
          originalTask: task.description,
        },
      };
      const summaryResult = await planner.process(summaryTask);
      this.collectResult(task.id, summaryResult);

      console.log("\n========== 任务执行完成 ==========\n");

      return {
        status: "success",
        plan: planResult.output,
        execution: executionResults.map(r => r.output),
        coordination: coordinationResult.output,
        finalOutput: finalResults.map(r => r.output),
        summary: summaryResult.output,
      };
    } catch (error) {
      console.error("任务执行失败:", error);
      return {
        status: "failed",
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 执行任务（流式输出，用于SSE）
   */
  async *executeTaskStream(
    task: AgentTask,
    onEvent?: (event: any) => void
  ): AsyncGenerator<any> {
    console.log(`\n========== 开始流式执行任务: ${task.id} ==========`);

    // 保存任务
    this.tasks.set(task.id, task);

    // 保存任务上下文
    await this.memory.addTaskContext(task.id, {
      description: task.description,
      type: task.type,
      priority: task.priority,
      createdAt: task.createdAt,
    });

    try {
      // 阶段1: 规划
      yield { type: "step_start", step: 1, name: "任务规划", message: "开始规划任务..." };
      const planners = this.getAgentsByRole(AgentRole.COORDINATOR);
      if (planners.length === 0) {
        throw new Error("没有可用的协调者Agent");
      }
      const planner = planners[0];

      // 流式生成规划
      let planContent = "";
      for await (const chunk of this.streamAgentOutput(planner, task)) {
        planContent += chunk;
        yield { type: "plan_progress", content: chunk };
      }
      const planResult = { taskId: task.id, agentId: planner.id, status: "success" as const, output: planContent };
      this.collectResult(task.id, planResult);
      yield { type: "step_complete", step: 1, name: "任务规划", message: "规划完成" };

      // 阶段2: 执行
      yield { type: "step_start", step: 2, name: "并行执行", message: "各专业智能体开始执行..." };
      const executors = this.getAgentsByRole(AgentRole.SPECIALIST);

      const executionResults = [];
      for (const executor of executors) {
        yield { type: "agent_start", agentId: executor.id, agentName: executor.name, message: `${executor.name} 开始工作` };

        let execContent = "";
        const execTask: AgentTask = {
          ...task,
          context: {
            ...task.context,
            plan: planContent,
            originalTask: task.description,
          },
        };

        for await (const chunk of this.streamAgentOutput(executor, execTask)) {
          execContent += chunk;
          yield { type: "agent_progress", agentId: executor.id, content: chunk };
        }

        const execResult = { taskId: task.id, agentId: executor.id, status: "success" as const, output: execContent };
        executionResults.push(execContent);
        this.collectResult(task.id, execResult);
        yield { type: "agent_complete", agentId: executor.id, message: `${executor.name} 完成` };
      }
      yield { type: "step_complete", step: 2, name: "并行执行", message: "所有专业智能体执行完成" };

      // 阶段3: 协调
      yield { type: "step_start", step: 3, name: "协调反馈", message: "协调者分析执行结果..." };
      let coordinationContent = "";
      const coordinationTask: AgentTask = {
        ...task,
        context: {
          ...task.context,
          executionResults: executionResults,
          originalTask: task.description,
        },
      };

      for await (const chunk of this.streamAgentOutput(planner, coordinationTask)) {
        coordinationContent += chunk;
        yield { type: "coordination_progress", content: chunk };
      }

      const coordinationResult = { taskId: task.id, agentId: planner.id, status: "success" as const, output: coordinationContent };
      this.collectResult(task.id, coordinationResult);
      yield { type: "step_complete", step: 3, name: "协调反馈", message: "协调完成" };

      // 阶段4: 最终执行
      yield { type: "step_start", step: 4, name: "最终执行", message: "根据协调结果执行..." };

      const finalResults = [];
      for (const executor of executors) {
        yield { type: "agent_start", agentId: executor.id, message: `${executor.name} 开始最终执行` };

        let finalContent = "";
        const finalTask: AgentTask = {
          ...task,
          context: {
            ...task.context,
            coordination: coordinationContent,
            executionResults: executionResults,
            originalTask: task.description,
          },
        };

        for await (const chunk of this.streamAgentOutput(executor, finalTask)) {
          finalContent += chunk;
          yield { type: "agent_progress", agentId: executor.id, content: chunk };
        }

        finalResults.push(finalContent);
        yield { type: "agent_complete", agentId: executor.id, message: `${executor.name} 最终执行完成` };
      }
      yield { type: "step_complete", step: 4, name: "最终执行", message: "最终执行完成" };

      // 阶段5: 汇总
      yield { type: "step_start", step: 5, name: "结果汇总", message: "汇总最终成果..." };
      let summaryContent = "";
      const summaryTask: AgentTask = {
        ...task,
        context: {
          ...task.context,
          finalResults: finalResults,
          originalTask: task.description,
        },
      };

      for await (const chunk of this.streamAgentOutput(planner, summaryTask)) {
        summaryContent += chunk;
        yield { type: "summary_progress", content: chunk };
      }

      const summaryResult = { taskId: task.id, agentId: planner.id, status: "success" as const, output: summaryContent };
      this.collectResult(task.id, summaryResult);
      yield { type: "step_complete", step: 5, name: "结果汇总", message: "汇总完成" };

      yield { type: "task_complete", message: "任务执行完成" };

      console.log("\n========== 流式任务执行完成 ==========\n");
    } catch (error) {
      console.error("流式任务执行失败:", error);
      yield { type: "error", message: error instanceof Error ? error.message : "未知错误" };
    }
  }

  /**
   * 流式获取Agent输出
   */
  private async *streamAgentOutput(agent: IAgent, task: AgentTask): AsyncGenerator<string> {
    try {
      for await (const chunk of agent.processStream(task)) {
        yield chunk;
      }
    } catch (error) {
      console.error(`Agent ${agent.name} stream failed:`, error);
      yield `错误: ${error instanceof Error ? error.message : "未知错误"}`;
    }
  }

  /**
   * 分配任务给特定Agent
   */
  async distributeTask(task: AgentTask): Promise<void> {
    const agents = this.getAllAgents();

    for (const agent of agents) {
      try {
        await this.messageBus.publish(
          "coordinator",
          agent.id,
          { task },
          MessageType.TASK_ASSIGN,
          task.id
        );
      } catch (error) {
        console.error(`Failed to send task to agent ${agent.name}:`, error);
      }
    }
  }

  /**
   * 收集任务结果
   */
  private collectResult(taskId: string, result: AgentResult): void {
    if (!this.results.has(taskId)) {
      this.results.set(taskId, []);
    }
    this.results.get(taskId)!.push(result);
  }

  /**
   * 获取任务的所有结果
   */
  collectResults(taskId: string): Promise<AgentResult[]> {
    return Promise.resolve(this.results.get(taskId) || []);
  }

  /**
   * 监控任务进度
   */
  async *monitorProgress(taskId: string): AsyncGenerator<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const interval = setInterval(() => {
      const results = this.results.get(taskId) || [];
      return {
        taskId,
        status: task.status,
        resultsCount: results.length,
        results,
      };
    }, 1000);

    // 这里需要实现真正的监控逻辑
    // 暂时返回空
    yield { taskId, status: task.status };
  }

  /**
   * 解决冲突
   */
  async resolveConflicts(taskId: string): Promise<void> {
    const planners = this.getAgentsByRole(AgentRole.COORDINATOR);
    if (planners.length === 0) {
      throw new Error("没有可用的协调者Agent");
    }

    const planner = planners[0];
    const conflictTask: AgentTask = {
      id: `${taskId}_conflict`,
      description: "解决任务执行中的冲突",
      type: "conflict_resolution",
      priority: "high",
      status: "processing",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      context: {
        originalTaskId: taskId,
      },
    };

    await planner.process(conflictTask);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalAgents: this.agents.size,
      totalTasks: this.tasks.size,
      agentRoles: Array.from(this.agents.values()).reduce((acc, agent) => {
        acc[agent.role] = (acc[agent.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      messageBusStats: this.messageBus.getStats(),
      memoryStats: this.memory.getStats(),
    };
  }
}
