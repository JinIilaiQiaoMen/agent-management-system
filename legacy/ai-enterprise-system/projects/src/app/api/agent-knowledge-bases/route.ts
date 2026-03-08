/**
 * 智能体知识库 API
 * GET - 获取所有知识库
 * POST - 创建知识库
 */

import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBaseManager } from '@/lib/agent-system';

export async function GET() {
  try {
    const knowledgeBases = await knowledgeBaseManager.getAllKnowledgeBases();
    return NextResponse.json({ success: true, data: knowledgeBases });
  } catch (error) {
    console.error('Failed to get knowledge bases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get knowledge bases', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const knowledgeBase = await knowledgeBaseManager.createKnowledgeBase({
      name: body.name,
      type: body.type || 'common',
      agentId: body.agentId || null,
      description: body.description || null,
      isActive: body.isActive ?? true,
      modifiedBy: body.modifiedBy || 'CEO',
    });
    
    return NextResponse.json({ success: true, data: knowledgeBase });
  } catch (error) {
    console.error('Failed to create knowledge base:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge base', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
