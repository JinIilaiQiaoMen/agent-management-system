/**
 * 宠物用品内容生成 Agent
 * 自动生成 TikTok/Instagram/YouTube/亚马逊/独立站的多语种文案、标题、关键词
 */

import { PET_PROMPT_TEMPLATES } from '../ai-platform/config';
import { selectModel } from '../ai-platform/model-router';
import { getFromCache, setCache } from '../ai-platform/cache';
import { recordApiCall } from '../ai-platform/monitoring';

export interface ProductInfo {
  name: string;
  description: string;
  category: string; // 玩具、食品、用品、服饰
  features: string[];
  targetPet: string[]; // 狗、猫、鸟、小型宠物
  ageRange?: string;
  material?: string;
  size?: string;
  price?: number;
  brand?: string;
  images?: string[];
  sku?: string;
}

export interface ContentGenerationRequest {
  productInfo: ProductInfo;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'amazon' | 'website';
  language: string;
  audience: string;
  brandTone?: string;
  videoType?: 'review' | 'unboxing' | 'tutorial' | 'promotional';
  market?: string; // US, EU, UK 等
}

export interface GeneratedContent {
  type: string;
  platform: string;
  language: string;
  content: string;
  metadata?: {
    hashtags?: string[];
    keywords?: string[];
    title?: string;
    description?: string;
    bulletPoints?: string[];
    backendKeywords?: string;
  };
  modelUsed: string;
  cost: number;
  cached: boolean;
}

/**
 * 宠物用品内容生成器
 */
export class PetContentGenerator {
  /**
   * 生成 TikTok 文案
   */
  async generateTikTokCaption(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const cacheKey = {
      productSku: request.productInfo.sku,
      platform: 'tiktok',
      language: request.language,
      audience: request.audience
    };

    // 检查缓存
    const cached = await getFromCache<GeneratedContent>('llm', cacheKey);
    if (cached) {
      return {
        ...cached,
        cached: true
      };
    }

    // 选择模型
    const modelSelection = await selectModel({
      taskType: 'shortText',
      priority: 'medium',
      requiresCreativity: true,
      requiresAccuracy: false
    });

    // 构建 Prompt
    const prompt = PET_PROMPT_TEMPLATES.tiktokCaption
      .replace('{{productInfo}}', JSON.stringify(request.productInfo))
      .replace('{{audience}}', request.audience)
      .replace('{{language}}', request.language);

    // 调用模型
    const content = await this.callModel(prompt, modelSelection.modelName);

    // 提取话题标签
    const hashtags = this.extractHashtags(content);

    const result: GeneratedContent = {
      type: 'caption',
      platform: 'tiktok',
      language: request.language,
      content,
      metadata: { hashtags },
      modelUsed: modelSelection.modelName,
      cost: modelSelection.estimatedCost,
      cached: false
    };

    // 缓存结果
    await setCache('llm', cacheKey, result);

    // 记录 API 调用
    await recordApiCall({
      modelName: modelSelection.modelName,
      modelType: 'llm',
      source: modelSelection.source,
      department: 'marketing',
      userId: 'system', // TODO: 从上下文获取
      cost: modelSelection.estimatedCost,
      success: true
    });

    return result;
  }

  /**
   * 生成 Instagram 文案
   */
  async generateInstagramCaption(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const cacheKey = {
      productSku: request.productInfo.sku,
      platform: 'instagram',
      language: request.language,
      audience: request.audience
    };

    const cached = await getFromCache<GeneratedContent>('llm', cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const modelSelection = await selectModel({
      taskType: 'longText',
      priority: 'medium',
      requiresCreativity: true,
      requiresAccuracy: false
    });

    const prompt = PET_PROMPT_TEMPLATES.instagramCaption
      .replace('{{productInfo}}', JSON.stringify(request.productInfo))
      .replace('{{audience}}', request.audience)
      .replace('{{language}}', request.language);

    const content = await this.callModel(prompt, modelSelection.modelName);
    const hashtags = this.extractHashtags(content);

    const result: GeneratedContent = {
      type: 'caption',
      platform: 'instagram',
      language: request.language,
      content,
      metadata: { hashtags },
      modelUsed: modelSelection.modelName,
      cost: modelSelection.estimatedCost,
      cached: false
    };

    await setCache('llm', cacheKey, result);
    await recordApiCall({
      modelName: modelSelection.modelName,
      modelType: 'llm',
      source: modelSelection.source,
      department: 'marketing',
      userId: 'system',
      cost: modelSelection.estimatedCost,
      success: true
    });

    return result;
  }

  /**
   * 生成 YouTube 内容
   */
  async generateYouTubeContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const cacheKey = {
      productSku: request.productInfo.sku,
      platform: 'youtube',
      videoType: request.videoType,
      language: request.language
    };

    const cached = await getFromCache<GeneratedContent>('llm', cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const modelSelection = await selectModel({
      taskType: 'longText',
      priority: 'high',
      requiresCreativity: true,
      requiresAccuracy: false
    });

    const prompt = PET_PROMPT_TEMPLATES.youtubeContent
      .replace('{{productInfo}}', JSON.stringify(request.productInfo))
      .replace('{{videoType}}', request.videoType || 'review')
      .replace('{{audience}}', request.audience)
      .replace('{{language}}', request.language);

    const content = await this.callModel(prompt, modelSelection.modelName);

    // 解析标题和描述
    const { titles, description, keywords } = this.parseYouTubeContent(content);

    const result: GeneratedContent = {
      type: 'videoContent',
      platform: 'youtube',
      language: request.language,
      content: description,
      metadata: {
        title: titles[0], // 使用第一个标题
        keywords
      },
      modelUsed: modelSelection.modelName,
      cost: modelSelection.estimatedCost,
      cached: false
    };

    await setCache('llm', cacheKey, result);
    await recordApiCall({
      modelName: modelSelection.modelName,
      modelType: 'llm',
      source: modelSelection.source,
      department: 'marketing',
      userId: 'system',
      cost: modelSelection.estimatedCost,
      success: true
    });

    return result;
  }

  /**
   * 生成亚马逊 Listing
   */
  async generateAmazonListing(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const cacheKey = {
      productSku: request.productInfo.sku,
      platform: 'amazon',
      market: request.market,
      language: request.language
    };

    const cached = await getFromCache<GeneratedContent>('llm', cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const modelSelection = await selectModel({
      taskType: 'contentOptimization',
      priority: 'high',
      requiresCreativity: false,
      requiresAccuracy: true
    });

    const prompt = PET_PROMPT_TEMPLATES.amazonListing
      .replace('{{productInfo}}', JSON.stringify(request.productInfo))
      .replace('{{market}}', request.market || 'US')
      .replace('{{language}}', request.language);

    const content = await this.callModel(prompt, modelSelection.modelName);

    // 解析 Listing
    const { title, bulletPoints, description, backendKeywords } = this.parseAmazonListing(content);

    const result: GeneratedContent = {
      type: 'listing',
      platform: 'amazon',
      language: request.language,
      content: description,
      metadata: {
        title,
        bulletPoints,
        backendKeywords
      },
      modelUsed: modelSelection.modelName,
      cost: modelSelection.estimatedCost,
      cached: false
    };

    await setCache('llm', cacheKey, result);
    await recordApiCall({
      modelName: modelSelection.modelName,
      modelType: 'llm',
      source: modelSelection.source,
      department: 'sales',
      userId: 'system',
      cost: modelSelection.estimatedCost,
      success: true
    });

    return result;
  }

  /**
   * 生成独立站产品描述
   */
  async generateProductDescription(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const cacheKey = {
      productSku: request.productInfo.sku,
      platform: 'website',
      brandTone: request.brandTone,
      language: request.language
    };

    const cached = await getFromCache<GeneratedContent>('llm', cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const modelSelection = await selectModel({
      taskType: 'longText',
      priority: 'medium',
      requiresCreativity: true,
      requiresAccuracy: false
    });

    const prompt = PET_PROMPT_TEMPLATES.productDescription
      .replace('{{productInfo}}', JSON.stringify(request.productInfo))
      .replace('{{brandTone}}', request.brandTone || 'warm')
      .replace('{{audience}}', request.audience)
      .replace('{{language}}', request.language);

    const content = await this.callModel(prompt, modelSelection.modelName);

    const result: GeneratedContent = {
      type: 'description',
      platform: 'website',
      language: request.language,
      content,
      modelUsed: modelSelection.modelName,
      cost: modelSelection.estimatedCost,
      cached: false
    };

    await setCache('llm', cacheKey, result);
    await recordApiCall({
      modelName: modelSelection.modelName,
      modelType: 'llm',
      source: modelSelection.source,
      department: 'marketing',
      userId: 'system',
      cost: modelSelection.estimatedCost,
      success: true
    });

    return result;
  }

  /**
   * 批量生成内容
   */
  async batchGenerate(requests: ContentGenerationRequest[]): Promise<GeneratedContent[]> {
    const results: GeneratedContent[] = [];

    for (const request of requests) {
      try {
        let result: GeneratedContent;

        switch (request.platform) {
          case 'tiktok':
            result = await this.generateTikTokCaption(request);
            break;
          case 'instagram':
            result = await this.generateInstagramCaption(request);
            break;
          case 'youtube':
            result = await this.generateYouTubeContent(request);
            break;
          case 'amazon':
            result = await this.generateAmazonListing(request);
            break;
          case 'website':
            result = await this.generateProductDescription(request);
            break;
          default:
            throw new Error(`不支持的平台: ${request.platform}`);
        }

        results.push(result);
      } catch (error) {
        console.error(`生成内容失败: ${request.platform}`, error);
      }
    }

    return results;
  }

  /**
   * 调用模型（非流式）
   */
  private async callModel(prompt: string, modelName: string): Promise<string> {
    const { LLMClient, Config } = await import('coze-coding-dev-sdk');

    const config = new Config();
    const llmClient = new LLMClient(config);

    // 根据模型名称选择实际的模型
    const actualModel = 'doubao-seed-2-0-pro-260215';

    try {
      // 使用 invoke 方法调用模型（非流式）
      const result = await llmClient.invoke([
        { role: 'user', content: prompt }
      ], {
        model: actualModel,
        temperature: 0.8
      });

      // 提取内容
      if (result && typeof result === 'object' && 'content' in result) {
        return String(result.content);
      } else if (typeof result === 'string') {
        return result;
      } else {
        console.warn('模型返回格式异常:', result);
        return JSON.stringify(result);
      }
    } catch (error: any) {
      console.error('LLM 调用失败:', error);

      // 如果调用失败，返回一个错误提示
      return `⚠️ 内容生成失败: ${error.message}\n\n请检查：\n1. 模型配置是否正确\n2. 网络连接是否正常\n3. API 密钥是否有效`;
    }
  }

  /**
   * 提取话题标签
   */
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex) || [];
    return matches;
  }

  /**
   * 解析 YouTube 内容
   */
  private parseYouTubeContent(content: string): {
    titles: string[];
    description: string;
    keywords: string[];
  } {
    // TODO: 实现解析逻辑
    return {
      titles: [],
      description: content,
      keywords: []
    };
  }

  /**
   * 解析亚马逊 Listing
   */
  private parseAmazonListing(content: string): {
    title: string;
    bulletPoints: string[];
    description: string;
    backendKeywords: string;
  } {
    // TODO: 实现解析逻辑
    return {
      title: '',
      bulletPoints: [],
      description: content,
      backendKeywords: ''
    };
  }
}

export const petContentGenerator = new PetContentGenerator();
