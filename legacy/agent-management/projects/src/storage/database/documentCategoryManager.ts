import { getDbInstance } from "@/storage/database";
import { documentCategories } from "@/storage/database/shared/schema";
import { eq, and, desc } from "drizzle-orm";
import type { InsertDocumentCategory } from "@/storage/database/shared/schema";

/**
 * 文档分类管理器
 */
export class DocumentCategoryManager {
  /**
   * 创建分类
   */
  async createCategory(data: InsertDocumentCategory) {
    const db = await getDbInstance();
    const [category] = await db
      .insert(documentCategories)
      .values({
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return category;
  }

  /**
   * 获取知识库的所有分类
   */
  async getCategoriesByKnowledgeBase(knowledgeBaseId: string) {
    const db = await getDbInstance();
    return db.query.documentCategories.findMany({
      where: eq(documentCategories.knowledgeBaseId, knowledgeBaseId),
      orderBy: [desc(documentCategories.createdAt)],
    });
  }

  /**
   * 获取分类详情
   */
  async getCategoryById(id: string) {
    const db = await getDbInstance();
    return db.query.documentCategories.findFirst({
      where: eq(documentCategories.id, id),
    });
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: string,
    data: Partial<Omit<InsertDocumentCategory, "id" | "createdAt">>
  ) {
    const db = await getDbInstance();
    const [category] = await db
      .update(documentCategories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documentCategories.id, id))
      .returning();
    return category;
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string) {
    const db = await getDbInstance();
    await db.delete(documentCategories).where(eq(documentCategories.id, id));
  }

  /**
   * 预设分类颜色
   */
  static presetColors = [
    "#3b82f6", // 蓝色
    "#10b981", // 绿色
    "#f59e0b", // 橙色
    "#ef4444", // 红色
    "#8b5cf6", // 紫色
    "#ec4899", // 粉色
    "#06b6d4", // 青色
    "#84cc16", // 石灰
  ];

  /**
   * 预设分类图标
   */
  static presetIcons = [
    "folder",
    "document",
    "code",
    "image",
    "video",
    "audio",
    "archive",
    "chart",
  ];
}

export const documentCategoryManager = new DocumentCategoryManager();
