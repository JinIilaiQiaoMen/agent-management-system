import { eq, and, desc, inArray } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  conversationBoxes,
  conversationBoxAgents,
  conversationBoxMessages,
  conversationBoxAgentResponses,
  agents,
  insertConversationBoxSchema,
  updateConversationBoxSchema,
  insertConversationBoxAgentSchema,
  insertConversationBoxMessageSchema,
  insertConversationBoxAgentResponseSchema,
} from "./shared/schema";
import type {
  ConversationBox,
  InsertConversationBox,
  UpdateConversationBox,
  ConversationBoxAgent,
  InsertConversationBoxAgent,
  ConversationBoxMessage,
  InsertConversationBoxMessage,
  ConversationBoxAgentResponse,
  InsertConversationBoxAgentResponse,
} from "./shared/schema";
import * as schema from "./shared/schema";

/**
 * 对话盒子管理器 - 管理多智能体协作对话
 */
export class ConversationBoxManager {
  /**
   * 创建对话盒子
   */
  async createConversationBox(data: InsertConversationBox): Promise<ConversationBox> {
    const db = await getDb(schema);
    const validated = insertConversationBoxSchema.parse(data);
    const [box] = await db.insert(conversationBoxes).values(validated).returning();
    return box;
  }

  /**
   * 获取所有对话盒子
   */
  async getConversationBoxes(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<
      Pick<ConversationBox, "id" | "taskId" | "createdBy" | "status">
    >;
  } = {}): Promise<ConversationBox[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions = [];
    if (filters.id !== undefined) {
      conditions.push(eq(conversationBoxes.id, filters.id));
    }
    if (filters.taskId !== undefined && filters.taskId !== null) {
      conditions.push(eq(conversationBoxes.taskId, filters.taskId));
    }
    if (filters.createdBy !== undefined) {
      conditions.push(eq(conversationBoxes.createdBy, filters.createdBy));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(conversationBoxes.status, filters.status));
    }

    return db.query.conversationBoxes.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(conversationBoxes.createdAt)],
      limit,
      offset: skip,
    });
  }

  /**
   * 根据ID获取对话盒子（包含智能体列表）
   */
  async getConversationBoxById(id: string): Promise<ConversationBox | null> {
    const db = await getDb(schema);
    const box = await db.query.conversationBoxes.findFirst({
      where: eq(conversationBoxes.id, id),
    });
    return box || null;
  }

  /**
   * 获取对话盒子详细信息（包含智能体、消息等）
   */
  async getConversationBoxDetail(id: string) {
    const db = await getDb(schema);
    
    const box = await db.query.conversationBoxes.findFirst({
      where: eq(conversationBoxes.id, id),
    });

    if (!box) {
      return null;
    }

    // 获取盒子中的智能体
    const boxAgents = await db.query.conversationBoxAgents.findMany({
      where: eq(conversationBoxAgents.boxId, id),
    });

    // 获取智能体详细信息
    const agentIds = boxAgents.map(ba => ba.agentId);
    const agentsData = agentIds.length > 0 
      ? await db.query.agents.findMany({
          where: inArray(agents.id, agentIds),
        })
      : [];

    // 合并数据
    const agentsWithRole = boxAgents.map(ba => {
      const agent = agentsData.find(a => a.id === ba.agentId);
      return {
        ...agent,
        boxRole: ba.role,
        joinedAt: ba.joinedAt,
      };
    });

    // 获取消息（包含响应）
    const messages = await db.query.conversationBoxMessages.findMany({
      where: eq(conversationBoxMessages.boxId, id),
      orderBy: [desc(conversationBoxMessages.createdAt)],
    });

    // 获取每条消息的响应
    const messagesWithResponses = await Promise.all(
      messages.map(async (message) => {
        const responses = await db.query.conversationBoxAgentResponses.findMany({
          where: eq(conversationBoxAgentResponses.messageId, message.id),
          orderBy: [desc(conversationBoxAgentResponses.createdAt)],
        });

        // 获取响应的智能体信息
        const responseAgentIds = responses.map(r => r.agentId);
        const responseAgents = responseAgentIds.length > 0
          ? await db.query.agents.findMany({
              where: inArray(agents.id, responseAgentIds),
            })
          : [];

        const responsesWithAgent = responses.map(r => ({
          ...r,
          agent: responseAgents.find(a => a.id === r.agentId),
        }));

        return {
          id: message.id,
          boxId: message.boxId,
          content: message.content,
          senderType: message.senderType,
          senderAgentId: message.senderAgentId,
          replyToId: message.replyToId,
          metadata: message.metadata,
          createdAt: message.createdAt,
          responses: responsesWithAgent,
        };
      })
    );

    return {
      id: box.id,
      title: box.title,
      description: box.description,
      taskId: box.taskId,
      createdBy: box.createdBy,
      status: box.status,
      metadata: box.metadata,
      createdAt: box.createdAt,
      updatedAt: box.updatedAt,
      agents: agentsWithRole,
      messages: messagesWithResponses,
    };
  }

  /**
   * 更新对话盒子
   */
  async updateConversationBox(id: string, data: UpdateConversationBox): Promise<ConversationBox | null> {
    const db = await getDb(schema);
    const validated = updateConversationBoxSchema.parse(data);

    const [box] = await db
      .update(conversationBoxes)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(conversationBoxes.id, id))
      .returning();
    
    return box || null;
  }

  /**
   * 删除对话盒子
   */
  async deleteConversationBox(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(conversationBoxes).where(eq(conversationBoxes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 添加智能体到对话盒子
   */
  async addAgentToBox(data: InsertConversationBoxAgent): Promise<ConversationBoxAgent> {
    const db = await getDb(schema);
    const validated = insertConversationBoxAgentSchema.parse(data);
    const [boxAgent] = await db.insert(conversationBoxAgents).values(validated).returning();
    return boxAgent;
  }

  /**
   * 批量添加智能体到对话盒子
   */
  async addAgentsToBox(boxId: string, agentIds: string[], role: string = "participant"): Promise<ConversationBoxAgent[]> {
    const db = await getDb(schema);
    
    const agentsToAdd = agentIds.map(agentId => ({
      boxId,
      agentId,
      role,
    }));

    const results = await db.insert(conversationBoxAgents).values(agentsToAdd).returning();
    return results;
  }

  /**
   * 从对话盒子移除智能体
   */
  async removeAgentFromBox(boxId: string, agentId: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db
      .delete(conversationBoxAgents)
      .where(
        and(
          eq(conversationBoxAgents.boxId, boxId),
          eq(conversationBoxAgents.agentId, agentId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 获取对话盒子中的智能体列表
   */
  async getBoxAgents(boxId: string) {
    const db = await getDb(schema);
    const boxAgents = await db.query.conversationBoxAgents.findMany({
      where: eq(conversationBoxAgents.boxId, boxId),
    });

    // 获取智能体详细信息
    const agentIds = boxAgents.map(ba => ba.agentId);
    const agentsData = agentIds.length > 0 
      ? await db.query.agents.findMany({
          where: inArray(agents.id, agentIds),
        })
      : [];

    // 合并数据
    return boxAgents.map(ba => {
      const agent = agentsData.find(a => a.id === ba.agentId);
      return {
        ...agent,
        boxRole: ba.role,
        joinedAt: ba.joinedAt,
      };
    });
  }

  /**
   * 发送消息到对话盒子
   */
  async sendMessageToBox(data: InsertConversationBoxMessage): Promise<ConversationBoxMessage> {
    const db = await getDb(schema);
    const validated = insertConversationBoxMessageSchema.parse(data);
    const [message] = await db.insert(conversationBoxMessages).values(validated).returning();
    return message;
  }

  /**
   * 添加智能体响应
   */
  async addAgentResponse(data: InsertConversationBoxAgentResponse): Promise<ConversationBoxAgentResponse> {
    const db = await getDb(schema);
    const validated = insertConversationBoxAgentResponseSchema.parse(data);
    const [response] = await db.insert(conversationBoxAgentResponses).values(validated).returning();
    return response;
  }

  /**
   * 获取对话盒子的消息历史（包含响应）
   */
  async getBoxMessages(boxId: string, limit: number = 100) {
    const db = await getDb(schema);

    const messages = await db.query.conversationBoxMessages.findMany({
      where: eq(conversationBoxMessages.boxId, boxId),
      orderBy: [desc(conversationBoxMessages.createdAt)],
      limit,
    });

    const messagesWithResponses = await Promise.all(
      messages.map(async (message) => {
        const responses = await db.query.conversationBoxAgentResponses.findMany({
          where: eq(conversationBoxAgentResponses.messageId, message.id),
          orderBy: [desc(conversationBoxAgentResponses.createdAt)],
        });

        // 获取响应的智能体信息
        const responseAgentIds = responses.map(r => r.agentId);
        const responseAgents = responseAgentIds.length > 0
          ? await db.query.agents.findMany({
              where: inArray(agents.id, responseAgentIds),
            })
          : [];

        const responsesWithAgent = responses.map(r => ({
          ...r,
          agent: responseAgents.find(a => a.id === r.agentId),
        }));

        return {
          id: message.id,
          boxId: message.boxId,
          content: message.content,
          senderType: message.senderType,
          senderAgentId: message.senderAgentId,
          replyToId: message.replyToId,
          metadata: message.metadata,
          createdAt: message.createdAt,
          responses: responsesWithAgent,
        };
      })
    );

    return messagesWithResponses;
  }

  /**
   * 获取对话上下文（用于LLM）
   * 返回格式化的对话历史，供智能体理解上下文
   */
  async getConversationContext(boxId: string, maxMessages: number = 10): Promise<string> {
    const messages = await this.getBoxMessages(boxId, maxMessages);
    messages.reverse(); // 按时间顺序

    let context = "";
    
    for (const message of messages) {
      const sender = message.senderType === "user" ? "用户" : `${message.senderAgentId}`;
      context += `【${sender}】: ${message.content}\n`;

      // 添加智能体响应
      if (message.responses && message.responses.length > 0) {
        for (const response of message.responses) {
          if (!response.isHidden) {
            context += `【${response.agent?.name || response.agentId}】: ${response.content}\n`;
          }
        }
      }
      context += "\n";
    }

    return context;
  }
}

export const conversationBoxManager = new ConversationBoxManager();
