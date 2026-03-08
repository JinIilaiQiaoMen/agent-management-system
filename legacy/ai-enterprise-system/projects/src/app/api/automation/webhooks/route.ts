import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';

/**
 * Webhook 接收端点
 * 用于接收外部系统（如 OpenClaw）的触发事件
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, event, data, timestamp } = body;

    console.log('收到 Webhook:', { workflowId, event, timestamp });

    if (!workflowId) {
      return NextResponse.json(
        { error: '缺少 workflowId 参数' },
        { status: 400 }
      );
    }

    // 触发工作流
    const execution = await workflowEngine.triggerWorkflow(workflowId, {
      event,
      ...data,
      timestamp: timestamp || new Date().toISOString(),
      webhookSource: true
    });

    if (!execution) {
      return NextResponse.json(
        { success: false, message: '工作流未触发（可能未启用或条件不满足）' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      workflowId,
      status: execution.status,
      message: '工作流已触发'
    });

  } catch (error: any) {
    console.error('Webhook 处理失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET 获取工作流执行记录
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workflowId = searchParams.get('workflowId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const executions = workflowEngine.getExecutions(workflowId || undefined);

    return NextResponse.json({
      success: true,
      executions: executions.slice(-limit),
      total: executions.length
    });

  } catch (error: any) {
    console.error('获取执行记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
