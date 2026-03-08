import { eq, and, SQL, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  agents,
  insertAgentSchema,
  updateAgentSchema,
} from "./shared/schema";
import type { Agent, InsertAgent, UpdateAgent } from "./shared/schema";
import * as schema from "./shared/schema";

export class AgentManager {
  /**
   * 创建智能体
   */
  async createAgent(data: InsertAgent): Promise<Agent> {
    const db = await getDb(schema);
    const validated = insertAgentSchema.parse(data);
    const [agent] = await db.insert(agents).values(validated).returning();
    return agent;
  }

  /**
   * 获取所有智能体
   */
  async getAgents(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<
      Pick<Agent, "id" | "department" | "isActive" | "parentId">
    >;
  } = {}): Promise<Agent[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(agents.id, filters.id));
    }
    if (filters.department !== undefined && filters.department !== null) {
      conditions.push(eq(agents.department, filters.department));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(agents.isActive, filters.isActive));
    }
    if (filters.parentId !== undefined && filters.parentId !== null) {
      conditions.push(eq(agents.parentId, filters.parentId));
    }

    return db.query.agents.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
    });
  }

  /**
   * 根据ID获取智能体
   */
  async getAgentById(id: string): Promise<Agent | null> {
    const db = await getDb(schema);
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, id),
    });
    return agent || null;
  }

  /**
   * 获取智能体树形结构
   */
  async getAgentTree(): Promise<Agent[]> {
    const db = await getDb(schema);
    const allAgents = await db.query.agents.findMany({
      where: eq(agents.isActive, true),
    });

    // 构建树形结构
    const agentMap = new Map<string, Agent & { children?: Agent[] }>();
    const roots: (Agent & { children?: Agent[] })[] = [];

    // 先将所有智能体存入Map
    allAgents.forEach((agent) => {
      agentMap.set(agent.id, { ...agent, children: [] });
    });

    // 构建父子关系
    allAgents.forEach((agent) => {
      const agentWithChildren = agentMap.get(agent.id)!;
      if (agent.parentId && agentMap.has(agent.parentId)) {
        const parent = agentMap.get(agent.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(agentWithChildren);
      } else {
        roots.push(agentWithChildren);
      }
    });

    return roots;
  }

  /**
   * 更新智能体
   */
  async updateAgent(id: string, data: UpdateAgent): Promise<Agent | null> {
    const db = await getDb(schema);
    const validated = updateAgentSchema.parse(data);
    const [agent] = await db
      .update(agents)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent || null;
  }

  /**
   * 删除智能体
   */
  async deleteAgent(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(agents).where(eq(agents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 根据部门获取智能体
   */
  async getAgentsByDepartment(department: string): Promise<Agent[]> {
    const db = await getDb(schema);
    return db.query.agents.findMany({
      where: eq(agents.department, department),
    });
  }

  /**
   * 批量获取智能体
   */
  async getAgentsByIds(ids: string[]): Promise<Agent[]> {
    const db = await getDb(schema);
    return db.query.agents.findMany({
      where: inArray(agents.id, ids),
    });
  }

  /**
   * 获取可用智能体（用于任务分配）
   */
  async getAvailableAgents(): Promise<Agent[]> {
    const db = await getDb(schema);
    return db.query.agents.findMany({
      where: eq(agents.isActive, true),
    });
  }
}

export const agentManager = new AgentManager();
