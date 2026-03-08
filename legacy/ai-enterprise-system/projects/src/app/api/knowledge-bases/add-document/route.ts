import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentKnowledgeDocuments, agentKnowledgeBases } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route POST /api/knowledge-bases/add-document
 * @description 向知识库添加文档
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      knowledgeBaseId, 
      fileName, 
      fileType, 
      content,
      filePath,
      fileSize,
      metadata 
    } = body;

    if (!knowledgeBaseId || !fileName) {
      return NextResponse.json(
        { error: '缺少必要参数：knowledgeBaseId 或 fileName' },
        { status: 400 }
      );
    }

    // 检查知识库是否存在
    const [existingKB] = await db
      .select()
      .from(agentKnowledgeBases)
      .where(eq(agentKnowledgeBases.id, knowledgeBaseId))
      .limit(1);

    if (!existingKB) {
      return NextResponse.json(
        { error: '知识库不存在' },
        { status: 404 }
      );
    }

    // 创建文档记录
    const documentId = uuidv4();
    const [newDocument] = await db
      .insert(agentKnowledgeDocuments)
      .values({
        id: documentId,
        knowledgeBaseId,
        fileName: fileName,
        fileType: fileType || 'text',
        filePath: filePath || '',
        fileSize: fileSize || 0,
        content: content || null,
        status: 'processing',
        uploadedBy: 'system',
        metadata: metadata || null,
      })
      .returning();

    // 更新知识库的文档数量
    await db
      .update(agentKnowledgeBases)
      .set({
        documentCount: (existingKB.documentCount || 0) + 1,
      })
      .where(eq(agentKnowledgeBases.id, knowledgeBaseId));

    return NextResponse.json({
      success: true,
      data: {
        document: newDocument,
        knowledgeBaseId,
      },
      message: '文档添加成功，正在处理中',
    });
  } catch (error) {
    console.error('添加文档失败:', error);
    return NextResponse.json(
      { error: '添加文档失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
