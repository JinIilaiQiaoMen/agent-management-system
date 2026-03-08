import { NextRequest, NextResponse } from "next/server";
import { documentManager, knowledgeBaseManager } from "@/storage/database";

/**
 * GET /api/knowledge-bases/[id]/documents - 获取知识库的文档列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: knowledgeBaseId } = await params;

    // 验证知识库是否存在
    const kb = await knowledgeBaseManager.getKnowledgeBaseById(knowledgeBaseId);
    if (!kb) {
      return NextResponse.json({ error: "知识库不存在" }, { status: 404 });
    }

    // 获取文档列表
    const documents = await documentManager.getDocumentsByKnowledgeBaseId(knowledgeBaseId);

    return NextResponse.json({
      success: true,
      data: documents.map((doc: any) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        status: doc.status,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt,
        matchScore: (doc.metadata as any)?.matchScore,
        matchReason: (doc.metadata as any)?.matchReason,
        analysis: (doc.metadata as any)?.analysis,
        recommendation: (doc.metadata as any)?.recommendation,
        docId: (doc.metadata as any)?.docId
      }))
    });
  } catch (error: any) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "获取文档列表失败", details: error.message },
      { status: 500 }
    );
  }
}
