import { NextRequest, NextResponse } from "next/server";
import { conversationBoxManager } from "@/storage/database";

/**
 * GET /api/conversation-boxes/[id]/agents - 获取盒子中的智能体列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boxId } = await params;

  try {
    const agents = await conversationBoxManager.getBoxAgents(boxId);

    return NextResponse.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error("Failed to get box agents:", error);
    return NextResponse.json({ 
      error: "获取智能体列表失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * POST /api/conversation-boxes/[id]/agents - 添加智能体到盒子
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boxId } = await params;

  try {
    const body = await request.json();
    const { agentIds, role = "participant" } = body;

    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json({ 
        error: "agentIds 必须是非空数组" 
      }, { status: 400 });
    }

    const addedAgents = await conversationBoxManager.addAgentsToBox(boxId, agentIds, role);

    return NextResponse.json({
      success: true,
      data: addedAgents,
      message: `成功添加 ${addedAgents.length} 个智能体`,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to add agents to box:", error);
    return NextResponse.json({ 
      error: "添加智能体失败",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
