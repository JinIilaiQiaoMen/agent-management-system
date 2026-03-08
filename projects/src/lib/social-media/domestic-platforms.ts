/**
 * 国内主流电商平台配置
 */

export interface DomesticPlatform {
  id: string;
  name: string;
  icon: string;
  category: 'ecommerce' | 'social' | 'content' | 'live';
  apiType: 'oauth' | 'api_key' | 'access_token' | 'open_api';
  apiDocUrl?: string;
  developerUrl?: string;
  supportedContentTypes: string[];
  requiresAuth: boolean;
  hasSandbox: boolean;
  description: string;
}

export const DOMESTIC_PLATFORMS: Record<string, DomesticPlatform> = {
  // ===== 电商平台 =====
  taobao: {
    id: 'taobao',
    name: '淘宝',
    icon: '🛍️',
    category: 'ecommerce',
    apiType: 'oauth',
    apiDocUrl: 'https://open.taobao.com/doc.htm',
    developerUrl: 'https://open.taobao.com/',
    supportedContentTypes: ['product', 'image', 'video', 'article'],
    requiresAuth: true,
    hasSandbox: true,
    description: '中国最大的电商平台，支持商品发布、店铺运营'
  },
  tmall: {
    id: 'tmall',
    name: '天猫',
    icon: '🐱',
    category: 'ecommerce',
    apiType: 'oauth',
    apiDocUrl: 'https://open.taobao.com/doc.htm',
    developerUrl: 'https://open.taobao.com/',
    supportedContentTypes: ['product', 'image', 'video', 'article'],
    requiresAuth: true,
    hasSandbox: true,
    description: '阿里巴巴旗下B2C电商平台，高端品牌首选'
  },
  jd: {
    id: 'jd',
    name: '京东',
    icon: '🐕',
    category: 'ecommerce',
    apiType: 'oauth',
    apiDocUrl: 'https://open.jd.com/home/home#/doc/common',
    developerUrl: 'https://open.jd.com/',
    supportedContentTypes: ['product', 'image', 'video', 'article'],
    requiresAuth: true,
    hasSandbox: true,
    description: '中国领先的自营式电商企业，正品保障'
  },
  pinduoduo: {
    id: 'pinduoduo',
    name: '拼多多',
    icon: '🍎',
    category: 'ecommerce',
    apiType: 'open_api',
    apiDocUrl: 'https://open.pinduoduo.com/application/document/browse',
    developerUrl: 'https://open.pinduoduo.com/',
    supportedContentTypes: ['product', 'image', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '社交电商平台，拼团购物模式'
  },
  douyin_ecommerce: {
    id: 'douyin_ecommerce',
    name: '抖音电商',
    icon: '🎵',
    category: 'ecommerce',
    apiType: 'oauth',
    apiDocUrl: 'https://developer.open-douyin.com/docs/resource',
    developerUrl: 'https://developer.open-douyin.com/',
    supportedContentTypes: ['product', 'video', 'live', 'short_video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '短视频+直播电商，兴趣推荐驱动'
  },
  kuaishou_ecommerce: {
    id: 'kuaishou_ecommerce',
    name: '快手电商',
    icon: '⚡',
    category: 'ecommerce',
    apiType: 'open_api',
    apiDocUrl: 'https://open.kuaishou.com/open/doc?doc=3',
    developerUrl: 'https://open.kuaishou.com/',
    supportedContentTypes: ['product', 'video', 'live', 'short_video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '下沉市场短视频+直播电商'
  },
  xiaohongshu: {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    category: 'ecommerce',
    apiType: 'oauth',
    apiDocUrl: 'https://open.xiaohongshu.com/document/xxx',
    developerUrl: 'https://open.xiaohongshu.com/',
    supportedContentTypes: ['article', 'image', 'video', 'product'],
    requiresAuth: true,
    hasSandbox: true,
    description: '生活方式分享平台，种草经济代表'
  },
  vipshop: {
    id: 'vipshop',
    name: '唯品会',
    icon: '🎁',
    category: 'ecommerce',
    apiType: 'open_api',
    apiDocUrl: 'https://open.vip.com/',
    developerUrl: 'https://open.vip.com/',
    supportedContentTypes: ['product', 'image', 'video'],
    requiresAuth: true,
    hasSandbox: false,
    description: '品牌特卖电商平台'
  },
  suning: {
    id: 'suning',
    name: '苏宁易购',
    icon: '🛒',
    category: 'ecommerce',
    apiType: 'open_api',
    apiDocUrl: 'https://open.suning.com/osrm/apigm.htm',
    developerUrl: 'https://open.suning.com/',
    supportedContentTypes: ['product', 'image', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '全渠道零售服务商'
  },
  dangdang: {
    id: 'dangdang',
    name: '当当网',
    icon: '📚',
    category: 'ecommerce',
    apiType: 'open_api',
    apiDocUrl: 'http://open.dangdang.com/',
    developerUrl: 'http://open.dangdang.com/',
    supportedContentTypes: ['product', 'image'],
    requiresAuth: true,
    hasSandbox: false,
    description: '综合性网上购物中心'
  },

  // ===== 社交媒体平台 =====
  wechat: {
    id: 'wechat',
    name: '微信公众号',
    icon: '💬',
    category: 'social',
    apiType: 'api_key',
    apiDocUrl: 'https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html',
    developerUrl: 'https://mp.weixin.qq.com/',
    supportedContentTypes: ['article', 'image', 'video', 'audio'],
    requiresAuth: true,
    hasSandbox: true,
    description: '微信官方公众号平台，内容发布与粉丝运营'
  },
  wechat_moment: {
    id: 'wechat_moment',
    name: '微信朋友圈',
    icon: '🔵',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html',
    developerUrl: 'https://mp.weixin.qq.com/',
    supportedContentTypes: ['image', 'video', 'text', 'link'],
    requiresAuth: true,
    hasSandbox: true,
    description: '微信社交圈，个人和商业信息发布'
  },
  wechat_video: {
    id: 'wechat_video',
    name: '微信视频号',
    icon: '🎬',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/video-upload.html',
    developerUrl: 'https://channels.weixin.qq.com/',
    supportedContentTypes: ['video', 'live', 'short_video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '微信短视频平台，与公众号联动'
  },
  weibo: {
    id: 'weibo',
    name: '微博',
    icon: '🦋',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://open.weibo.com/wiki',
    developerUrl: 'https://open.weibo.com/',
    supportedContentTypes: ['text', 'image', 'video', 'live'],
    requiresAuth: true,
    hasSandbox: true,
    description: '中国最大的社交媒体平台'
  },
  bilibili: {
    id: 'bilibili',
    name: '哔哩哔哩',
    icon: '📺',
    category: 'content',
    apiType: 'oauth',
    apiDocUrl: 'https://openhome.bilibili.com/doc',
    developerUrl: 'https://openhome.bilibili.com/',
    supportedContentTypes: ['video', 'article', 'live', 'short_video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '年轻人喜爱的视频社区'
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎',
    icon: '🧠',
    category: 'content',
    apiType: 'oauth',
    apiDocUrl: 'https://www.zhihu.com/api',
    developerUrl: 'https://www.zhihu.com/developer',
    supportedContentTypes: ['article', 'answer', 'video', 'live'],
    requiresAuth: true,
    hasSandbox: true,
    description: '专业问答社区，知识分享平台'
  },
  toutiao: {
    id: 'toutiao',
    name: '今日头条',
    icon: '📰',
    category: 'content',
    apiType: 'oauth',
    apiDocUrl: 'https://www.toutiao.com/open/doc/',
    developerUrl: 'https://www.toutiao.com/open/',
    supportedContentTypes: ['article', 'image', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '个性化资讯推荐平台'
  },
  baijiahao: {
    id: 'baijiahao',
    name: '百度百家号',
    icon: '🔍',
    category: 'content',
    apiType: 'oauth',
    apiDocUrl: 'https://baijiahao.baidu.com/bj/developer',
    developerUrl: 'https://baijiahao.baidu.com/bj/developer',
    supportedContentTypes: ['article', 'image', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '百度内容生态平台'
  },
  qq: {
    id: 'qq',
    name: 'QQ空间',
    icon: '🐧',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://connect.qq.com/',
    developerUrl: 'https://connect.qq.com/',
    supportedContentTypes: ['text', 'image', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '腾讯社交空间，年轻用户聚集地'
  },
  kuaishou: {
    id: 'kuaishou',
    name: '快手',
    icon: '⚡',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://open.kuaishou.com/open/doc',
    developerUrl: 'https://open.kuaishou.com/',
    supportedContentTypes: ['video', 'live', 'short_video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '短视频社交平台'
  },

  // ===== 内容创作平台 =====
  dedao: {
    id: 'dedao',
    name: '得到',
    icon: '📖',
    category: 'content',
    apiType: 'open_api',
    apiDocUrl: 'https://open.dedao.cn/',
    developerUrl: 'https://open.dedao.cn/',
    supportedContentTypes: ['article', 'audio', 'video'],
    requiresAuth: true,
    hasSandbox: false,
    description: '知识付费平台，内容创作'
  },
  ximalaya: {
    id: 'ximalaya',
    name: '喜马拉雅',
    icon: '🎧',
    category: 'content',
    apiType: 'open_api',
    apiDocUrl: 'https://open.ximalaya.com/doc',
    developerUrl: 'https://open.ximalaya.com/',
    supportedContentTypes: ['audio', 'video', 'article'],
    requiresAuth: true,
    hasSandbox: true,
    description: '音频内容平台，有声读物'
  },
  netease_cloud: {
    id: 'netease_cloud',
    name: '网易云音乐',
    icon: '🎵',
    category: 'content',
    apiType: 'oauth',
    apiDocUrl: 'https://music.163.com/#/api',
    developerUrl: 'https://music.163.com/',
    supportedContentTypes: ['audio', 'article', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '音乐社交平台'
  },
  douyin: {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://developer.open-douyin.com/docs/resource',
    developerUrl: 'https://developer.open-douyin.com/',
    supportedContentTypes: ['video', 'live', 'short_video', 'article'],
    requiresAuth: true,
    hasSandbox: true,
    description: '短视频社交平台，流量巨大'
  },

  // ===== 直播平台 =====
  douyin_live: {
    id: 'douyin_live',
    name: '抖音直播',
    icon: '📺',
    category: 'live',
    apiType: 'oauth',
    apiDocUrl: 'https://developer.open-douyin.com/docs/resource',
    developerUrl: 'https://developer.open-douyin.com/',
    supportedContentTypes: ['live', 'product', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '抖音直播带货平台'
  },
  kuaishou_live: {
    id: 'kuaishou_live',
    name: '快手直播',
    icon: '⚡',
    category: 'live',
    apiType: 'open_api',
    apiDocUrl: 'https://open.kuaishou.com/open/doc',
    developerUrl: 'https://open.kuaishou.com/',
    supportedContentTypes: ['live', 'product', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '快手直播带货平台'
  },
  taobao_live: {
    id: 'taobao_live',
    name: '淘宝直播',
    icon: '🛍️',
    category: 'live',
    apiType: 'oauth',
    apiDocUrl: 'https://open.taobao.com/doc.htm',
    developerUrl: 'https://open.taobao.com/',
    supportedContentTypes: ['live', 'product'],
    requiresAuth: true,
    hasSandbox: true,
    description: '淘宝直播带货平台'
  },
  bilibili_live: {
    id: 'bilibili_live',
    name: 'B站直播',
    icon: '📺',
    category: 'live',
    apiType: 'oauth',
    apiDocUrl: 'https://openhome.bilibili.com/doc',
    developerUrl: 'https://openhome.bilibili.com/',
    supportedContentTypes: ['live', 'video'],
    requiresAuth: true,
    hasSandbox: true,
    description: '哔哩哔哩直播平台'
  },

  // ===== 企业服务平台 =====
  wechat_work: {
    id: 'wechat_work',
    name: '企业微信',
    icon: '🏢',
    category: 'social',
    apiType: 'api_key',
    apiDocUrl: 'https://developer.work.weixin.qq.com/document/',
    developerUrl: 'https://developer.work.weixin.qq.com/',
    supportedContentTypes: ['article', 'image', 'video', 'file'],
    requiresAuth: true,
    hasSandbox: true,
    description: '企业级沟通与协作平台'
  },
  dingtalk: {
    id: 'dingtalk',
    name: '钉钉',
    icon: '📱',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://open.dingtalk.com/document/',
    developerUrl: 'https://open.dingtalk.com/',
    supportedContentTypes: ['article', 'image', 'video', 'file'],
    requiresAuth: true,
    hasSandbox: true,
    description: '智能移动办公平台'
  },
  feishu: {
    id: 'feishu',
    name: '飞书',
    icon: '🚀',
    category: 'social',
    apiType: 'oauth',
    apiDocUrl: 'https://open.feishu.cn/document/',
    developerUrl: 'https://open.feishu.cn/',
    supportedContentTypes: ['article', 'image', 'video', 'file'],
    requiresAuth: true,
    hasSandbox: true,
    description: '企业协作平台'
  }
};

// 按类别分组
export const PLATFORMS_BY_CATEGORY = {
  ecommerce: Object.values(DOMESTIC_PLATFORMS).filter(p => p.category === 'ecommerce'),
  social: Object.values(DOMESTIC_PLATFORMS).filter(p => p.category === 'social'),
  content: Object.values(DOMESTIC_PLATFORMS).filter(p => p.category === 'content'),
  live: Object.values(DOMESTIC_PLATFORMS).filter(p => p.category === 'live')
};

// 热门平台（按用户数量和活跃度排序）
export const POPULAR_PLATFORMS = [
  'taobao',
  'jd',
  'pinduoduo',
  'douyin_ecommerce',
  'kuaishou_ecommerce',
  'xiaohongshu',
  'wechat',
  'douyin',
  'weibo',
  'bilibili'
];
