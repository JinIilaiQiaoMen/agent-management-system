/**
 * ZAEP 尚书省 - 六部识别系统
 * 负责根据诏令识别目标六部
 */

import { Ministry, Intent, IntentParams } from '../types/san-sheng.types';

/**
 * 六部能力定义
 */
interface MinistryCapability {
  ministry: Ministry;
  name: string;
  description: string;
  supportedIntents: string[];
  priority: number; // 优先级，数字越小优先级越高
}

/**
 * 六部识别系统
 */
export class MinistryIdentifier {
  private capabilities: MinistryCapability[];

  constructor() {
    this.capabilities = this.initializeCapabilities();
  }

  /**
   * 初始化六部能力
   */
  private initializeCapabilities(): MinistryCapability[] {
    return [
      // 吏部
      {
        ministry: Ministry.LIBU,
        name: '吏部',
        description: '官员任免、考核、招聘、薪资',
        supportedIntents: ['hr_management', 'recruitment'],
        priority: 1,
      },

      // 户部
      {
        ministry: Ministry.HUBU,
        name: '户部',
        description: '财务管理、客户分析、背调、成本分析',
        supportedIntents: ['customer_analysis', 'finance_analysis'],
        priority: 2,
      },

      // 礼部
      {
        ministry: Ministry.LIBU_LI,
        name: '礼部',
        description: '邮件生成、内容生成、外交、礼仪',
        supportedIntents: ['email_generation', 'content_generation'],
        priority: 3,
      },

      // 兵部
      {
        ministry: Ministry.BINGBU,
        name: '兵部',
        description: '风险评估、安全审计、数据安全',
        supportedIntents: ['risk_assessment', 'security_audit'],
        priority: 4,
      },

      // 刑部
      {
        ministry: Ministry.XINGBU,
        name: '刑部',
        description: '合规检查、内容审核、法律咨询',
        supportedIntents: ['compliance_check'],
        priority: 5,
      },

      // 工部
      {
        ministry: Ministry.GONGBU,
        name: '工部',
        description: '数据采集、系统维护、工具开发、知识库',
        supportedIntents: ['data_crawl', 'system_maintenance'],
        priority: 6,
      },
    ];
  }

  /**
   * 识别六部
   * @param intent - 意图
   * @param parameters - 参数
   */
  identifyMinistry(intent: Intent, parameters: IntentParams): Ministry {
    console.log(`[尚书省] 识别六部: 意图=${intent.id}`);

    // 1. 如果意图已经有targetMinistry，直接使用
    if (intent.targetMinistry) {
      console.log(`[尚书省] 使用预设六部: ${intent.targetMinistry}`);
      return intent.targetMinistry;
    }

    // 2. 根据意图ID查找支持该意图的六部
    const matchedMinistries = this.capabilities.filter(
      cap => cap.supportedIntents.includes(intent.id)
    );

    if (matchedMinistries.length === 0) {
      console.log(`[尚书省] 未找到支持意图${intent.id}的六部，使用吏部`);
      return Ministry.LIBU; // 默认吏部
    }

    // 3. 如果有多个匹配，选择优先级最高的
    matchedMinistries.sort((a, b) => a.priority - b.priority);
    const bestMatch = matchedMinistries[0];

    console.log(`[尚书省] 匹配六部: ${bestMatch.name} (${bestMatch.ministry})`);

    return bestMatch.ministry;
  }

  /**
   * 根据关键词识别六部
   * @param message - 原始消息
   */
  identifyMinistryByKeywords(message: string): Ministry {
    const keywordsMap: Record<string, Ministry> = {
      // 户部关键词
      '客户': Ministry.HUBU,
      '背调': Ministry.HUBU,
      '信用': Ministry.HUBU,
      '财务': Ministry.HUBU,
      '成本': Ministry.HUBU,
      '利润': Ministry.HUBU,
      '报表': Ministry.HUBU,

      // 礼部关键词
      '邮件': Ministry.LIBU_LI,
      '文案': Ministry.LIBU_LI,
      '营销': Ministry.LIBU_LI,
      '产品介绍': Ministry.LIBU_LI,
      '商务': Ministry.LIBU_LI,

      // 吏部关键词
      '员工': Ministry.LIBU,
      '招聘': Ministry.LIBU,
      '简历': Ministry.LIBU,
      '面试': Ministry.LIBU,
      '绩效': Ministry.LIBU,
      '薪资': Ministry.LIBU,
      '考核': Ministry.LIBU,
      '人事': Ministry.LIBU,
      'HR': Ministry.LIBU,

      // 兵部关键词
      '风险': Ministry.BINGBU,
      '安全': Ministry.BINGBU,
      '审计': Ministry.BINGBU,
      '监控': Ministry.BINGBU,
      '隐患': Ministry.BINGBU,

      // 刑部关键词
      '合规': Ministry.XINGBU,
      '审核': Ministry.XINGBU,
      '法律': Ministry.XINGBU,
      '内容审核': Ministry.XINGBU,

      // 工部关键词
      '爬取': Ministry.GONGBU,
      '采集': Ministry.GONGBU,
      '抓取': Ministry.GONGBU,
      '系统': Ministry.GONGBU,
      '维护': Ministry.GONGBU,
      '工具': Ministry.GONGBU,
      '知识库': Ministry.GONGBU,
    };

    // 查找匹配的关键词
    for (const [keyword, ministry] of Object.entries(keywordsMap)) {
      if (message.includes(keyword)) {
        console.log(`[尚书省] 根据关键词"${keyword}"识别六部: ${ministry}`);
        return ministry;
      }
    }

    // 默认吏部
    console.log(`[尚书省] 未匹配关键词，使用吏部`);
    return Ministry.LIBU;
  }

  /**
   * 获取六部能力
   * @param ministry - 六部
   */
  getMinistryCapability(ministry: Ministry): MinistryCapability | undefined {
    return this.capabilities.find(cap => cap.ministry === ministry);
  }

  /**
   * 获取所有六部能力
   */
  getAllCapabilities(): MinistryCapability[] {
    return this.capabilities;
  }

  /**
   * 检查六部是否支持意图
   * @param ministry - 六部
   * @param intentId - 意图ID
   */
  supportsIntent(ministry: Ministry, intentId: string): boolean {
    const capability = this.getMinistryCapability(ministry);
    return capability ? capability.supportedIntents.includes(intentId) : false;
  }

  /**
   * 获取支持意图的六部列表
   * @param intentId - 意图ID
   */
  getMinistriesByIntent(intentId: string): MinistryCapability[] {
    return this.capabilities.filter(
      cap => cap.supportedIntents.includes(intentId)
    );
  }

  /**
   * 获取六部名称
   * @param ministry - 六部
   */
  getMinistryName(ministry: Ministry): string {
    const capability = this.getMinistryCapability(ministry);
    return capability ? capability.name : ministry;
  }

  /**
   * 获取六部描述
   * @param ministry - 六部
   */
  getMinistryDescription(ministry: Ministry): string {
    const capability = this.getMinistryCapability(ministry);
    return capability ? capability.description : '';
  }

  /**
   * 智能路由
   * 根据意图、参数和消息综合判断路由到哪个六部
   * @param intent - 意图
   * @param parameters - 参数
   * @param message - 原始消息
   */
  intelligentRoute(
    intent: Intent,
    parameters: IntentParams,
    message: string
  ): Ministry {
    // 1. 优先使用意图中的targetMinistry
    if (intent.targetMinistry) {
      return intent.targetMinistry;
    }

    // 2. 根据意图识别
    const ministryByIntent = this.identifyMinistry(intent, parameters);

    // 3. 根据关键词识别（备用方案）
    const ministryByKeywords = this.identifyMinistryByKeywords(message);

    // 4. 如果两者一致，使用它
    if (ministryByIntent === ministryByKeywords) {
      return ministryByIntent;
    }

    // 5. 如果不一致，优先使用意图识别的结果
    console.log(`[尚书省] 意图识别(${ministryByIntent})与关键词识别(${ministryByKeywords})不一致，使用意图识别结果`);

    return ministryByIntent;
  }

  /**
   * 获取六部负载（模拟）
   * @param ministry - 六部
   */
  getMinistryLoad(ministry: Ministry): {
    current: number;
    max: number;
    percentage: number;
  } {
    // 这里模拟负载情况，实际应该从系统获取
    const loads: Record<Ministry, number> = {
      [Ministry.LIBU]: 45,
      [Ministry.HUBU]: 60,
      [Ministry.LIBU_LI]: 30,
      [Ministry.BINGBU]: 20,
      [Ministry.XINGBU]: 15,
      [Ministry.GONGBU]: 50,
    };

    const current = loads[ministry] || 0;
    const max = 100;
    const percentage = Math.round((current / max) * 100);

    return {
      current,
      max,
      percentage,
    };
  }

  /**
   * 获取推荐六部
   * 根据负载和优先级推荐最合适的六部
   * @param intent - 意图
   * @param parameters - 参数
   */
  getRecommendedMinistry(intent: Intent, parameters: IntentParams): {
    ministry: Ministry;
    reason: string;
    load: number;
  } {
    // 获取支持意图的六部列表
    const capableMinistries = this.getMinistriesByIntent(intent.id);

    if (capableMinistries.length === 0) {
      return {
        ministry: Ministry.LIBU,
        reason: '未找到支持该意图的六部，默认吏部',
        load: this.getMinistryLoad(Ministry.LIBU).percentage,
      };
    }

    // 根据负载选择负载最低的六部
    let recommended = capableMinistries[0];
    let minLoad = 100;

    for (const ministry of capableMinistries) {
      const load = this.getMinistryLoad(ministry.ministry).percentage;
      if (load < minLoad) {
        minLoad = load;
        recommended = ministry;
      }
    }

    return {
      ministry: recommended.ministry,
      reason: `根据意图${intent.name}和负载推荐`,
      load: minLoad,
    };
  }

  /**
   * 添加六部能力
   * @param capability - 六部能力
   */
  addCapability(capability: MinistryCapability): void {
    this.capabilities.push(capability);
    console.log(`[尚书省] 添加六部能力: ${capability.name}`);
  }

  /**
   * 移除六部能力
   * @param ministry - 六部
   */
  removeCapability(ministry: Ministry): boolean {
    const index = this.capabilities.findIndex(cap => cap.ministry === ministry);
    if (index !== -1) {
      this.capabilities.splice(index, 1);
      console.log(`[尚书省] 移除六部能力: ${ministry}`);
      return true;
    }
    return false;
  }
}

/**
 * 单例实例
 */
export const ministryIdentifier = new MinistryIdentifier();

/**
 * 识别六部的便捷函数
 */
export function identifyMinistry(
  intent: Intent,
  parameters: IntentParams
): Ministry {
  return ministryIdentifier.identifyMinistry(intent, parameters);
}

export function identifyMinistryByKeywords(message: string): Ministry {
  return ministryIdentifier.identifyMinistryByKeywords(message);
}

export function intelligentRoute(
  intent: Intent,
  parameters: IntentParams,
  message: string
): Ministry {
  return ministryIdentifier.intelligentRoute(intent, parameters, message);
}
