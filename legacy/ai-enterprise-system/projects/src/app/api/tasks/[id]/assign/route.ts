import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentTasks, agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route POST /api/tasks/[id]/assign
 * @description 分配任务给指定智能体
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentId, assignedBy, requirements, deadline } = body;

    if (!agentId || !assignedBy) {
      return NextResponse.json(
        { error: '缺少必要参数：agentId 或 assignedBy' },
        { status: 400 }
      );
    }

    // 检查任务是否存在
    const existingTask = await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.id, id))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    // 更新任务分配信息
    const [updatedTask] = await db
      .update(agentTasks)
      .set({
        assignedAgentId: agentId,
        status: 'assigned',
      })
      .where(eq(agentTasks.id, id))
      .returning();

    // 创建任务交付物记录
    const deliverableId = uuidv4();
    await db.insert(agentTaskDeliverables).values({
      id: deliverableId,
      taskId: id,
      agentId: agentId,
      title: '任务分配记录',
      type: 'assignment',
      content: JSON.stringify({
        requirements: requirements || '',
        deadline: deadline || null,
        assignedAt: new Date().toISOString(),
      }),
      status: 'pending',
      version: 1,
      metadata: null,
    });

    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        deliverableId,
      },
      message: '任务分配成功',
    });
  } catch (error) {
    console.error('分配任务失败:', error);
    return NextResponse.json(
      { error: '分配任务失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
