/**
 * ZAEP 锦衣卫 - 审计系统
 * 负责审计规则引擎
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ProcessFlow,
  MonitorReport,
  AuditReport,
  MonitorMetrics,
  Anomaly,
} from '../types/san-sheng.types';
import { LogSystem, logSystem } from './logger';

/**
 * 审计规则
 */
interface AuditRule {
  id: string;
  name: string;
  description: string;
  category: 'completeness' | 'compliance' | 'efficiency' | 'traceability' | 'accuracy';
  check: (flow: ProcessFlow) => {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  };
}

/**
 * 审计系统
 */
export class AuditSystem {
  private logSystem: LogSystem;
  private rules: AuditRule[];

  constructor() {
    this.logSystem = logSystem;
    this.rules = this.initializeRules();
  }

  /**
   * 初始化审计规则
   */
  private initializeRules(): AuditRule[] {
    return [
      // ===== 完整性规则 =====
      {
        id: 'completeness_1',
        name: '流程完整性检查',
        description: '检查流程是否包含所有必要阶段',
        category: 'completeness',
        check: this.checkProcessCompleteness.bind(this),
      },
      {
        id: 'completeness_2',
        name: '数据完整性检查',
        description: '检查每个阶段的数据是否完整',
        category: 'completeness',
        check: this.checkDataCompleteness.bind(this),
      },

      // ===== 合规性规则 =====
      {
        id: 'compliance_1',
        name: '权限合规检查',
        description: '检查操作是否符合权限要求',
        category: 'compliance',
        check: this.checkPermissionCompliance.bind(this),
      },
      {
        id: 'compliance_2',
        name: '安全合规检查',
        description: '检查操作是否符合安全规范',
        category: 'compliance',
        check: this.checkSecurityCompliance.bind(this),
      },

      // ===== 时效性规则 =====
      {
        id: 'efficiency_1',
        name: '响应时间检查',
        description: '检查各阶段响应时间是否合理',
        category: 'efficiency',
        check: this.checkResponseTime.bind(this),
      },
      {
        id: 'efficiency_2',
        name: '总执行时间检查',
        description: '检查总执行时间是否合理',
        category: 'efficiency',
        check: this.checkTotalExecutionTime.bind(this),
      },

      // ===== 可追溯性规则 =====
      {
        id: 'traceability_1',
        name: '日志完整性检查',
        description: '检查日志记录是否完整',
        category: 'traceability',
        check: this.checkLogCompleteness.bind(this),
      },
      {
        id: 'traceability_2',
        name: '数据流向检查',
        description: '检查数据流向是否清晰',
        category: 'traceability',
        check: this.checkDataFlowTraceability.bind(this),
      },

      // ===== 准确性规则 =====
      {
        id: 'accuracy_1',
        name: '结果准确性检查',
        description: '检查结果是否准确',
        category: 'accuracy',
        check: this.checkResultAccuracy.bind(this),
      },
      {
        id: 'accuracy_2',
        name: '错误率检查',
        description: '检查错误率是否在可接受范围内',
        category: 'accuracy',
        check: this.checkErrorRate.bind(this),
      },
    ];
  }

  /**
   * 执行审计
   * @param flow - 流程数据
   */
  async auditProcess(flow: ProcessFlow): Promise<{
    report: AuditReport;
    metrics: MonitorMetrics;
    anomalies: Anomaly[];
  }> {
    console.log(`[锦衣卫] 开始审计流程: ${flow.processId}`);
    this.logSystem.info('jinyiwei', `开始审计流程: ${flow.processId}`, {}, flow.processId);

    const anomalies: Anomaly[] = [];
    const categoryScores: Record<string, { total: number; count: number }> = {
      completeness: { total: 0, count: 0 },
      compliance: { total: 0, count: 0 },
      efficiency: { total: 0, count: 0 },
      traceability: { total: 0, count: 0 },
      accuracy: { total: 0, count: 0 },
    };

    // 执行所有规则
    for (const rule of this.rules) {
      this.logSystem.info('jinyiwei', `执行审计规则: ${rule.name}`, {}, flow.processId);

      const result = rule.check(flow);

      // 记录分数
      categoryScores[rule.category].total += result.score;
      categoryScores[rule.category].count++;

      // 如果未通过，记录异常
      if (!result.passed) {
        for (const issue of result.issues) {
          const anomaly: Anomaly = {
            id: uuidv4(),
            processId: flow.processId,
            stage: 'jinyiwei',
            level: result.score < 50 ? 'error' : 'warn',
            message: `[${rule.name}] ${issue}`,
            timestamp: Date.now(),
            data: {
              ruleId: rule.id,
              ruleName: rule.name,
              category: rule.category,
              score: result.score,
            },
          };

          anomalies.push(anomaly);
          this.logSystem.logAnomaly('jinyiwei', anomaly.message, flow.processId, anomaly.data);
        }
      }
    }

    // 计算各维度分数
    const metrics: MonitorMetrics = {
      completeness: this.calculateCategoryScore(categoryScores.completeness),
      compliance: this.calculateCategoryScore(categoryScores.compliance),
      efficiency: this.calculateCategoryScore(categoryScores.efficiency),
      accuracy: this.calculateCategoryScore(categoryScores.accuracy),
      traceability: this.calculateCategoryScore(categoryScores.traceability),
    };

    // 生成审计报告
    const report = await this.generateAuditReport(flow, metrics, anomalies);

    console.log(`[锦衣卫] 审计完成: ${flow.processId}, 异常数=${anomalies.length}`);

    return {
      report,
      metrics,
      anomalies,
    };
  }

  /**
   * 生成审计报告
   */
  private async generateAuditReport(
    flow: ProcessFlow,
    metrics: MonitorMetrics,
    anomalies: Anomaly[]
  ): Promise<AuditReport> {
    const overallScore = this.calculateOverallScore(metrics);

    const report: AuditReport = {
      processId: flow.processId,
      timestamp: Date.now(),
      imperialDecree: flow.imperialDecree,
      flow,
      metrics,
      anomalies,
      conclusion: this.generateConclusion(metrics, anomalies),
      recommendations: this.generateRecommendations(metrics, anomalies),
    };

    this.logSystem.info('jinyiwei', `生成审计报告`, { overallScore }, flow.processId);

    return report;
  }

  /**
   * 生成结论
   */
  private generateConclusion(metrics: MonitorMetrics, anomalies: Anomaly[]): string {
    const overallScore = this.calculateOverallScore(metrics);

    if (overallScore >= 90) {
      return '流程执行优秀，所有指标均在合理范围内';
    } else if (overallScore >= 70) {
      return '流程执行良好，有轻微问题但可接受';
    } else if (overallScore >= 50) {
      return '流程执行一般，存在需要改进的问题';
    } else {
      return '流程执行较差，存在严重问题需要立即处理';
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(metrics: MonitorMetrics, anomalies: Anomaly[]): string[] {
    const recommendations: string[] = [];

    // 根据低分维度生成建议
    if (metrics.completeness < 70) {
      recommendations.push('建议完善流程执行，确保所有阶段都正常完成');
    }

    if (metrics.compliance < 70) {
      recommendations.push('建议加强权限和安全检查，确保合规性');
    }

    if (metrics.efficiency < 70) {
      recommendations.push('建议优化流程，提高执行效率');
    }

    if (metrics.accuracy < 70) {
      recommendations.push('建议检查结果准确性，减少错误率');
    }

    if (metrics.traceability < 70) {
      recommendations.push('建议完善日志记录，提高可追溯性');
    }

    // 根据异常生成建议
    const criticalAnomalies = anomalies.filter(a => a.level === 'critical');
    if (criticalAnomalies.length > 0) {
      recommendations.push(`发现${criticalAnomalies.length}个严重异常，需要立即处理`);
    }

    return recommendations.length > 0 ? recommendations : ['流程执行正常，无需特别改进'];
  }

  // ===== 审计规则实现 =====

  /**
   * 检查流程完整性
   */
  private checkProcessCompleteness(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查各阶段是否存在
    if (!flow.zhongshu) {
      issues.push('缺少中书省阶段数据');
      score -= 25;
    }

    if (!flow.menxia) {
      issues.push('缺少门下省阶段数据');
      score -= 25;
    }

    if (!flow.shangshu) {
      issues.push('缺少尚书省阶段数据');
      score -= 25;
    }

    if (!flow.liubu) {
      issues.push('缺少六部阶段数据');
      score -= 25;
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '流程完整' : `流程不完整，缺少${issues.length}个阶段`,
      issues,
    };
  }

  /**
   * 检查数据完整性
   */
  private checkDataCompleteness(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查中书省数据
    if (flow.zhongshu) {
      if (!flow.zhongshu.intent) {
        issues.push('中书省缺少意图数据');
        score -= 10;
      }
      if (!flow.zhongshu.parameters) {
        issues.push('中书省缺少参数数据');
        score -= 10;
      }
    }

    // 检查门下省数据
    if (flow.menxia) {
      if (!flow.menxia.reviewResult) {
        issues.push('门下省缺少审核结果数据');
        score -= 10;
      }
    }

    // 检查尚书省数据
    if (flow.shangshu) {
      if (!flow.shangshu.taskId) {
        issues.push('尚书省缺少任务ID');
        score -= 10;
      }
      if (!flow.shangshu.agent) {
        issues.push('尚书省缺少Agent数据');
        score -= 10;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '数据完整' : `数据不完整，缺少${issues.length}项数据`,
      issues,
    };
  }

  /**
   * 检查权限合规
   */
  private checkPermissionCompliance(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查门下省审核结果
    if (flow.menxia && flow.menxia.reviewResult) {
      const { checks } = flow.menxia.reviewResult;

      const permissionCheck = checks.find(c => c.name === '权限检查');
      if (permissionCheck && !permissionCheck.passed) {
        issues.push('权限检查未通过');
        score -= 100;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '权限合规' : '权限不合规',
      issues,
    };
  }

  /**
   * 检查安全合规
   */
  private checkSecurityCompliance(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查门下省审核结果
    if (flow.menxia && flow.menxia.reviewResult) {
      const { checks } = flow.menxia.reviewResult;

      const safetyCheck = checks.find(c => c.name === '安全检查');
      if (safetyCheck && !safetyCheck.passed) {
        issues.push('安全检查未通过');
        score -= 100;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '安全合规' : '安全不合规',
      issues,
    };
  }

  /**
   * 检查响应时间
   */
  private checkResponseTime(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查中书省决策时间
    if (flow.zhongshu && flow.zhongshu.decisionTime) {
      if (flow.zhongshu.decisionTime > 5000) {
        issues.push(`中书省决策时间过长: ${flow.zhongshu.decisionTime}ms`);
        score -= 20;
      }
    }

    // 检查尚书省执行时间
    if (flow.shangshu && flow.shangshu.executionTime) {
      if (flow.shangshu.executionTime > 30000) {
        issues.push(`尚书省执行时间过长: ${flow.shangshu.executionTime}ms`);
        score -= 30;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '响应时间合理' : '响应时间过长',
      issues,
    };
  }

  /**
   * 检查总执行时间
   */
  private checkTotalExecutionTime(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 计算总时间
    const totalTime = this.calculateTotalExecutionTime(flow);

    if (totalTime > 60000) {
      issues.push(`总执行时间过长: ${totalTime}ms`);
      score -= 50;
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '总执行时间合理' : '总执行时间过长',
      issues,
    };
  }

  /**
   * 检查日志完整性
   */
  private checkLogCompleteness(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查是否有日志
    const logs = this.logSystem.getProcessLogs(flow.processId);
    if (logs.length === 0) {
      issues.push('缺少日志记录');
      score -= 100;
    } else if (logs.length < 10) {
      issues.push('日志记录过少');
      score -= 50;
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '日志记录完整' : '日志记录不完整',
      issues,
    };
  }

  /**
   * 检查数据流向可追溯性
   */
  private checkDataFlowTraceability(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查数据流向是否连贯
    if (flow.zhongshu && flow.menxia) {
      if (flow.zhongshu.draftId && !flow.menxia.edict) {
        // 门下省可能驳回了，这里只警告
        // issues.push('数据流向不连贯：草拟的诏令未通过审核');
        // score -= 50;
      }
    }

    if (flow.menxia && flow.menxia.edict && flow.shangshu) {
      if (!flow.shangshu.taskId) {
        issues.push('数据流向不连贯：审核通过的诏令未生成任务');
        score -= 50;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '数据流向清晰' : '数据流向不连贯',
      issues,
    };
  }

  /**
   * 检查结果准确性
   */
  private checkResultAccuracy(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 检查是否有结果
    if (flow.liubu && flow.liubu.taskResult) {
      if (!flow.liubu.taskResult.success) {
        issues.push('任务执行失败');
        score -= 100;
      }
    } else {
      issues.push('缺少任务执行结果');
      score -= 50;
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '结果准确' : '结果不准确',
      issues,
    };
  }

  /**
   * 检查错误率
   */
  private checkErrorRate(flow: ProcessFlow): {
    passed: boolean;
    score: number;
    message: string;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // 统计错误日志
    const errorLogs = this.logSystem.getErrorLogs(flow.processId);
    const allLogs = this.logSystem.getProcessLogs(flow.processId);

    if (allLogs.length > 0) {
      const errorRate = errorLogs.length / allLogs.length;

      if (errorRate > 0.1) {
        issues.push(`错误率过高: ${(errorRate * 100).toFixed(2)}%`);
        score -= 50;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      message: issues.length === 0 ? '错误率合理' : '错误率过高',
      issues,
    };
  }

  // ===== 辅助方法 =====

  /**
   * 计算分类分数
   */
  private calculateCategoryScore(scores: { total: number; count: number }): number {
    if (scores.count === 0) return 0;
    return Math.round(scores.total / scores.count);
  }

  /**
   * 计算总体分数
   */
  private calculateOverallScore(metrics: MonitorMetrics): number {
    return Math.round(
      (metrics.completeness +
        metrics.compliance +
        metrics.efficiency +
        metrics.accuracy +
        metrics.traceability) / 5
    );
  }

  /**
   * 计算总执行时间
   */
  private calculateTotalExecutionTime(flow: ProcessFlow): number {
    return flow.timestamp - flow.imperialDecree.timestamp;
  }

  /**
   * 添加审计规则
   */
  addRule(rule: AuditRule): void {
    this.rules.push(rule);
    console.log(`[锦衣卫] 添加审计规则: ${rule.name}`);
  }

  /**
   * 移除审计规则
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      console.log(`[锦衣卫] 移除审计规则: ${ruleId}`);
      return true;
    }
    return false;
  }

  /**
   * 获取所有规则
   */
  getAllRules(): AuditRule[] {
    return this.rules;
  }
}

/**
 * 单例实例
 */
export const auditSystem = new AuditSystem();

/**
 * 审计流程的便捷函数
 */
export async function auditProcess(flow: ProcessFlow): Promise<{
  report: AuditReport;
  metrics: MonitorMetrics;
  anomalies: Anomaly[];
}> {
  return auditSystem.auditProcess(flow);
}
