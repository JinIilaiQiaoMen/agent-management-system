import {
  IAgent,
  AgentRole,
  AgentTask,
  AgentResult,
  MessageType,
  Tool,
} from "./types";
import { MessageBus } from "./MessageBus";
import { Memory } from "./Memory";

/**
 * Agent基类
 * 实现了基本的Agent功能：消息收发、记忆存储、工具调用等
 */
export abstract class BaseAgent implements IAgent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  llmClient: any;
  messageBus?: MessageBus;
  memory?: Memory;
  tools?: Tool[];
  customHeaders?: Record<string, string>;

  constructor(
    id: string,
    name: string,
    role: AgentRole,
    description: string,
    llmClient: any,
    customHeaders?: Record<string, string>
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.description = description;
    this.llmClient = llmClient;
    this.customHeaders = customHeaders || {};
  }

  /**
   * 绑定消息总线
   */
  bindMessageBus(messageBus: MessageBus): void {
    this.messageBus = messageBus;
  }

  /**
   * 绑定记忆模块
   */
  bindMemory(memory: Memory): void {
    this.memory = memory;
  }

  /**
   * 绑定工具
   */
  bindTools(tools: Tool[]): void {
    this.tools = tools;
  }

  /**
   * 发送消息
   */
  async sendMessage(
    toAgent: string,
    content: any,
    type: MessageType = MessageType.MESSAGE,
    taskId?: string
  ): Promise<void> {
    if (!this.messageBus) {
      throw new Error("MessageBus not bound");
    }

    await this.messageBus.publish(this.id, toAgent, content, type, taskId);

    // 保存到记忆
    if (this.memory && taskId) {
      await this.memory.addMessage(taskId, this.id, "user", JSON.stringify(content));
    }
  }

  /**
   * 接收消息
   */
  async receiveMessages(): Promise<any[]> {
    if (!this.messageBus) {
      return [];
    }

    return await this.messageBus.consume(this.id);
  }

  /**
   * 处理任务（由子类实现具体逻辑）
   */
  abstract process(task: AgentTask): Promise<AgentResult>;

  /**
   * 流式处理任务（由子类实现具体逻辑）
   */
  abstract processStream(task: AgentTask): AsyncGenerator<string>;

  /**
   * 调用LLM生成响应
   */
  protected async callLLM(
    prompt: string,
    systemPrompt?: string,
    messages?: any[]
  ): Promise<string> {
    if (!this.llmClient) {
      throw new Error("LLM client is not initialized");
    }

    try {
      const messagesToUse = messages || [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ];

      // 使用 stream 方法收集结果，确保传递 customHeaders
      const stream = this.llmClient.stream(messagesToUse, { temperature: 0.7 }, undefined, this.customHeaders);

      let result = "";
      for await (const chunk of stream) {
        if (chunk.content) {
          result += chunk.content.toString();
        }
      }

      return result;
    } catch (error) {
      console.error("LLM call failed:", error);
      throw error;
    }
  }

  /**
   * 调用LLM流式生成响应
   */
  protected async *callLLMStream(
    prompt: string,
    systemPrompt?: string,
    messages?: any[]
  ): AsyncGenerator<string> {
    if (!this.llmClient) {
      throw new Error("LLM client is not initialized");
    }

    try {
      const messagesToUse = messages || [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ];

      const stream = this.llmClient.stream(messagesToUse, { temperature: 0.7 }, undefined, this.customHeaders);

      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content.toString();
        }
      }
    } catch (error) {
      console.error("LLM stream call failed:", error);
      throw error;
    }
  }

  /**
   * 获取对话历史（从记忆中）
   */
  protected async getConversationHistory(taskId: string, limit: number = 10): Promise<any[]> {
    if (!this.memory) {
      return [];
    }

    return await this.memory.getConversationHistory(taskId, undefined, limit);
  }

  /**
   * 获取工具描述
   */
  protected getToolDescriptions(): string {
    if (!this.tools || this.tools.length === 0) {
      return "无可用工具";
    }

    return this.tools
      .map(
        (tool) =>
          `- ${tool.name}: ${tool.description}\n  参数: ${JSON.stringify(tool.parameters)}`
      )
      .join("\n");
  }

  /**
   * 创建任务结果
   */
  protected createResult(
    taskId: string,
    status: "success" | "failed" | "partial",
    output: any,
    error?: string
  ): AgentResult {
    return {
      taskId,
      agentId: this.id,
      status,
      output,
      metadata: {
        executionTime: Date.now(),
      },
      error,
    };
  }
}

/**
 * 规划者Agent
 * 负责任务拆解和执行计划制定
 */
export class PlannerAgent extends BaseAgent {
  constructor(id: string, name: string, llmClient: any) {
    super(
      id,
      name,
      AgentRole.PLANNER,
      "负责分析任务、制定执行计划、分配工作",
      llmClient
    );
  }

  async process(task: AgentTask): Promise<AgentResult> {
    try {
      // 获取对话历史
      const history = await this.getConversationHistory(task.id, 5);

      const prompt = `你是一个任务规划专家。请为以下任务制定详细的执行计划：

任务描述：${task.description}
任务类型：${task.type}

可用工具：
${this.getToolDescriptions()}

请制定一个清晰的执行计划，包括：
1. 任务分析（目标、约束、依赖）
2. 执行步骤（按顺序列出）
3. 角色分配（每个步骤由哪个角色负责）
4. 所需工具
5. 预期输出

请以JSON格式返回，格式如下：
{
  "analysis": "任务分析",
  "steps": [
    {
      "step": 1,
      "description": "步骤描述",
      "role": "角色名称",
      "tools": ["工具1", "工具2"],
      "expectedOutput": "预期输出"
    }
  ],
  "requirements": ["要求1", "要求2"]
}`;

      const response = await this.callLLM(prompt);
      const result = this.createResult(task.id, "success", response);

      // 保存到记忆
      if (this.memory) {
        await this.memory.addResult(task.id, this.id, result);
      }

      return result;
    } catch (error) {
      return this.createResult(
        task.id,
        "failed",
        null,
        error instanceof Error ? error.message : "规划失败"
      );
    }
  }

  async *processStream(task: AgentTask): AsyncGenerator<string> {
    const prompt = `你是一个任务规划专家。请为以下任务制定详细的执行计划：

任务描述：${task.description}
任务类型：${task.type}

可用工具：
${this.getToolDescriptions()}

请制定一个清晰的执行计划，包括：
1. 任务分析（目标、约束、依赖）
2. 执行步骤（按顺序列出）
3. 角色分配（每个步骤由哪个角色负责）
4. 所需工具
5. 预期输出

请以JSON格式返回，格式如下：
{
  "analysis": "任务分析",
  "steps": [
    {
      "step": 1,
      "description": "步骤描述",
      "role": "角色名称",
      "tools": ["工具1", "工具2"],
      "expectedOutput": "预期输出"
    }
  ],
  "requirements": ["要求1", "要求2"]
}`;

    const systemPrompt = `你是任务规划专家，负责分析任务、制定执行计划、分配工作。`;

    for await (const chunk of this.callLLMStream(prompt, systemPrompt)) {
      yield chunk;
    }
  }
}

/**
 * 执行者Agent
 * 负责具体任务的执行
 */
export class ExecutorAgent extends BaseAgent {
  constructor(id: string, name: string, role: AgentRole, llmClient: any, customHeaders?: Record<string, string>) {
    super(
      id,
      name,
      role,
      `负责执行${role}相关的具体任务`,
      llmClient,
      customHeaders
    );
  }

  async process(task: AgentTask): Promise<AgentResult> {
    try {
      // 获取对话历史
      const history = await this.getConversationHistory(task.id, 10);

      const prompt = `你是一个${this.role}，负责执行具体任务。

任务描述：${task.description}
任务上下文：${JSON.stringify(task.context || {})}

之前的对话记录：
${history.map(h => `${h.agentId}: ${h.content}`).join('\n\n')}

可用工具：
${this.getToolDescriptions()}

请根据任务要求执行你的工作，并输出详细的执行结果。
如果需要使用工具，请在回复中说明工具名称和参数。

请以JSON格式返回，格式如下：
{
  "output": "执行结果",
  "toolsUsed": ["工具1"],
  "nextSteps": ["下一步1"],
  "metadata": {
    "key": "value"
  }
}`;

      const response = await this.callLLM(prompt);
      const result = this.createResult(task.id, "success", response);

      // 保存到记忆
      if (this.memory) {
        await this.memory.addResult(task.id, this.id, result);
      }

      return result;
    } catch (error) {
      return this.createResult(
        task.id,
        "failed",
        null,
        error instanceof Error ? error.message : "执行失败"
      );
    }
  }

  async *processStream(task: AgentTask): AsyncGenerator<string> {
    const prompt = `你是一个${this.role}，负责执行具体任务。

任务描述：${task.description}
任务上下文：${JSON.stringify(task.context || {})}

之前的对话记录：
${(await this.getConversationHistory(task.id, 10)).map(h => `${h.agentId}: ${h.content}`).join('\n\n')}

可用工具：
${this.getToolDescriptions()}

请根据任务要求执行你的工作，并输出详细的执行结果。
如果需要使用工具，请在回复中说明工具名称和参数。

请以JSON格式返回，格式如下：
{
  "output": "执行结果",
  "toolsUsed": ["工具1"],
  "nextSteps": ["下一步1"],
  "metadata": {
    "key": "value"
  }
}`;

    const systemPrompt = `你是${this.role}，负责执行${this.role}相关的具体任务。`;

    for await (const chunk of this.callLLMStream(prompt, systemPrompt)) {
      yield chunk;
    }
  }
}

/**
 * 审核者Agent
 * 负责审核工作结果并给出反馈
 */
export class ReviewerAgent extends BaseAgent {
  constructor(id: string, name: string, llmClient: any) {
    super(
      id,
      name,
      AgentRole.REVIEWER,
      "负责审核工作成果、发现问题、提出改进建议",
      llmClient
    );
  }

  async process(task: AgentTask): Promise<AgentResult> {
    try {
      // 获取对话历史
      const history = await this.getConversationHistory(task.id, 15);

      const prompt = `你是一个专业的内容审核专家。请审核以下工作成果：

任务描述：${task.description}
执行结果：${JSON.stringify(task.context?.executionResult || {})}

之前的对话记录：
${history.map(h => `${h.agentId}: ${h.content}`).join('\n\n')}

请从以下维度进行审核：
1. 完整性：是否满足任务要求
2. 准确性：内容是否准确无误
3. 质量：工作质量是否达到标准
4. 问题：是否存在明显问题或错误
5. 建议：提出改进建议

请以JSON格式返回，格式如下：
{
  "approved": true/false,
  "completeness": "完整性评价",
  "accuracy": "准确性评价",
  "quality": "质量评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"],
  "score": 85
}`;

      const response = await this.callLLM(prompt);
      const result = this.createResult(task.id, "success", response);

      // 保存到记忆
      if (this.memory) {
        await this.memory.addResult(task.id, this.id, result);
      }

      return result;
    } catch (error) {
      return this.createResult(
        task.id,
        "failed",
        null,
        error instanceof Error ? error.message : "审核失败"
      );
    }
  }

  async *processStream(task: AgentTask): AsyncGenerator<string> {
    const prompt = `你是一个专业的内容审核专家。请审核以下工作成果：

任务描述：${task.description}
执行结果：${JSON.stringify(task.context?.executionResult || {})}

之前的对话记录：
${(await this.getConversationHistory(task.id, 15)).map(h => `${h.agentId}: ${h.content}`).join('\n\n')}

请从以下维度进行审核：
1. 完整性：是否满足任务要求
2. 准确性：内容是否准确无误
3. 质量：工作质量是否达到标准
4. 问题：是否存在明显问题或错误
5. 建议：提出改进建议

请以JSON格式返回，格式如下：
{
  "approved": true/false,
  "completeness": "完整性评价",
  "accuracy": "准确性评价",
  "quality": "质量评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"],
  "score": 85
}`;

    const systemPrompt = `你是专业的内容审核专家，负责审核工作成果、发现问题、提出改进建议。`;

    for await (const chunk of this.callLLMStream(prompt, systemPrompt)) {
      yield chunk;
    }
  }
}

/**
 * 协调者Agent
 * 负责协调多个Agent之间的工作
 */
export class CoordinatorAgent extends BaseAgent {
  constructor(id: string, name: string, llmClient: any, customHeaders?: Record<string, string>) {
    super(
      id,
      name,
      AgentRole.COORDINATOR,
      "负责协调各专业Agent的工作、解决冲突、汇总成果",
      llmClient,
      customHeaders
    );
  }

  async process(task: AgentTask): Promise<AgentResult> {
    try {
      // 获取对话历史
      const history = await this.getConversationHistory(task.id, 20);

      const prompt = `你是一个项目协调负责人。请协调各专业Agent的工作。

任务描述：${task.description}
当前状态：${JSON.stringify(task.context || {})}

之前的对话记录：
${history.map(h => `${h.agentId}: ${h.content}`).join('\n\n')}

请进行协调工作：
1. 总结各Agent的工作进展
2. 识别可能的问题或冲突
3. 提出解决方案或调整建议
4. 确认最终的协作方案
5. 下达明确的执行指令

请以JSON格式返回，格式如下：
{
  "summary": "工作进展总结",
  "conflicts": ["冲突1", "冲突2"],
  "solutions": ["方案1", "方案2"],
  "finalPlan": "最终协作方案",
  "instructions": ["指令1", "指令2"],
  "nextActions": ["下一步1"]
}`;

      const response = await this.callLLM(prompt);
      const result = this.createResult(task.id, "success", response);

      // 保存到记忆
      if (this.memory) {
        await this.memory.addResult(task.id, this.id, result);
      }

      return result;
    } catch (error) {
      return this.createResult(
        task.id,
        "failed",
        null,
        error instanceof Error ? error.message : "协调失败"
      );
    }
  }

  async *processStream(task: AgentTask): AsyncGenerator<string> {
    const prompt = `你是一个项目协调负责人。请协调各专业Agent的工作。

任务描述：${task.description}
当前状态：${JSON.stringify(task.context || {})}

之前的对话记录：
${(await this.getConversationHistory(task.id, 20)).map(h => `${h.agentId}: ${h.content}`).join('\n\n')}

请进行协调工作：
1. 总结各Agent的工作进展
2. 识别可能的问题或冲突
3. 提出解决方案或调整建议
4. 确认最终的协作方案
5. 下达明确的执行指令

请以JSON格式返回，格式如下：
{
  "summary": "工作进展总结",
  "conflicts": ["冲突1", "冲突2"],
  "solutions": ["方案1", "方案2"],
  "finalPlan": "最终协作方案",
  "instructions": ["指令1", "指令2"],
  "nextActions": ["下一步1"]
}`;

    const systemPrompt = `你是项目协调负责人，负责协调各专业Agent的工作、解决冲突、汇总成果。`;

    for await (const chunk of this.callLLMStream(prompt, systemPrompt)) {
      yield chunk;
    }
  }
}
