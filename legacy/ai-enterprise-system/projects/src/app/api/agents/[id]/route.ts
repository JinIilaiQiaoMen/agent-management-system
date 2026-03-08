/**
 * 智能体详情 API
 * GET - 获取单个智能体
 * PUT - 更新智能体
 * DELETE - 删除智能体
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentManager } from '@/lib/agent-system';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await agentManager.getAgentById(id);
    
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error('Failed to get agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get agent', details: error instanceof Error ? error.message : String(error) },
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
    
    const agent = await agentManager.updateAgent(id, body);
    
    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent', details: error instanceof Error ? error.message : String(error) },
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
    const success = await agentManager.deleteAgent(id);
    
    if (!success) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete agent', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
