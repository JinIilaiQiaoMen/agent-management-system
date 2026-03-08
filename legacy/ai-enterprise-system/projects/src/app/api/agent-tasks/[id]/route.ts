/**
 * 任务详情 API
 * GET - 获取单个任务
 * PUT - 更新任务
 * DELETE - 删除任务
 */

import { NextRequest, NextResponse } from 'next/server';
import { taskManager } from '@/lib/agent-system';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskWithAgent = await taskManager.getTaskWithAgent(id);
    
    if (!taskWithAgent) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: taskWithAgent });
  } catch (error) {
    console.error('Failed to get task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get task', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const task = await taskManager.updateTask(id, body);
    
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await taskManager.deleteTask(id);
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
