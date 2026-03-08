/**
 * ZAEP 中书省 - 意图识别引擎
 * 负责理解皇帝圣意，识别用户意图
 */

import { Intent, Ministry } from '../types/san-sheng.types';

/**
 * 意图定义
 */
interface IntentDefinition {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  targetMinistry: Ministry;
  requiredParams: string[];
  examples: string[];
}

/**
 * 意图库
 */
const INTENTS: IntentDefinition[] = [
  // ===== 户部 =====
  {
    id: 'customer_analysis',
    name: '客户分析',
    description: '分析客户背景、信用评估、客户画像',
    keywords: ['背调', '分析客户', '客户分析', '信用评估', '客户画像', '客户背景'],
    targetMinistry: Ministry.HUBU,
    requiredParams: ['company'],
    examples: [
      '帮我分析一下XX公司的客户背景',
      '分析XX公司的信用状况',
      '做一下客户背调',
    ],
  },

  {
    id: 'finance_analysis',
    name: '财务分析',
    description: '财务报表分析、成本分析、利润分析',
    keywords: ['财务', '报表', '成本', '利润', '收入', '财务分析'],
    targetMinistry: Ministry.HUBU,
    requiredParams: ['period'],
    examples: [
      '分析一下本月财务报表',
      '查一下最近三个月的成本',
    ],
  },

  // ===== 礼部 =====
  {
    id: 'email_generation',
    name: '邮件生成',
    description: '生成商务邮件、双语邮件、模板选择',
    keywords: ['生成邮件', '写邮件', '邮件模板', '发送邮件', '商务邮件'],
    targetMinistry: Ministry.LIBU_LI,
    requiredParams: ['recipient', 'type'],
    examples: [
      '给XX公司发一封产品介绍邮件',
      '生成一封商务合作邮件',
      '写一封跟进邮件',
    ],
  },

  {
    id: 'content_generation',
    name: '内容生成',
    description: '营销内容、产品描述、宣传文案',
    keywords: ['生成内容', '营销文案', '产品描述', '宣传'],
    targetMinistry: Ministry.LIBU_LI,
    requiredParams: ['topic'],
    examples: [
      '生成一个产品营销文案',
      '写一段产品介绍',
    ],
  },

  // ===== 吏部 =====
  {
    id: 'hr_management',
    name: 'HR管理',
    description: '员工管理、绩效考核、薪资计算',
    keywords: ['员工', '绩效', '薪资', '考核', 'HR', '人事'],
    targetMinistry: Ministry.LIBU,
    requiredParams: ['action'],
    examples: [
      '查看员工列表',
      '计算本月薪资',
      '查询绩效考核',
    ],
  },

  {
    id: 'recruitment',
    name: '招聘',
    description: '简历解析、面试安排、招聘管理',
    keywords: ['招聘', '简历', '面试', '求职'],
    targetMinistry: Ministry.LIBU,
    requiredParams: ['position'],
    examples: [
      '查看简历列表',
      '安排面试',
      '发布招聘信息',
    ],
  },

  // ===== 兵部 =====
  {
    id: 'risk_assessment',
    name: '风险评估',
    description: '风险识别、风险评估、风险控制',
    keywords: ['风险', '评估', '安全隐患', '安全检查'],
    targetMinistry: Ministry.BINGBU,
    requiredParams: ['target'],
    examples: [
      '评估一下这个项目的风险',
      '检查系统安全隐患',
    ],
  },

  {
    id: 'security_audit',
    name: '安全审计',
    description: '安全审计、权限检查、安全报告',
    keywords: ['审计', '安全审计', '权限', '安全报告'],
    targetMinistry: Ministry.BINGBU,
    requiredParams: ['scope'],
    examples: [
      '做一次安全审计',
      '检查用户权限',
    ],
  },

  // ===== 刑部 =====
  {
    id: 'compliance_check',
    name: '合规检查',
    description: '合规审核、内容审核、法律咨询',
    keywords: ['合规', '审核', '内容审核', '法律'],
    targetMinistry: Ministry.XINGBU,
    requiredParams: ['content'],
    examples: [
      '审核这个内容',
      '检查合规性',
    ],
  },

  // ===== 工部 =====
  {
    id: 'data_crawl',
    name: '数据采集',
    description: '数据爬取、内容提取、批量采集',
    keywords: ['爬取', '采集', '抓取', '数据'],
    targetMinistry: Ministry.GONGBU,
    requiredParams: ['url'],
    examples: [
      '爬取这个网站的数据',
      '采集商品信息',
    ],
  },

  {
    id: 'system_maintenance',
    name: '系统维护',
    description: '系统运维、监控告警、日志分析',
    keywords: ['运维', '监控', '告警', '日志', '维护'],
    targetMinistry: Ministry.GONGBU,
    requiredParams: ['action'],
    examples: [
      '查看系统日志',
      '检查系统状态',
    ],
  },
];

/**
 * 意图识别引擎
 */
export class IntentEngine {
  private intents: IntentDefinition[];

  constructor() {
    this.intents = INTENTS;
  }

  /**
   * 识别意图
   * @param text - 用户输入文本
   */
  async recognizeIntent(text: string): Promise<Intent> {
    const normalizedText = this.normalizeText(text);

    // 1. 关键词匹配
    const matchedIntents = this.matchByKeywords(normalizedText);

    // 2. 如果没有匹配，使用默认意图
    if (matchedIntents.length === 0) {
      return this.createDefaultIntent(text);
    }

    // 3. 如果有多个匹配，选择最高分数的
    const bestMatch = this.selectBestMatch(matchedIntents, normalizedText);

    // 4. 构建Intent对象
    return {
      id: bestMatch.definition.id,
      name: bestMatch.definition.name,
      description: bestMatch.definition.description,
      confidence: bestMatch.score,
      targetMinistry: bestMatch.definition.targetMinistry,
    };
  }

  /**
   * 规范化文本
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' '); // 保留中文、英文、数字
  }

  /**
   * 关键词匹配
   */
  private matchByKeywords(text: string): Array<{
    definition: IntentDefinition;
    score: number;
  }> {
    const matches: Array<{ definition: IntentDefinition; score: number }> = [];

    for (const intent of this.intents) {
      let score = 0;
      let matchedKeywords = 0;

      // 计算关键词匹配度
      for (const keyword of intent.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          matchedKeywords++;
          score += keyword.length / text.length; // 关键词权重
        }
      }

      // 如果有匹配，添加到结果
      if (matchedKeywords > 0) {
        matches.push({
          definition: intent,
          score: score * 100 + matchedKeywords * 10, // 转换为0-100的分数
        });
      }
    }

    // 限制最高分数为100
    return matches.map(m => ({
      ...m,
      score: Math.min(m.score, 100),
    }));
  }

  /**
   * 选择最佳匹配
   */
  private selectBestMatch(
    matches: Array<{ definition: IntentDefinition; score: number }>,
    text: string
  ): { definition: IntentDefinition; score: number } {
    // 按分数排序
    matches.sort((a, b) => b.score - a.score);

    // 返回分数最高的
    return matches[0];
  }

  /**
   * 创建默认意图
   */
  private createDefaultIntent(text: string): Intent {
    return {
      id: 'unknown',
      name: '未知意图',
      description: '无法识别的用户意图',
      confidence: 0.5,
      targetMinistry: Ministry.LIBU, // 默认发给吏部
    };
  }

  /**
   * 获取所有意图
   */
  getAllIntents(): IntentDefinition[] {
    return this.intents;
  }

  /**
   * 根据ID获取意图
   */
  getIntentById(id: string): IntentDefinition | undefined {
    return this.intents.find(intent => intent.id === id);
  }

  /**
   * 获取意图示例
   */
  getIntentExamples(intentId: string): string[] {
    const intent = this.getIntentById(intentId);
    return intent?.examples || [];
  }
}

/**
 * 单例实例
 */
export const intentEngine = new IntentEngine();

/**
 * 识别意图的便捷函数
 */
export async function recognizeIntent(text: string): Promise<Intent> {
  return intentEngine.recognizeIntent(text);
}
