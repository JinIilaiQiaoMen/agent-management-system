import {
  Memory as IMemory,
  MemoryEntry,
} from "./types";

/**
 * 记忆模块实现
 * 用于存储任务上下文、历史交互、Agent对话等
 */
export class Memory implements IMemory {
  private entries: Map<string, MemoryEntry[]> = new Map();
  private globalEntries: MemoryEntry[] = [];
  private maxGlobalSize = 5000;
  private maxTaskSize = 1000;

  constructor() {}

  /**
   * 存储记忆条目
   */
  async store(entry: MemoryEntry): Promise<void> {
    const memoryEntry: MemoryEntry = {
      ...entry,
      id: entry.id || `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: entry.timestamp || Date.now(),
    };

    // 存储到全局记忆
    this.globalEntries.push(memoryEntry);
    if (this.globalEntries.length > this.maxGlobalSize) {
      this.globalEntries.shift();
    }

    // 如果有关联任务，存储到任务记忆
    if (entry.taskId) {
      if (!this.entries.has(entry.taskId)) {
        this.entries.set(entry.taskId, []);
      }
      this.entries.get(entry.taskId)!.push(memoryEntry);
      if (this.entries.get(entry.taskId)!.length > this.maxTaskSize) {
        this.entries.get(entry.taskId)!.shift();
      }
    }
  }

  /**
   * 检索特定任务的所有记忆
   */
  async retrieve(taskId: string): Promise<MemoryEntry[]> {
    return this.entries.get(taskId) || [];
  }

  /**
   * 检索特定Agent的所有记忆
   */
  async retrieveByAgent(agentId: string): Promise<MemoryEntry[]> {
    return this.globalEntries.filter(entry => entry.agentId === agentId);
  }

  /**
   * 检索特定类型的记忆
   */
  async retrieveByType(type: string): Promise<MemoryEntry[]> {
    return this.globalEntries.filter(entry => entry.type === type);
  }

  /**
   * 搜索记忆（简单的关键词匹配）
   */
  async search(query: string): Promise<MemoryEntry[]> {
    const lowerQuery = query.toLowerCase();
    return this.globalEntries.filter(entry => {
      const contentStr = JSON.stringify(entry.content).toLowerCase();
      return contentStr.includes(lowerQuery);
    });
  }

  /**
   * 获取最近的对话历史
   */
  async getRecentMessages(taskId: string, limit: number = 10): Promise<MemoryEntry[]> {
    const taskEntries = this.entries.get(taskId) || [];
    return taskEntries
      .filter(entry => entry.type === "message")
      .slice(-limit);
  }

  /**
   * 获取任务上下文
   */
  async getTaskContext(taskId: string): Promise<any> {
    const taskEntries = this.entries.get(taskId) || [];
    const contextEntries = taskEntries.filter(entry => entry.type === "context");

    return {
      taskId,
      context: contextEntries.map(entry => entry.content),
      messages: await this.getRecentMessages(taskId),
      results: taskEntries.filter(entry => entry.type === "result"),
    };
  }

  /**
   * 获取Agent对话历史
   */
  async getConversationHistory(
    taskId: string,
    agentId?: string,
    limit?: number
  ): Promise<any[]> {
    let entries = this.entries.get(taskId) || [];
    entries = entries.filter(entry => entry.type === "message");

    if (agentId) {
      entries = entries.filter(entry => entry.agentId === agentId);
    }

    if (limit) {
      entries = entries.slice(-limit);
    }

    return entries.map(entry => ({
      role: entry.content.role || "assistant",
      content: entry.content.content || entry.content,
      agentId: entry.agentId,
      timestamp: entry.timestamp,
    }));
  }

  /**
   * 添加任务上下文
   */
  async addTaskContext(taskId: string, context: any): Promise<void> {
    await this.store({
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "context",
      content: context,
      taskId,
      timestamp: Date.now(),
    });
  }

  /**
   * 添加对话消息
   */
  async addMessage(
    taskId: string,
    agentId: string,
    role: string,
    content: string
  ): Promise<void> {
    await this.store({
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "message",
      content: { role, content },
      taskId,
      agentId,
      timestamp: Date.now(),
    });
  }

  /**
   * 添加任务结果
   */
  async addResult(taskId: string, agentId: string, result: any): Promise<void> {
    await this.store({
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "result",
      content: result,
      taskId,
      agentId,
      timestamp: Date.now(),
    });
  }

  /**
   * 清空所有记忆
   */
  clear(): void {
    this.entries.clear();
    this.globalEntries = [];
  }

  /**
   * 清空特定任务的记忆
   */
  clearTask(taskId: string): void {
    this.entries.delete(taskId);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalEntries: this.globalEntries.length,
      taskCount: this.entries.size,
      tasks: Array.from(this.entries.entries()).map(([taskId, entries]) => ({
        taskId,
        entryCount: entries.length,
      })),
    };
  }

  /**
   * 导出任务记忆（用于调试或持久化）
   */
  exportTaskMemory(taskId: string): MemoryEntry[] {
    return this.entries.get(taskId) || [];
  }

  /**
   * 导入任务记忆
   */
  importTaskMemory(taskId: string, entries: MemoryEntry[]): void {
    this.entries.set(taskId, entries);
    // 同时添加到全局记忆
    for (const entry of entries) {
      this.globalEntries.push(entry);
    }
  }
}

// 创建全局Memory实例
let globalMemory: Memory | null = null;

export function getMemory(): Memory {
  if (!globalMemory) {
    globalMemory = new Memory();
  }
  return globalMemory;
}

export function resetMemory(): void {
  globalMemory = null;
}
