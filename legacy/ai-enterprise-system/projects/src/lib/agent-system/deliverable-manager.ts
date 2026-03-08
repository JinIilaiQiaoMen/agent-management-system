/**
 * 成果管理器
 * 处理任务成果的 CRUD 操作
 * 强制使用真实数据库
 */

import { eq, desc } from 'drizzle-orm';
import { db, agentTaskDeliverables, type AgentTaskDeliverable, type InsertAgentTaskDeliverable } from '@/lib/db';

// ==========================================
// 成果管理器
// ==========================================

export const deliverableManager = {
  /**
   * 根据任务 ID 获取成果
   */
  async getDeliverablesByTaskId(taskId: string): Promise<AgentTaskDeliverable[]> {
    return await db.select().from(agentTaskDeliverables).where(eq(agentTaskDeliverables.taskId, taskId));
  },

  /**
   * 创建成果
   */
  async createDeliverable(data: InsertAgentTaskDeliverable): Promise<AgentTaskDeliverable> {
    const result = await db.insert(agentTaskDeliverables).values(data).returning();
    return result[0];
  },

  /**
   * 更新成果
   */
  async updateDeliverable(id: string, data: Partial<InsertAgentTaskDeliverable>): Promise<AgentTaskDeliverable | null> {
    const result = await db
      .update(agentTaskDeliverables)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(agentTaskDeliverables.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * 删除成果
   */
  async deleteDeliverable(id: string): Promise<boolean> {
    const result = await db.delete(agentTaskDeliverables).where(eq(agentTaskDeliverables.id, id)).returning();
    return result.length > 0;
  },
};
