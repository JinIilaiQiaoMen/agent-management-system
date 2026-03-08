/**
 * ZAEP 锦衣卫 - 异常告警系统
 * 负责异常检测和告警
 */

import { v4 as uuidv4 } from 'uuid';
import { Anomaly, ProcessFlow, MonitorMetrics } from '../types/san-sheng.types';
import { LogSystem, logSystem } from './logger';

/**
 * 告警级别
 */
export type AlertLevel = 'info' | 'warn' | 'error' | 'critical';

/**
 * 告警规则
 */
interface AlertRule {
  id: string;
  name: string;
  description: string;
  level: AlertLevel;
  enabled: boolean;
  check: (data: any) => boolean;
  message: string;
  actions: AlertAction[];
}

/**
 * 告警动作
 */
export interface AlertAction {
  type: 'log' | 'console' | 'notify' | 'webhook';
  config?: any;
}

/**
 * 告警
 */
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  level: AlertLevel;
  message: string;
  data: any;
  timestamp: number;
  processId?: string;
  actions: AlertAction[];
  status: 'open' | 'acknowledged' | 'resolved';
}

/**
 * 告警系统
 */
export class AlertSystem {
  private logSystem: LogSystem;
  private rules: AlertRule[] = [];
  private alerts: Alert[] = [];
  private maxAlerts = 1000;

  constructor() {
    this.logSystem = logSystem;
    this.initializeRules();
    this.startCleanupInterval();
  }

  /**
   * 初始化告警规则
   */
  private initializeRules(): void {
    // ===== 完整性告警 =====
    this.addRule({
      id: 'completeness_critical',
      name: '完整性严重告警',
      description: '完整性指标低于50%',
      level: 'critical',
      enabled: true,
      check: (data: any) => data.metrics?.completeness < 50,
      message: '完整性指标严重低于阈值',
      actions: [{ type: 'log' }, { type: 'console' }, { type: 'notify' }],
    });

    this.addRule({
      id: 'completeness_warning',
      name: '完整性警告',
      description: '完整性指标低于70%',
      level: 'warn',
      enabled: true,
      check: (data: any) =>
        data.metrics?.completeness >= 50 && data.metrics?.completeness < 70,
      message: '完整性指标低于正常水平',
      actions: [{ type: 'log' }, { type: 'console' }],
    });

    // ===== 合规性告警 =====
    this.addRule({
      id: 'compliance_critical',
      name: '合规性严重告警',
      description: '合规性指标低于50%',
      level: 'critical',
      enabled: true,
      check: (data: any) => data.metrics?.compliance < 50,
      message: '合规性指标严重低于阈值',
      actions: [{ type: 'log' }, { type: 'console' }, { type: 'notify' }],
    });

    this.addRule({
      id: 'compliance_warning',
      name: '合规性警告',
      description: '合规性指标低于70%',
      level: 'warn',
      enabled: true,
      check: (data: any) =>
        data.metrics?.compliance >= 50 && data.metrics?.compliance < 70,
      message: '合规性指标低于正常水平',
      actions: [{ type: 'log' }, { type: 'console' }],
    });

    // ===== 时效性告警 =====
    this.addRule({
      id: 'efficiency_critical',
      name: '时效性严重告警',
      description: '时效性指标低于50%',
      level: 'error',
      enabled: true,
      check: (data: any) => data.metrics?.efficiency < 50,
      message: '时效性指标严重低于阈值',
      actions: [{ type: 'log' }, { type: 'console' }, { type: 'notify' }],
    });

    this.addRule({
      id: 'efficiency_warning',
      name: '时效性警告',
      description: '时效性指标低于70%',
      level: 'warn',
      enabled: true,
      check: (data: any) =>
        data.metrics?.efficiency >= 50 && data.metrics?.efficiency < 70,
      message: '时效性指标低于正常水平',
      actions: [{ type: 'log' }, { type: 'console' }],
    });

    // ===== 准确性告警 =====
    this.addRule({
      id: 'accuracy_critical',
      name: '准确性严重告警',
      description: '准确性指标低于50%',
      level: 'critical',
      enabled: true,
      check: (data: any) => data.metrics?.accuracy < 50,
      message: '准确性指标严重低于阈值',
      actions: [{ type: 'log' }, { type: 'console' }, { type: 'notify' }],
    });

    this.addRule({
      id: 'accuracy_warning',
      name: '准确性警告',
      description: '准确性指标低于70%',
      level: 'warn',
      enabled: true,
      check: (data: any) =>
        data.metrics?.accuracy >= 50 && data.metrics?.accuracy < 70,
      message: '准确性指标低于正常水平',
      actions: [{ type: 'log' }, { type: 'console' }],
    });

    // ===== 可追溯性告警 =====
    this.addRule({
      id: 'traceability_critical',
      name: '可追溯性严重告警',
      description: '可追溯性指标低于50%',
      level: 'error',
      enabled: true,
      check: (data: any) => data.metrics?.traceability < 50,
      message: '可追溯性指标严重低于阈值',
      actions: [{ type: 'log' }, { type: 'console' }, { type: 'notify' }],
    });

    this.addRule({
      id: 'traceability_warning',
      name: '可追溯性警告',
      description: '可追溯性指标低于70%',
      level: 'warn',
      enabled: true,
      check: (data: any) =>
        data.metrics?.traceability >= 50 && data.metrics?.traceability < 70,
      message: '可追溯性指标低于正常水平',
      actions: [{ type: 'log' }, { type: 'console' }],
    });

    // ===== 异常告警 =====
    this.addRule({
      id: 'anomaly_critical',
      name: '严重异常告警',
      description: '检测到严重异常',
      level: 'critical',
      enabled: true,
      check: (data: any) => {
        const criticalAnomalies = data.anomalies?.filter(
          (a: Anomaly) => a.level === 'critical'
        );
        return criticalAnomalies && criticalAnomalies.length > 0;
      },
      message: '检测到严重异常',
      actions: [{ type: 'log' }, { type: 'console' }, { type: 'notify' }],
    });

    this.addRule({
      id: 'anomaly_error',
      name: '错误异常告警',
      description: '检测到错误级别异常',
      level: 'error',
      enabled: true,
      check: (data: any) => {
        const errorAnomalies = data.anomalies?.filter(
          (a: Anomaly) => a.level === 'error'
        );
        return errorAnomalies && errorAnomalies.length > 0;
      },
      message: '检测到错误级别异常',
      actions: [{ type: 'log' }, { type: 'console' }, { type: 'notify' }],
    });
  }

  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
    console.log(`[锦衣卫] 添加告警规则: ${rule.name}`);
  }

  /**
   * 移除告警规则
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      console.log(`[锦衣卫] 移除告警规则: ${ruleId}`);
      return true;
    }
    return false;
  }

  /**
   * 检查并触发告警
   * @param data - 数据
   * @param processId - 流程ID
   */
  async checkAndTriggerAlerts(data: any, processId?: string): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        if (rule.check(data)) {
          const alert = await this.triggerAlert(rule, data, processId);
          triggeredAlerts.push(alert);
        }
      } catch (error) {
        console.error(`[锦衣卫] 告警规则检查失败: ${rule.name}`, error);
      }
    }

    return triggeredAlerts;
  }

  /**
   * 触发告警
   */
  private async triggerAlert(
    rule: AlertRule,
    data: any,
    processId?: string
  ): Promise<Alert> {
    const alert: Alert = {
      id: uuidv4(),
      ruleId: rule.id,
      ruleName: rule.name,
      level: rule.level,
      message: rule.message,
      data,
      timestamp: Date.now(),
      processId,
      actions: rule.actions,
      status: 'open',
    };

    // 保存告警
    this.alerts.push(alert);

    // 限制告警数量
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.splice(0, this.alerts.length - this.maxAlerts);
    }

    // 执行告警动作
    await this.executeAlertActions(alert);

    // 记录到日志
    this.logSystem.error('jinyiwei', `[告警] ${rule.name}: ${rule.message}`, alert.data, processId);

    return alert;
  }

  /**
   * 执行告警动作
   */
  private async executeAlertActions(alert: Alert): Promise<void> {
    for (const action of alert.actions) {
      try {
        switch (action.type) {
          case 'log':
            // 已经在triggerAlert中记录了
            break;

          case 'console':
            this.printAlertToConsole(alert);
            break;

          case 'notify':
            await this.sendNotification(alert);
            break;

          case 'webhook':
            await this.sendWebhook(alert, action.config);
            break;
        }
      } catch (error) {
        console.error(`[锦衣卫] 执行告警动作失败: ${action.type}`, error);
      }
    }
  }

  /**
   * 打印告警到控制台
   */
  private printAlertToConsole(alert: Alert): void {
    const levelIcons: Record<AlertLevel, string> = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      critical: '🚨',
    };

    const icon = levelIcons[alert.level];
    const time = new Date(alert.timestamp).toLocaleString('zh-CN');

    console.log(`${icon} [${time}] [${alert.level.toUpperCase()}] ${alert.ruleName}: ${alert.message}`);

    if (alert.data) {
      console.log('  数据:', JSON.stringify(alert.data, null, 2));
    }
  }

  /**
   * 发送通知
   */
  private async sendNotification(alert: Alert): Promise<void> {
    // 这里应该集成通知系统（邮件、短信、钉钉等）
    console.log(`[锦衣卫] 发送通知: ${alert.ruleName}`);

    // 模拟发送
    // await sendEmail({ to: 'admin@example.com', subject: `告警: ${alert.ruleName}`, body: alert.message });
  }

  /**
   * 发送Webhook
   */
  private async sendWebhook(alert: Alert, config: any): Promise<void> {
    if (!config || !config.url) {
      console.warn('[锦衣卫] Webhook配置不完整');
      return;
    }

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook请求失败: ${response.status}`);
      }

      console.log(`[锦衣卫] Webhook发送成功: ${config.url}`);
    } catch (error) {
      console.error('[锦衣卫] Webhook发送失败', error);
      throw error;
    }
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      console.log(`[锦衣卫] 告警已确认: ${alertId}`);
      return true;
    }
    return false;
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      console.log(`[锦衣卫] 告警已解决: ${alertId}`);
      return true;
    }
    return false;
  }

  /**
   * 获取告警列表
   */
  getAlerts(filters?: {
    level?: AlertLevel;
    status?: 'open' | 'acknowledged' | 'resolved';
    processId?: string;
    since?: number;
  }): Alert[] {
    let alerts = [...this.alerts];

    if (filters) {
      if (filters.level) {
        alerts = alerts.filter(a => a.level === filters.level);
      }

      if (filters.status) {
        alerts = alerts.filter(a => a.status === filters.status);
      }

      if (filters.processId) {
        alerts = alerts.filter(a => a.processId === filters.processId);
      }

      if (filters.since) {
        alerts = alerts.filter(a => a.timestamp >= filters.since!);
      }
    }

    return alerts.reverse(); // 最新的在前
  }

  /**
   * 获取告警统计
   */
  getAlertStats(): {
    total: number;
    byLevel: Record<AlertLevel, number>;
    byStatus: Record<string, number>;
    recent: Alert[];
  } {
    const byLevel: Record<AlertLevel, number> = {
      info: 0,
      warn: 0,
      error: 0,
      critical: 0,
    };

    const byStatus: Record<string, number> = {
      open: 0,
      acknowledged: 0,
      resolved: 0,
    };

    for (const alert of this.alerts) {
      byLevel[alert.level]++;
      byStatus[alert.status]++;
    }

    // 获取最近的10个告警
    const recent = this.alerts.slice(-10).reverse();

    return {
      total: this.alerts.length,
      byLevel,
      byStatus,
      recent,
    };
  }

  /**
   * 清理过期告警
   */
  private startCleanupInterval(): void {
    // 每小时清理一次
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 60 * 60 * 1000);
  }

  /**
   * 清理旧告警
   */
  cleanupOldAlerts(maxAge: number = 7 * 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    const originalCount = this.alerts.length;

    this.alerts = this.alerts.filter(alert => {
      const age = now - alert.timestamp;

      // 保留未解决的告警
      if (alert.status === 'open') {
        return true;
      }

      // 删除超过保留期的已解决告警
      return age < maxAge;
    });

    const cleaned = originalCount - this.alerts.length;

    if (cleaned > 0) {
      console.log(`[锦衣卫] 清理旧告警: ${cleaned}条`);
    }

    return cleaned;
  }

  /**
   * 批量确认告警
   */
  batchAcknowledgeAlerts(alertIds: string[]): number {
    let count = 0;
    for (const id of alertIds) {
      if (this.acknowledgeAlert(id)) {
        count++;
      }
    }
    return count;
  }

  /**
   * 批量解决告警
   */
  batchResolveAlerts(alertIds: string[]): number {
    let count = 0;
    for (const id of alertIds) {
      if (this.resolveAlert(id)) {
        count++;
      }
    }
    return count;
  }

  /**
   * 获取所有规则
   */
  getAllRules(): AlertRule[] {
    return [...this.rules];
  }

  /**
   * 启用规则
   */
  enableRule(ruleId: string): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = true;
      console.log(`[锦衣卫] 启用告警规则: ${rule.name}`);
      return true;
    }
    return false;
  }

  /**
   * 禁用规则
   */
  disableRule(ruleId: string): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = false;
      console.log(`[锦衣卫] 禁用告警规则: ${rule.name}`);
      return true;
    }
    return false;
  }

  /**
   * 导出告警
   */
  exportAlerts(format: 'json' | 'csv' = 'json'): string {
    const alerts = this.getAlerts();

    if (format === 'json') {
      return JSON.stringify(alerts, null, 2);
    }

    // CSV格式
    const headers = 'id,ruleId,ruleName,level,message,timestamp,status\n';
    const rows = alerts.map(a =>
      `${a.id},${a.ruleId},"${a.ruleName}",${a.level},"${a.message}",${a.timestamp},${a.status}`
    );

    return headers + rows.join('\n');
  }
}

/**
 * 单例实例
 */
export const alertSystem = new AlertSystem();

/**
 * 检查并触发告警的便捷函数
 */
export async function checkAndTriggerAlerts(data: any, processId?: string): Promise<Alert[]> {
  return alertSystem.checkAndTriggerAlerts(data, processId);
}
