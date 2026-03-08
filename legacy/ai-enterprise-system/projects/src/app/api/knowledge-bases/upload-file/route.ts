import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentKnowledgeDocuments, agentKnowledgeBases } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route POST /api/knowledge-bases/upload-file
 * @description 上传文件到知识库
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const knowledgeBaseId = formData.get('knowledgeBaseId') as string;
    const file = formData.get('file') as File;

    if (!knowledgeBaseId || !file) {
      return NextResponse.json(
        { error: '缺少必要参数：knowledgeBaseId 或 file' },
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

    // 获取文件信息
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    
    // 根据文件类型确定文档类型
    let documentType = 'file';
    if (fileType.startsWith('image/')) {
      documentType = 'image';
    } else if (fileType === 'application/pdf') {
      documentType = 'pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      documentType = 'document';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      documentType = 'spreadsheet';
    } else if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      documentType = 'text';
    }

    // 读取文件内容（对于文本文件）
    let content: string | null = null;
    if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      content = await file.text();
    }

    // 创建文档记录
    const documentId = uuidv4();
    const [newDocument] = await db
      .insert(agentKnowledgeDocuments)
      .values({
        id: documentId,
        knowledgeBaseId,
        fileName: fileName,
        fileType: documentType,
        filePath: '', // 文件上传后应存储到对象存储，这里暂时为空字符串
        fileSize: fileSize,
        content: content,
        status: 'processing',
        uploadedBy: 'system',
        metadata: {
          originalFileName: fileName,
          mimeType: fileType,
          uploadedAt: new Date().toISOString(),
        },
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
        uploadInfo: {
          fileName,
          fileSize,
          fileType,
          documentType,
        },
      },
      message: '文件上传成功，正在处理中',
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json(
      { error: '上传文件失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
