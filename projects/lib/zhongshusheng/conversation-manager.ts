/**
 * ZAEP 中书省 - 对话历史管理
 * 负责管理对话上下文，支持多轮对话
 */

import { ChatMessage, RequestContext } from '../types/san-sheng.types';

/**
 * 对话历史管理器
 */
export class ConversationHistoryManager {
  // 内存存储（生产环境应使用数据库）
  private conversations: Map<string, ChatMessage[]> = new Map();

  /**
   * 保存消息
   * @param sessionId - 会话ID
   * @param message - 聊天消息
   */
  async saveMessage(sessionId: string, message: ChatMessage): Promise<void> {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }

    const conversation = this.conversations.get(sessionId)!;
    conversation.push(message);

    console.log(`[对话历史] 保存消息 [${sessionId}]:`, message.role, message.content.substring(0, 50));
  }

  /**
   * 获取对话历史
   * @param sessionId - 会话ID
   * @param limit - 限制条数（最近N条）
   */
  async getHistory(
    sessionId: string,
    limit: number = 10
  ): Promise<ChatMessage[]> {
    const conversation = this.conversations.get(sessionId) || [];
    return conversation.slice(-limit);
  }

  /**
   * 获取完整对话历史
   * @param sessionId - 会话ID
   */
  async getFullHistory(sessionId: string): Promise<ChatMessage[]> {
    return this.conversations.get(sessionId) || [];
  }

  /**
   * 清除对话历史
   * @param sessionId - 会话ID
   */
  async clearHistory(sessionId: string): Promise<void> {
    this.conversations.delete(sessionId);
    console.log(`[对话历史] 清除历史 [${sessionId}]`);
  }

  /**
   * 删除特定消息
   * @param sessionId - 会话ID
   * @param messageId - 消息ID
   */
  async deleteMessage(sessionId: string, messageId: string): Promise<boolean> {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      return false;
    }

    const index = conversation.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      conversation.splice(index, 1);
      console.log(`[对话历史] 删除消息 [${sessionId}]: ${messageId}`);
      return true;
    }

    return false;
  }

  /**
   * 获取上下文
   * @param sessionId - 会话ID
   * @param windowSize - 上下文窗口大小
   */
  async getContext(
    sessionId: string,
    windowSize: number = 5
  ): Promise<RequestContext> {
    const history = await this.getHistory(sessionId, windowSize);

    return {
      sessionId,
      userId: 'system', // TODO: 从消息中提取
      timestamp: Date.now(),
      conversationHistory: history,
    };
  }

  /**
   * 统计对话信息
   * @param sessionId - 会话ID
   */
  async getConversationStats(sessionId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    systemMessages: number;
    startTime: number | null;
    lastMessageTime: number | null;
  }> {
    const conversation = this.conversations.get(sessionId) || [];

    return {
      totalMessages: conversation.length,
      userMessages: conversation.filter(m => m.role === 'user').length,
      assistantMessages: conversation.filter(m => m.role === 'assistant').length,
      systemMessages: conversation.filter(m => m.role === 'system').length,
      startTime: conversation.length > 0 ? conversation[0].timestamp : null,
      lastMessageTime: conversation.length > 0 ? conversation[conversation.length - 1].timestamp : null,
    };
  }

  /**
   * 搜索消息
   * @param sessionId - 会话ID
   * @param keyword - 关键词
   */
  async searchMessages(sessionId: string, keyword: string): Promise<ChatMessage[]> {
    const conversation = this.conversations.get(sessionId) || [];
    const lowerKeyword = keyword.toLowerCase();

    return conversation.filter(msg =>
      msg.content.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 获取所有会话ID
   */
  async getAllSessionIds(): Promise<string[]> {
    return Array.from(this.conversations.keys());
  }

  /**
   * 清除过期对话
   * @param maxAge - 最大年龄（毫秒）
   */
  async clearExpiredConversations(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now();
    let cleared = 0;

    for (const [sessionId, conversation] of this.conversations.entries()) {
      if (conversation.length === 0) {
        continue;
      }

      const lastMessage = conversation[conversation.length - 1];
      const age = now - lastMessage.timestamp;

      if (age > maxAge) {
        this.conversations.delete(sessionId);
        cleared++;
        console.log(`[对话历史] 清除过期会话 [${sessionId}], 年龄: ${Math.round(age / 1000 / 60)}分钟`);
      }
    }

    return cleared;
  }

  /**
   * 导出对话历史
   * @param sessionId - 会话ID
   */
  async exportConversation(sessionId: string): Promise<string> {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      return '';
    }

    const lines = [`# 对话历史 [${sessionId}]`, ''];

    for (const msg of conversation) {
      const time = new Date(msg.timestamp).toLocaleString('zh-CN');
      const roleName = msg.role === 'user' ? '用户' : msg.role === 'assistant' ? '助手' : '系统';
      lines.push(`[${time}] ${roleName}:`);
      lines.push(msg.content);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 批量保存消息
   * @param sessionId - 会话ID
   * @param messages - 消息数组
   */
  async batchSaveMessages(sessionId: string, messages: ChatMessage[]): Promise<void> {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }

    const conversation = this.conversations.get(sessionId)!;
    conversation.push(...messages);

    console.log(`[对话历史] 批量保存 ${messages.length} 条消息 [${sessionId}]`);
  }

  /**
   * 检测对话意图
   * @param sessionId - 会话ID
   * @param message - 当前消息
   */
  async detectIntent(
    sessionId: string,
    message: string
  ): Promise<'new_task' | 'follow_up' | 'clarification' | 'unknown'> {
    const history = await this.getHistory(sessionId, 5);

    if (history.length === 0) {
      return 'new_task';
    }

    const lastMessage = history[history.length - 1];

    // 如果上一条是助手消息，且包含"？"或"是否"等，可能是澄清
    if (
      lastMessage.role === 'assistant' &&
      (lastMessage.content.includes('?') || lastMessage.content.includes('是否'))
    ) {
      return 'clarification';
    }

    // 检查是否包含引用（如"上面的"、"刚才的"等）
    const referenceKeywords = ['上面的', '刚才的', '之前', '那个'];
    const hasReference = referenceKeywords.some(kw => message.includes(kw));

    if (hasReference) {
      return 'follow_up';
    }

    // 默认是新任务
    return 'new_task';
  }
}

/**
 * 单例实例
 */
export const conversationHistoryManager = new ConversationHistoryManager();

/**
 * 便捷函数
 */
export async function saveMessage(sessionId: string, message: ChatMessage): Promise<void> {
  return conversationHistoryManager.saveMessage(sessionId, message);
}

export async function getHistory(sessionId: string, limit?: number): Promise<ChatMessage[]> {
  return conversationHistoryManager.getHistory(sessionId, limit);
}

export async function getContext(sessionId: string, windowSize?: number): Promise<RequestContext> {
  return conversationHistoryManager.getContext(sessionId, windowSize);
}
