/**
 * 智能体任务 API
 * GET - 获取所有任务
 * POST - 创建任务
 */

import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '@/lib/agent-system';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    
    let tasks;
    if (status) {
      tasks = await taskManager.getTasksByStatus(status);
    } else if (agentId) {
      tasks = await taskManager.getTasksByAgentId(agentId);
    } else {
      tasks = await taskManager.getAllTasks();
    }
    
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get tasks', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const task = await taskManager.createTask({
      title: body.title,
      description: body.description,
      assignedAgentId: body.assignedAgentId || null,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      createdBy: body.createdBy || 'CEO',
      metadata: body.metadata || null,
    });
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
