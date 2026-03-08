import { NextRequest, NextResponse } from 'next/server';

// POST - 测试 OpenClaw 连接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, apiKey } = body;

    if (!webhookUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Webhook URL 和 API Key 不能为空' },
        { status: 400 }
      );
    }

    // 发送测试请求
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'OpenClaw 集成测试',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: '连接测试成功',
    });
  } catch (error) {
    console.error('OpenClaw 连接测试失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '连接测试失败',
      },
      { status: 200 }
    );
  }
}
