import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentTasks, agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route POST /api/tasks/[id]/complete
 * @description 标记任务完成
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
    const { 
      completedBy, 
      deliverables, 
      summary, 
      qualityScore,
      notes 
    } = body as {
      completedBy?: string;
      deliverables?: unknown[];
      summary?: string;
      qualityScore?: number;
      notes?: string;
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

    // 更新任务状态为已完成
    const [updatedTask] = await db
      .update(agentTasks)
      .set({
        status: 'completed',
        completedAt: new Date().toISOString(),
      })
      .where(eq(agentTasks.id, id))
      .returning();

    // 创建完成交付物记录
    const deliverableId = uuidv4();
    await db.insert(agentTaskDeliverables).values({
      id: deliverableId,
      taskId: id,
      agentId: existingTask.assignedAgentId || 'unknown',
      title: '任务完成记录',
      type: 'completion',
      content: JSON.stringify({
        deliverables: deliverables || [],
        summary: summary || '',
        qualityScore: qualityScore || null,
        notes: notes || '',
        completedAt: new Date().toISOString(),
        completedBy: completedBy || 'system',
      }),
      status: 'completed',
      version: 1,
      metadata: null,
    });

    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        deliverableId,
      },
      message: '任务已标记为完成',
    });
  } catch (error) {
    console.error('完成任务失败:', error);
    return NextResponse.json(
      { error: '完成任务失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
