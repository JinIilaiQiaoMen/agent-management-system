import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/automation/workflow-engine';

/**
 * 手动触发工作流 API
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, input } = body;

    if (!workflowId) {
      return NextResponse.json(
        { error: '缺少 workflowId 参数' },
        { status: 400 }
      );
    }

    // 触发工作流
    const execution = await workflowEngine.triggerWorkflow(workflowId, input || {});

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
    console.error('触发工作流失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
