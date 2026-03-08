/**
 * ZAEP 尚书省 - 任务调度中心
 * 负责接收诏令、任务分配、流程编排、结果汇总
 */

import { v4 as uuidv4 } from 'uuid';
import { MinistryIdentifier, intelligentRoute } from './ministry-identifier';
import { AgentAllocator, allocateAgent, createTask } from './agent-allocator';
import { TaskExecutor, executeTask } from './task-executor';
import {
  Edict,
  Task,
  ExecutionResult,
  EdictPriority,
  Ministry,
  Intent,
  IntentParams,
} from '../types/san-sheng.types';

/**
 * 任务队列项
 */
interface TaskQueueItem {
  task: Task;
  priority: number;
  queuedAt: number;
}

/**
 * 调度中心
 */
export class TaskDispatcher {
  private ministryIdentifier: MinistryIdentifier;
  private agentAllocator: AgentAllocator;
  private taskExecutor: TaskExecutor;

  // 任务队列
  private taskQueue: TaskQueueItem[] = [];

  // 正在执行的任务
  private runningTasks: Map<string, Task> = new Map();

  constructor() {
    this.ministryIdentifier = new MinistryIdentifier();
    this.agentAllocator = new AgentAllocator();
    this.taskExecutor = new TaskExecutor();
  }

  /**
   * 执行诏令
   * @param edict - 诏令
   */
  async executeEdict(edict: Edict): Promise<ExecutionResult> {
    console.log(`[尚书省] 开始执行诏令: ${edict.id}`);
    const startTime = Date.now();

    try {
      // 1. 识别六部
      const ministry = this.ministryIdentifier.intelligentRoute(
        edict.intent,
        edict.parameters,
        edict.parameters.rawText || edict.intent.name
      );

      console.log(`[尚书省] 识别六部: ${ministry}`);

      // 2. 创建任务
      const task = this.agentAllocator.createTask(
        edict.id,
        this.getTaskName(edict.intent),
        this.getTaskDescription(edict.intent),
        edict.parameters,
        edict.priority
      );

      // 3. 分配Agent
      const agent = await this.agentAllocator.allocateAgent(
        task,
        ministry,
        this.getCapabilityFromIntent(edict.intent.id)
      );

      console.log(`[尚书省] 分配Agent: ${agent.name}`);

      // 4. 添加到执行队列
      this.runningTasks.set(task.id, task);

      // 5. 执行任务
      const taskResult = await this.taskExecutor.executeTask(task, agent, ministry);

      // 6. 记录Agent性能
      this.agentAllocator.recordAgentPerformance(
        agent.id,
        taskResult.executionTime,
        taskResult.success
      );

      // 7. 释放Agent
      this.agentAllocator.releaseAgent(agent.id);

      // 8. 从执行队列移除
      this.runningTasks.delete(task.id);

      console.log(`[尚书省] 诏令执行完成: ${edict.id}, 耗时=${Date.now() - startTime}ms`);

      return taskResult;

    } catch (error) {
      console.error(`[尚书省] 诏令执行失败: ${edict.id}`, error);

      return {
        success: false,
        taskId: '',
        agentId: '',
        data: null,
        logs: [],
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 添加任务到队列
   * @param task - 任务
   */
  async enqueueTask(task: Task): Promise<void> {
    const priority = this.calculatePriority(task);

    this.taskQueue.push({
      task,
      priority,
      queuedAt: Date.now(),
    });

    // 按优先级排序
    this.taskQueue.sort((a, b) => {
      // 先按优先级排序（数字越小优先级越高）
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // 优先级相同，按排队时间排序
      return a.queuedAt - b.queuedAt;
    });

    console.log(`[尚书省] 任务加入队列: ${task.id}, 优先级=${priority}, 队列长度=${this.taskQueue.length}`);
  }

  /**
   * 从队列获取任务
   */
  async dequeueTask(): Promise<TaskQueueItem | undefined> {
    return this.taskQueue.shift();
  }

  /**
   * 计算任务优先级
   * @param task - 任务
   */
  private calculatePriority(task: Task): number {
    const priorityMap: Record<EdictPriority, number> = {
      'critical': 1,
      'urgent': 2,
      'normal': 3,
    };

    return priorityMap[task.priority] || 3;
  }

  /**
   * 获取任务名称
   * @param intent - 意图
   */
  private getTaskName(intent: Intent): string {
    const taskNames: Record<string, string> = {
      'customer_analysis': '客户分析任务',
      'finance_analysis': '财务分析任务',
      'email_generation': '邮件生成任务',
      'content_generation': '内容生成任务',
      'hr_management': 'HR管理任务',
      'recruitment': '招聘任务',
      'risk_assessment': '风险评估任务',
      'security_audit': '安全审计任务',
      'compliance_check': '合规检查任务',
      'data_crawl': '数据采集任务',
      'system_maintenance': '系统维护任务',
    };

    return taskNames[intent.id] || '未知任务';
  }

  /**
   * 获取任务描述
   * @param intent - 意图
   */
  private getTaskDescription(intent: Intent): string {
    return intent.description || `执行${intent.name}操作`;
  }

  /**
   * 从意图获取能力
   * @param intentId - 意图ID
   */
  private getCapabilityFromIntent(intentId: string): string | undefined {
    const capabilityMap: Record<string, string> = {
      'customer_analysis': 'customer_analysis',
      'finance_analysis': 'finance_analysis',
      'email_generation': 'email_generation',
      'content_generation': 'content_generation',
      'hr_management': 'hr_management',
      'recruitment': 'recruitment',
      'risk_assessment': 'risk_assessment',
      'security_audit': 'security_audit',
      'compliance_check': 'compliance_check',
      'data_crawl': 'data_crawl',
      'system_maintenance': 'system_maintenance',
    };

    return capabilityMap[intentId];
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): {
    queueLength: number;
    runningTasks: number;
  } {
    return {
      queueLength: this.taskQueue.length,
      runningTasks: this.runningTasks.size,
    };
  }

  /**
   * 批量执行任务
   * @param tasks - 任务列表
   */
  async executeBatchTasks(tasks: Task[]): Promise<ExecutionResult[]> {
    console.log(`[尚书省] 批量执行${tasks.length}个任务`);

    const results: ExecutionResult[] = [];

    for (const task of tasks) {
      // 添加到队列
      await this.enqueueTask(task);
    }

    // 执行所有任务
    while (this.taskQueue.length > 0) {
      const queueItem = await this.dequeueTask();
      if (queueItem) {
        const result = await this.executeTask(queueItem.task);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 执行单个任务
   * @param task - 任务
   */
  private async executeTask(task: Task): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // 获取Agent
      const agent = this.agentAllocator.getAgent(task.assignedAgentId);
      if (!agent) {
        throw new Error(`Agent ${task.assignedAgentId} 不存在`);
      }

      // 获取六部
      const ministry = agent.ministry;

      // 执行任务
      const result = await this.taskExecutor.executeTask(task, agent, ministry);

      // 记录性能
      this.agentAllocator.recordAgentPerformance(
        agent.id,
        result.executionTime,
        result.success
      );

      return result;

    } catch (error) {
      return {
        success: false,
        taskId: task.id,
        agentId: task.assignedAgentId,
        data: null,
        logs: [],
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 取消任务
   * @param taskId - 任务ID
   */
  async cancelTask(taskId: string): Promise<boolean> {
    // 检查是否在队列中
    const queueIndex = this.taskQueue.findIndex(item => item.task.id === taskId);
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1);
      console.log(`[尚书省] 取消队列任务: ${taskId}`);
      return true;
    }

    // 检查是否正在执行
    if (this.runningTasks.has(taskId)) {
      const task = this.runningTasks.get(taskId)!;
      task.status = 'cancelled';
      this.runningTasks.delete(taskId);
      console.log(`[尚书省] 取消执行任务: ${taskId}`);
      return true;
    }

    return false;
  }

  /**
   * 获取任务状态
   * @param taskId - 任务ID
   */
  getTaskStatus(taskId: string): {
    status: 'queued' | 'running' | 'completed' | 'cancelled' | 'not_found';
    task?: Task;
  } {
    // 检查队列
    const queueItem = this.taskQueue.find(item => item.task.id === taskId);
    if (queueItem) {
      return {
        status: 'queued',
        task: queueItem.task,
      };
    }

    // 检查正在执行的任务
    if (this.runningTasks.has(taskId)) {
      return {
        status: 'running',
        task: this.runningTasks.get(taskId),
      };
    }

    return {
      status: 'not_found',
    };
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): {
    queued: Task[];
    running: Task[];
  } {
    return {
      queued: this.taskQueue.map(item => item.task),
      running: Array.from(this.runningTasks.values()),
    };
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    const count = this.taskQueue.length;
    this.taskQueue = [];
    console.log(`[尚书省] 清空队列: ${count}个任务`);
  }

  /**
   * 获取调度器统计信息
   */
  getStatistics(): {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    averageExecutionTime: number;
  } {
    // 这里应该从数据库或日志中统计
    // 暂时返回模拟数据
    return {
      totalProcessed: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
    };
  }
}

/**
 * 单例实例
 */
export const taskDispatcher = new TaskDispatcher();

/**
 * 执行诏令的便捷函数
 */
export async function executeEdict(edict: Edict): Promise<ExecutionResult> {
  return taskDispatcher.executeEdict(edict);
}
