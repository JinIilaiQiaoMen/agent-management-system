import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentConversations, agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route GET /api/conversations/[id]/messages
 * @description 获取对话消息列表
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

    // 将对话转换为消息格式
    const messages = [];
    if (conversation.userMessage) {
      messages.push({
        id: `${conversation.id}-user`,
        role: 'user',
        content: conversation.userMessage,
        timestamp: conversation.createdAt,
      });
    }
    if (conversation.agentResponse) {
      messages.push({
        id: `${conversation.id}-assistant`,
        role: 'assistant',
        content: conversation.agentResponse,
        timestamp: conversation.createdAt,
        modelUsed: conversation.modelUsed,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        messages,
        total: messages.length,
        conversationId: id,
      },
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    return NextResponse.json(
      { error: '获取消息列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/conversations/[id]/messages
 * @description 添加消息到对话（发送新消息并获取AI响应）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, metadata } = body;

    if (!content) {
      return NextResponse.json(
        { error: '缺少必要参数：content' },
        { status: 400 }
      );
    }

    // 获取对话
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

    // 创建新消息记录（实际上是追加到现有对话）
    const newMessageId = uuidv4();
    
    // 更新对话的用户消息
    const [updatedConversation] = await db
      .update(agentConversations)
      .set({
        userMessage: content,
        metadata: {
          ...(conversation.metadata as Record<string, unknown> || {}),
          lastMessageAt: new Date().toISOString(),
          messageCount: ((conversation.metadata as Record<string, unknown>)?.messageCount as number || 0) + 1,
        },
      })
      .where(eq(agentConversations.id, id))
      .returning();

    // 如果关联了任务，创建交付物记录
    if (conversation.taskId) {
      await db.insert(agentTaskDeliverables).values({
        id: uuidv4(),
        taskId: conversation.taskId,
        agentId: conversation.agentId,
        title: '对话消息',
        type: 'message',
        content: JSON.stringify({
          conversationId: id,
          messageId: newMessageId,
          role: 'user',
          content: content.substring(0, 500), // 截断保存
        }),
        status: 'completed',
        version: 1,
        metadata: metadata || null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: {
          id: newMessageId,
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        },
        conversation: updatedConversation,
      },
      message: '消息添加成功',
    });
  } catch (error) {
    console.error('添加消息失败:', error);
    return NextResponse.json(
      { error: '添加消息失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
