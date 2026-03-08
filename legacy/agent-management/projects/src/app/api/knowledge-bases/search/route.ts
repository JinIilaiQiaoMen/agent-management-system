import { NextRequest } from "next/server";
import { documentManager, knowledgeBaseManager, getDbInstance } from "@/storage/database";
import { sql, and, or, ilike, eq } from "drizzle-orm";
import { documents } from "@/storage/database/shared/schema";
import { successResponse, errorResponse, withErrorHandler } from "@/lib/api-response";

/**
 * POST /api/knowledge-bases/search - 全文搜索文档
 * 支持搜索文档名和内容
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const { query, knowledgeBaseId, limit = 20 } = await request.json();

  if (!query || query.trim().length === 0) {
    return errorResponse("请输入搜索关键词", 400);
  }

  // 如果指定了知识库ID，验证知识库是否存在
  if (knowledgeBaseId) {
    const kb = await knowledgeBaseManager.getKnowledgeBaseById(knowledgeBaseId);
    if (!kb) {
      return errorResponse("知识库不存在", 404);
    }
  }

  // 构建搜索条件
  const searchConditions = [];

  // 搜索文件名
  searchConditions.push(ilike(documents.fileName, `%${query}%`));

  // 搜索内容（如果存在）
  if (documents.content) {
    searchConditions.push(ilike(documents.content, `%${query}%`));
  }

  // 如果指定了知识库ID，添加过滤条件
  const conditions = knowledgeBaseId
    ? [eq(documents.knowledgeBaseId, knowledgeBaseId), or(...searchConditions)]
    : [or(...searchConditions)];

  // 执行搜索
  const db = await getDbInstance();
  const results = await db
    .select({
      id: documents.id,
      fileName: documents.fileName,
      fileType: documents.fileType,
      fileSize: documents.fileSize,
      status: documents.status,
      knowledgeBaseId: documents.knowledgeBaseId,
      uploadedBy: documents.uploadedBy,
      uploadedAt: documents.uploadedAt,
      content: documents.content,
      metadata: documents.metadata,
    })
    .from(documents)
    .where(and(...conditions))
    .limit(limit);

  // 高亮搜索关键词
  const highlightedResults = results.map((doc) => ({
    ...doc,
    fileName: highlightText(doc.fileName, query),
    contentPreview: doc.content
      ? highlightText(doc.content.substring(0, 500), query)
      : null,
  }));

  return successResponse(
    {
      query,
      count: results.length,
      data: highlightedResults,
    },
    "搜索成功"
  );
});

/**
 * 高亮文本中的关键词
 */
function highlightText(text: string, query: string): string {
  if (!text) return "";
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}
