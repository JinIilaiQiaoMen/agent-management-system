import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agentTasks, agentTaskDeliverables } from "@/storage/database/shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/tasks/[id] - 获取任务详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [task] = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.id, id))
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "任务不存在" },
        { status: 404 }
      );
    }

    // 获取任务相关的成果
    const deliverables = await db
      .select()
      .from(agentTaskDeliverables)
      .where(eq(agentTaskDeliverables.taskId, id));

    return NextResponse.json({
      ...task,
      deliverables,
    });
  } catch (error: unknown) {
    console.error("Failed to get task:", error);
    return NextResponse.json(
      {
        error: "获取任务失败",
        details: error instanceof Error ? error.message : String(error),
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
    const updates: Record<string, unknown> = {};

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

    // 如果状态变为completed，设置完成时间
    if (body.status === "completed") {
      updates["completedAt"] = new Date().toISOString();
    }

    // 更新任务
    const [updatedTask] = await db
      .update(agentTasks)
      .set(updates)
      .where(eq(agentTasks.id, id))
      .returning();

    if (!updatedTask) {
      return NextResponse.json(
        { error: "任务不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error: unknown) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      {
        error: "更新任务失败",
        details: error instanceof Error ? error.message : String(error),
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
    const [task] = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.id, id))
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "任务不存在" },
        { status: 404 }
      );
    }

    // 删除任务（级联删除会自动删除相关成果）
    await db.delete(agentTasks).where(eq(agentTasks.id, id));

    return NextResponse.json({
      success: true,
      message: "任务删除成功"
    });
  } catch (error: unknown) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      {
        error: "删除任务失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
