/**
 * ZAEP 中书省 - 决策系统
 * 负责草拟诏令，辅助决策
 */

import { v4 as uuidv4 } from 'uuid';
import { IntentEngine, recognizeIntent } from './intent-engine';
import { ParameterExtractor, extractParameters } from './parameter-extractor';
import {
  ImperialDecree,
  RequestContext,
  EdictDraft,
  ResponseToEmperor,
  RejectionReason,
} from '../types/san-sheng.types';

/**
 * 中书省 - 决策草拟机构
 */
export class ZhongshuSheng {
  private intentEngine: IntentEngine;
  private parameterExtractor: ParameterExtractor;

  constructor() {
    this.intentEngine = new IntentEngine();
    this.parameterExtractor = new ParameterExtractor();
  }

  /**
   * 草拟诏令
   * @param imperialDecree - 皇帝的圣旨（用户输入）
   * @param context - 请求上下文
   */
  async draftEdict(
    imperialDecree: string,
    context: RequestContext
  ): Promise<EdictDraft> {
    // 1. 理解圣意（意图识别）
    const intent = await this.intentEngine.recognizeIntent(imperialDecree);

    console.log('[中书省] 识别意图:', intent);

    // 2. 提取参数
    let parameters = await this.parameterExtractor.extractParameters(
      imperialDecree,
      intent
    );

    console.log('[中书省] 提取参数:', parameters);

    // 3. 验证参数
    const validation = this.parameterExtractor.validateParameters(
      parameters,
      this.getRequiredParams(intent.id)
    );

    if (!validation.valid) {
      // 参数不完整，标记为需要补充
      parameters._needsInfo = true;
      parameters._missingParams = validation.missing;
    }

    // 4. 补充默认参数
    parameters = this.parameterExtractor.applyDefaults(parameters, intent);

    // 5. 确定目标六部
    const targetMinistry = intent.targetMinistry;

    // 6. 确定优先级
    const priority = this.determinePriority(imperialDecree);

    // 7. 草拟诏令
    const edictDraft: EdictDraft = {
      id: `draft_${uuidv4()}`,
      intent,
      parameters,
      targetMinistry,
      priority,
      createdBy: context.userId,
      createdAt: context.timestamp,
      status: 'draft',
    };

    console.log('[中书省] 草拟诏令:', edictDraft);

    return edictDraft;
  }

  /**
   * 处理封驳
   * @param edictDraft - 被驳回的诏令
   * @param rejectionReason - 驳回原因
   */
  async handleRejection(
    edictDraft: EdictDraft,
    rejectionReason: RejectionReason
  ): Promise<ResponseToEmperor> {
    console.log('[中书省] 收到驳回:', rejectionReason);

    // 生成解释和建议
    const explanation = this.generateRejectionExplanation(
      edictDraft,
      rejectionReason
    );

    const suggestions = this.generateSuggestions(
      edictDraft,
      rejectionReason
    );

    return {
      type: 'rejection',
      message: explanation,
      suggestions,
      edict: edictDraft,
      rejectionReason,
    };
  }

  /**
   * 确定优先级
   */
  private determinePriority(text: string): 'normal' | 'urgent' | 'critical' {
    const urgentKeywords = ['紧急', '立即', '马上', '快点', '急'];
    const criticalKeywords = ['危险', '严重', '严重错误', '数据丢失', '系统崩溃'];

    for (const keyword of criticalKeywords) {
      if (text.includes(keyword)) {
        return 'critical';
      }
    }

    for (const keyword of urgentKeywords) {
      if (text.includes(keyword)) {
        return 'urgent';
      }
    }

    return 'normal';
  }

  /**
   * 获取必需参数
   */
  private getRequiredParams(intentId: string): string[] {
    const requiredParamsMap: Record<string, string[]> = {
      'customer_analysis': ['company'],
      'email_generation': ['recipient'],
      'data_crawl': ['url'],
    };

    return requiredParamsMap[intentId] || [];
  }

  /**
   * 生成驳回解释
   */
  private generateRejectionExplanation(
    edictDraft: EdictDraft,
    rejectionReason: RejectionReason
  ): string {
    const { category, level, message } = rejectionReason;

    let explanation = `圣旨已被驳回。`;

    switch (category) {
      case 'permission':
        explanation += `\n\n原因: 权限不足`;
        break;
      case 'safety':
        explanation += `\n\n原因: 存在安全隐患`;
        break;
      case 'logic':
        explanation += `\n\n原因: 逻辑有问题`;
        break;
      case 'risk':
        explanation += `\n\n原因: 风险等级过高 (${level})`;
        break;
    }

    explanation += `\n\n详细说明: ${message}`;

    return explanation;
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    edictDraft: EdictDraft,
    rejectionReason: RejectionReason
  ): string[] {
    const suggestions: string[] = [];

    // 根据驳回原因生成不同的建议
    switch (rejectionReason.category) {
      case 'permission':
        suggestions.push('请联系管理员开通相应权限');
        suggestions.push('或使用其他方式完成任务');
        break;

      case 'safety':
        suggestions.push('请确认操作不会造成数据损坏');
        suggestions.push('建议先备份数据');
        suggestions.push('或使用测试环境操作');
        break;

      case 'logic':
        suggestions.push('请检查输入参数是否完整');
        suggestions.push('或提供更详细的描述');
        break;

      case 'risk':
        suggestions.push('建议降低操作风险');
        suggestions.push('或分批执行，逐步验证');
        break;
    }

    // 如果有预设建议，也加入
    if (rejectionReason.suggestions && rejectionReason.suggestions.length > 0) {
      suggestions.push(...rejectionReason.suggestions);
    }

    return suggestions;
  }

  /**
   * 获取意图示例
   */
  getIntentExamples(intentId: string): string[] {
    return this.intentEngine.getIntentExamples(intentId);
  }

  /**
   * 获取所有意图
   */
  getAllIntents() {
    return this.intentEngine.getAllIntents();
  }
}

/**
 * 单例实例
 */
export const zhongshuSheng = new ZhongshuSheng();
