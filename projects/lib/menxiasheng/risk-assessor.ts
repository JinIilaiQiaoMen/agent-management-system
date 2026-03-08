/**
 * ZAEP 门下省 - 风险评估系统
 * 负责评估操作风险
 */

import { CheckItem, RiskLevel, RejectionReason } from '../types/san-sheng.types';

/**
 * 风险因素定义
 */
interface RiskFactor {
  id: string;
  name: string;
  description: string;
  weight: number; // 权重 0-1
  check: (intent: any, parameters: any, message: string) => Promise<{
    score: number; // 风险分数 0-1
    reason: string;
  }>;
}

/**
 * 风险评估系统
 */
export class RiskAssessor {
  private riskFactors: RiskFactor[];

  constructor() {
    this.riskFactors = this.initializeRiskFactors();
  }

  /**
   * 初始化风险因素
   */
  private initializeRiskFactors(): RiskFactor[] {
    return [
      {
        id: 'data_impact',
        name: '数据影响',
        description: '评估操作对数据的影响范围',
        weight: 0.4,
        check: this.checkDataImpact.bind(this),
      },
      {
        id: 'reversibility',
        name: '可逆性',
        description: '评估操作是否可逆',
        weight: 0.3,
        check: this.checkReversibility.bind(this),
      },
      {
        id: 'user_intent',
        name: '用户意图',
        description: '评估用户意图是否合理',
        weight: 0.2,
        check: this.checkUserIntent.bind(this),
      },
      {
        id: 'system_resources',
        name: '系统资源',
        description: '评估操作对系统资源的影响',
        weight: 0.1,
        check: this.checkSystemResources.bind(this),
      },
    ];
  }

  /**
   * 评估风险
   * @param intent - 意图
   * @param parameters - 参数
   * @param message - 原始消息
   */
  async assessRisk(
    intent: { id: string; name: string },
    parameters: any,
    message: string
  ): Promise<CheckItem & { riskLevel: RiskLevel; riskFactors: any[] }> {
    console.log(`[门下省] 风险评估: 意图=${intent.id}`);

    const riskFactorResults: any[] = [];
    let totalRisk = 0;

    // 评估每个风险因素
    for (const factor of this.riskFactors) {
      const result = await factor.check(intent, parameters, message);
      const weightedRisk = result.score * factor.weight;

      riskFactorResults.push({
        factorId: factor.id,
        factorName: factor.name,
        weight: factor.weight,
        score: result.score,
        weightedRisk,
        reason: result.reason,
      });

      totalRisk += weightedRisk;
    }

    // 确定风险等级
    const riskLevel = this.calculateRiskLevel(totalRisk);

    // 生成检查结果
    const checkItem: CheckItem & { riskLevel: RiskLevel; riskFactors: any[] } = {
      name: '风险评估',
      passed: riskLevel !== 'critical',
      message: this.generateRiskMessage(totalRisk, riskLevel),
      riskLevel,
      riskFactors: riskFactorResults,
      details: {
        totalRiskScore: Math.round(totalRisk * 100) / 100,
        maxRisk: 1.0,
      },
    };

    console.log(`[门下省] 风险评估完成: 风险等级=${riskLevel}, 总分=${totalRisk.toFixed(2)}`);

    return checkItem;
  }

  /**
   * 计算风险等级
   */
  private calculateRiskLevel(totalRisk: number): RiskLevel {
    if (totalRisk >= 0.8) return 'critical';
    if (totalRisk >= 0.6) return 'high';
    if (totalRisk >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * 生成风险消息
   */
  private generateRiskMessage(totalRisk: number, riskLevel: RiskLevel): string {
    const percentage = Math.round(totalRisk * 100);

    const messages: Record<RiskLevel, string> = {
      low: `风险评估完成，风险等级: 低 (${percentage}%)，操作相对安全`,
      medium: `风险评估完成，风险等级: 中 (${percentage}%)，请谨慎操作`,
      high: `风险评估完成，风险等级: 高 (${percentage}%)，强烈建议三思`,
      critical: `风险评估完成，风险等级: 严重 (${percentage}%)，建议取消或寻求授权`,
    };

    return messages[riskLevel];
  }

  /**
   * 检查数据影响
   */
  private async checkDataImpact(
    intent: { id: string; name: string },
    parameters: any,
    message: string
  ): Promise<{ score: number; reason: string }> {
    let score = 0;
    const reasons: string[] = [];

    // 检查是否是批量操作
    if (message.includes('所有') || message.includes('全部') || message.includes('批量')) {
      score += 0.6;
      reasons.push('涉及批量数据操作');
    }

    // 检查意图类型
    const highImpactIntents = ['customer_analysis', 'data_crawl', 'system_maintenance'];
    if (highImpactIntents.includes(intent.id)) {
      score += 0.3;
      reasons.push(`意图"${intent.name}"可能对数据产生影响`);
    }

    // 检查参数中的数量限制
    if (parameters.limit && parameters.limit > 100) {
      score += 0.4;
      reasons.push(`操作涉及${parameters.limit}条数据`);
    }

    if (score === 0) {
      reasons.push('数据影响较小');
    }

    return {
      score: Math.min(score, 1.0),
      reason: reasons.join('; '),
    };
  }

  /**
   * 检查可逆性
   */
  private async checkReversibility(
    intent: { id: string; name: string },
    parameters: any,
    message: string
  ): Promise<{ score: number; reason: string }> {
    const irreversibleKeywords = ['删除', '清空', '覆盖', '清除'];
    const reversibleKeywords = ['查询', '查看', '分析', '评估', '生成'];

    let score = 0;
    const reasons: string[] = [];

    // 检查是否包含不可逆关键词
    for (const keyword of irreversibleKeywords) {
      if (message.includes(keyword)) {
        score += 0.7;
        reasons.push(`包含不可逆操作"${keyword}"`);
        break;
      }
    }

    // 检查是否包含可逆关键词
    for (const keyword of reversibleKeywords) {
      if (message.includes(keyword)) {
        score = Math.max(0, score - 0.3);
        reasons.push(`包含可逆操作"${keyword}"`);
        break;
      }
    }

    // 根据意图判断
    if (intent.id.includes('delete') || intent.id.includes('clear') || intent.id.includes('remove')) {
      score = Math.min(score + 0.3, 1.0);
      reasons.push('意图类型为不可逆操作');
    }

    if (intent.id.includes('query') || intent.id.includes('get') || intent.id.includes('list')) {
      score = 0;
      reasons.push('意图类型为查询操作，完全可逆');
    }

    if (score === 0) {
      reasons.push('操作可逆');
    } else if (score < 0.5) {
      reasons.push('操作部分可逆');
    } else {
      reasons.push('操作不可逆');
    }

    return {
      score: Math.min(score, 1.0),
      reason: reasons.join('; '),
    };
  }

  /**
   * 检查用户意图
   */
  private async checkUserIntent(
    intent: { id: string; name: string },
    parameters: any,
    message: string
  ): Promise<{ score: number; reason: string }> {
    let score = 0;
    const reasons: string[] = [];

    // 检查参数完整性
    const missingParams = this.getMissingParameters(intent.id, parameters);
    if (missingParams.length > 0) {
      score += 0.3;
      reasons.push(`缺少参数: ${missingParams.join(', ')}`);
    }

    // 检查参数有效性
    const invalidParams = this.getInvalidParameters(parameters);
    if (invalidParams.length > 0) {
      score += 0.4;
      reasons.push(`参数无效: ${invalidParams.join(', ')}`);
    }

    // 检查意图与参数是否匹配
    const mismatch = this.checkIntentParameterMismatch(intent.id, parameters);
    if (mismatch) {
      score += 0.5;
      reasons.push(mismatch);
    }

    if (score === 0) {
      reasons.push('用户意图清晰，参数完整有效');
    }

    return {
      score: Math.min(score, 1.0),
      reason: reasons.join('; '),
    };
  }

  /**
   * 检查系统资源
   */
  private async checkSystemResources(
    intent: { id: string; name: string },
    parameters: any,
    message: string
  ): Promise<{ score: number; reason: string }> {
    let score = 0;
    const reasons: string[] = [];

    // 检查是否是大量数据操作
    if (parameters.limit && parameters.limit > 1000) {
      score += 0.4;
      reasons.push(`操作数据量较大 (${parameters.limit}条)`);
    }

    // 检查是否是系统维护操作
    if (intent.id === 'system_maintenance') {
      score += 0.3;
      reasons.push('系统维护操作可能影响服务');
    }

    // 检查是否是爬虫操作
    if (intent.id === 'data_crawl' && parameters.depth === 'deep') {
      score += 0.3;
      reasons.push('深度爬取可能消耗大量资源');
    }

    if (score === 0) {
      reasons.push('对系统资源影响较小');
    }

    return {
      score: Math.min(score, 1.0),
      reason: reasons.join('; '),
    };
  }

  /**
   * 获取缺失的参数
   */
  private getMissingParameters(intentId: string, parameters: any): string[] {
    const requiredParams: Record<string, string[]> = {
      'customer_analysis': ['company'],
      'email_generation': ['recipient', 'emailType'],
      'data_crawl': ['url'],
      'recruitment': ['position'],
    };

    const required = requiredParams[intentId] || [];
    return required.filter(param => !parameters[param]);
  }

  /**
   * 获取无效的参数
   */
  private getInvalidParameters(parameters: any): string[] {
    const invalid: string[] = [];

    // 检查URL格式
    if (parameters.url) {
      try {
        new URL(parameters.url);
      } catch {
        invalid.push('url');
      }
    }

    // 检查数字参数
    if (parameters.limit && (typeof parameters.limit !== 'number' || parameters.limit < 0)) {
      invalid.push('limit');
    }

    return invalid;
  }

  /**
   * 检查意图参数不匹配
   */
  private checkIntentParameterMismatch(intentId: string, parameters: any): string | null {
    // 检查客户分析是否缺少公司名
    if (intentId === 'customer_analysis' && !parameters.company) {
      return '客户分析需要公司名称参数';
    }

    // 检查邮件生成是否缺少收件人
    if (intentId === 'email_generation' && !parameters.recipient) {
      return '邮件生成需要收件人参数';
    }

    // 检查数据爬取是否缺少URL
    if (intentId === 'data_crawl' && !parameters.url) {
      return '数据爬取需要URL参数';
    }

    return null;
  }

  /**
   * 生成驳回原因
   * @param riskLevel - 风险等级
   * @param riskFactors - 风险因素结果
   */
  generateRejectionReason(
    riskLevel: RiskLevel,
    riskFactors: any[]
  ): RejectionReason {
    const suggestions: string[] = [];

    // 根据风险因素生成建议
    for (const factor of riskFactors) {
      if (factor.weightedRisk > 0.3) {
        if (factor.factorId === 'data_impact') {
          suggestions.push('建议先在测试环境验证');
        } else if (factor.factorId === 'reversibility') {
          suggestions.push('建议先备份数据');
          suggestions.push('或使用更安全的操作方式');
        } else if (factor.factorId === 'user_intent') {
          suggestions.push('请完善参数信息');
        } else if (factor.factorId === 'system_resources') {
          suggestions.push('建议在低峰期执行');
        }
      }
    }

    return {
      category: 'risk',
      level: riskLevel,
      message: `操作风险等级过高 (${riskLevel})，建议谨慎操作`,
      suggestions: suggestions.length > 0 ? suggestions : ['请确认操作安全性后再执行'],
    };
  }

  /**
   * 添加风险因素
   */
  addRiskFactor(factor: RiskFactor): void {
    this.riskFactors.push(factor);
  }

  /**
   * 获取所有风险因素
   */
  getAllRiskFactors(): RiskFactor[] {
    return this.riskFactors;
  }
}

/**
 * 单例实例
 */
export const riskAssessor = new RiskAssessor();

/**
 * 评估风险的便捷函数
 */
export async function assessRisk(
  intent: { id: string; name: string },
  parameters: any,
  message: string
): Promise<CheckItem & { riskLevel: RiskLevel; riskFactors: any[] }> {
  return riskAssessor.assessRisk(intent, parameters, message);
}
