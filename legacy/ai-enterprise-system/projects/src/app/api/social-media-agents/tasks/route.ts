import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialMediaScheduledTasks } from '@/storage/database/shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

/**
 * GET /api/social-media-agents/tasks
 * 获取定时任务列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    // 构建查询
    let query = db.select().from(socialMediaScheduledTasks);

    // 执行查询
    let tasks = await query;

    // 按Agent筛选
    if (agentId) {
      tasks = tasks.filter((t: typeof tasks[0]) => t.agentId === agentId);
    }

    // 按状态筛选
    if (status) {
      tasks = tasks.filter((t: typeof tasks[0]) => t.status === status);
    }

    // 按平台筛选
    if (platform) {
      tasks = tasks.filter((t: typeof tasks[0]) => t.platform === platform);
    }

    // 按执行时间排序
    tasks.sort((a: typeof tasks[0], b: typeof tasks[0]) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );

    // 计算统计
    const allTasks = await db.select().from(socialMediaScheduledTasks);
    const stats = {
      total: allTasks.length,
      pending: allTasks.filter((t: typeof allTasks[0]) => t.status === 'pending').length,
      running: allTasks.filter((t: typeof allTasks[0]) => t.status === 'running').length,
      completed: allTasks.filter((t: typeof allTasks[0]) => t.status === 'completed').length,
      failed: allTasks.filter((t: typeof allTasks[0]) => t.status === 'failed').length,
      upcomingToday: allTasks.filter((t: typeof allTasks[0]) => {
        const scheduled = new Date(t.scheduledTime);
        const today = new Date();
        return (
          t.status === 'pending' &&
          scheduled.getDate() === today.getDate() &&
          scheduled.getMonth() === today.getMonth() &&
          scheduled.getFullYear() === today.getFullYear()
        );
      }).length,
    };

    return NextResponse.json({
      tasks,
      stats,
    });
  } catch (error: any) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json(
      { error: '获取任务列表失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-media-agents/tasks
 * 创建新的定时任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentId,
      agentName,
      platform,
      platformIcon,
      taskType,
      title,
      content,
      mediaUrls,
      scheduledTime,
      priority,
      repeat,
    } = body;

    if (!agentId || !scheduledTime || !content) {
      return NextResponse.json(
        { error: '缺少必要参数: agentId, scheduledTime, content' },
        { status: 400 }
      );
    }

    // 插入数据库
    const [newTask] = await db
      .insert(socialMediaScheduledTasks)
      .values({
        agentId,
        agentName: agentName || '未知Agent',
        platform: platform || 'unknown',
        platformIcon: platformIcon || '📱',
        taskType: taskType || 'schedule',
        title: title || '定时发布任务',
        content,
        mediaUrls: mediaUrls || [],
        scheduledTime,
        status: 'pending',
        priority: priority || 'medium',
        repeat: repeat || 'none',
      })
      .returning();

    return NextResponse.json({
      success: true,
      task: newTask,
      message: '定时任务创建成功',
    });
  } catch (error: any) {
    console.error('创建任务失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social-media-agents/tasks
 * 更新定时任务
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
    }

    // 更新
    const [updatedTask] = await db
      .update(socialMediaScheduledTasks)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(socialMediaScheduledTasks.id, id))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: '任务更新成功',
    });
  } catch (error: any) {
    console.error('更新任务失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-media-agents/tasks
 * 删除定时任务
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
    }

    // 删除
    await db.delete(socialMediaScheduledTasks).where(eq(socialMediaScheduledTasks.id, id));

    return NextResponse.json({
      success: true,
      message: '任务已删除',
    });
  } catch (error: any) {
    console.error('删除任务失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
