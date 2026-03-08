import { NextRequest, NextResponse } from "next/server";
import { taskManager } from "@/storage/database";

/**
 * POST /api/tasks/[id]/complete - 完成任务
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await taskManager.completeTask(id);

    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to complete task:", error);
    return NextResponse.json({ error: "完成任务失败" }, { status: 500 });
  }
}
