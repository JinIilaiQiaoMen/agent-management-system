/**
 * 智能体管理器
 * 处理智能体的 CRUD 操作
 * 强制使用真实数据库
 */

import { eq, isNull, desc } from 'drizzle-orm';
import { db, agents, type Agent, type InsertAgent } from '@/lib/db';

// ==========================================
// 智能体管理器
// ==========================================

export const agentManager = {
  /**
   * 获取所有智能体
   */
  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(desc(agents.createdAt));
  },

  /**
   * 获取活跃的智能体
   */
  async getActiveAgents(): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.isActive, true)).orderBy(desc(agents.createdAt));
  },

  /**
   * 根据 ID 获取智能体
   */
  async getAgentById(id: string): Promise<Agent | null> {
    const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * 根据部门获取智能体
   */
  async getAgentsByDepartment(department: string): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.department, department));
  },

  /**
   * 获取顶层智能体（没有父级的智能体）
   */
  async getTopLevelAgents(): Promise<Agent[]> {
    return await db.select().from(agents).where(isNull(agents.parentId));
  },

  /**
   * 获取子智能体
   */
  async getChildAgents(parentId: string): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.parentId, parentId));
  },

  /**
   * 创建智能体
   */
  async createAgent(data: InsertAgent): Promise<Agent> {
    const result = await db.insert(agents).values(data).returning();
    return result[0];
  },

  /**
   * 更新智能体
   */
  async updateAgent(id: string, data: Partial<InsertAgent>): Promise<Agent | null> {
    const result = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(agents.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * 删除智能体
   */
  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id)).returning();
    return result.length > 0;
  },
};
