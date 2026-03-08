import { eq, and, SQL, inArray, desc, asc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  conversations,
  insertConversationSchema,
} from "./shared/schema";
import type { Conversation, InsertConversation } from "./shared/schema";
import * as schema from "./shared/schema";

export class ConversationManager {
  /**
   * 创建对话记录
   */
  async createConversation(data: InsertConversation): Promise<Conversation> {
    const db = await getDb(schema);
    const validated = insertConversationSchema.parse(data);
    const [conversation] = await db
      .insert(conversations)
      .values(validated)
      .returning();
    return conversation;
  }

  /**
   * 获取对话记录
   */
  async getConversations(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<
      Pick<Conversation, "agentId" | "taskId">
    >;
    orderBy?: string;
    order?: "asc" | "desc";
  } = {}): Promise<Conversation[]> {
    const { skip = 0, limit = 100, filters = {}, orderBy, order = "asc" } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.agentId !== undefined) {
      conditions.push(eq(conversations.agentId, filters.agentId));
    }
    if (filters.taskId !== undefined && filters.taskId !== null) {
      conditions.push(eq(conversations.taskId, filters.taskId));
    }

    // 构建排序选项
    let orderByClause;
    if (orderBy === "createdAt") {
      orderByClause = order === "desc" ? desc(conversations.createdAt) : asc(conversations.createdAt);
    }

    return db.query.conversations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: orderByClause,
      limit,
      offset: skip,
    });
  }

  /**
   * 获取与智能体的对话历史
   */
  async getConversationHistory(agentId: string, limit = 20): Promise<Conversation[]> {
    const db = await getDb(schema);
    return db.query.conversations.findMany({
      where: eq(conversations.agentId, agentId),
      limit,
    });
  }

  /**
   * 根据ID获取对话
   */
  async getConversationById(id: string): Promise<Conversation | null> {
    const db = await getDb(schema);
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
    return conversation || null;
  }
}

export const conversationManager = new ConversationManager();
