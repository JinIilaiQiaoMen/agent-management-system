import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentConversations, agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route GET /api/conversations
 * @description 获取对话列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const taskId = searchParams.get('taskId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 构建查询条件
    const conditions = [];
    if (agentId) {
      conditions.push(eq(agentConversations.agentId, agentId));
    }
    if (taskId) {
      conditions.push(eq(agentConversations.taskId, taskId));
    }

    // 获取对话列表
    const allConversations = await db
      .select()
      .from(agentConversations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(agentConversations.createdAt));

    // 分页
    const total = allConversations.length;
    const offset = (page - 1) * pageSize;
    const paginatedConversations = allConversations.slice(offset, offset + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        conversations: paginatedConversations,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取对话列表失败:', error);
    return NextResponse.json(
      { error: '获取对话列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/conversations
 * @description 创建新对话
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      agentId, 
      taskId, 
      initialMessage,
      metadata
    } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: '缺少必要参数：agentId' },
        { status: 400 }
      );
    }

    // 创建对话记录
    const conversationId = uuidv4();
    const [newConversation] = await db
      .insert(agentConversations)
      .values({
        id: conversationId,
        agentId,
        taskId: taskId || null,
        userMessage: initialMessage || '',
        agentResponse: null,
        modelUsed: null,
        metadata: metadata || null,
      })
      .returning();

    // 如果有初始消息且关联任务，创建任务交付物记录
    if (initialMessage && taskId) {
      await db.insert(agentTaskDeliverables).values({
        id: uuidv4(),
        taskId,
        agentId,
        title: '对话记录',
        type: 'conversation',
        content: JSON.stringify({
          conversationId,
          message: initialMessage,
          type: 'initial',
        }),
        status: 'pending',
        version: 1,
        metadata: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: newConversation,
      message: '对话创建成功',
    });
  } catch (error) {
    console.error('创建对话失败:', error);
    return NextResponse.json(
      { error: '创建对话失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
