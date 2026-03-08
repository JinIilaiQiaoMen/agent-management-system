import { NextRequest, NextResponse } from 'next/server';

/**
 * 用户登出 API
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    // 清除 cookie
    const response = NextResponse.json({
      success: true,
      message: '登出成功'
    });

    response.cookies.delete('token');

    return response;

  } catch (error: any) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { error: error.message || '登出失败' },
      { status: 500 }
    );
  }
}
