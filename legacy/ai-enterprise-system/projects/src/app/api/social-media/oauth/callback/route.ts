import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth 回调处理页面
 * 这个页面接收授权后的回调，提取 code 和 state 参数
 * 然后将参数发送给 POST /api/social-media/oauth 完成令牌交换
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const platform = searchParams.get('platform') || 'tiktok'; // 从 state 或其他方式获取

  // 处理授权失败
  if (error) {
    return NextResponse.redirect(
      new URL(`/social-media-automation?oauth_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // 处理授权成功
  if (code) {
    try {
      // 调用令牌交换接口
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/social-media/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform,
          code,
          state,
          redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/social-media/oauth/callback`
        })
      });

      const result = await tokenResponse.json();

      if (result.success) {
        return NextResponse.redirect(
          new URL(`/social-media-automation?oauth_success=${encodeURIComponent(platform)}`, request.url)
        );
      } else {
        return NextResponse.redirect(
          new URL(`/social-media-automation?oauth_error=${encodeURIComponent(result.error || '授权失败')}`, request.url)
        );
      }
    } catch (error: any) {
      return NextResponse.redirect(
        new URL(`/social-media-automation?oauth_error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  // 没有收到 code 或 error，可能是用户取消了授权
  return NextResponse.redirect(
    new URL(`/social-media-automation?oauth_cancelled=true`, request.url)
  );
}
