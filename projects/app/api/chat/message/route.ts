/**
 * API: /api/chat/message
 * 保存聊天消息
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/chat/message
 * 保存聊天消息
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入
    if (!body.sessionId || !body.role || !body.content) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要参数: sessionId, role, content',
        },
        { status: 400 }
      );
    }

    // TODO: 保存到数据库
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: body.sessionId,
      role: body.role,
      content: body.content,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: message,
    });

  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      {
        success: false,
        message: '保存聊天消息时发生错误',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
