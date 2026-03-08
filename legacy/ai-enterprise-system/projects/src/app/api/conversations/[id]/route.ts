import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentConversations } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * @route GET /api/conversations/[id]
 * @description 获取对话详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [conversation] = await db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.id, id))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('获取对话详情失败:', error);
    return NextResponse.json(
      { error: '获取对话详情失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @route PUT /api/conversations/[id]
 * @description 更新对话
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { agentResponse, modelUsed, metadata } = body;

    // 检查对话是否存在
    const [existingConversation] = await db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.id, id))
      .limit(1);

    if (!existingConversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      );
    }

    // 更新对话
    const [updatedConversation] = await db
      .update(agentConversations)
      .set({
        agentResponse: agentResponse ?? existingConversation.agentResponse,
        modelUsed: modelUsed ?? existingConversation.modelUsed,
        metadata: metadata ?? existingConversation.metadata,
      })
      .where(eq(agentConversations.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedConversation,
      message: '对话更新成功',
    });
  } catch (error) {
    console.error('更新对话失败:', error);
    return NextResponse.json(
      { error: '更新对话失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @route DELETE /api/conversations/[id]
 * @description 删除对话
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查对话是否存在
    const [existingConversation] = await db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.id, id))
      .limit(1);

    if (!existingConversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      );
    }

    // 删除对话
    await db
      .delete(agentConversations)
      .where(eq(agentConversations.id, id));

    return NextResponse.json({
      success: true,
      message: '对话删除成功',
    });
  } catch (error) {
    console.error('删除对话失败:', error);
    return NextResponse.json(
      { error: '删除对话失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
