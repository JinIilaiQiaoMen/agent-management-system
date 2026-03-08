/**
 * ZAEP 锦衣卫 - 都御史（监控系统）
 * 整合监控、审计、日志、告警
 */

import {
  ProcessFlow,
  MonitorReport,
  AuditReport,
  MonitorMetrics,
  Anomaly,
} from '../types/san-sheng.types';
import { MonitorSystem, monitorProcess, monitorSystem } from './monitor';
import { AuditSystem, auditProcess } from './auditor';
import { LogSystem, logSystem, logAnomaly } from './logger';
import { AlertSystem, checkAndTriggerAlerts } from './alert-system';

/**
 * 都御史 - 锦衣卫长官
 * 负责全流程监控、审计、日志、告警
 */
export class DuyushiMonitor {
  private monitorSystem: MonitorSystem;
  private auditSystem: AuditSystem;
  private logSystem: LogSystem;
  private alertSystem: AlertSystem;

  constructor() {
    this.monitorSystem = monitorSystem;
    this.auditSystem = new AuditSystem();
    this.logSystem = logSystem;
    this.alertSystem = alertSystem;
  }

  /**
   * 监控中书省
   */
  async monitorZhongshu(data: any, report: any): Promise<void> {
    console.log(`[锦衣卫] 监控中书省: ${data?.processId || 'unknown'}`);

    const processId = data?.processId;

    // 记录日志
    this.logSystem.info('jinyiwei', '监控中书省阶段', data, processId);

    // 检查异常
    if (!data?.intent) {
      this.logSystem.warn('jinyiwei', '中书省缺少意图数据', data, processId);
    }

    if (!data?.parameters) {
      this.logSystem.warn('jinyiwei', '中书省缺少参数数据', data, processId);
    }

    // 检查决策时间
    if (data?.decisionTime && data.decisionTime > 10000) {
      this.logSystem.warn(
        'jinyiwei',
        `中书省决策时间过长: ${data.decisionTime}ms`,
        data,
        processId
      );
    }
  }

  /**
   * 监控门下省
   */
  async monitorMenxia(data: any, report: any): Promise<void> {
    console.log(`[锦衣卫] 监控门下省: ${data?.processId || 'unknown'}`);

    const processId = data?.processId;

    // 记录日志
    this.logSystem.info('jinyiwei', '监控门下省阶段', data, processId);

    // 检查审核结果
    if (!data?.reviewResult) {
      this.logSystem.warn('jinyiwei', '门下省缺少审核结果', data, processId);
      return;
    }

    const { checks } = data.reviewResult;

    // 检查失败的检查项
    const failedChecks = checks.filter((c: any) => !c.passed);

    if (failedChecks.length > 0) {
      this.logSystem.warn(
        'jinyiwei',
        `门下省有${failedChecks.length}项检查未通过`,
        { failedChecks },
        processId
      );

      // 记录异常
      for (const check of failedChecks) {
        this.logSystem.logAnomaly(
          'menxia',
          `审核检查失败: ${check.name} - ${check.message}`,
          processId!,
          check
        );
      }
    }

    // 检查是否驳回
    if (data.edict === undefined && checks.length > 0) {
      this.logSystem.info('jinyiwei', '门下省驳回诏令', data, processId);
    }
  }

  /**
   * 监控尚书省
   */
  async monitorShangshu(data: any, report: any): Promise<void> {
    console.log(`[锦衣卫] 监控尚书省: ${data?.processId || 'unknown'}`);

    const processId = data?.processId;

    // 记录日志
    this.logSystem.info('jinyiwei', '监控尚书省阶段', data, processId);

    // 检查任务ID
    if (!data?.taskId) {
      this.logSystem.warn('jinyiwei', '尚书省缺少任务ID', data, processId);
    }

    // 检查Agent
    if (!data?.agent) {
      this.logSystem.warn('jinyiwei', '尚书省缺少Agent信息', data, processId);
    }

    // 检查执行时间
    if (data?.executionTime && data.executionTime > 60000) {
      this.logSystem.warn(
        'jinyiwei',
        `尚书省执行时间过长: ${data.executionTime}ms`,
        data,
        processId
      );
    }
  }

  /**
   * 监控六部
   */
  async monitorLiubu(data: any, report: any): Promise<void> {
    console.log(`[锦衣卫] 监控六部: ${data?.processId || 'unknown'}`);

    const processId = data?.processId;

    // 记录日志
    this.logSystem.info('jinyiwei', '监控六部阶段', data, processId);

    // 检查任务结果
    if (!data?.taskResult) {
      this.logSystem.warn('jinyiwei', '六部缺少任务结果', data, processId);
      return;
    }

    const { success, data: resultData } = data.taskResult;

    // 检查是否成功
    if (!success) {
      this.logSystem.error(
        'jinyiwei',
        '六部任务执行失败',
        data.taskResult,
        processId
      );

      // 记录异常
      this.logSystem.logAnomaly(
        'liubu',
        `任务执行失败: ${data.taskResult.error || '未知错误'}`,
        processId!,
        data.taskResult
      );
    }

    // 检查结果数据
    if (!resultData) {
      this.logSystem.warn('jinyiwei', '六部任务结果缺少数据', data, processId);
    }
  }

  /**
   * 生成审计报告
   */
  async generateAuditReport(report: any): Promise<AuditReport> {
    console.log(`[锦衣卫] 生成审计报告: ${report.processId}`);

    // 从监控系统获取审计结果
    const auditResult = await this.auditSystem.auditProcess(report.flow);

    return auditResult.report;
  }

  /**
   * 发送告警
   */
  async sendAlert(report: any): Promise<void> {
    console.log(`[锦衣卫] 检查告警: ${report.processId}`);

    // 检查并触发告警
    const alerts = await this.alertSystem.checkAndTriggerAlerts({
      metrics: report.metrics,
      anomalies: report.anomalies,
    }, report.processId);

    if (alerts.length > 0) {
      console.log(`[锦衣卫] 触发${alerts.length}个告警`);
    }
  }

  /**
   * 获取完整监控报告
   */
  async getFullMonitorReport(
    processId: string,
    flow: ProcessFlow
  ): Promise<{
    monitorReport: MonitorReport;
    auditReport: AuditReport;
    alerts: any[];
    logs: any[];
  }> {
    console.log(`[锦衣卫] 获取完整监控报告: ${processId}`);

    // 获取监控报告
    const monitorReport = await this.monitorSystem.monitorProcess(processId, flow);

    // 获取审计报告
    const auditResult = await this.auditSystem.auditProcess(flow);

    // 获取告警
    const alerts = this.alertSystem.getAlerts({ processId });

    // 获取日志
    const logs = this.logSystem.getProcessLogs(processId);

    return {
      monitorReport,
      auditReport: auditResult.report,
      alerts,
      logs,
    };
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      totalProcesses: number;
      activeAlerts: number;
      avgAccuracy: number;
      avgEfficiency: number;
    };
  }> {
    const stats = await this.monitorSystem.getSystemMonitoring();
    const alertStats = this.alertSystem.getAlertStats();
    const logStats = this.logSystem.getGlobalStats();

    // 计算健康状态
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (alertStats.byStatus.open > 10 || stats.averageMetrics.accuracy < 70) {
      status = 'critical';
    } else if (alertStats.byStatus.open > 5 || stats.averageMetrics.efficiency < 70) {
      status = 'warning';
    }

    return {
      status,
      metrics: {
        totalProcesses: stats.totalProcesses,
        activeAlerts: alertStats.byStatus.open,
        avgAccuracy: stats.averageMetrics.accuracy,
        avgEfficiency: stats.averageMetrics.efficiency,
      },
    };
  }

  /**
   * 重置监控系统
   */
  async reset(): Promise<void> {
    console.log('[锦衣卫] 重置监控系统');

    // 清理旧日志
    this.logSystem.cleanupOldLogs(0);

    // 清理旧告警
    this.alertSystem.cleanupOldAlerts(0);

    // 重置统计
    // (实际应用中可能不需要完全重置）
  }

  /**
   * 获取监控统计
   */
  async getMonitoringStatistics(): Promise<{
    processes: any;
    alerts: any;
    logs: any;
    systemHealth: any;
  }> {
    const systemMonitoring = await this.monitorSystem.getSystemMonitoring();
    const alertStats = this.alertSystem.getAlertStats();
    const logStats = this.logSystem.getGlobalStats();
    const systemHealth = await this.getSystemHealth();

    return {
      processes: systemMonitoring,
      alerts: alertStats,
      logs: logStats,
      systemHealth,
    };
  }
}

/**
 * 单例实例
 */
export const duyushiMonitor = new DuyushiMonitor();
