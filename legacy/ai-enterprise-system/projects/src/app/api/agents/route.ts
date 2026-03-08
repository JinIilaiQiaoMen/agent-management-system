/**
 * 智能体 API 路由
 * GET /api/agents - 获取所有智能体
 * POST /api/agents - 创建新智能体
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentManager } from '@/lib/agent-system';

export async function GET() {
  try {
    const agents = await agentManager.getAllAgents();
    return NextResponse.json({ success: true, data: agents });
  } catch (error: any) {
    console.error('获取智能体失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取智能体失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agent = await agentManager.createAgent(body);
    return NextResponse.json({ success: true, data: agent });
  } catch (error: any) {
    console.error('创建智能体失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建智能体失败' },
      { status: 500 }
    );
  }
}
