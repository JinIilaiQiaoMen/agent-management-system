import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentKnowledgeDocuments, agentKnowledgeBases } from '@/storage/database/shared/schema';
import type { AgentKnowledgeDocument, AgentKnowledgeBase } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';

interface SearchResult extends AgentKnowledgeDocument {
  relevanceScore: number;
}

/**
 * @route GET /api/knowledge-bases/search
 * @description 搜索知识库内容
 * @query q - 搜索关键词
 * @query knowledgeBaseId - 可选，限定在特定知识库中搜索
 * @query fileType - 可选，文件类型过滤
 * @query page - 页码
 * @query pageSize - 每页数量
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const knowledgeBaseId = searchParams.get('knowledgeBaseId');
    const fileType = searchParams.get('fileType');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!query) {
      return NextResponse.json(
        { error: '缺少搜索关键词' },
        { status: 400 }
      );
    }

    // 构建查询条件
    const conditions = [eq(agentKnowledgeDocuments.status, 'completed')];
    
    if (knowledgeBaseId) {
      conditions.push(eq(agentKnowledgeDocuments.knowledgeBaseId, knowledgeBaseId));
    }
    
    if (fileType) {
      conditions.push(eq(agentKnowledgeDocuments.fileType, fileType));
    }

    // 执行搜索
    const allDocuments = await db
      .select()
      .from(agentKnowledgeDocuments)
      .where(and(...conditions));

    // 简单的关键词搜索
    const keywords = query.toLowerCase().split(/\s+/).filter((k: string) => k.length > 1);
    
    const searchResults: SearchResult[] = allDocuments
      .map((doc: typeof agentKnowledgeDocuments.$inferSelect) => {
        const content = (doc.content || '').toLowerCase();
        const fileName = (doc.fileName || '').toLowerCase();
        
        let relevanceScore = 0;
        keywords.forEach((keyword: string) => {
          // 文件名匹配权重更高
          const fileNameMatches = (fileName.match(new RegExp(keyword, 'g')) || []).length;
          const contentMatches = (content.match(new RegExp(keyword, 'g')) || []).length;
          
          relevanceScore += fileNameMatches * 0.5 + contentMatches * 0.1;
        });
        
        return {
          ...doc,
          relevanceScore: Math.min(relevanceScore, 10),
        };
      })
      .filter((doc: SearchResult) => doc.relevanceScore > 0)
      .sort((a: SearchResult, b: SearchResult) => b.relevanceScore - a.relevanceScore);

    // 分页
    const total = searchResults.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedResults = searchResults.slice(offset, offset + pageSize);

    // 获取知识库名称映射
    const knowledgeBases = await db.select().from(agentKnowledgeBases);
    const kbMap = new Map(knowledgeBases.map((kb: typeof agentKnowledgeBases.$inferSelect) => [kb.id, kb.name]));

    return NextResponse.json({
      success: true,
      data: {
        query,
        total,
        page,
        pageSize,
        totalPages,
        results: paginatedResults.map((doc: SearchResult) => ({
          id: doc.id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          knowledgeBaseId: doc.knowledgeBaseId,
          knowledgeBaseName: kbMap.get(doc.knowledgeBaseId) || '未知知识库',
          filePath: doc.filePath,
          snippet: (doc.content || '').substring(0, 300),
          relevanceScore: doc.relevanceScore,
          createdAt: doc.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('搜索知识库失败:', error);
    return NextResponse.json(
      { error: '搜索失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
