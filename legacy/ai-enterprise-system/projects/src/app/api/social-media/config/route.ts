import { NextRequest, NextResponse } from 'next/server';
import { PLATFORMS } from '@/lib/social-media/platform-config';

/**
 * 获取平台配置
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');

  if (platform) {
    // 返回特定平台的配置
    const config = PLATFORMS[platform];
    if (!config) {
      return NextResponse.json(
        { error: `不支持的平台: ${platform}` },
        { status: 400 }
      );
    }

    // 检查是否已配置凭据
    const hasCredentials = checkPlatformCredentials(platform);

    return NextResponse.json({
      ...config,
      hasCredentials,
      needsAuth: config.requiresAuth && !hasCredentials
    });
  } else {
    // 返回所有平台配置
    const platforms = Object.values(PLATFORMS).map(config => ({
      ...config,
      hasCredentials: checkPlatformCredentials(config.id),
      needsAuth: config.requiresAuth && !checkPlatformCredentials(config.id)
    }));

    return NextResponse.json({ platforms });
  }
}

/**
 * 保存平台配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, credentials } = body;

    if (!platform || !credentials) {
      return NextResponse.json(
        { error: '缺少必要参数: platform, credentials' },
        { status: 400 }
      );
    }

    if (!PLATFORMS[platform]) {
      return NextResponse.json(
        { error: `不支持的平台: ${platform}` },
        { status: 400 }
      );
    }

    // TODO: 将凭据保存到数据库或环境变量
    // 这里演示保存到环境变量（生产环境应该使用加密存储）
    console.log(`保存 ${platform} 平台凭据:`, {
      hasAccessToken: !!credentials.accessToken,
      hasApiKey: !!credentials.apiKey,
      hasClientId: !!credentials.clientId,
      hasClientSecret: !!credentials.clientSecret,
      hasBusinessId: !!credentials.businessId,
      hasPageId: !!credentials.pageId
    });

    return NextResponse.json({
      success: true,
      message: `${PLATFORMS[platform].name} 配置已保存`,
      platform
    });
  } catch (error: any) {
    console.error('保存配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '保存配置失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 删除平台配置
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json(
        { error: '缺少平台参数' },
        { status: 400 }
      );
    }

    if (!PLATFORMS[platform]) {
      return NextResponse.json(
        { error: `不支持的平台: ${platform}` },
        { status: 400 }
      );
    }

    // TODO: 从数据库或环境变量中删除凭据
    console.log(`删除 ${platform} 平台凭据`);

    return NextResponse.json({
      success: true,
      message: `${PLATFORMS[platform].name} 配置已删除`,
      platform
    });
  } catch (error: any) {
    console.error('删除配置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除配置失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * 检查平台凭据是否存在
 */
function checkPlatformCredentials(platform: string): boolean {
  // TODO: 从数据库或环境变量中检查
  // 这里演示检查环境变量
  const envMap: Record<string, string[]> = {
    tiktok: ['TIKTOK_ACCESS_TOKEN'],
    instagram: ['INSTAGRAM_ACCESS_TOKEN'],
    youtube: ['YOUTUBE_ACCESS_TOKEN'],
    facebook: ['FACEBOOK_ACCESS_TOKEN']
  };

  const requiredKeys = envMap[platform];
  if (!requiredKeys) return false;

  return requiredKeys.some(key => !!process.env[key]);
}
