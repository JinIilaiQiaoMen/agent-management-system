/**
 * API: /api/chat/history/:sessionId
 * 获取聊天历史
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/chat/history/:sessionId
 * 获取聊天历史
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少 sessionId 参数',
        },
        { status: 400 }
      );
    }

    // TODO: 从数据库获取聊天历史
    // 这里先返回空数组
    const history: Array<{
      role: string;
      content: string;
      timestamp?: number;
    }> = [];

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        messages: history,
      },
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取聊天历史时发生错误',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
