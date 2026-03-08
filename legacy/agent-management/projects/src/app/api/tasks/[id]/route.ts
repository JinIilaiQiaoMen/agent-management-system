import { NextRequest, NextResponse } from "next/server";
import { taskManager } from "@/storage/database";

/**
 * GET /api/tasks/[id] - 获取任务详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await taskManager.getTaskById(id);

    if (!task) {
      return NextResponse.json(
        { error: "任务不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error: any) {
    console.error("Failed to get task:", error);
    return NextResponse.json(
      {
        error: "获取任务失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id] - 更新任务信息
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 支持更新的字段
    const allowedUpdates = ["priority", "status", "assignedAgentId", "title", "description", "metadata"];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "没有提供有效的更新字段" },
        { status: 400 }
      );
    }

    // 更新任务
    const updatedTask = await taskManager.updateTask(id, updates);

    if (!updatedTask) {
      return NextResponse.json(
        { error: "任务不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      {
        error: "更新任务失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id] - 删除任务
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查任务是否存在
    const task = await taskManager.getTaskById(id);
    if (!task) {
      return NextResponse.json(
        { error: "任务不存在" },
        { status: 404 }
      );
    }

    // 删除任务
    const success = await taskManager.deleteTask(id);

    if (!success) {
      return NextResponse.json(
        { error: "删除任务失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "任务删除成功"
    });
  } catch (error: any) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      {
        error: "删除任务失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
