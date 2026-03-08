import { NextRequest, NextResponse } from "next/server";
import { conversationBoxManager } from "@/storage/database";

/**
 * GET /api/conversation-boxes - 获取对话盒子列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId") || undefined;
    const createdBy = searchParams.get("createdBy") || undefined;
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const boxes = await conversationBoxManager.getConversationBoxes({
      skip,
      limit,
      filters: {
        taskId,
        createdBy,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      data: boxes,
    });
  } catch (error) {
    console.error("Failed to get conversation boxes:", error);
    return NextResponse.json({ 
      error: "获取对话盒子列表失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * POST /api/conversation-boxes - 创建对话盒子
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.title || !body.createdBy) {
      return NextResponse.json({ 
        error: "缺少必填字段: title, createdBy" 
      }, { status: 400 });
    }

    // 创建对话盒子
    const box = await conversationBoxManager.createConversationBox(body);

    // 如果有初始智能体列表，添加智能体
    if (body.agentIds && Array.isArray(body.agentIds) && body.agentIds.length > 0) {
      await conversationBoxManager.addAgentsToBox(
        box.id,
        body.agentIds,
        body.role || "participant"
      );
    }

    // 返回完整的盒子信息（包含智能体）
    const boxDetail = await conversationBoxManager.getConversationBoxDetail(box.id);

    return NextResponse.json({
      success: true,
      data: boxDetail,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation box:", error);
    return NextResponse.json({ 
      error: "创建对话盒子失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
