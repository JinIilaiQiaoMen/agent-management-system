import { eq, and, SQL, inArray } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  tasks,
  agents,
  insertTaskSchema,
  updateTaskSchema,
} from "./shared/schema";
import type { Task, InsertTask, UpdateTask } from "./shared/schema";
import * as schema from "./shared/schema";

export class TaskManager {
  /**
   * 创建任务
   */
  async createTask(data: InsertTask): Promise<Task> {
    const db = await getDb(schema);
    const validated = insertTaskSchema.parse(data);
    const [task] = await db.insert(tasks).values(validated).returning();
    return task;
  }

  /**
   * 获取所有任务
   */
  async getTasks(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<
      Pick<Task, "id" | "assignedAgentId" | "status" | "priority" | "createdBy">
    >;
  } = {}): Promise<Task[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(tasks.id, filters.id));
    }
    if (filters.assignedAgentId !== undefined && filters.assignedAgentId !== null) {
      conditions.push(eq(tasks.assignedAgentId, filters.assignedAgentId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters.priority !== undefined) {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    if (filters.createdBy !== undefined) {
      conditions.push(eq(tasks.createdBy, filters.createdBy));
    }

    return db.query.tasks.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
    });
  }

  /**
   * 根据ID获取任务
   */
  async getTaskById(id: string): Promise<Task | null> {
    const db = await getDb(schema);
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });
    return task || null;
  }

  /**
   * 获取待分配的任务
   */
  async getPendingTasks(): Promise<Task[]> {
    const db = await getDb(schema);
    return db.query.tasks.findMany({
      where: eq(tasks.status, "pending"),
    });
  }

  /**
   * 获取智能体的任务
   */
  async getTasksByAgentId(agentId: string): Promise<Task[]> {
    const db = await getDb(schema);
    return db.query.tasks.findMany({
      where: eq(tasks.assignedAgentId, agentId),
    });
  }

  /**
   * 更新任务
   */
  async updateTask(id: string, data: UpdateTask): Promise<Task | null> {
    const db = await getDb(schema);
    const validated = updateTaskSchema.parse(data);

    // 如果状态改为completed，设置完成时间
    if (validated.status === "completed" && !validated.completedAt) {
      validated.completedAt = new Date();
    }

    const [task] = await db
      .update(tasks)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || null;
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 分配任务给智能体
   */
  async assignTask(taskId: string, agentId: string): Promise<Task | null> {
    const db = await getDb(schema);
    const [task] = await db
      .update(tasks)
      .set({
        assignedAgentId: agentId,
        status: "assigned",
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();
    return task || null;
  }

  /**
   * 开始任务
   */
  async startTask(taskId: string): Promise<Task | null> {
    const db = await getDb(schema);
    const [task] = await db
      .update(tasks)
      .set({
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();
    return task || null;
  }

  /**
   * 完成任务
   */
  async completeTask(taskId: string): Promise<Task | null> {
    const db = await getDb(schema);
    const [task] = await db
      .update(tasks)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();
    return task || null;
  }

  /**
   * 获取可用智能体（用于任务分配）
   */
  async getAvailableAgents(): Promise<any[]> {
    const db = await getDb(schema);
    const agentList = await db.query.agents.findMany({
      where: eq(agents.isActive, true),
    });
    return agentList;
  }
}

export const taskManager = new TaskManager();
