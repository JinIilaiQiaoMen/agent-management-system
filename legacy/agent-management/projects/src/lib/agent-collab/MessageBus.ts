import {
  AgentMessage,
  MessageBus as IMessageBus,
  MessageType,
} from "./types";

/**
 * 消息总线实现
 * 使用内存队列实现Agent之间的异步消息传递
 */
export class MessageBus implements IMessageBus {
  private queues: Map<string, AgentMessage[]> = new Map();
  private subscribers: Map<string, Set<AsyncGenerator<AgentMessage>>> = new Map();
  private messageHistory: AgentMessage[] = [];
  private maxHistorySize = 1000;

  constructor() {
    // 初始化时创建必要的队列
  }

  /**
   * 发布消息到目标Agent的队列
   */
  async publish(
    from: string,
    to: string,
    content: any,
    type: MessageType = MessageType.MESSAGE,
    taskId?: string
  ): Promise<void> {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      content,
      type,
      timestamp: Date.now(),
      taskId,
    };

    // 添加到目标Agent的队列
    if (!this.queues.has(to)) {
      this.queues.set(to, []);
    }
    this.queues.get(to)!.push(message);

    // 添加到历史记录
    this.addToHistory(message);

    // 通知订阅者
    await this.notifySubscribers(to, message);
  }

  /**
   * 订阅Agent的消息（返回异步生成器）
   */
  async *subscribe(agentId: string): AsyncGenerator<AgentMessage> {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, new Set());
    }

    const subscriber: any = {
      [Symbol.asyncIterator]() {
        return this;
      },
      next: () => this.getNextMessage(agentId),
    };

    this.subscribers.get(agentId)!.add(subscriber);

    try {
      while (true) {
        const message = await this.getNextMessage(agentId);
        yield message;
      }
    } finally {
      // 清理订阅者
      this.subscribers.get(agentId)?.delete(subscriber);
    }
  }

  /**
   * 获取下一条消息（阻塞等待）
   */
  private async getNextMessage(agentId: string): Promise<AgentMessage> {
    const queue = this.queues.get(agentId);
    if (queue && queue.length > 0) {
      return queue.shift()!;
    }

    // 如果队列为空，等待新消息
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const queue = this.queues.get(agentId);
        if (queue && queue.length > 0) {
          clearInterval(checkInterval);
          resolve(queue.shift()!);
        }
      }, 100);
    });
  }

  /**
   * 消费消息（非阻塞，获取当前队列所有消息）
   */
  async consume(agentId: string): Promise<AgentMessage[]> {
    const queue = this.queues.get(agentId) || [];
    const messages = [...queue];
    this.queues.set(agentId, []);
    return messages;
  }

  /**
   * 获取队列大小
   */
  getQueueSize(agentId: string): number {
    return this.queues.get(agentId)?.length || 0;
  }

  /**
   * 清空队列
   */
  clearQueue(agentId: string): void {
    this.queues.set(agentId, []);
  }

  /**
   * 添加消息到历史记录
   */
  private addToHistory(message: AgentMessage): void {
    this.messageHistory.push(message);

    // 限制历史记录大小
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  /**
   * 获取消息历史
   */
  getHistory(agentId?: string, limit?: number): AgentMessage[] {
    let history = this.messageHistory;

    if (agentId) {
      // 过滤特定Agent的消息
      history = history.filter(
        (msg) => msg.from === agentId || msg.to === agentId
      );
    }

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * 通知所有订阅者
   */
  private async notifySubscribers(agentId: string, message: AgentMessage): Promise<void> {
    // 订阅者通过getNextMessage自动获取消息，这里不需要额外通知
  }

  /**
   * 获取所有活跃的Agent ID
   */
  getActiveAgents(): string[] {
    return Array.from(this.queues.keys());
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.queues.clear();
    this.subscribers.clear();
    this.messageHistory = [];
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalMessages: this.messageHistory.length,
      activeAgents: this.getActiveAgents().length,
      queueSizes: Object.fromEntries(
        Array.from(this.queues.entries()).map(([agentId, queue]) => [
          agentId,
          queue.length,
        ])
      ),
    };
  }
}

// 创建全局MessageBus实例
let globalMessageBus: MessageBus | null = null;

export function getMessageBus(): MessageBus {
  if (!globalMessageBus) {
    globalMessageBus = new MessageBus();
  }
  return globalMessageBus;
}

export function resetMessageBus(): void {
  globalMessageBus = null;
}
