/**
 * API: /api/zhongshu/dispatch
 * 皇帝发布圣旨的统一入口
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImperialDecree, ImperialResponse } from '@/lib/types/san-sheng.types';
import { handleImperialDecree } from '@/lib/san-sheng-system';

/**
 * POST /api/zhongshu/dispatch
 * 处理皇帝圣旨
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入
    if (!body.message || !body.sessionId || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要参数: message, sessionId, userId',
        },
        { status: 400 }
      );
    }

    // 构建圣旨对象
    const decree: ImperialDecree = {
      message: body.message,
      sessionId: body.sessionId,
      userId: body.userId,
      timestamp: Date.now(),
      options: {
        priority: body.options?.priority || 'normal',
        requireAudit: body.options?.requireAudit !== false,
      },
    };

    // 处理圣旨
    const response: ImperialResponse = await handleImperialDecree(decree);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error handling imperial decree:', error);
    return NextResponse.json(
      {
        success: false,
        message: '处理圣旨时发生错误',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/zhongshu/dispatch
 * 健康检查
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '中书省调度系统运行正常',
    timestamp: Date.now(),
  });
}
