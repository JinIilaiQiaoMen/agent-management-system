/**
 * 对话管理器
 * 处理对话的 CRUD 操作
 * 强制使用真实数据库
 */

import { eq, desc } from 'drizzle-orm';
import { db, agentConversations, type AgentConversation, type InsertAgentConversation } from '@/lib/db';

// ==========================================
// 对话管理器
// ==========================================

export const conversationManager = {
  /**
   * 根据智能体获取对话
   */
  async getConversationsByAgentId(agentId: string): Promise<AgentConversation[]> {
    return await db.select().from(agentConversations).where(eq(agentConversations.agentId, agentId)).orderBy(desc(agentConversations.createdAt));
  },

  /**
   * 创建对话
   */
  async createConversation(data: InsertAgentConversation): Promise<AgentConversation> {
    const result = await db.insert(agentConversations).values(data).returning();
    return result[0];
  },

  /**
   * 更新对话
   */
  async updateConversation(id: string, data: Partial<InsertAgentConversation>): Promise<AgentConversation | null> {
    const result = await db
      .update(agentConversations)
      .set(data)
      .where(eq(agentConversations.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * 删除对话
   */
  async deleteConversation(id: string): Promise<boolean> {
    const result = await db.delete(agentConversations).where(eq(agentConversations.id, id)).returning();
    return result.length > 0;
  },
};
