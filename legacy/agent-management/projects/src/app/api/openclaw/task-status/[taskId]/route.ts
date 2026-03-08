import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import * as schema from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

// GET - 查询任务状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const db = await getDb(schema);

    // 验证 API Key
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json(
        { error: '缺少 API Key' },
        { status: 401 }
      );
    }

    // 获取 OpenClaw 配置
    const configs = await db.query.openclawConfigs.findMany({
      limit: 1,
    });

    if (configs.length === 0 || configs[0].apiKey !== apiKey) {
      return NextResponse.json(
        { error: '无效的 API Key' },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    // 查询任务
    const task = await db.query.tasks.findFirst({
      where: eq(schema.tasks.id, taskId),
    });

    if (!task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    // 查询任务结果
    const results = await db.query.taskDeliverables.findMany({
      where: eq(schema.taskDeliverables.taskId, taskId),
      orderBy: (taskDeliverables, { desc }) => desc(taskDeliverables.createdAt),
      limit: 10,
    });

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedAgentId: task.assignedAgentId,
        createdBy: task.createdBy,
        metadata: task.metadata,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        results: results.map(r => ({
          id: r.id,
          agentId: r.agentId,
          title: r.title,
          type: r.type,
          content: r.content,
          status: r.status,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('查询任务状态失败:', error);
    return NextResponse.json(
      { error: '查询任务状态失败' },
      { status: 500 }
    );
  }
}
