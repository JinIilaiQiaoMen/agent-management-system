import { NextRequest, NextResponse } from "next/server";
import { conversationBoxManager } from "@/storage/database";

/**
 * GET /api/conversation-boxes/[id] - 获取对话盒子详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const boxDetail = await conversationBoxManager.getConversationBoxDetail(id);

    if (!boxDetail) {
      return NextResponse.json({ error: "对话盒子不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: boxDetail,
    });
  } catch (error) {
    console.error("Failed to get conversation box:", error);
    return NextResponse.json({ 
      error: "获取对话盒子失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * PUT /api/conversation-boxes/[id] - 更新对话盒子
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    const updatedBox = await conversationBoxManager.updateConversationBox(id, body);

    if (!updatedBox) {
      return NextResponse.json({ error: "对话盒子不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedBox,
    });
  } catch (error) {
    console.error("Failed to update conversation box:", error);
    return NextResponse.json({ 
      error: "更新对话盒子失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * DELETE /api/conversation-boxes/[id] - 删除对话盒子
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const deleted = await conversationBoxManager.deleteConversationBox(id);

    if (!deleted) {
      return NextResponse.json({ error: "对话盒子不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "对话盒子已删除",
    });
  } catch (error) {
    console.error("Failed to delete conversation box:", error);
    return NextResponse.json({ 
      error: "删除对话盒子失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
