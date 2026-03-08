import { NextRequest, NextResponse } from 'next/server';
import { selectModel, batchSelectModels } from '@/lib/ai-platform/model-router';

/**
 * 单个任务模型选择
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskType, estimatedTokens, priority, requiresCreativity, requiresAccuracy } = body;

    // 参数验证
    if (!taskType) {
      return NextResponse.json(
        { error: '缺少 taskType 参数' },
        { status: 400 }
      );
    }

    // 调用模型路由
    const selection = await selectModel({
      taskType,
      estimatedTokens: estimatedTokens || 1000,
      priority: priority || 'medium',
      requiresCreativity: requiresCreativity || false,
      requiresAccuracy: requiresAccuracy || false
    });

    return NextResponse.json({ success: true, data: selection });
  } catch (error: any) {
    console.error('模型选择失败:', error);
    return NextResponse.json(
      { error: '模型选择失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * 批量模型选择
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tasksParam = searchParams.get('tasks');

    if (!tasksParam) {
      return NextResponse.json(
        { error: '缺少 tasks 参数' },
        { status: 400 }
      );
    }

    const tasks = JSON.parse(tasksParam);

    // 调用批量模型选择
    const selections = await batchSelectModels(tasks);

    return NextResponse.json({ success: true, data: selections });
  } catch (error: any) {
    console.error('批量模型选择失败:', error);
    return NextResponse.json(
      { error: '批量模型选择失败', details: error.message },
      { status: 500 }
    );
  }
}
