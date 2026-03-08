/**
 * 内容合规审核 Agent
 * 基于本地开源模型，自动审核内容是否符合平台规则、广告法、知识产权要求
 */

import { COMPLIANCE_RULES } from '../ai-platform/config';
import { selectModel } from '../ai-platform/model-router';
import { getFromCache, setCache } from '../ai-platform/cache';
import { recordApiCall } from '../ai-platform/monitoring';

export interface ComplianceCheckRequest {
  content: string;
  platform: string;
  contentType: 'text' | 'image' | 'video';
  language: string;
  productCategory?: string;
}

export interface ComplianceIssue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  suggestion?: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface ComplianceResult {
  isCompliant: boolean;
  issues: ComplianceIssue[];
  score: number; // 0-100
  requiredDisclaimers: string[];
  recommendations: string[];
  modelUsed: string;
  cost: number;
}

/**
 * 内容合规审核器
 */
export class ComplianceAuditor {
  /**
   * 执行合规检查
   */
  async checkCompliance(request: ComplianceCheckRequest): Promise<ComplianceResult> {
    const cacheKey = {
      contentHash: this.hashContent(request.content),
      platform: request.platform,
      contentType: request.contentType
    };

    // 检查缓存
    const cached = await getFromCache<ComplianceResult>('llm', cacheKey);
    if (cached) {
      return cached;
    }

    // 选择模型（使用本地模型，零成本）
    const modelSelection = await selectModel({
      taskType: 'contentCompliance',
      priority: 'high',
      requiresCreativity: false,
      requiresAccuracy: true
    });

    // 执行检查
    const issues = await this.performChecks(request);
    const requiredDisclaimers = this.checkRequiredDisclaimers(request);

    // 计算合规分数
    const score = this.calculateScore(issues);

    const result: ComplianceResult = {
      isCompliant: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      score,
      requiredDisclaimers,
      recommendations: this.generateRecommendations(issues, request),
      modelUsed: modelSelection.modelName,
      cost: modelSelection.estimatedCost
    };

    // 缓存结果
    await setCache('llm', cacheKey, result);

    // 记录 API 调用
    await recordApiCall({
      modelName: modelSelection.modelName,
      modelType: 'llm',
      source: modelSelection.source,
      department: 'operations',
      userId: 'system',
      cost: modelSelection.estimatedCost,
      success: true
    });

    return result;
  }

  /**
   * 执行各项检查
   */
  private async performChecks(request: ComplianceCheckRequest): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];

    // 1. 检查禁止使用的词汇
    issues.push(...this.checkProhibitedWords(request));

    // 2. 检查广告法合规性
    if (request.platform === 'amazon' || request.platform === 'website') {
      issues.push(...this.checkAdvertisingLaw(request));
    }

    // 3. 检查知识产权
    if (COMPLIANCE_RULES.rules.copyrightCheck) {
      issues.push(...await this.checkCopyright(request));
    }

    // 4. 检查平台特定规则
    issues.push(...this.checkPlatformRules(request));

    return issues;
  }

  /**
   * 检查禁止使用的词汇
   */
  private checkProhibitedWords(request: ComplianceCheckRequest): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const prohibitedWords = COMPLIANCE_RULES.rules.prohibitedWords;

    prohibitedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      let match;
      while ((match = regex.exec(request.content)) !== null) {
        issues.push({
          severity: 'high',
          type: 'prohibitedWord',
          description: `禁止使用的词汇: "${word}"`,
          suggestion: `建议替换为: ${this.getAlternativeWord(word)}`,
          position: {
            start: match.index,
            end: match.index + word.length
          }
        });
      }
    });

    return issues;
  }

  /**
   * 检查广告法合规性
   */
  private checkAdvertisingLaw(request: ComplianceCheckRequest): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // 检查绝对化用语
    const absoluteWords = ['最', '第一', '唯一', '顶级', '极致', '完美', '永不'];
    absoluteWords.forEach(word => {
      const regex = new RegExp(`["']?${word}["']?`, 'gi');
      if (regex.test(request.content)) {
        issues.push({
          severity: 'high',
          type: 'advertisingLaw',
          description: `可能违反广告法的绝对化用语: "${word}"`,
          suggestion: '建议删除或修改为更客观的表述'
        });
      }
    });

    // 检查虚假宣传
    if (request.content.includes('100%') && !request.content.includes('用户')) {
      issues.push({
        severity: 'medium',
        type: 'advertisingLaw',
        description: '使用 "100%" 可涉嫌虚假宣传',
        suggestion: '建议提供数据来源或修改为 "大部分用户"'
      });
    }

    return issues;
  }

  /**
   * 检查知识产权
   */
  private async checkCopyright(request: ComplianceCheckRequest): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];

    // TODO: 集成商标数据库 API
    // 这里应该调用商标查询 API 检查是否使用了注册商标

    return issues;
  }

  /**
   * 检查平台特定规则
   */
  private checkPlatformRules(request: ComplianceCheckRequest): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    switch (request.platform) {
      case 'amazon':
        issues.push(...this.checkAmazonRules(request));
        break;
      case 'tiktok':
        issues.push(...this.checkTikTokRules(request));
        break;
      case 'instagram':
        issues.push(...this.checkInstagramRules(request));
        break;
    }

    return issues;
  }

  /**
   * 检查亚马逊规则
   */
  private checkAmazonRules(request: ComplianceCheckRequest): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // 标题长度检查
    if (request.contentType === 'text' && request.content.length > 200) {
      issues.push({
        severity: 'medium',
        type: 'platformRule',
        description: '亚马逊标题超过 200 字符',
        suggestion: '建议缩短标题，控制在 200 字符以内'
      });
    }

    // 检查外部链接
    if (request.content.includes('http')) {
      issues.push({
        severity: 'high',
        type: 'platformRule',
        description: '包含外部链接，违反亚马逊规则',
        suggestion: '建议删除所有外部链接'
      });
    }

    return issues;
  }

  /**
   * 检查 TikTok 规则
   */
  private checkTikTokRules(request: ComplianceCheckRequest): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // 检查敏感内容
    const sensitiveKeywords = ['政治', '宗教', '暴力', '色情'];
    sensitiveKeywords.forEach(keyword => {
      if (request.content.toLowerCase().includes(keyword.toLowerCase())) {
        issues.push({
          severity: 'high',
          type: 'platformRule',
          description: `可能触发 TikTok 敏感内容检测: "${keyword}"`,
          suggestion: '建议删除相关内容或修改表述'
        });
      }
    });

    return issues;
  }

  /**
   * 检查 Instagram 规则
   */
  private checkInstagramRules(request: ComplianceCheckRequest): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    // 检查话题标签数量
    const hashtagCount = (request.content.match(/#/g) || []).length;
    if (hashtagCount > 30) {
      issues.push({
        severity: 'medium',
        type: 'platformRule',
        description: `话题标签数量过多 (${hashtagCount} 个)，Instagram 限制 30 个`,
        suggestion: '建议减少话题标签数量，控制在 30 个以内'
      });
    }

    return issues;
  }

  /**
   * 检查是否需要免责声明
   */
  private checkRequiredDisclaimers(request: ComplianceCheckRequest): string[] {
    const disclaimers: string[] = [];
    const rules = COMPLIANCE_RULES.rules.requiredDisclaimers;

    // 健康相关产品需要免责声明
    if (request.productCategory === 'food' || request.productCategory === 'medicine') {
      disclaimers.push(rules.health);
    }

    // 食品类需要免责声明
    if (request.productCategory === 'food') {
      disclaimers.push(rules.dietary);
    }

    return disclaimers;
  }

  /**
   * 计算合规分数
   */
  private calculateScore(issues: ComplianceIssue[]): number {
    let score = 100;

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(issues: ComplianceIssue[], request: ComplianceCheckRequest): string[] {
    const recommendations: string[] = [];

    // 提取所有建议
    issues.forEach(issue => {
      if (issue.suggestion && !recommendations.includes(issue.suggestion)) {
        recommendations.push(issue.suggestion);
      }
    });

    // 平台特定建议
    switch (request.platform) {
      case 'amazon':
        recommendations.push('建议定期查看亚马逊政策更新，确保合规性');
        break;
      case 'tiktok':
        recommendations.push('建议使用 TikTok 官方的内容审核工具进行二次检查');
        break;
    }

    return recommendations;
  }

  /**
   * 获取替代词汇
   */
  private getAlternativeWord(word: string): string {
    const alternatives: Record<string, string> = {
      '治愈': '缓解',
      '疗效': '效果',
      '保证': '承诺',
      '永久': '长期',
      '最佳': '优秀',
      '第一名': '领先'
    };

    return alternatives[word] || '建议修改';
  }

  /**
   * 生成内容哈希（用于缓存）
   */
  private hashContent(content: string): string {
    // 简单哈希实现
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

export const complianceAuditor = new ComplianceAuditor();
