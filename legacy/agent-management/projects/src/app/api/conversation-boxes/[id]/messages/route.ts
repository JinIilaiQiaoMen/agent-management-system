import { NextRequest, NextResponse } from "next/server";
import { conversationBoxManager } from "@/storage/database";

/**
 * GET /api/conversation-boxes/[id]/messages - 获取盒子消息列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boxId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const messages = await conversationBoxManager.getBoxMessages(boxId, limit);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Failed to get box messages:", error);
    return NextResponse.json({ 
      error: "获取消息列表失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * POST /api/conversation-boxes/[id]/messages - 发送消息到盒子
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boxId } = await params;

  try {
    const body = await request.json();
    const { content, senderType = "user", senderAgentId, replyToId, metadata } = body;

    if (!content) {
      return NextResponse.json({ 
        error: "content 不能为空" 
      }, { status: 400 });
    }

    if (senderType === "agent" && !senderAgentId) {
      return NextResponse.json({ 
        error: "智能体发送消息必须提供 senderAgentId" 
      }, { status: 400 });
    }

    const message = await conversationBoxManager.sendMessageToBox({
      boxId,
      content,
      senderType,
      senderAgentId,
      replyToId,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: message,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to send message to box:", error);
    return NextResponse.json({ 
      error: "发送消息失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
