/**
 * 社媒平台配置
 */

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  requiresAuth: boolean;
  authType: 'oauth' | 'api_key' | 'access_token';
  authUrl?: string;
  scopes?: string[];
  supportedContentTypes: string[];
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    requiresAuth: true,
    authType: 'oauth',
    authUrl: 'https://www.tiktok.com/v2/auth',
    scopes: ['video.upload', 'user.info.basic'],
    supportedContentTypes: ['video', 'image', 'text']
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    requiresAuth: true,
    authType: 'oauth',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: ['instagram_basic', 'instagram_content_publish'],
    supportedContentTypes: ['image', 'video', 'carousel']
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    requiresAuth: true,
    authType: 'oauth',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/youtube.upload'],
    supportedContentTypes: ['video']
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    requiresAuth: true,
    authType: 'oauth',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['pages_manage_posts', 'pages_read_engagement'],
    supportedContentTypes: ['text', 'image', 'video', 'link']
  }
};

export interface PostContent {
  platform: string;
  contentType: string;
  title?: string;
  description: string;
  mediaUrls?: string[];
  scheduledTime?: string;
  hashtags?: string[];
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  platformPostId?: string;
  status: string;
  message: string;
  publishedAt?: string;
}
