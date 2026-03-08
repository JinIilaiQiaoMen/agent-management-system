import { NextRequest, NextResponse } from "next/server";
import { knowledgeBaseManager } from "@/storage/database";

/**
 * GET /api/knowledge-bases - 获取所有知识库
 */
export async function GET() {
  try {
    const knowledgeBases = await knowledgeBaseManager.getKnowledgeBases();
    return NextResponse.json(knowledgeBases);
  } catch (error) {
    console.error("Failed to get knowledge bases:", error);
    return NextResponse.json({ error: "获取知识库列表失败" }, { status: 500 });
  }
}

/**
 * POST /api/knowledge-bases - 创建知识库
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const kb = await knowledgeBaseManager.createKnowledgeBase(body);
    return NextResponse.json(kb, { status: 201 });
  } catch (error) {
    console.error("Failed to create knowledge base:", error);
    return NextResponse.json({ error: "创建知识库失败" }, { status: 500 });
  }
}
