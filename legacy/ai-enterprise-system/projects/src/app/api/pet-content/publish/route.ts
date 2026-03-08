import { NextRequest, NextResponse } from 'next/server';
import { PLATFORMS } from '@/lib/social-media/platform-config';
import { DOMESTIC_PLATFORMS } from '@/lib/social-media/domestic-platforms';

interface PublishRequest {
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduledTime?: string;
  productName?: string;
}

interface PublishResult {
  success: boolean;
  postId?: string;
  platformPostId?: string;
  status: 'published' | 'scheduled' | 'failed';
  message: string;
  publishedAt?: string;
}

/**
 * 宠物内容一键发布 API
 * 整合国内外社媒平台发布能力
 */
export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json();
    const { platform, content, mediaUrls = [], scheduledTime, productName } = body;

    if (!platform || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: platform, content' },
        { status: 400 }
      );
    }

    // 判断平台类型
    const isOverseas = platform in PLATFORMS;
    const isDomestic = platform in DOMESTIC_PLATFORMS;

    if (!isOverseas && !isDomestic) {
      return NextResponse.json(
        { success: false, error: `不支持的平台: ${platform}` },
        { status: 400 }
      );
    }

    // 获取平台配置
    const platformConfig = isOverseas
      ? PLATFORMS[platform]
      : DOMESTIC_PLATFORMS[platform];

    // 检查凭据
    const credentials = getPlatformCredentials(platform);
    if (!credentials && platformConfig.requiresAuth) {
      return NextResponse.json(
        {
          success: false,
          error: `未配置 ${platformConfig.name} 的认证信息`,
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // 执行发布
    let result: PublishResult;

    if (scheduledTime) {
      // 定时发布
      result = await schedulePost(platform, content, mediaUrls, scheduledTime, productName);
    } else {
      // 立即发布
      if (isOverseas) {
        result = await publishToOverseasPlatform(platform, content, mediaUrls);
      } else {
        result = await publishToDomesticPlatform(platform, content, mediaUrls);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('发布失败:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'failed',
        error: '发布失败',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 获取平台凭据
 */
function getPlatformCredentials(platform: string): Record<string, string> | null {
  // 海外平台凭据映射
  const overseasEnvMap: Record<string, string[]> = {
    tiktok: ['TIKTOK_ACCESS_TOKEN', 'TIKTOK_CLIENT_ID'],
    instagram: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_BUS_ID'],
    youtube: ['YOUTUBE_ACCESS_TOKEN', 'YOUTUBE_CLIENT_ID'],
    facebook: ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
    twitter: ['TWITTER_ACCESS_TOKEN', 'TWITTER_API_KEY'],
  };

  // 国内平台凭据映射
  const domesticEnvMap: Record<string, string[]> = {
    taobao: ['TAOBAO_APP_KEY', 'TAOBAO_APP_SECRET'],
    tmall: ['TAOBAO_APP_KEY', 'TAOBAO_APP_SECRET'],
    jd: ['JD_APP_KEY', 'JD_APP_SECRET'],
    pinduoduo: ['PDD_CLIENT_ID', 'PDD_CLIENT_SECRET'],
    douyin_ecommerce: ['DOUYIN_APP_ID', 'DOUYIN_APP_SECRET'],
    kuaishou_ecommerce: ['KUAISHOU_APP_ID', 'KUAISHOU_APP_SECRET'],
    xiaohongshu: ['XHS_APP_ID', 'XHS_APP_SECRET'],
    wechat: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
    weibo: ['WEIBO_APP_KEY', 'WEIBO_APP_SECRET'],
  };

  const envMap = { ...overseasEnvMap, ...domesticEnvMap };
  const requiredKeys = envMap[platform];

  if (!requiredKeys) return null;

  const credentials: Record<string, string> = {};
  for (const key of requiredKeys) {
    const value = process.env[key];
    if (value) {
      credentials[key] = value;
    }
  }

  return Object.keys(credentials).length > 0 ? credentials : null;
}

/**
 * 发布到海外平台
 */
async function publishToOverseasPlatform(
  platform: string,
  content: string,
  mediaUrls: string[]
): Promise<PublishResult> {
  const platformPostId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 模拟API调用延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 根据不同平台执行不同的发布逻辑
  switch (platform) {
    case 'tiktok':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_tiktok`,
        status: 'published',
        message: '成功发布到 TikTok',
        publishedAt: new Date().toISOString(),
      };

    case 'instagram':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_instagram`,
        status: 'published',
        message: '成功发布到 Instagram',
        publishedAt: new Date().toISOString(),
      };

    case 'youtube':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_youtube`,
        status: 'published',
        message: '成功发布到 YouTube',
        publishedAt: new Date().toISOString(),
      };

    case 'facebook':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_facebook`,
        status: 'published',
        message: '成功发布到 Facebook',
        publishedAt: new Date().toISOString(),
      };

    case 'twitter':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_twitter`,
        status: 'published',
        message: '成功发布到 Twitter',
        publishedAt: new Date().toISOString(),
      };

    default:
      return {
        success: false,
        status: 'failed',
        message: `不支持的海外平台: ${platform}`,
      };
  }
}

/**
 * 发布到国内平台
 */
async function publishToDomesticPlatform(
  platform: string,
  content: string,
  mediaUrls: string[]
): Promise<PublishResult> {
  const platformPostId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 模拟API调用延迟
  await new Promise((resolve) => setTimeout(resolve, 600));

  const platformNames: Record<string, string> = {
    taobao: '淘宝',
    tmall: '天猫',
    jd: '京东',
    pinduoduo: '拼多多',
    douyin_ecommerce: '抖音电商',
    kuaishou_ecommerce: '快手电商',
    xiaohongshu: '小红书',
    vipshop: '唯品会',
    wechat: '微信公众号',
    weibo: '微博',
    wechat_moment: '微信朋友圈',
    wechat_video: '微信视频号',
  };

  const platformName = platformNames[platform] || platform;

  // 根据平台类型执行不同的发布逻辑
  switch (platform) {
    case 'taobao':
    case 'tmall':
    case 'jd':
    case 'pinduoduo':
    case 'vipshop':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_${platform}`,
        status: 'published',
        message: `成功发布到 ${platformName} 商品详情`,
        publishedAt: new Date().toISOString(),
      };

    case 'douyin_ecommerce':
    case 'kuaishou_ecommerce':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_${platform}`,
        status: 'published',
        message: `成功发布到 ${platformName}`,
        publishedAt: new Date().toISOString(),
      };

    case 'xiaohongshu':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_xiaohongshu`,
        status: 'published',
        message: '成功发布到小红书笔记',
        publishedAt: new Date().toISOString(),
      };

    case 'wechat':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_wechat`,
        status: 'published',
        message: '成功发布到微信公众号文章',
        publishedAt: new Date().toISOString(),
      };

    case 'weibo':
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_weibo`,
        status: 'published',
        message: '成功发布到微博',
        publishedAt: new Date().toISOString(),
      };

    default:
      return {
        success: true,
        postId: platformPostId,
        platformPostId: `${platformPostId}_${platform}`,
        status: 'published',
        message: `成功发布到 ${platformName}`,
        publishedAt: new Date().toISOString(),
      };
  }
}

/**
 * 定时发布
 */
async function schedulePost(
  platform: string,
  content: string,
  mediaUrls: string[],
  scheduledTime: string,
  productName?: string
): Promise<PublishResult> {
  const postId = `schedule_${platform}_${Date.now()}`;

  // TODO: 实现真实的定时任务存储
  // 这里模拟存储到数据库或任务队列

  const scheduledDate = new Date(scheduledTime);

  return {
    success: true,
    postId,
    status: 'scheduled',
    message: `已安排在 ${scheduledDate.toLocaleString('zh-CN')} 发布`,
    publishedAt: scheduledTime,
  };
}

/**
 * 获取支持的平台列表
 */
export async function GET() {
  const overseasPlatforms = Object.entries(PLATFORMS).map(([id, config]) => ({
    id,
    name: config.name,
    icon: config.icon,
    category: 'overseas',
    requiresAuth: config.requiresAuth,
    supportedTypes: config.supportedContentTypes,
  }));

  const domesticPlatforms = Object.entries(DOMESTIC_PLATFORMS)
    .slice(0, 10)
    .map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
      category: config.category,
      requiresAuth: config.requiresAuth,
      supportedTypes: config.supportedContentTypes,
    }));

  return NextResponse.json({
    overseas: overseasPlatforms,
    domestic: domesticPlatforms,
  });
}
