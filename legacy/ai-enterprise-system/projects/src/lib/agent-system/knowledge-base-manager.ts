/**
 * 知识库管理器
 * 处理知识库的 CRUD 操作
 * 强制使用真实数据库
 */

import { eq, desc } from 'drizzle-orm';
import { db, agentKnowledgeBases, type AgentKnowledgeBase, type InsertAgentKnowledgeBase } from '@/lib/db';

// ==========================================
// 知识库管理器
// ==========================================

export const knowledgeBaseManager = {
  /**
   * 获取所有知识库
   */
  async getAllKnowledgeBases(): Promise<AgentKnowledgeBase[]> {
    return await db.select().from(agentKnowledgeBases).orderBy(desc(agentKnowledgeBases.createdAt));
  },

  /**
   * 根据 ID 获取知识库
   */
  async getKnowledgeBaseById(id: string): Promise<AgentKnowledgeBase | null> {
    const result = await db.select().from(agentKnowledgeBases).where(eq(agentKnowledgeBases.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * 根据智能体获取知识库
   */
  async getKnowledgeBasesByAgentId(agentId: string): Promise<AgentKnowledgeBase[]> {
    return await db.select().from(agentKnowledgeBases).where(eq(agentKnowledgeBases.agentId, agentId));
  },

  /**
   * 创建知识库
   */
  async createKnowledgeBase(data: InsertAgentKnowledgeBase): Promise<AgentKnowledgeBase> {
    const result = await db.insert(agentKnowledgeBases).values(data).returning();
    return result[0];
  },

  /**
   * 更新知识库
   */
  async updateKnowledgeBase(id: string, data: Partial<InsertAgentKnowledgeBase>): Promise<AgentKnowledgeBase | null> {
    const result = await db
      .update(agentKnowledgeBases)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(agentKnowledgeBases.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * 删除知识库
   */
  async deleteKnowledgeBase(id: string): Promise<boolean> {
    const result = await db.delete(agentKnowledgeBases).where(eq(agentKnowledgeBases.id, id)).returning();
    return result.length > 0;
  },
};
