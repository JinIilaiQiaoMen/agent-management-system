import { NextRequest, NextResponse } from "next/server";
import { agentManager } from "@/storage/database";

/**
 * GET /api/agents/[id] - 获取单个智能体
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await agentManager.getAgentById(id);

    if (!agent) {
      return NextResponse.json({ error: "智能体不存在" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Failed to get agent:", error);
    return NextResponse.json({ error: "获取智能体失败" }, { status: 500 });
  }
}

/**
 * PUT /api/agents/[id] - 更新智能体
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const agent = await agentManager.updateAgent(id, body);

    if (!agent) {
      return NextResponse.json({ error: "智能体不存在" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Failed to update agent:", error);
    return NextResponse.json({ error: "更新智能体失败" }, { status: 500 });
  }
}

/**
 * DELETE /api/agents/[id] - 删除智能体
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await agentManager.deleteAgent(id);

    if (!success) {
      return NextResponse.json({ error: "智能体不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete agent:", error);
    return NextResponse.json({ error: "删除智能体失败" }, { status: 500 });
  }
}
