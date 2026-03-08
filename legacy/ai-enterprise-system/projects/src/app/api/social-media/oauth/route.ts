import { NextRequest, NextResponse } from 'next/server';
import { PLATFORMS } from '@/lib/social-media/platform-config';

/**
 * 获取OAuth授权URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const redirectUri = searchParams.get('redirect_uri');

    if (!platform) {
      return NextResponse.json(
        { error: '缺少平台参数' },
        { status: 400 }
      );
    }

    const platformConfig = PLATFORMS[platform];

    if (!platformConfig) {
      return NextResponse.json(
        { error: `不支持的平台: ${platform}` },
        { status: 400 }
      );
    }

    if (platformConfig.authType !== 'oauth') {
      return NextResponse.json(
        { error: '该平台不支持OAuth授权' },
        { status: 400 }
      );
    }

    // 检查是否配置了 Client ID
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const isDemoMode = !clientId;

    // 生成OAuth授权URL
    const authUrl = generateOAuthUrl(platform, redirectUri || undefined);

    return NextResponse.json({
      platform,
      authUrl,
      authType: 'oauth',
      isDemoMode,
      demoNotice: isDemoMode ? '演示模式：使用模拟凭据，请配置真实的 Client ID 以使用真实授权' : undefined
    });
  } catch (error: any) {
    console.error('生成授权URL失败:', error);
    return NextResponse.json(
      {
        error: '获取授权链接失败',
        details: error.message,
        hint: '请检查平台配置或使用手动配置方式'
      },
      { status: 500 }
    );
  }
}

/**
 * OAuth回调处理
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, code, state, redirectUri } = body;

    if (!platform || !code) {
      return NextResponse.json(
        { error: '缺少必要参数: platform, code' },
        { status: 400 }
      );
    }

    // 使用授权码交换访问令牌
    const tokens = await exchangeCodeForTokens(platform, code, redirectUri);

    // TODO: 将令牌保存到数据库或环境变量
    console.log(`${platform} OAuth 授权成功:`, {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      expiresIn: tokens.expiresIn
    });

    return NextResponse.json({
      success: true,
      platform,
      message: `${PLATFORMS[platform].name} 授权成功`,
      tokens: {
        accessToken: '***已隐藏***',
        refreshToken: '***已隐藏***'
      }
    });
  } catch (error: any) {
    console.error('OAuth授权失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'OAuth授权失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 生成OAuth授权URL
 */
function generateOAuthUrl(platform: string, redirectUri?: string): string {
  const config = PLATFORMS[platform];
  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`] || 'demo_client_id';

  // 验证基础配置
  if (!config.authUrl) {
    throw new Error(`平台 ${platform} 缺少授权 URL 配置`);
  }

  const baseUrl = config.authUrl;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/social-media/oauth/callback`,
    response_type: 'code',
    scope: config.scopes?.join(' ') || '',
    state: generateState()
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * 交换授权码获取访问令牌
 */
async function exchangeCodeForTokens(
  platform: string,
  code: string,
  redirectUri?: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}> {
  // TODO: 调用真实的OAuth令牌端点
  // 这里模拟返回令牌

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    accessToken: `demo_access_token_${platform}_${Date.now()}`,
    refreshToken: `demo_refresh_token_${platform}_${Date.now()}`,
    expiresIn: 3600,
    tokenType: 'Bearer'
  };
}

/**
 * 生成OAuth state参数（防止CSRF攻击）
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
