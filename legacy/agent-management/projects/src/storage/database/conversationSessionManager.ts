import { eq, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { conversationSessions } from "./shared/schema";
import {
  insertConversationSessionSchema,
  type ConversationSession,
  type InsertConversationSession,
} from "./shared/schema";
import * as schema from "./shared/schema";

export class ConversationSessionManager {
  /**
   * 创建新的对话会话
   */
  async createConversationSession(
    data: InsertConversationSession
  ): Promise<ConversationSession> {
    const db = await getDb(schema);
    const validated = insertConversationSessionSchema.parse(data);
    const [session] = await db
      .insert(conversationSessions)
      .values(validated)
      .returning();
    return session;
  }

  /**
   * 根据ID获取对话会话
   */
  async getConversationSessionById(
    id: string
  ): Promise<ConversationSession | null> {
    const db = await getDb(schema);
    const session = await db.query.conversationSessions.findFirst({
      where: eq(conversationSessions.id, id),
    });
    return session || null;
  }

  /**
   * 获取所有对话会话
   */
  async getAllConversationSessions(): Promise<ConversationSession[]> {
    const db = await getDb(schema);
    const sessions = await db.query.conversationSessions.findMany({
      orderBy: [desc(conversationSessions.createdAt)],
    });
    return sessions;
  }

  /**
   * 根据智能体ID获取对话会话
   */
  async getConversationSessionsByAgentId(
    agentId: string
  ): Promise<ConversationSession[]> {
    const db = await getDb(schema);
    const sessions = await db.query.conversationSessions.findMany({
      where: eq(conversationSessions.agentId, agentId),
      orderBy: [desc(conversationSessions.createdAt)],
    });
    return sessions;
  }

  /**
   * 根据知识库ID获取对话会话
   */
  async getConversationSessionsByKnowledgeBaseId(
    knowledgeBaseId: string
  ): Promise<ConversationSession[]> {
    const db = await getDb(schema);
    const sessions = await db.query.conversationSessions.findMany({
      where: eq(conversationSessions.knowledgeBaseId, knowledgeBaseId),
      orderBy: [desc(conversationSessions.createdAt)],
    });
    return sessions;
  }

  /**
   * 删除对话会话
   */
  async deleteConversationSession(id: string): Promise<void> {
    const db = await getDb(schema);
    await db
      .delete(conversationSessions)
      .where(eq(conversationSessions.id, id));
  }

  /**
   * 更新知识库ID（用于将对话关联到知识库）
   */
  async updateKnowledgeBaseId(
    id: string,
    knowledgeBaseId: string
  ): Promise<ConversationSession | null> {
    const db = await getDb(schema);
    const [updated] = await db
      .update(conversationSessions)
      .set({ knowledgeBaseId })
      .where(eq(conversationSessions.id, id))
      .returning();
    return updated || null;
  }
}

// 导出单例
export const conversationSessionManager = new ConversationSessionManager();
