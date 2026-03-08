import { eq, and, SQL, inArray } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  knowledgeBases,
  insertKnowledgeBaseSchema,
  updateKnowledgeBaseSchema,
} from "./shared/schema";
import type {
  KnowledgeBase,
  InsertKnowledgeBase,
  UpdateKnowledgeBase,
} from "./shared/schema";
import * as schema from "./shared/schema";

export class KnowledgeBaseManager {
  /**
   * 创建知识库
   */
  async createKnowledgeBase(
    data: InsertKnowledgeBase
  ): Promise<KnowledgeBase> {
    const db = await getDb(schema);
    const validated = insertKnowledgeBaseSchema.parse(data);
    const [kb] = await db.insert(knowledgeBases).values(validated).returning();
    return kb;
  }

  /**
   * 获取所有知识库
   */
  async getKnowledgeBases(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<
      Pick<KnowledgeBase, "id" | "type" | "agentId" | "isActive">
    >;
  } = {}): Promise<KnowledgeBase[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(knowledgeBases.id, filters.id));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(knowledgeBases.type, filters.type));
    }
    if (filters.agentId !== undefined && filters.agentId !== null) {
      conditions.push(eq(knowledgeBases.agentId, filters.agentId));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(knowledgeBases.isActive, filters.isActive));
    }

    return db.query.knowledgeBases.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
    });
  }

  /**
   * 根据ID获取知识库
   */
  async getKnowledgeBaseById(id: string): Promise<KnowledgeBase | null> {
    const db = await getDb(schema);
    const kb = await db.query.knowledgeBases.findFirst({
      where: eq(knowledgeBases.id, id),
    });
    return kb || null;
  }

  /**
   * 获取通用知识库
   */
  async getCommonKnowledgeBase(): Promise<KnowledgeBase | null> {
    try {
      const db = await getDb(schema);
      const kb = await db.query.knowledgeBases.findFirst({
        where: eq(knowledgeBases.type, "common"),
      });
      return kb || null;
    } catch (error) {
      console.error("Error getting common knowledge base:", error);
      return null;
    }
  }

  /**
   * 根据智能体ID获取知识库
   */
  async getKnowledgeBaseByAgentId(
    agentId: string
  ): Promise<KnowledgeBase | null> {
    const db = await getDb(schema);
    const kb = await db.query.knowledgeBases.findFirst({
      where: and(
        eq(knowledgeBases.type, "individual"),
        eq(knowledgeBases.agentId, agentId)
      ),
    });
    return kb || null;
  }

  /**
   * 更新知识库
   */
  async updateKnowledgeBase(
    id: string,
    data: UpdateKnowledgeBase
  ): Promise<KnowledgeBase | null> {
    const db = await getDb(schema);
    const validated = updateKnowledgeBaseSchema.parse(data);
    const [kb] = await db
      .update(knowledgeBases)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(knowledgeBases.id, id))
      .returning();
    return kb || null;
  }

  /**
   * 删除知识库
   */
  async deleteKnowledgeBase(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(knowledgeBases).where(eq(knowledgeBases.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 更新文档数量
   */
  async updateDocumentCount(id: string, delta: number): Promise<void> {
    const db = await getDb(schema);
    const kb = await db.query.knowledgeBases.findFirst({
      where: eq(knowledgeBases.id, id),
    });

    if (kb) {
      await db
        .update(knowledgeBases)
        .set({
          documentCount: Math.max(0, (kb.documentCount || 0) + delta),
          updatedAt: new Date(),
        })
        .where(eq(knowledgeBases.id, id));
    }
  }
}

export const knowledgeBaseManager = new KnowledgeBaseManager();
