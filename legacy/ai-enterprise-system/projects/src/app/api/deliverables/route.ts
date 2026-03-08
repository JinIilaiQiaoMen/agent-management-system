import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route GET /api/deliverables
 * @description 获取成果列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 构建查询条件
    const conditions = [];
    if (taskId) {
      conditions.push(eq(agentTaskDeliverables.taskId, taskId));
    }
    if (agentId) {
      conditions.push(eq(agentTaskDeliverables.agentId, agentId));
    }
    if (type) {
      conditions.push(eq(agentTaskDeliverables.type, type));
    }
    if (status) {
      conditions.push(eq(agentTaskDeliverables.status, status));
    }

    // 获取成果列表
    const allDeliverables = await db
      .select()
      .from(agentTaskDeliverables)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(agentTaskDeliverables.createdAt));

    // 分页
    const total = allDeliverables.length;
    const offset = (page - 1) * pageSize;
    const paginatedDeliverables = allDeliverables.slice(offset, offset + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        deliverables: paginatedDeliverables,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取成果列表失败:', error);
    return NextResponse.json(
      { error: '获取成果列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/deliverables
 * @description 创建新成果
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      taskId, 
      agentId, 
      title,
      type, 
      content,
      filePath,
      fileName,
      fileSize,
      fileType,
      status,
      metadata 
    } = body;

    if (!taskId || !agentId || !type) {
      return NextResponse.json(
        { error: '缺少必要参数：taskId, agentId 或 type' },
        { status: 400 }
      );
    }

    // 创建成果
    const deliverableId = uuidv4();
    const [newDeliverable] = await db
      .insert(agentTaskDeliverables)
      .values({
        id: deliverableId,
        taskId,
        agentId,
        title: title || '未命名成果',
        type,
        content: content || null,
        filePath: filePath || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileType: fileType || null,
        status: status || 'pending',
        version: 1,
        metadata: metadata || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newDeliverable,
      message: '成果创建成功',
    });
  } catch (error) {
    console.error('创建成果失败:', error);
    return NextResponse.json(
      { error: '创建成果失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
