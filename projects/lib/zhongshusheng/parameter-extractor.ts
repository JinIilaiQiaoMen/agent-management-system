/**
 * ZAEP 中书省 - 参数提取系统
 * 负责从用户输入中提取参数
 */

import { IntentParams } from '../types/san-sheng.types';
import { Intent, Ministry } from '../types/san-sheng.types';

/**
 * 参数提取规则
 */
interface ExtractionRule {
  name: string;
  patterns: RegExp[];
  type: 'string' | 'number' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
}

/**
 * 参数提取引擎
 */
export class ParameterExtractor {
  /**
   * 从文本中提取参数
   * @param text - 用户输入文本
   * @param intent - 识别出的意图
   */
  async extractParameters(text: string, intent: Intent): Promise<IntentParams> {
    const params: IntentParams = {};

    // 根据意图类型提取不同的参数
    switch (intent.id) {
      case 'customer_analysis':
        await this.extractCustomerParams(text, params);
        break;

      case 'email_generation':
        await this.extractEmailParams(text, params);
        break;

      case 'finance_analysis':
        await this.extractFinanceParams(text, params);
        break;

      case 'recruitment':
        await this.extractRecruitmentParams(text, params);
        break;

      case 'data_crawl':
        await this.extractCrawlParams(text, params);
        break;

      default:
        // 默认参数提取
        await this.extractDefaultParams(text, params);
        break;
    }

    return params;
  }

  /**
   * 提取客户分析参数
   */
  private async extractCustomerParams(text: string, params: IntentParams): Promise<void> {
    // 公司名称
    const companyMatch = text.match(/(?:分析|背调|评估)(?:一下|一下)?([^，。！\s]+)/);
    if (companyMatch) {
      params.company = companyMatch[1].trim();
    }

    // 分析类型
    if (text.includes('背调')) {
      params.analysisType = 'background';
    } else if (text.includes('信用')) {
      params.analysisType = 'credit';
    } else if (text.includes('画像')) {
      params.analysisType = 'profile';
    } else {
      params.analysisType = 'full';
    }

    // 详细程度
    if (text.includes('详细') || text.includes('全面')) {
      params.detailLevel = 'high';
    } else if (text.includes('简单') || text.includes('简要')) {
      params.detailLevel = 'low';
    } else {
      params.detailLevel = 'medium';
    }
  }

  /**
   * 提取邮件生成参数
   */
  private async extractEmailParams(text: string, params: IntentParams): Promise<void> {
    // 收件人/公司
    const recipientMatch = text.match(/(?:给|向)([^，。！\s]+)/);
    if (recipientMatch) {
      params.recipient = recipientMatch[1].trim();
    }

    // 邮件类型
    if (text.includes('产品') || text.includes('介绍')) {
      params.emailType = 'product_introduction';
    } else if (text.includes('合作')) {
      params.emailType = 'cooperation';
    } else if (text.includes('跟进')) {
      params.emailType = 'follow_up';
    } else if (text.includes('报价')) {
      params.emailType = 'quotation';
    } else {
      params.emailType = 'business';
    }

    // 语言
    if (text.includes('英文') || text.includes('English')) {
      params.language = 'en';
    } else if (text.includes('双语') || text.includes('中英')) {
      params.language = 'bilingual';
    } else {
      params.language = 'zh';
    }

    // 模板
    if (text.includes('正式') || text.includes('商务')) {
      params.template = 'formal';
    } else if (text.includes('友好')) {
      params.template = 'friendly';
    } else {
      params.template = 'standard';
    }
  }

  /**
   * 提取财务分析参数
   */
  private async extractFinanceParams(text: string, params: IntentParams): Promise<void> {
    // 时间周期
    const periodPatterns = [
      { pattern: /本月/, value: 'month' },
      { pattern: /本月/, value: 'current_month' },
      { pattern: /上个月|上月/, value: 'last_month' },
      { pattern: /最近三个月|近三个月/, value: 'quarter' },
      { pattern: /今年|本年/, value: 'year' },
      { pattern: /去年|上年/, value: 'last_year' },
    ];

    for (const { pattern, value } of periodPatterns) {
      if (pattern.test(text)) {
        params.period = value;
        break;
      }
    }

    if (!params.period) {
      params.period = 'month'; // 默认本月
    }

    // 分析类型
    if (text.includes('成本')) {
      params.financeType = 'cost';
    } else if (text.includes('利润')) {
      params.financeType = 'profit';
    } else if (text.includes('收入') || text.includes('营收')) {
      params.financeType = 'revenue';
    } else {
      params.financeType = 'general';
    }
  }

  /**
   * 提取招聘参数
   */
  private async extractRecruitmentParams(text: string, params: IntentParams): Promise<void> {
    // 职位
    const positionMatch = text.match(/(?:招聘|招)([^，。！\s]+)(?:的)?(?:简历|人员|员工)/);
    if (positionMatch) {
      params.position = positionMatch[1].trim();
    }

    // 操作类型
    if (text.includes('简历')) {
      params.action = 'view_resumes';
    } else if (text.includes('面试')) {
      params.action = 'schedule_interview';
    } else if (text.includes('发布')) {
      params.action = 'publish_job';
    } else {
      params.action = 'general';
    }

    // 数量限制
    const numberMatch = text.match(/(\d+)个|(\d+)份/);
    if (numberMatch) {
      params.limit = parseInt(numberMatch[1] || numberMatch[2]);
    } else {
      params.limit = 10; // 默认10条
    }
  }

  /**
   * 提取数据采集参数
   */
  private async extractCrawlParams(text: string, params: IntentParams): Promise<void> {
    // URL
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      params.url = urlMatch[0];
    }

    // 采集类型
    if (text.includes('商品')) {
      params.crawlType = 'product';
    } else if (text.includes('新闻') || text.includes('文章')) {
      params.crawlType = 'article';
    } else if (text.includes('评论') || text.includes('评价')) {
      params.crawlType = 'review';
    } else {
      params.crawlType = 'general';
    }

    // 深度
    if (text.includes('深度') || text.includes('详细')) {
      params.depth = 'deep';
    } else {
      params.depth = 'shallow';
    }
  }

  /**
   * 提取默认参数
   */
  private async extractDefaultParams(text: string, params: IntentParams): Promise<void> {
    // 尝试提取任何数字
    const numbers = text.match(/\d+/g);
    if (numbers) {
      params.numbers = numbers.map(n => parseInt(n));
    }

    // 尝试提取任何URL
    const urls = text.match(/https?:\/\/[^\s]+/g);
    if (urls) {
      params.urls = urls;
    }

    // 原始文本
    params.rawText = text;
  }

  /**
   * 验证参数完整性
   * @param params - 提取的参数
   * @param requiredParams - 必需参数列表
   */
  validateParameters(params: IntentParams, requiredParams: string[]): {
    valid: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    for (const required of requiredParams) {
      if (!params[required]) {
        missing.push(required);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * 补充默认参数
   * @param params - 参数对象
   * @param intent - 意图对象
   */
  applyDefaults(params: IntentParams, intent: Intent): IntentParams {
    // 根据意图类型补充默认值
    switch (intent.id) {
      case 'customer_analysis':
        if (!params.detailLevel) params.detailLevel = 'medium';
        if (!params.analysisType) params.analysisType = 'full';
        break;

      case 'email_generation':
        if (!params.language) params.language = 'zh';
        if (!params.template) params.template = 'standard';
        break;

      case 'finance_analysis':
        if (!params.period) params.period = 'month';
        break;

      case 'data_crawl':
        if (!params.depth) params.depth = 'shallow';
        break;
    }

    return params;
  }
}

/**
 * 单例实例
 */
export const parameterExtractor = new ParameterExtractor();

/**
 * 提取参数的便捷函数
 */
export async function extractParameters(text: string, intent: Intent): Promise<IntentParams> {
  return parameterExtractor.extractParameters(text, intent);
}
