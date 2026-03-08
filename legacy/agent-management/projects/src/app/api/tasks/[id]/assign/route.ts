import { NextRequest, NextResponse } from "next/server";
import { taskManager } from "@/storage/database";

/**
 * POST /api/tasks/[id]/assign - 分配任务给智能体
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json({ error: "缺少智能体ID" }, { status: 400 });
    }

    const task = await taskManager.assignTask(id, agentId);

    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to assign task:", error);
    return NextResponse.json({ error: "分配任务失败" }, { status: 500 });
  }
}
