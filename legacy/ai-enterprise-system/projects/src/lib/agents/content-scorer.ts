/**
 * 内容质量评分系统
 * 基于真实性和营销效果对生成内容进行准确评分
 */

export interface ContentScore {
  overall: number; // 总分 0-100
  dimensions: {
    fluency: number; // 语言流畅度 0-100
    relevance: number; // 内容相关性 0-100
    appeal: number; // 吸引力 0-100
    authenticity: number; // 真实性 0-100
    platformFit: number; // 平台适配度 0-100
    ctaStrength: number; // 行动号召强度 0-100
  };
  strengths: string[]; // 优点
  weaknesses: string[]; // 缺点
  suggestions: string[]; // 改进建议
}

export class ContentScorer {
  /**
   * 对生成内容进行评分
   */
  scoreContent(
    content: string,
    platform: string,
    productName: string,
    productDescription?: string
  ): ContentScore {
    const scores = {
      fluency: this.scoreFluency(content),
      relevance: this.scoreRelevance(content, productName, productDescription),
      appeal: this.scoreAppeal(content),
      authenticity: this.scoreAuthenticity(content),
      platformFit: this.scorePlatformFit(content, platform),
      ctaStrength: this.scoreCTAStrength(content)
    };

    const overall = Math.round(
      (scores.fluency * 0.15 +
        scores.relevance * 0.2 +
        scores.appeal * 0.2 +
        scores.authenticity * 0.2 +
        scores.platformFit * 0.15 +
        scores.ctaStrength * 0.1)
    );

    return {
      overall,
      dimensions: scores,
      strengths: this.identifyStrengths(content, scores),
      weaknesses: this.identifyWeaknesses(content, scores),
      suggestions: this.generateSuggestions(scores, platform)
    };
  }

  /**
   * 评分：语言流畅度
   */
  private scoreFluency(content: string): number {
    let score = 100;

    // 检查语法问题
    const grammarIssues = [
      /\btest product\b/i, // 模糊的产品名
      /\bthe the\b/i, // 重复词汇
      /\ba a\b/i, // 重复冠词
      /\bto to\b/i, // 重复介词
      /\bof of\b/i // 重复介词
    ];

    grammarIssues.forEach(pattern => {
      if (pattern.test(content)) {
        score -= 10;
      }
    });

    // 检查句子长度
    const sentences = content.split(/[.!?]/);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    if (avgLength > 200) {
      score -= 5; // 句子过长
    }

    // 检查是否有表情符号（TikTok/Instagram 适用）
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    if (emojiCount > 0 && emojiCount <= 3) {
      score += 5; // 适量表情符号加分
    } else if (emojiCount > 3) {
      score -= 5; // 过多表情符号扣分
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评分：内容相关性
   */
  private scoreRelevance(content: string, productName: string, description?: string): number {
    let score = 50;

    // 检查是否包含产品关键词
    const productKeywords = productName.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();

    let keywordMatches = 0;
    productKeywords.forEach(keyword => {
      if (keyword.length > 3 && contentLower.includes(keyword)) {
        keywordMatches++;
      }
    });

    if (keywordMatches >= productKeywords.length * 0.5) {
      score += 30;
    } else if (keywordMatches >= productKeywords.length * 0.3) {
      score += 15;
    }

    // 检查是否包含宠物相关词汇
    const petKeywords = ['dog', 'cat', 'pet', 'puppy', 'kitty', 'fur baby', 'furry'];
    const petMatches = petKeywords.filter(kw => contentLower.includes(kw)).length;
    score += petMatches * 5;

    return Math.min(100, score);
  }

  /**
   * 评分：吸引力
   */
  private scoreAppeal(content: string): number {
    let score = 50;

    // 检查开头是否吸引人
    const firstSentence = content.split('.')[0];
    const attractiveOpeners = [
      /stop scrolling/i,
      /wait/i,
      /you need to see/i,
      /finally/i,
      /game changer/i,
      /must have/i,
      /don't miss/i
    ];

    if (attractiveOpeners.some(opener => opener.test(firstSentence))) {
      score += 20;
    }

    // 检查是否使用故事化语言
    const storyIndicators = ['last week', 'yesterday', 'i used to', 'until i found', 'my experience'];
    if (storyIndicators.some(indicator => content.toLowerCase().includes(indicator))) {
      score += 15;
    }

    // 检查是否有紧迫感
    const urgencyWords = ['hurry', 'limited', 'now', 'today only', 'last chance', 'exclusive'];
    if (urgencyWords.some(word => content.toLowerCase().includes(word))) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * 评分：真实性
   */
  private scoreAuthenticity(content: string): number {
    let score = 50;

    // 检查是否过度夸张
    const exaggeratedWords = ['best ever', 'amazing', 'incredible', 'perfect', 'miracle', 'magic'];
    const exaggerationCount = exaggeratedWords.filter(word => content.toLowerCase().includes(word)).length;
    if (exaggerationCount > 3) {
      score -= 20;
    }

    // 检查是否包含具体细节
    const specificDetails = [
      /\d+\s*(day|week|month|year)/i, // 具体时间
      /\$\d+/, // 具体价格
      /\d+\s*\%/i, // 百分比
      /\d+\s*(star|review)/i, // 评价数量
    ];

    const detailCount = specificDetails.filter(pattern => pattern.test(content)).length;
    score += detailCount * 10;

    // 检查是否使用"test product"等模糊词汇（扣分）
    if (/test product|sample|free trial/i.test(content)) {
      score -= 30;
    }

    // 检查是否有具体的材质、尺寸等信息
    const productSpecs = ['material', 'size', 'weight', 'dimensions', 'ingredients'];
    const specMatches = productSpecs.filter(spec => content.toLowerCase().includes(spec)).length;
    score += specMatches * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 评分：平台适配度
   */
  private scorePlatformFit(content: string, platform: string): number {
    let score = 50;

    const contentLower = content.toLowerCase();

    switch (platform) {
      case 'tiktok':
        // TikTok 需要短句、表情符号、话题标签
        if (content.length < 500) score += 20; // 长度适中
        if (/#[a-z]+/i.test(content)) score += 20; // 有话题标签
        if (/[\u{1F600}-\u{1F64F}]/u.test(content)) score += 10; // 有表情
        break;

      case 'instagram':
        // Instagram 需要精致、有故事感
        if (content.length > 100 && content.length < 300) score += 20;
        if (content.split('.').length > 3) score += 15; // 多句式
        if (/#[a-z]+/i.test(content)) score += 20;
        break;

      case 'youtube':
        // YouTube 需要详细描述、SEO 优化
        if (content.length > 200) score += 20;
        if (/https?:\/\//.test(content)) score += 15; // 包含链接
        break;

      case 'amazon':
        // Amazon 需要专业、简洁、功能导向
        if (!/amazing|incredible|best ever/i.test(content)) score += 15; // 不夸张
        if (/benefit|feature|advantage/i.test(content)) score += 20; // 强调功能
        break;

      default:
        score = 50;
    }

    return Math.min(100, score);
  }

  /**
   * 评分：行动号召强度
   */
  private scoreCTAStrength(content: string): number {
    let score = 50;

    const strongCTAs = [
      /click the link/i,
      /shop now/i,
      /get yours/i,
      /order now/i,
      /buy today/i,
      /limited time/i,
      /exclusive/i
    ];

    const weakCTAs = [
      /check it out/i,
      /visit our site/i,
      /see more/i,
      /learn more/i
    ];

    if (strongCTAs.some(cta => cta.test(content))) {
      score += 30;
    } else if (weakCTAs.some(cta => cta.test(content))) {
      score += 10;
    }

    // 检查是否有 CTA
    if (!/click|shop|get|buy|order|visit|check/i.test(content)) {
      score -= 30;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 识别优点
   */
  private identifyStrengths(content: string, scores: any): string[] {
    const strengths: string[] = [];

    if (scores.fluency > 80) strengths.push('语言流畅自然');
    if (scores.appeal > 80) strengths.push('开头吸引人，有故事感');
    if (scores.platformFit > 80) strengths.push('符合平台风格');
    if (scores.ctaStrength > 80) strengths.push('行动号召有力');
    if (/#[a-z]+/i.test(content)) strengths.push('包含话题标签');
    if (/[\u{1F600}-\u{1F64F}]/u.test(content)) strengths.push('使用表情符号，增加亲和力');
    if (content.length < 500 && scores.platformFit > 80) strengths.push('长度适中，易于阅读');

    return strengths.length > 0 ? strengths : ['无明显优点'];
  }

  /**
   * 识别缺点
   */
  private identifyWeaknesses(content: string, scores: any): string[] {
    const weaknesses: string[] = [];

    if (scores.fluency < 60) weaknesses.push('语言表达不够流畅');
    if (scores.relevance < 60) weaknesses.push('产品信息不够突出');
    if (scores.authenticity < 60) weaknesses.push('真实感不足，过于夸张或模糊');
    if (scores.ctaStrength < 60) weaknesses.push('行动号召不够有力');
    if (/test product/i.test(content)) weaknesses.push('使用模糊词汇，缺乏具体性');
    if (scores.platformFit < 60) weaknesses.push('不符合平台风格');
    if (/amazing|incredible|best ever/i.test(content) && scores.authenticity < 70) {
      weaknesses.push('过度使用夸张词汇');
    }

    return weaknesses.length > 0 ? weaknesses : ['无明显缺点'];
  }

  /**
   * 生成改进建议
   */
  private generateSuggestions(scores: any, platform: string): string[] {
    const suggestions: string[] = [];

    if (scores.fluency < 80) {
      suggestions.push('优化句子结构，减少语法错误');
    }

    if (scores.relevance < 80) {
      suggestions.push('增加产品特色和具体卖点');
    }

    if (scores.authenticity < 80) {
      suggestions.push('减少夸张词汇，增加具体细节和使用场景');
    }

    if (scores.ctaStrength < 80) {
      suggestions.push('加强行动号召，使用更有力的 CTA');
    }

    if (platform === 'tiktok' && scores.platformFit < 80) {
      suggestions.push('增加话题标签和表情符号');
      suggestions.push('控制文案长度在 200 字以内');
    }

    if (platform === 'instagram' && scores.platformFit < 80) {
      suggestions.push('增加更多情感化描述');
      suggestions.push('使用 5-10 个精准话题标签');
    }

    if (suggestions.length === 0) {
      suggestions.push('内容质量良好，可以直接使用');
    }

    return suggestions;
  }
}

export const contentScorer = new ContentScorer();
