import { NextRequest, NextResponse } from 'next/server';
import { workflowExecutor } from '@/lib/comfyui/client';

/**
 * 测试 ComfyUI 工作流生成
 * POST /api/comfyui/test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowType, params } = body;

    if (!workflowType || !params) {
      return NextResponse.json(
        { error: '缺少必要参数: workflowType 和 params' },
        { status: 400 }
      );
    }

    let result;

    switch (workflowType) {
      case 'petProductScene':
        result = await workflowExecutor.generatePetProductScene(params);
        break;
      case 'petProductUnboxing':
        result = await workflowExecutor.generatePetProductUnboxing(params);
        break;
      case 'petProductFeatures':
        result = await workflowExecutor.generatePetProductFeatures(params);
        break;
      case 'shortVideo':
        result = await workflowExecutor.generateShortVideo(params);
        break;
      default:
        return NextResponse.json(
          { error: `不支持的工作流类型: ${workflowType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      workflowType
    });

  } catch (error: any) {
    console.error('ComfyUI 测试失败:', error);
    return NextResponse.json(
      {
        error: '工作流执行失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 获取 ComfyUI 状态
 * GET /api/comfyui/test
 */
export async function GET() {
  try {
    // 这里可以添加 ComfyUI 健康检查逻辑
    // 例如：检查 ComfyUI 服务是否可达
    return NextResponse.json({
      status: 'ok',
      message: 'ComfyUI 集成已就绪',
      note: '请确保 ComfyUI 服务已启动（默认 http://localhost:8188）'
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: '状态检查失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}
