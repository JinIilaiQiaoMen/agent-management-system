import { NextRequest, NextResponse } from 'next/server';

/**
 * 任务管理API
 */

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟任务存储
const tasks: Map<string, Task> = new Map();

// 初始化一些示例任务
const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: '客户背调 - 阿里巴巴',
    description: '完成对阿里巴巴的背景调查',
    status: 'in_progress',
    priority: 'high',
    assignee: '销售一部',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: '发送产品介绍邮件',
    description: '向潜在客户发送产品介绍',
    status: 'pending',
    priority: 'medium',
    assignee: '销售二部',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

sampleTasks.forEach(task => tasks.set(task.id, task));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  let result = Array.from(tasks.values());

  if (status) {
    result = result.filter(t => t.status === status);
  }
  if (priority) {
    result = result.filter(t => t.priority === priority);
  }

  // 按优先级和创建时间排序
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  result.sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({
    success: true,
    data: {
      total: result.length,
      tasks: result,
      stats: {
        pending: tasks.size,
        inProgress: Array.from(tasks.values()).filter(t => t.status === 'in_progress').length,
        completed: Array.from(tasks.values()).filter(t => t.status === 'completed').length,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority = 'medium', assignee, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: '请提供任务标题' },
        { status: 400 }
      );
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: 'pending',
      priority,
      assignee,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.set(task.id, task);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '创建任务失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority, assignee, dueDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '请提供任务ID' },
        { status: 400 }
      );
    }

    const task = tasks.get(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    // 更新任务
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee) task.assignee = assignee;
    if (dueDate) task.dueDate = dueDate;
    task.updatedAt = new Date().toISOString();

    tasks.set(id, task);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新任务失败' },
      { status: 500 }
    );
  }
}
