/**
 * ZAEP 门下省 - 安全检查器
 * 负责检查操作安全性
 */

import { CheckItem, RiskLevel } from '../types/san-sheng.types';

/**
 * 危险操作定义
 */
interface DangerousAction {
  keywords: string[];
  category: 'deletion' | 'modification' | 'system' | 'data';
  riskLevel: RiskLevel;
  description: string;
}

/**
 * 安全检查器
 */
export class SafetyChecker {
  private dangerousActions: DangerousAction[];

  constructor() {
    this.dangerousActions = this.initializeDangerousActions();
  }

  /**
   * 初始化危险操作
   */
  private initializeDangerousActions(): DangerousAction[] {
    return [
      // 删除操作
      {
        keywords: ['删除', 'delete', 'drop', 'truncate', '清除', '清空'],
        category: 'deletion',
        riskLevel: 'high',
        description: '数据删除操作',
      },
      {
        keywords: ['删除所有', 'delete all', '全部删除'],
        category: 'deletion',
        riskLevel: 'critical',
        description: '批量数据删除操作',
      },

      // 修改操作
      {
        keywords: ['修改', 'update', 'alter', '变更', '覆盖'],
        category: 'modification',
        riskLevel: 'medium',
        description: '数据修改操作',
      },
      {
        keywords: ['批量修改', 'bulk update'],
        category: 'modification',
        riskLevel: 'high',
        description: '批量数据修改操作',
      },

      // 系统操作
      {
        keywords: ['重启', 'restart', 'shutdown', '停止', '关闭'],
        category: 'system',
        riskLevel: 'high',
        description: '系统控制操作',
      },
      {
        keywords: ['清除缓存', 'clear cache', 'flush cache'],
        category: 'system',
        riskLevel: 'low',
        description: '缓存清理操作',
      },

      // 数据操作
      {
        keywords: ['导出', 'export', '下载', 'download'],
        category: 'data',
        riskLevel: 'medium',
        description: '数据导出操作',
      },
      {
        keywords: ['导入', 'import', '上传', 'upload'],
        category: 'data',
        riskLevel: 'medium',
        description: '数据导入操作',
      },
      {
        keywords: ['备份', 'backup'],
        category: 'data',
        riskLevel: 'low',
        description: '数据备份操作',
      },
    ];
  }

  /**
   * 检查安全性
   * @param intent - 意图
   * @param parameters - 参数
   * @param message - 原始消息
   */
  async checkSafety(
    intent: { id: string; name: string },
    parameters: any,
    message: string
  ): Promise<CheckItem> {
    console.log(`[门下省] 安全检查: 意图=${intent.id}, 参数=`, parameters);

    // 1. 检查是否包含危险操作关键词
    const dangerCheck = this.checkDangerousKeywords(message);
    if (!dangerCheck.passed) {
      return dangerCheck;
    }

    // 2. 检查参数是否包含可疑内容
    const paramCheck = this.checkParameters(parameters);
    if (!paramCheck.passed) {
      return paramCheck;
    }

    // 3. 根据意图类型进行特殊检查
    const intentCheck = await this.checkIntentSafety(intent, parameters);
    if (!intentCheck.passed) {
      return intentCheck;
    }

    // 4. 安全检查通过
    return {
      name: '安全检查',
      passed: true,
      message: '安全检查通过，未发现潜在风险',
    };
  }

  /**
   * 检查危险关键词
   */
  private checkDangerousKeywords(message: string): CheckItem {
    const lowerMessage = message.toLowerCase();

    for (const action of this.dangerousActions) {
      for (const keyword of action.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          // 检查是否是低风险操作
          if (action.riskLevel === 'low') {
            return {
              name: '操作安全检查',
              passed: true,
              message: `检测到${action.description}，风险等级: ${action.riskLevel}`,
              details: {
                category: action.category,
                riskLevel: action.riskLevel,
              },
            };
          }

          // 中风险及以上需要警告
          return {
            name: '操作安全检查',
            passed: false,
            message: `检测到潜在${action.description}，风险等级: ${action.riskLevel}`,
            details: {
              category: action.category,
              riskLevel: action.riskLevel,
              keyword: keyword,
              suggestion: this.getSuggestion(action.category, action.riskLevel),
            },
          };
        }
      }
    }

    return {
      name: '危险关键词检查',
      passed: true,
      message: '未检测到危险操作关键词',
    };
  }

  /**
   * 检查参数安全性
   */
  private checkParameters(parameters: any): CheckItem {
    // 检查SQL注入
    if (this.hasSQLInjection(parameters)) {
      return {
        name: 'SQL注入检查',
        passed: false,
        message: '检测到潜在的SQL注入风险',
        details: {
          suggestion: '请检查参数中是否包含SQL关键字',
        },
      };
    }

    // 检查XSS攻击
    if (this.hasXSS(parameters)) {
      return {
        name: 'XSS攻击检查',
        passed: false,
        message: '检测到潜在的XSS攻击风险',
        details: {
          suggestion: '请检查参数中是否包含脚本代码',
        },
      };
    }

    // 检查路径遍历
    if (this.hasPathTraversal(parameters)) {
      return {
        name: '路径遍历检查',
        passed: false,
        message: '检测到潜在的路径遍历风险',
        details: {
          suggestion: '请检查文件路径参数',
        },
      };
    }

    return {
      name: '参数安全检查',
      passed: true,
      message: '参数安全检查通过',
    };
  }

  /**
   * 检查意图特殊安全性
   */
  private async checkIntentSafety(
    intent: { id: string; name: string },
    parameters: any
  ): Promise<CheckItem> {
    // 针对不同意图的特殊检查
    switch (intent.id) {
      case 'data_crawl':
        return this.checkCrawlSafety(parameters);

      case 'system_maintenance':
        return this.checkMaintenanceSafety(parameters);

      default:
        return {
          name: '意图安全检查',
          passed: true,
          message: `${intent.name}操作安全`,
        };
    }
  }

  /**
   * 检查爬取安全性
   */
  private checkCrawlSafety(parameters: any): CheckItem {
    // 检查URL是否合法
    if (parameters.url) {
      try {
        const url = new URL(parameters.url);

        // 检查是否是内网地址
        if (
          url.hostname === 'localhost' ||
          url.hostname === '127.0.0.1' ||
          url.hostname.startsWith('192.168.') ||
          url.hostname.startsWith('10.')
        ) {
          return {
            name: '爬取目标检查',
            passed: false,
            message: '不允许爬取内网地址',
            details: {
              url: url.hostname,
              suggestion: '请使用公网可访问的URL',
            },
          };
        }
      } catch (error) {
        return {
          name: 'URL格式检查',
          passed: false,
          message: 'URL格式不正确',
        };
      }
    }

    return {
      name: '爬取操作检查',
      passed: true,
      message: '爬取操作安全检查通过',
    };
  }

  /**
   * 检查维护操作安全性
   */
  private checkMaintenanceSafety(parameters: any): CheckItem {
    // 检查维护操作类型
    if (parameters.action === 'restart') {
      return {
        name: '重启操作检查',
        passed: false,
        message: '重启操作存在风险',
        details: {
          suggestion: '建议先备份，然后在低峰期执行',
        },
      };
    }

    return {
      name: '维护操作检查',
      passed: true,
      message: '维护操作安全检查通过',
    };
  }

  /**
   * 检查SQL注入
   */
  private hasSQLInjection(parameters: any): boolean {
    const sqlKeywords = [
      'union', 'select', 'insert', 'update', 'delete', 'drop',
      'create', 'alter', 'truncate', 'exec', 'execute',
      '--', ';', '/*', '*/',
    ];

    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        return sqlKeywords.some(keyword => lowerValue.includes(keyword));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkValue(v));
      }
      return false;
    };

    return checkValue(parameters);
  }

  /**
   * 检查XSS攻击
   */
  private hasXSS(parameters: any): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror/i,
      /onload/i,
      /onclick/i,
    ];

    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return xssPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkValue(v));
      }
      return false;
    };

    return checkValue(parameters);
  }

  /**
   * 检查路径遍历
   */
  private hasPathTraversal(parameters: any): boolean {
    const pathPatterns = [
      /\.\./,
      /~\//,
      /\\/,
    ];

    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return pathPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkValue(v));
      }
      return false;
    };

    return checkValue(parameters);
  }

  /**
   * 获取建议
   */
  private getSuggestion(category: string, riskLevel: RiskLevel): string {
    const suggestions: Record<string, Record<RiskLevel, string>> = {
      deletion: {
        high: '建议先备份数据，确认无误后再执行',
        critical: '此操作不可恢复，强烈建议三思！建议先导出备份',
        medium: '建议先预览要删除的内容',
      },
      modification: {
        high: '建议先在测试环境验证',
        critical: '建议先备份原始数据',
        medium: '建议预览修改结果',
      },
      system: {
        high: '建议在低峰期执行',
        critical: '建议先通知相关人员，并在低峰期执行',
        medium: '建议确认当前系统状态',
      },
      data: {
        high: '建议检查数据源安全性',
        critical: '建议进行数据脱敏',
        medium: '建议预览数据内容',
      },
    };

    return suggestions[category]?.[riskLevel] || '请仔细确认操作后果';
  }

  /**
   * 获取风险等级
   * @param message - 原始消息
   */
  getRiskLevel(message: string): RiskLevel {
    const lowerMessage = message.toLowerCase();
    let maxRisk: RiskLevel = 'low';

    for (const action of this.dangerousActions) {
      for (const keyword of action.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          // 比较风险等级
          if (this.compareRiskLevel(action.riskLevel, maxRisk) > 0) {
            maxRisk = action.riskLevel;
          }
        }
      }
    }

    return maxRisk;
  }

  /**
   * 比较风险等级
   */
  private compareRiskLevel(level1: RiskLevel, level2: RiskLevel): number {
    const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    return riskOrder[level1] - riskOrder[level2];
  }
}

/**
 * 单例实例
 */
export const safetyChecker = new SafetyChecker();

/**
 * 检查安全性的便捷函数
 */
export async function checkSafety(
  intent: { id: string; name: string },
  parameters: any,
  message: string
): Promise<CheckItem> {
  return safetyChecker.checkSafety(intent, parameters, message);
}
