import { NextRequest, NextResponse } from "next/server";
import { conversationSessionManager, knowledgeBaseManager } from "@/storage/database";

// POST: 保存对话会话
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, agentId, taskId, content, savedBy, knowledgeBaseId, tags, metadata } = body;

    // 验证必填字段
    if (!title || !agentId || !content || !savedBy) {
      return NextResponse.json(
        { error: "缺少必填字段: title, agentId, content, savedBy" },
        { status: 400 }
      );
    }

    // 保存对话会话
    const session = await conversationSessionManager.createConversationSession({
      title,
      agentId,
      taskId: taskId || null,
      content,
      savedBy,
      knowledgeBaseId: knowledgeBaseId || null,
      tags: tags || null,
      metadata: metadata || null,
    });

    // 如果指定了知识库ID，更新知识库的文档计数和修改人
    if (knowledgeBaseId) {
      const kb = await knowledgeBaseManager.getKnowledgeBaseById(knowledgeBaseId);
      if (kb) {
        await knowledgeBaseManager.updateKnowledgeBase(knowledgeBaseId, {
          documentCount: kb.documentCount + 1,
          modifiedBy: savedBy,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("保存对话会话失败:", error);
    return NextResponse.json(
      { error: "保存对话会话失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET: 获取对话会话列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get("agentId");
    const knowledgeBaseId = searchParams.get("knowledgeBaseId");

    let sessions;
    if (knowledgeBaseId) {
      sessions = await conversationSessionManager.getConversationSessionsByKnowledgeBaseId(
        knowledgeBaseId
      );
    } else if (agentId) {
      sessions = await conversationSessionManager.getConversationSessionsByAgentId(agentId);
    } else {
      sessions = await conversationSessionManager.getAllConversationSessions();
    }

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("获取对话会话列表失败:", error);
    return NextResponse.json(
      { error: "获取对话会话列表失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE: 删除对话会话
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少会话ID" },
        { status: 400 }
      );
    }

    // 获取会话信息以便更新知识库计数
    const session = await conversationSessionManager.getConversationSessionById(id);
    
    // 删除会话
    await conversationSessionManager.deleteConversationSession(id);

    // 如果会话关联了知识库，更新知识库的文档计数
    if (session?.knowledgeBaseId) {
      const kb = await knowledgeBaseManager.getKnowledgeBaseById(session.knowledgeBaseId);
      if (kb && kb.documentCount > 0) {
        await knowledgeBaseManager.updateKnowledgeBase(session.knowledgeBaseId, {
          documentCount: kb.documentCount - 1,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除对话会话失败:", error);
    return NextResponse.json(
      { error: "删除对话会话失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
