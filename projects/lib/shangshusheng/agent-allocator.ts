/**
 * ZAEP 尚书省 - Agent分配逻辑
 * 负责将任务分配给合适的Agent
 */

import { v4 as uuidv4 } from 'uuid';
import { Agent, Task, TaskStatus, EdictPriority } from '../types/san-sheng.types';
import { Ministry } from '../types/san-sheng.types';

/**
 * Agent状态
 */
interface AgentStatus extends Agent {
  currentLoad: number; // 当前负载
  maxCapacity: number; // 最大容量
  lastActiveTime: number;
  performanceScore: number; // 性能评分 0-100
}

/**
 * Agent分配器
 */
export class AgentAllocator {
  // Agent注册表（模拟）
  private agents: Map<string, AgentStatus> = new Map();

  constructor() {
    this.initializeAgents();
  }

  /**
   * 初始化Agent
   */
  private initializeAgents(): void {
    // 吏部Agents
    this.registerAgent({
      id: 'agent-hr-manager',
      name: 'HR管理Agent',
      ministry: Ministry.LIBU,
      capabilities: ['hr_management', 'performance_review', 'salary_calculation'],
      status: 'active',
      description: '负责HR管理、绩效考核、薪资计算',
      version: '1.0.0',
    });

    this.registerAgent({
      id: 'agent-recruitment',
      name: '招聘Agent',
      ministry: Ministry.LIBU,
      capabilities: ['recruitment', 'resume_parsing', 'interview_scheduling'],
      status: 'active',
      description: '负责招聘、简历解析、面试安排',
      version: '1.0.0',
    });

    // 户部Agents
    this.registerAgent({
      id: 'agent-customer-analysis',
      name: '客户分析Agent',
      ministry: Ministry.HUBU,
      capabilities: ['customer_analysis', 'credit_assessment', 'customer_profile'],
      status: 'active',
      description: '负责客户分析、信用评估、客户画像',
      version: '1.0.0',
    });

    this.registerAgent({
      id: 'agent-finance-analysis',
      name: '财务分析Agent',
      ministry: Ministry.HUBU,
      capabilities: ['finance_analysis', 'cost_analysis', 'profit_analysis'],
      status: 'active',
      description: '负责财务分析、成本分析、利润分析',
      version: '1.0.0',
    });

    // 礼部Agents
    this.registerAgent({
      id: 'agent-email-generator',
      name: '邮件生成Agent',
      ministry: Ministry.LIBU_LI,
      capabilities: ['email_generation', 'bilingual_translation', 'template_selection'],
      status: 'active',
      description: '负责邮件生成、双语翻译、模板选择',
      version: '1.0.0',
    });

    this.registerAgent({
      id: 'agent-content-generator',
      name: '内容生成Agent',
      ministry: Ministry.LIBU_LI,
      capabilities: ['content_generation', 'marketing_copy', 'product_description'],
      status: 'active',
      description: '负责内容生成、营销文案、产品描述',
      version: '1.0.0',
    });

    // 兵部Agents
    this.registerAgent({
      id: 'agent-risk-assessment',
      name: '风险评估Agent',
      ministry: Ministry.BINGBU,
      capabilities: ['risk_assessment', 'risk_identification', 'risk_control'],
      status: 'active',
      description: '负责风险评估、风险识别、风险控制',
      version: '1.0.0',
    });

    this.registerAgent({
      id: 'agent-security-audit',
      name: '安全审计Agent',
      ministry: Ministry.BINGBU,
      capabilities: ['security_audit', 'permission_check', 'security_report'],
      status: 'active',
      description: '负责安全审计、权限检查、安全报告',
      version: '1.0.0',
    });

    // 刑部Agents
    this.registerAgent({
      id: 'agent-compliance-check',
      name: '合规检查Agent',
      ministry: Ministry.XINGBU,
      capabilities: ['compliance_check', 'content_review', 'legal_consultation'],
      status: 'active',
      description: '负责合规检查、内容审核、法律咨询',
      version: '1.0.0',
    });

    // 工部Agents
    this.registerAgent({
      id: 'agent-data-crawler',
      name: '数据采集Agent',
      ministry: Ministry.GONGBU,
      capabilities: ['data_crawl', 'content_extraction', 'batch_crawl'],
      status: 'active',
      description: '负责数据采集、内容提取、批量采集',
      version: '1.0.0',
    });

    this.registerAgent({
      id: 'agent-system-maintenance',
      name: '系统维护Agent',
      ministry: Ministry.GONGBU,
      capabilities: ['system_maintenance', 'monitoring', 'log_analysis'],
      status: 'active',
      description: '负责系统维护、监控、日志分析',
      version: '1.0.0',
    });

    console.log(`[尚书省] 初始化${this.agents.size}个Agent`);
  }

  /**
   * 注册Agent
   * @param agent - Agent信息
   */
  registerAgent(agent: Agent): void {
    const agentStatus: AgentStatus = {
      ...agent,
      currentLoad: 0,
      maxCapacity: 10,
      lastActiveTime: Date.now(),
      performanceScore: 90,
    };

    this.agents.set(agent.id, agentStatus);
    console.log(`[尚书省] 注册Agent: ${agent.name} (${agent.id})`);
  }

  /**
   * 分配Agent
   * @param task - 任务
   * @param ministry - 六部
   * @param capability - 需要的能力
   */
  async allocateAgent(
    task: Task,
    ministry: Ministry,
    capability?: string
  ): Promise<Agent> {
    console.log(`[尚书省] 分配Agent: 六部=${ministry}, 能力=${capability}`);

    // 1. 筛选符合六部的Agent
    const candidateAgents = this.getAgentsByMinistry(ministry);

    if (candidateAgents.length === 0) {
      throw new Error(`未找到${ministry}的Agent`);
    }

    // 2. 如果指定了能力，进一步筛选
    let filteredAgents = candidateAgents;
    if (capability) {
      filteredAgents = candidateAgents.filter(agent =>
        agent.capabilities.includes(capability)
      );

      if (filteredAgents.length === 0) {
        console.log(`[尚书省] 未找到支持能力${capability}的Agent，使用六部${ministry}的Agent`);
        filteredAgents = candidateAgents;
      }
    }

    // 3. 筛选活跃的Agent
    const activeAgents = filteredAgents.filter(agent => agent.status === 'active');

    if (activeAgents.length === 0) {
      throw new Error(`没有可用的${ministry}Agent`);
    }

    // 4. 根据负载选择负载最低的Agent
    let selectedAgent = activeAgents[0];
    let minLoad = 100;

    for (const agent of activeAgents) {
      if (agent.currentLoad < minLoad) {
        minLoad = agent.currentLoad;
        selectedAgent = agent;
      }
    }

    // 5. 更新Agent负载
    this.updateAgentLoad(selectedAgent.id, 1);

    console.log(`[尚书省] 分配Agent: ${selectedAgent.name} (${selectedAgent.id}), 负载=${minLoad}%`);

    // 6. 更新任务的Agent ID
    task.assignedAgentId = selectedAgent.id;
    task.assignedAt = Date.now();
    task.status = 'assigned';

    return selectedAgent;
  }

  /**
   * 创建任务
   * @param edictId - 诏令ID
   * @param name - 任务名称
   * @param description - 任务描述
   * @param parameters - 参数
   * @param priority - 优先级
   */
  createTask(
    edictId: string,
    name: string,
    description: string,
    parameters: any,
    priority: EdictPriority
  ): Task {
    const task: Task = {
      id: `task_${uuidv4()}`,
      edictId,
      name,
      description,
      assignedAgentId: '',
      assignedAt: 0,
      status: 'pending',
      priority,
      parameters,
      logs: [],
    };

    console.log(`[尚书省] 创建任务: ${task.id}`);

    return task;
  }

  /**
   * 释放Agent
   * @param agentId - Agent ID
   */
  releaseAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.updateAgentLoad(agentId, -1);
      console.log(`[尚书省] 释放Agent: ${agent.name} (${agentId})`);
    }
  }

  /**
   * 更新Agent负载
   * @param agentId - Agent ID
   * @param delta - 负载变化量
   */
  private updateAgentLoad(agentId: string, delta: number): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentLoad = Math.max(0, Math.min(agent.maxCapacity, agent.currentLoad + delta));
      agent.lastActiveTime = Date.now();
    }
  }

  /**
   * 根据六部获取Agent列表
   * @param ministry - 六部
   */
  getAgentsByMinistry(ministry: Ministry): AgentStatus[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.ministry === ministry
    );
  }

  /**
   * 根据能力获取Agent列表
   * @param capability - 能力
   */
  getAgentsByCapability(capability: string): AgentStatus[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * 获取Agent
   * @param agentId - Agent ID
   */
  getAgent(agentId: string): AgentStatus | undefined {
    return this.agents.get(agentId);
  }

  /**
   * 获取所有Agent
   */
  getAllAgents(): AgentStatus[] {
    return Array.from(this.agents.values());
  }

  /**
   * 获取活跃Agent列表
   */
  getActiveAgents(): AgentStatus[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.status === 'active'
    );
  }

  /**
   * 获取Agent负载
   * @param agentId - Agent ID
   */
  getAgentLoad(agentId: string): {
    current: number;
    max: number;
    percentage: number;
  } {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} 不存在`);
    }

    return {
      current: agent.currentLoad,
      max: agent.maxCapacity,
      percentage: Math.round((agent.currentLoad / agent.maxCapacity) * 100),
    };
  }

  /**
   * 获取六部负载
   * @param ministry - 六部
   */
  getMinistryLoad(ministry: Ministry): {
    totalLoad: number;
    maxLoad: number;
    percentage: number;
    agentCount: number;
  } {
    const agents = this.getAgentsByMinistry(ministry);

    const totalLoad = agents.reduce((sum, agent) => sum + agent.currentLoad, 0);
    const maxLoad = agents.reduce((sum, agent) => sum + agent.maxCapacity, 0);

    return {
      totalLoad,
      maxLoad,
      percentage: maxLoad > 0 ? Math.round((totalLoad / maxLoad) * 100) : 0,
      agentCount: agents.length,
    };
  }

  /**
   * 更新Agent状态
   * @param agentId - Agent ID
   * @param status - 状态
   */
  updateAgentStatus(agentId: string, status: 'active' | 'inactive' | 'busy'): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      console.log(`[尚书省] 更新Agent状态: ${agent.name} -> ${status}`);
    }
  }

  /**
   * 记录Agent性能
   * @param agentId - Agent ID
   * @param executionTime - 执行时间
   * @param success - 是否成功
   */
  recordAgentPerformance(
    agentId: string,
    executionTime: number,
    success: boolean
  ): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      // 简单的性能评分算法
      const score = success ? 90 : 30;
      const newScore = (agent.performanceScore * 0.9) + (score * 0.1);
      agent.performanceScore = Math.round(newScore);

      console.log(`[尚书省] 记录Agent性能: ${agent.name}, 执行时间=${executionTime}ms, 成功=${success}, 评分=${agent.performanceScore}`);
    }
  }

  /**
   * 获取最佳Agent
   * @param ministry - 六部
   * @param capability - 能力
   */
  getBestAgent(ministry: Ministry, capability?: string): AgentStatus | undefined {
    const candidates = this.getAgentsByMinistry(ministry);

    if (candidates.length === 0) {
      return undefined;
    }

    let filteredCandidates = candidates;
    if (capability) {
      filteredCandidates = candidates.filter(agent =>
        agent.capabilities.includes(capability)
      );
    }

    if (filteredCandidates.length === 0) {
      return candidates[0];
    }

    // 选择负载最低且性能评分最高的Agent
    let bestAgent = filteredCandidates[0];
    let bestScore = this.calculateAgentScore(bestAgent);

    for (const agent of filteredCandidates) {
      const score = this.calculateAgentScore(agent);
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  /**
   * 计算Agent评分
   * @param agent - Agent
   */
  private calculateAgentScore(agent: AgentStatus): number {
    const loadScore = (1 - agent.currentLoad / agent.maxCapacity) * 50; // 负载评分 0-50
    const performanceScore = agent.performanceScore / 2; // 性能评分 0-50
    return loadScore + performanceScore;
  }
}

/**
 * 单例实例
 */
export const agentAllocator = new AgentAllocator();

/**
 * 分配Agent的便捷函数
 */
export async function allocateAgent(
  task: Task,
  ministry: Ministry,
  capability?: string
): Promise<Agent> {
  return agentAllocator.allocateAgent(task, ministry, capability);
}

export function createTask(
  edictId: string,
  name: string,
  description: string,
  parameters: any,
  priority: EdictPriority
): Task {
  return agentAllocator.createTask(edictId, name, description, parameters, priority);
}
