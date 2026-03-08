import { NextRequest, NextResponse } from "next/server";
import { conversationBoxManager } from "@/storage/database";

/**
 * DELETE /api/conversation-boxes/[id]/agents/[agentId] - 从盒子移除智能体
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; agentId: string }> }
) {
  const { id: boxId, agentId } = await params;

  try {
    const removed = await conversationBoxManager.removeAgentFromBox(boxId, agentId);

    if (!removed) {
      return NextResponse.json({ 
        error: "智能体不存在或未在该盒子中" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "智能体已移除",
    });
  } catch (error) {
    console.error("Failed to remove agent from box:", error);
    return NextResponse.json({ 
      error: "移除智能体失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
