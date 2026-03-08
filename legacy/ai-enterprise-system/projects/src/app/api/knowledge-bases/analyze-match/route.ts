import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentKnowledgeBases, agentKnowledgeDocuments } from '@/storage/database/shared/schema';
import { eq, inArray, and } from 'drizzle-orm';

interface DocumentMatch {
  document: typeof agentKnowledgeDocuments.$inferSelect;
  score: number;
}

/**
 * @route POST /api/knowledge-bases/analyze-match
 * @description 分析查询与知识库的匹配度
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, knowledgeBaseIds, topK = 5, minScore = 0.5 } = body as {
      query: string;
      knowledgeBaseIds?: string[];
      topK?: number;
      minScore?: number;
    };

    if (!query) {
      return NextResponse.json(
        { error: '缺少必要参数：query' },
        { status: 400 }
      );
    }

    let targetKBs = knowledgeBaseIds;

    // 如果没有指定知识库，获取所有启用的知识库
    if (!targetKBs || targetKBs.length === 0) {
      const allKBs = await db
        .select()
        .from(agentKnowledgeBases)
        .where(eq(agentKnowledgeBases.isActive, true));

      targetKBs = allKBs.map((kb: typeof agentKnowledgeBases.$inferSelect) => kb.id);
    }

    // 获取知识库文档
    const documents = await db
      .select()
      .from(agentKnowledgeDocuments)
      .where(eq(agentKnowledgeDocuments.status, 'completed'));

    // 简单的关键词匹配算法（实际应用中应使用向量相似度搜索）
    const queryKeywords = query.toLowerCase().split(/\s+/).filter((k: string) => k.length > 1);
    
    // 确保targetKBs不为undefined
    const kbIds = targetKBs || [];
    
    const matches: DocumentMatch[] = documents
      .filter((doc: typeof agentKnowledgeDocuments.$inferSelect) => kbIds.includes(doc.knowledgeBaseId))
      .map((doc: typeof agentKnowledgeDocuments.$inferSelect) => {
        const content = (doc.content || '').toLowerCase();
        const fileName = (doc.fileName || '').toLowerCase();
        
        // 计算匹配分数
        let score = 0;
        queryKeywords.forEach((keyword: string) => {
          if (content.includes(keyword)) score += 0.3;
          if (fileName.includes(keyword)) score += 0.5;
        });
        
        return {
          document: doc,
          score: Math.min(score, 1.0),
        };
      })
      .filter((match: DocumentMatch) => match.score >= minScore)
      .sort((a: DocumentMatch, b: DocumentMatch) => b.score - a.score)
      .slice(0, topK);

    return NextResponse.json({
      success: true,
      data: {
        query,
        totalMatches: matches.length,
        matches: matches.map((m: DocumentMatch) => ({
          documentId: m.document.id,
          fileName: m.document.fileName,
          fileType: m.document.fileType,
          knowledgeBaseId: m.document.knowledgeBaseId,
          score: m.score,
          snippet: (m.document.content || '').substring(0, 200) + '...',
        })),
      },
      message: `找到 ${matches.length} 个匹配结果`,
    });
  } catch (error) {
    console.error('分析匹配失败:', error);
    return NextResponse.json(
      { error: '分析匹配失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
