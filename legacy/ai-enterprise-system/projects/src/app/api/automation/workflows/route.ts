import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine, presetWorkflows } from '@/lib/automation/workflow-engine';

/**
 * 工作流管理 API
 */

/**
 * GET - 获取所有工作流
 */
export async function GET(request: NextRequest) {
  try {
    const workflows = workflowEngine.getWorkflows();

    return NextResponse.json({
      success: true,
      workflows,
      total: workflows.length
    });

  } catch (error: any) {
    console.error('获取工作流失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - 创建工作流
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, triggers, actions, conditions } = body;

    if (!name || !triggers || !actions) {
      return NextResponse.json(
        { error: '缺少必要参数: name, triggers, actions' },
        { status: 400 }
      );
    }

    const workflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || '',
      triggers,
      actions,
      conditions,
      enabled: false,
      createdBy: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    workflowEngine.registerWorkflow(workflow);

    return NextResponse.json({
      success: true,
      workflow,
      message: '工作流创建成功'
    });

  } catch (error: any) {
    console.error('创建工作流失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT - 更新工作流
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, triggers, actions, conditions, enabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: '缺少 workflowId' },
        { status: 400 }
      );
    }

    const existingWorkflow = workflowEngine.getWorkflow(id);
    if (!existingWorkflow) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      );
    }

    const updatedWorkflow = {
      ...existingWorkflow,
      name: name || existingWorkflow.name,
      description: description ?? existingWorkflow.description,
      triggers: triggers ?? existingWorkflow.triggers,
      actions: actions ?? existingWorkflow.actions,
      conditions: conditions ?? existingWorkflow.conditions,
      enabled: enabled ?? existingWorkflow.enabled,
      updatedAt: new Date()
    };

    workflowEngine.registerWorkflow(updatedWorkflow);

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
      message: '工作流更新成功'
    });

  } catch (error: any) {
    console.error('更新工作流失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 删除工作流
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少 workflowId' },
        { status: 400 }
      );
    }

    const workflow = workflowEngine.getWorkflow(id);
    if (!workflow) {
      return NextResponse.json(
        { error: '工作流不存在' },
        { status: 404 }
      );
    }

    workflowEngine.deleteWorkflow(id);

    return NextResponse.json({
      success: true,
      message: '工作流删除成功'
    });

  } catch (error: any) {
    console.error('删除工作流失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
