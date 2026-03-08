import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  taskDeliverables,
  insertTaskDeliverableSchema,
  updateTaskDeliverableSchema,
} from "./shared/schema";
import type {
  TaskDeliverable,
  InsertTaskDeliverable,
  UpdateTaskDeliverable,
} from "./shared/schema";
import * as schema from "./shared/schema";

export class TaskDeliverableManager {
  /**
   * 创建任务成果
   */
  async createTaskDeliverable(data: InsertTaskDeliverable): Promise<TaskDeliverable> {
    const db = await getDb(schema);
    const validated = insertTaskDeliverableSchema.parse(data);
    const [deliverable] = await db
      .insert(taskDeliverables)
      .values(validated)
      .returning();
    return deliverable;
  }

  /**
   * 获取任务的所有成果
   */
  async getTaskDeliverables(taskId: string): Promise<TaskDeliverable[]> {
    const db = await getDb(schema);
    return db.query.taskDeliverables.findMany({
      where: eq(taskDeliverables.taskId, taskId),
      orderBy: [desc(taskDeliverables.createdAt)],
    });
  }

  /**
   * 根据ID获取任务成果
   */
  async getTaskDeliverableById(id: string): Promise<TaskDeliverable | null> {
    const db = await getDb(schema);
    const deliverable = await db.query.taskDeliverables.findFirst({
      where: eq(taskDeliverables.id, id),
    });
    return deliverable || null;
  }

  /**
   * 根据类型获取任务成果
   */
  async getTaskDeliverablesByType(taskId: string, type: string): Promise<TaskDeliverable[]> {
    const db = await getDb(schema);
    return db.query.taskDeliverables.findMany({
      where: and(eq(taskDeliverables.taskId, taskId), eq(taskDeliverables.type, type)),
      orderBy: [desc(taskDeliverables.createdAt)],
    });
  }

  /**
   * 根据智能体ID获取成果
   */
  async getDeliverablesByAgentId(agentId: string): Promise<TaskDeliverable[]> {
    const db = await getDb(schema);
    return db.query.taskDeliverables.findMany({
      where: eq(taskDeliverables.agentId, agentId),
      orderBy: [desc(taskDeliverables.createdAt)],
    });
  }

  /**
   * 更新任务成果
   */
  async updateTaskDeliverable(id: string, data: UpdateTaskDeliverable): Promise<TaskDeliverable | null> {
    const db = await getDb(schema);
    const validated = updateTaskDeliverableSchema.parse(data);
    const [deliverable] = await db
      .update(taskDeliverables)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(taskDeliverables.id, id))
      .returning();
    return deliverable || null;
  }

  /**
   * 更新成果状态
   */
  async updateDeliverableStatus(id: string, status: string): Promise<TaskDeliverable | null> {
    const db = await getDb(schema);
    const [deliverable] = await db
      .update(taskDeliverables)
      .set({ status, updatedAt: new Date() })
      .where(eq(taskDeliverables.id, id))
      .returning();
    return deliverable || null;
  }

  /**
   * 创建新版本
   */
  async createNewVersion(
    oldId: string,
    newData: Partial<InsertTaskDeliverable>
  ): Promise<TaskDeliverable> {
    const db = await getDb(schema);
    const oldDeliverable = await this.getTaskDeliverableById(oldId);
    if (!oldDeliverable) {
      throw new Error("Original deliverable not found");
    }

    // 获取当前最新版本号
    const allVersions = await db.query.taskDeliverables.findMany({
      where: and(
        eq(taskDeliverables.taskId, oldDeliverable.taskId),
        eq(taskDeliverables.title, oldDeliverable.title)
      ),
      orderBy: [desc(taskDeliverables.version)],
      limit: 1,
    });

    const nextVersion = allVersions.length > 0 ? allVersions[0].version + 1 : 1;

    const [newDeliverable] = await db
      .insert(taskDeliverables)
      .values({
        ...oldDeliverable,
        ...newData,
        id: undefined, // 让数据库生成新ID
        version: nextVersion,
        status: "draft",
        createdAt: undefined,
        updatedAt: new Date(),
      })
      .returning();

    return newDeliverable;
  }

  /**
   * 删除任务成果
   */
  async deleteTaskDeliverable(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(taskDeliverables).where(eq(taskDeliverables.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 获取最新版本
   */
  async getLatestVersion(taskId: string, title: string): Promise<TaskDeliverable | null> {
    const db = await getDb(schema);
    const [deliverable] = await db.query.taskDeliverables.findMany({
      where: and(
        eq(taskDeliverables.taskId, taskId),
        eq(taskDeliverables.title, title)
      ),
      orderBy: [desc(taskDeliverables.version)],
      limit: 1,
    });

    return deliverable || null;
  }
}

export const taskDeliverableManager = new TaskDeliverableManager();
