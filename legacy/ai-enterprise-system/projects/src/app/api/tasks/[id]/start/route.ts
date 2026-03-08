import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentTasks } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * @route POST /api/tasks/[id]/start
 * @description 开始执行任务
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 尝试解析请求体，如果为空则使用默认值
    let body = {};
    try {
      body = await request.json();
    } catch {
      // 请求体为空，使用默认值
    }
    const { startedBy, executionNotes } = body as { startedBy?: string; executionNotes?: string };

    // 检查任务是否存在
    const [existingTask] = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.id, id))
      .limit(1);

    if (!existingTask) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    // 检查任务状态是否可以开始
    if (existingTask.status === 'completed') {
      return NextResponse.json(
        { error: '任务已完成，无法重新开始' },
        { status: 400 }
      );
    }

    if (existingTask.status === 'cancelled') {
      return NextResponse.json(
        { error: '任务已取消，无法开始' },
        { status: 400 }
      );
    }

    // 更新任务状态为进行中，将开始时间存入metadata
    const currentMetadata = (existingTask.metadata as Record<string, unknown>) || {};
    const [updatedTask] = await db
      .update(agentTasks)
      .set({
        status: 'in_progress',
        metadata: {
          ...currentMetadata,
          startedAt: new Date().toISOString(),
          startedBy: startedBy || null,
          executionNotes: executionNotes || null,
        },
      })
      .where(eq(agentTasks.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        startedAt: (updatedTask.metadata as Record<string, unknown>)?.startedAt || null,
        startedBy: startedBy || null,
        executionNotes: executionNotes || null,
      },
      message: '任务已开始执行',
    });
  } catch (error) {
    console.error('开始任务失败:', error);
    return NextResponse.json(
      { error: '开始任务失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
