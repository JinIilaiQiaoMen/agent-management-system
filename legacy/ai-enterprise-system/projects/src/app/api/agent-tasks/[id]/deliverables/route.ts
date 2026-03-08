/**
 * 任务成果 API
 * GET - 获取任务成果
 * POST - 创建任务成果
 */

import { NextRequest, NextResponse } from 'next/server';
import { deliverableManager } from '@/lib/agent-system';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deliverables = await deliverableManager.getDeliverablesByTaskId(id);
    return NextResponse.json(deliverables);
  } catch (error) {
    console.error('Failed to get deliverables:', error);
    return NextResponse.json(
      { error: 'Failed to get deliverables', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const deliverable = await deliverableManager.createDeliverable({
      taskId: id,
      agentId: body.agentId,
      title: body.title,
      type: body.type,
      content: body.content || null,
      filePath: body.filePath || null,
      fileName: body.fileName || null,
      fileSize: body.fileSize || null,
      fileType: body.fileType || null,
      status: body.status || 'draft',
      version: body.version || 1,
      metadata: body.metadata || null,
    });
    
    return NextResponse.json(deliverable);
  } catch (error) {
    console.error('Failed to create deliverable:', error);
    return NextResponse.json(
      { error: 'Failed to create deliverable', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
