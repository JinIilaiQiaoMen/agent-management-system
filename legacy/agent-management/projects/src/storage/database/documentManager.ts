import { eq, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { documents, insertDocumentSchema } from "./shared/schema";
import type { Document, InsertDocument } from "./shared/schema";
import * as schema from "./shared/schema";

export class DocumentManager {
  /**
   * 创建文档记录
   */
  async createDocument(data: InsertDocument): Promise<Document> {
    const db = await getDb(schema);
    const validated = insertDocumentSchema.parse(data);
    const [doc] = await db.insert(documents).values(validated).returning();
    return doc;
  }

  /**
   * 根据ID获取文档
   */
  async getDocumentById(id: string): Promise<Document | null> {
    const db = await getDb(schema);
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });
    return doc || null;
  }

  /**
   * 获取所有文档
   */
  async getAllDocuments(): Promise<Document[]> {
    const db = await getDb(schema);
    const docs = await db.query.documents.findMany({
      orderBy: [desc(documents.createdAt)],
    });
    return docs;
  }

  /**
   * 根据知识库ID获取文档
   */
  async getDocumentsByKnowledgeBaseId(knowledgeBaseId: string): Promise<Document[]> {
    const db = await getDb(schema);
    const docs = await db.query.documents.findMany({
      where: eq(documents.knowledgeBaseId, knowledgeBaseId),
      orderBy: [desc(documents.createdAt)],
    });
    return docs;
  }

  /**
   * 根据状态获取文档
   */
  async getDocumentsByStatus(status: string): Promise<Document[]> {
    const db = await getDb(schema);
    const docs = await db.query.documents.findMany({
      where: eq(documents.status, status),
      orderBy: [desc(documents.createdAt)],
    });
    return docs;
  }

  /**
   * 更新文档
   */
  async updateDocument(id: string, data: Partial<InsertDocument>): Promise<Document | null> {
    const db = await getDb(schema);
    const [updated] = await db
      .update(documents)
      .set(data)
      .where(eq(documents.id, id))
      .returning();
    return updated || null;
  }

  /**
   * 更新文档内容
   */
  async updateDocumentContent(id: string, content: string, status: string): Promise<Document | null> {
    const db = await getDb(schema);
    const [updated] = await db
      .update(documents)
      .set({ content, status })
      .where(eq(documents.id, id))
      .returning();
    return updated || null;
  }

  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<void> {
    const db = await getDb(schema);
    await db.delete(documents).where(eq(documents.id, id));
  }

  /**
   * 批量创建文档
   */
  async createDocuments(data: InsertDocument[]): Promise<Document[]> {
    const db = await getDb(schema);
    const validated = data.map((d) => insertDocumentSchema.parse(d));
    const docs = await db.insert(documents).values(validated).returning();
    return docs;
  }
}

// 导出单例
export const documentManager = new DocumentManager();
