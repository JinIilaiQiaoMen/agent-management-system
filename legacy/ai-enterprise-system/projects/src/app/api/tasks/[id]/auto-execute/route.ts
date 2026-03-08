import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentTasks, agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route POST /api/tasks/[id]/auto-execute
 * @description 自动执行任务（AI自动完成）
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
    const { autoAssignAgent = true, executionMode = 'standard' } = body as {
      autoAssignAgent?: boolean;
      executionMode?: string;
    };

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

    // 更新任务状态为执行中，将执行信息存入metadata
    const currentMetadata = (existingTask.metadata as Record<string, unknown>) || {};
    const [updatedTask] = await db
      .update(agentTasks)
      .set({
        status: 'in_progress',
        metadata: {
          ...currentMetadata,
          startedAt: new Date().toISOString(),
          executionMode,
          autoAssignAgent,
          trigger: 'manual_auto_execute',
        },
      })
      .where(eq(agentTasks.id, id))
      .returning();

    // 创建执行记录
    const executionId = uuidv4();
    await db.insert(agentTaskDeliverables).values({
      id: executionId,
      taskId: id,
      agentId: existingTask.assignedAgentId || 'system',
      title: '自动执行记录',
      type: 'execution',
      content: JSON.stringify({
        executionMode,
        autoAssignAgent,
        startedAt: new Date().toISOString(),
        trigger: 'manual_auto_execute',
      }),
      status: 'in_progress',
      version: 1,
      metadata: null,
    });

    // 模拟自动执行流程
    // 在实际应用中，这里应该调用AI服务来执行任务
    const executionResult = {
      taskId: id,
      status: 'in_progress',
      executionId,
      message: '任务已开始自动执行',
      estimatedDuration: '2-5分钟',
      progress: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        execution: executionResult,
      },
      message: '任务自动执行已启动',
    });
  } catch (error) {
    console.error('自动执行任务失败:', error);
    return NextResponse.json(
      { error: '自动执行任务失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
