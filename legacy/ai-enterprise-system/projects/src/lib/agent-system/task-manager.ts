/**
 * 任务管理器
 * 处理任务的 CRUD 操作
 * 强制使用真实数据库
 */

import { eq, and, desc } from 'drizzle-orm';
import { db, agentTasks, type AgentTask, type InsertAgentTask } from '@/lib/db';

// ==========================================
// 任务管理器
// ==========================================

export const taskManager = {
  /**
   * 获取所有任务
   */
  async getAllTasks(): Promise<AgentTask[]> {
    return await db.select().from(agentTasks).orderBy(desc(agentTasks.createdAt));
  },

  /**
   * 根据 ID 获取任务
   */
  async getTaskById(id: string): Promise<AgentTask | null> {
    const result = await db.select().from(agentTasks).where(eq(agentTasks.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * 根据状态获取任务
   */
  async getTasksByStatus(status: string): Promise<AgentTask[]> {
    return await db.select().from(agentTasks).where(eq(agentTasks.status, status));
  },

  /**
   * 创建任务
   */
  async createTask(data: InsertAgentTask): Promise<AgentTask> {
    const result = await db.insert(agentTasks).values(data).returning();
    return result[0];
  },

  /**
   * 更新任务
   */
  async updateTask(id: string, data: Partial<InsertAgentTask>): Promise<AgentTask | null> {
    const result = await db
      .update(agentTasks)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(agentTasks.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(agentTasks).where(eq(agentTasks.id, id)).returning();
    return result.length > 0;
  },

  /**
   * 根据智能体获取任务
   */
  async getTasksByAgentId(agentId: string): Promise<AgentTask[]> {
    return await db.select().from(agentTasks).where(eq(agentTasks.assignedAgentId, agentId));
  },

  /**
   * 获取任务及其关联的智能体
   */
  async getTaskWithAgent(id: string): Promise<{ task: AgentTask; agent: null } | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;
    // 返回任务和空的智能体（智能体信息需要通过 agentManager 单独获取）
    return { task, agent: null };
  },

  /**
   * 为智能体分配任务
   */
  async assignTask(taskId: string, agentId: string): Promise<AgentTask | null> {
    return await this.updateTask(taskId, { assignedAgentId: agentId });
  },
};
