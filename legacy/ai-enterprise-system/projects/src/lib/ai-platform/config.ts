/**
 * AI 能力中台配置
 * 实现模型智能路由、缓存、监控等核心能力
 */

// 模型类型定义
export type ModelType = 'llm' | 'image' | 'video';

// 模型复杂度等级
export type TaskComplexity = 'low' | 'medium' | 'high';

// 支持的模型列表
export const SUPPORTED_MODELS = {
  // 本地开源模型（优先使用，零成本）
  local: {
    llama3: {
      name: 'Llama 3 8B',
      type: 'llm' as ModelType,
      endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434/api/generate',
      complexity: 'low' as TaskComplexity,
      maxTokens: 4000,
      cost: 0,
      performance: 'fast'
    },
    qwen2: {
      name: 'Qwen2 7B',
      type: 'llm' as ModelType,
      endpoint: process.env.LOCAL_QWEN_ENDPOINT || 'http://localhost:11434/api/generate',
      complexity: 'medium' as TaskComplexity,
      maxTokens: 8000,
      cost: 0,
      performance: 'balanced'
    },
    mistral: {
      name: 'Mistral 7B',
      type: 'llm' as ModelType,
      endpoint: process.env.LOCAL_MISTRAL_ENDPOINT || 'http://localhost:11434/api/generate',
      complexity: 'medium' as TaskComplexity,
      maxTokens: 8000,
      cost: 0,
      performance: 'balanced'
    },
    sd3: {
      name: 'Stable Diffusion 3',
      type: 'image' as ModelType,
      endpoint: process.env.LOCAL_SD_ENDPOINT || 'http://localhost:7860',
      complexity: 'medium' as TaskComplexity,
      cost: 0,
      performance: 'balanced'
    },
    flux: {
      name: 'Flux',
      type: 'image' as ModelType,
      endpoint: process.env.LOCAL_FLUX_ENDPOINT || 'http://localhost:7860',
      complexity: 'high' as TaskComplexity,
      cost: 0,
      performance: 'slow'
    },
    animatediff: {
      name: 'AnimateDiff',
      type: 'video' as ModelType,
      endpoint: process.env.LOCAL_VIDEO_ENDPOINT || 'http://localhost:7860',
      complexity: 'high' as TaskComplexity,
      cost: 0,
      performance: 'slow'
    }
  },
  // 付费 API（仅在复杂任务时使用）
  paid: {
    gpt4o: {
      name: 'GPT-4o',
      type: 'llm' as ModelType,
      complexity: 'high' as TaskComplexity,
      maxTokens: 128000,
      cost: 0.005, // 每 1K tokens
      performance: 'excellent'
    },
    claude3: {
      name: 'Claude 3.5 Sonnet',
      type: 'llm' as ModelType,
      complexity: 'high' as TaskComplexity,
      maxTokens: 200000,
      cost: 0.003, // 每 1K tokens
      performance: 'excellent'
    }
  }
};

// ComfyUI 配置
export const COMFYUI_CONFIG = {
  endpoint: process.env.COMFYUI_ENDPOINT || 'http://localhost:8188',
  workflowPath: process.env.COMFYUI_WORKFLOW_PATH || './public/workflows',
  workflows: {
    // 宠物产品场景图生成
    petProductScene: 'pet_product_scene.json',
    // 宠物产品开箱图生成
    petProductUnboxing: 'pet_product_unboxing.json',
    // 宠物产品卖点图生成
    petProductFeatures: 'pet_product_features.json',
    // 短视频生成
    shortVideo: 'short_video.json'
  }
};

// 缓存配置
export const CACHE_CONFIG = {
  enabled: process.env.CACHE_ENABLED !== 'false',
  ttl: {
    llm: 3600, // 1小时
    image: 86400, // 24小时
    video: 172800, // 48小时
    customerAnalysis: 7200 // 2小时
  },
  keyPrefix: 'ai-platform'
};

// API 用量监控配置
export const MONITORING_CONFIG = {
  enabled: true,
  thresholds: {
    dailyLimit: 1000000, // 每日最大 API 调用次数
    costLimit: 1000, // 每日最大成本（美元）
    departmentLimits: {
      marketing: 500000,
      sales: 300000,
      operations: 200000
    }
  },
  alertEmail: process.env.ALERT_EMAIL || 'admin@example.com'
};

// 任务复杂度判断规则
export const COMPLEXITY_RULES = {
  // 低复杂度：简单问答、模板填充、短文本生成
  low: [
    'simpleQuestion',
    'templateFill',
    'shortText',
    'keywordExtraction',
    'languageDetection'
  ],
  // 中等复杂度：长文本生成、多轮对话、图片生成
  medium: [
    'longText',
    'multiTurn',
    'imageGeneration',
    'contentOptimization',
    'emailGeneration'
  ],
  // 高复杂度：视频生成、复杂创意、多模态融合
  high: [
    'videoGeneration',
    'creativeWriting',
    'multimodal',
    'complexAnalysis',
    'contentCompliance'
  ]
};

// 宠物跨境专属 Prompt 模板
export const PET_PROMPT_TEMPLATES = {
  // TikTok 文案生成
  tiktokCaption: `你是一位专业的 TikTok 宠物用品营销文案专家，擅长创作符合欧美养宠用户喜好的内容。

产品信息：{{productInfo}}
目标受众：{{audience}}
发布平台：TikTok
语言：{{language}}

要求：
1. 开头前3秒必须抓住注意力（使用悬念、疑问或惊喜）
2. 1-2个有趣的宠物互动场景描述
3. 自然植入产品核心卖点（最多3个）
4. 使用当下热门的宠物话题标签
5. 语气活泼、亲切，像和朋友聊天
6. 长度控制在 100-150 字
7. 包含行动号召（CTA）

请生成 TikTok 文案（包含话题标签）：`,

  // Instagram 文案生成
  instagramCaption: `你是一位专业的 Instagram 宠物用品内容创作者，擅长创作精致、有品质感的宠物内容。

产品信息：{{productInfo}}
目标受众：{{audience}}
发布平台：Instagram
语言：{{language}}

要求：
1. 开头用情感化的描述建立共鸣
2. 展示宠物使用产品的真实场景
3. 强调产品如何提升宠物生活质量
4. 使用优雅、温暖的语调
5. 包含 5-10 个精准的话题标签（混合热门标签和小众标签）
6. 长度控制在 150-200 字
7. 鼓励用户分享自己的宠物故事

请生成 Instagram 文案：`,

  // YouTube 标题和描述
  youtubeContent: `你是一位专业的 YouTube 宠物用品内容制作人，擅长创作吸引点击的标题和详细的视频描述。

产品信息：{{productInfo}}
视频类型：{{videoType}}
目标受众：{{audience}}
语言：{{language}}

要求：
1. 生成 5 个吸引点击的标题（包含关键词，使用数字、疑问句等技巧）
2. 生成详细视频描述（包含产品介绍、使用说明、时间戳、CTA）
3. 优化 SEO 关键词
4. 包含宠物相关的热门标签

请生成 YouTube 标题和描述：`,

  // 亚马逊 Listing 生成
  amazonListing: `你是一位专业的亚马逊宠物用品 Listing 优化专家，熟悉 A9 算法和 SEO 最佳实践。

产品信息：{{productInfo}}
目标市场：{{market}}
语言：{{language}}

要求：
1. 产品标题（200 字符以内，包含核心关键词）
2. 五点描述（每个要点突出一个核心卖点，包含关键词）
3. 产品描述（详细、有说服力，包含使用场景）
4. 后台关键词（250 字节以内）
5. 优化搜索词，提高转化率

请生成亚马逊 Listing：`,

  // 独立站产品描述
  productDescription: `你是一位专业的 D2C 宠物用品品牌文案专家，擅长创作有情感、有故事的产品描述。

产品信息：{{productInfo}}
品牌调性：{{brandTone}}
目标受众：{{audience}}
语言：{{language}}

要求：
1. 讲述一个与产品相关的温馨故事
2. 突出产品对宠物和主人的生活改变
3. 使用感性、真诚的语言
4. 包含产品规格、材质、使用说明
5. 长度适中（300-500 字）
6. 强化品牌价值观

请生成产品描述：`,

  // 客服回复生成
  customerServiceReply: `你是一位专业的宠物用品客服代表，熟悉宠物健康知识和产品信息。

客户问题：{{customerQuestion}}
产品信息：{{productInfo}}
客户情绪：{{customerEmotion}}
语言：{{language}}

要求：
1. 首先表达理解和共情
2. 清晰解答客户问题（如果有健康担忧，建议咨询兽医）
3. 提供具体的解决方案或产品建议
4. 语气友好、专业、耐心
5. 包含后续跟进建议

请生成客服回复：`
};

// 内容合规审核规则
export const COMPLIANCE_RULES = {
  platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Amazon'],
  rules: {
    // 禁止使用的词汇
    prohibitedWords: ['治愈', '疗效', '保证', '永久', '最佳', '第一名'],
    // 需要标注的内容
    requiredDisclaimers: {
      health: '此产品不能替代专业兽医诊断',
      dietary: '喂食前请咨询兽医',
      age: '不适合 [具体年龄段] 的宠物'
    },
    // 知识产权
    copyrightCheck: true,
    // 广告法合规
    advertisingLawCheck: true
  }
};
