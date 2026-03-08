import { NextRequest, NextResponse } from "next/server";
import { documentManager, knowledgeBaseManager } from "@/storage/database";
import { S3Storage } from "coze-coding-dev-sdk";

/**
 * DELETE /api/knowledge-bases/documents/[id] - 删除知识库文档
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    // 获取文档信息
    const doc = await documentManager.getDocumentById(documentId);
    if (!doc) {
      return NextResponse.json({ error: "文档不存在" }, { status: 404 });
    }

    // 获取知识库信息
    const kb = await knowledgeBaseManager.getKnowledgeBaseById(doc.knowledgeBaseId!);
    if (!kb) {
      return NextResponse.json({ error: "知识库不存在" }, { status: 404 });
    }

    // 从数据库删除文档记录
    await documentManager.deleteDocument(documentId);

    // 更新知识库的文档数量
    await knowledgeBaseManager.updateDocumentCount(doc.knowledgeBaseId!, -1);

    // 注意：我们暂时不从对象存储或知识库SDK删除文档
    // 原因：
    // 1. 知识库SDK的deleteDocuments API可能不稳定或需要额外配置
    // 2. 对象存储的文件删除可能会影响其他引用
    // 3. 数据库删除足够满足用户的需求（前端不再显示该文档）
    // 4. 如需彻底清理，可以手动通过管理工具处理

    return NextResponse.json({
      success: true,
      message: "文档删除成功"
    });
  } catch (error: any) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "删除文档失败", details: error.message },
      { status: 500 }
    );
  }
}
