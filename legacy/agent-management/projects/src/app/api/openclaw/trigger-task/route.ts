import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import * as schema from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';

interface TriggerTaskRequest {
  taskId?: string;
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  assigneeIds: string[];
  dueDate?: string;
  autoExecute?: boolean;
}

// POST - 触发任务执行
export async function POST(request: NextRequest) {
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

    const config = configs[0];

    // 检查是否允许自动触发
    if (!config.autoTrigger) {
      return NextResponse.json(
        { error: '自动触发未启用' },
        { status: 403 }
      );
    }

    const body: TriggerTaskRequest = await request.json();
    const {
      taskId,
      title,
      description,
      priority = 'medium',
      assigneeIds,
      dueDate,
      autoExecute = false,
    } = body;

    // 验证必需字段
    if (!title || !description || !assigneeIds || assigneeIds.length === 0) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 验证智能体是否存在
    const validAssignees = await db.query.agents.findMany({
      where: (agents, { inArray }) => inArray(agents.id, assigneeIds),
    });

    if (validAssignees.length === 0) {
      return NextResponse.json(
        { error: '无效的智能体 ID' },
        { status: 400 }
      );
    }

    // 获取负责人智能体（优先选择 leader 角色的智能体）
    const leaderAgent = validAssignees.find(a => a.role === 'leader');
    const specialistAgents = validAssignees.filter(a => a.role !== 'leader');

    if (!leaderAgent && specialistAgents.length === 0) {
      return NextResponse.json(
        { error: '至少需要一个有效的智能体' },
        { status: 400 }
      );
    }

    // 创建任务
    const newTaskId = taskId || crypto.randomUUID();
    const [task] = await db
      .insert(schema.tasks)
      .values({
        id: newTaskId,
        title,
        description,
        priority,
        status: 'pending',
        assignedAgentId: leaderAgent?.id,
        createdBy: 'openclaw',
        metadata: {
          source: 'openclaw',
          autoExecute,
        },
      })
      .returning();

    // 通知 OpenClaw 任务已创建
    if (config.notifyOnStart) {
      await notifyOpenClaw(config.webhookUrl, config.apiKey, {
        event: 'task.created',
        taskId: task.id,
        status: 'pending',
        message: '任务已创建，等待执行',
        timestamp: new Date().toISOString(),
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          assignees: validAssignees.map(a => ({ id: a.id, name: a.name, role: a.role })),
        },
      });
    }

    // 如果启用自动执行，触发任务执行
    let executionUrl = null;
    if (autoExecute) {
      // 生成流式执行 URL
      executionUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/tasks/${task.id}/auto-execute-stream`;

      // 异步触发执行
      fetch(executionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('触发任务执行失败:', error);
      });

      return NextResponse.json({
        success: true,
        message: '任务已创建并开始执行',
        task: {
          id: task.id,
          title: task.title,
          status: 'in_progress',
          executionUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '任务创建成功',
      task: {
        id: task.id,
        title: task.title,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('触发任务失败:', error);
    return NextResponse.json(
      { error: '触发任务失败' },
      { status: 500 }
    );
  }
}

// 通知 OpenClaw
async function notifyOpenClaw(
  webhookUrl: string,
  apiKey: string,
  payload: any
) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('通知 OpenClaw 失败:', error);
  }
}
