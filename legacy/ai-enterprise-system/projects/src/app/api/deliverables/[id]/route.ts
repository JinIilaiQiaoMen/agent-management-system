import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * @route GET /api/deliverables/[id]
 * @description 获取成果详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deliverable] = await db
      .select()
      .from(agentTaskDeliverables)
      .where(eq(agentTaskDeliverables.id, id))
      .limit(1);

    if (!deliverable) {
      return NextResponse.json(
        { error: '成果不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deliverable,
    });
  } catch (error) {
    console.error('获取成果详情失败:', error);
    return NextResponse.json(
      { error: '获取成果详情失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @route PUT /api/deliverables/[id]
 * @description 更新成果
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, status, metadata } = body;

    // 检查成果是否存在
    const [existingDeliverable] = await db
      .select()
      .from(agentTaskDeliverables)
      .where(eq(agentTaskDeliverables.id, id))
      .limit(1);

    if (!existingDeliverable) {
      return NextResponse.json(
        { error: '成果不存在' },
        { status: 404 }
      );
    }

    // 更新成果
    const [updatedDeliverable] = await db
      .update(agentTaskDeliverables)
      .set({
        content: content ?? existingDeliverable.content,
        status: status ?? existingDeliverable.status,
        metadata: metadata ?? existingDeliverable.metadata,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(agentTaskDeliverables.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedDeliverable,
      message: '成果更新成功',
    });
  } catch (error) {
    console.error('更新成果失败:', error);
    return NextResponse.json(
      { error: '更新成果失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @route DELETE /api/deliverables/[id]
 * @description 删除成果
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查成果是否存在
    const [existingDeliverable] = await db
      .select()
      .from(agentTaskDeliverables)
      .where(eq(agentTaskDeliverables.id, id))
      .limit(1);

    if (!existingDeliverable) {
      return NextResponse.json(
        { error: '成果不存在' },
        { status: 404 }
      );
    }

    // 删除成果
    await db
      .delete(agentTaskDeliverables)
      .where(eq(agentTaskDeliverables.id, id));

    return NextResponse.json({
      success: true,
      message: '成果删除成功',
    });
  } catch (error) {
    console.error('删除成果失败:', error);
    return NextResponse.json(
      { error: '删除成果失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
