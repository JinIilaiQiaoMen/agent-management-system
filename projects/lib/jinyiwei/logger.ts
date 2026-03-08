/**
 * ZAEP 锦衣卫 - 日志系统
 * 负责全流程日志记录
 */

import { v4 as uuidv4 } from 'uuid';
import { Anomaly, ProcessFlow } from '../types/san-sheng.types';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * 日志条目
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei';
  message: string;
  data?: any;
  processId?: string;
}

/**
 * 日志系统
 */
export class LogSystem {
  // 内存存储（生产环境应使用数据库）
  private logs: Map<string, LogEntry[]> = new Map();
  private maxLogsPerProcess = 1000; // 每个流程最多保留1000条日志

  constructor() {
    // 初始化定时清理
    this.startCleanupInterval();
  }

  /**
   * 记录日志
   * @param level - 日志级别
   * @param stage - 阶段
   * @param message - 消息
   * @param data - 数据
   * @param processId - 流程ID
   */
  log(
    level: LogLevel,
    stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    message: string,
    data?: any,
    processId?: string
  ): LogEntry {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      level,
      stage,
      message,
      data,
      processId,
    };

    // 保存到内存
    if (processId) {
      if (!this.logs.has(processId)) {
        this.logs.set(processId, []);
      }

      const processLogs = this.logs.get(processId)!;
      processLogs.push(entry);

      // 限制日志数量
      if (processLogs.length > this.maxLogsPerProcess) {
        processLogs.splice(0, processLogs.length - this.maxLogsPerProcess);
      }
    }

    // 输出到控制台
    this.printToConsole(entry);

    return entry;
  }

  /**
   * DEBUG日志
   */
  debug(
    stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    message: string,
    data?: any,
    processId?: string
  ): LogEntry {
    return this.log(LogLevel.DEBUG, stage, message, data, processId);
  }

  /**
   * INFO日志
   */
  info(
    stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    message: string,
    data?: any,
    processId?: string
  ): LogEntry {
    return this.log(LogLevel.INFO, stage, message, data, processId);
  }

  /**
   * WARN日志
   */
  warn(
    stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    message: string,
    data?: any,
    processId?: string
  ): LogEntry {
    return this.log(LogLevel.WARN, stage, message, data, processId);
  }

  /**
   * ERROR日志
   */
  error(
    stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    message: string,
    data?: any,
    processId?: string
  ): LogEntry {
    return this.log(LogLevel.ERROR, stage, message, data, processId);
  }

  /**
   * CRITICAL日志
   */
  critical(
    stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    message: string,
    data?: any,
    processId?: string
  ): LogEntry {
    return this.log(LogLevel.CRITICAL, stage, message, data, processId);
  }

  /**
   * 记录异常
   * @param stage - 阶段
   * @param message - 消息
   * @param processId - 流程ID
   * @param data - 数据
   */
  logAnomaly(
    stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    message: string,
    processId: string,
    data?: any
  ): Anomaly {
    const anomaly: Anomaly = {
      id: uuidv4(),
      processId,
      stage,
      level: this.getAnomalyLevelFromMessage(message),
      message,
      timestamp: Date.now(),
      data,
    };

    // 记录为ERROR日志
    this.error(stage, `[异常] ${message}`, data, processId);

    return anomaly;
  }

  /**
   * 从消息获取异常级别
   */
  private getAnomalyLevelFromMessage(message: string): 'info' | 'warn' | 'error' | 'critical' {
    const criticalKeywords = ['致命', '严重', '崩溃', '数据丢失', '无法恢复'];
    const errorKeywords = ['错误', '失败', '异常'];
    const warnKeywords = ['警告', '风险', '注意'];

    for (const keyword of criticalKeywords) {
      if (message.includes(keyword)) return 'critical';
    }

    for (const keyword of errorKeywords) {
      if (message.includes(keyword)) return 'error';
    }

    for (const keyword of warnKeywords) {
      if (message.includes(keyword)) return 'warn';
    }

    return 'info';
  }

  /**
   * 获取流程日志
   * @param processId - 流程ID
   * @param level - 日志级别过滤
   */
  getProcessLogs(
    processId: string,
    level?: LogLevel
  ): LogEntry[] {
    const logs = this.logs.get(processId) || [];

    if (level) {
      return logs.filter(log => log.level === level);
    }

    return logs;
  }

  /**
   * 获取流程日志统计
   * @param processId - 流程ID
   */
  getProcessLogStats(processId: string): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byStage: Record<string, number>;
    timeRange: { start: number; end: number };
  } {
    const logs = this.getProcessLogs(processId);

    const stats = {
      total: logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.CRITICAL]: 0,
      } as Record<LogLevel, number>,
      byStage: {
        zhongshu: 0,
        menxia: 0,
        shangshu: 0,
        liubu: 0,
        jinyiwei: 0,
      },
      timeRange: {
        start: logs.length > 0 ? logs[0].timestamp : 0,
        end: logs.length > 0 ? logs[logs.length - 1].timestamp : 0,
      },
    };

    for (const log of logs) {
      stats.byLevel[log.level]++;
      stats.byStage[log.stage]++;
    }

    return stats;
  }

  /**
   * 获取错误日志
   * @param processId - 流程ID
   */
  getErrorLogs(processId: string): LogEntry[] {
    return this.getProcessLogs(processId).filter(
      log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL
    );
  }

  /**
   * 搜索日志
   * @param keyword - 关键词
   * @param stage - 阶段
   * @param level - 级别
   */
  searchLogs(
    keyword: string,
    stage?: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
    level?: LogLevel
  ): LogEntry[] {
    const allLogs: LogEntry[] = [];

    for (const logs of this.logs.values()) {
      allLogs.push(...logs);
    }

    return allLogs.filter(log => {
      // 关键词匹配
      if (keyword && !log.message.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }

      // 阶段匹配
      if (stage && log.stage !== stage) {
        return false;
      }

      // 级别匹配
      if (level && log.level !== level) {
        return false;
      }

      return true;
    });
  }

  /**
   * 清除流程日志
   * @param processId - 流程ID
   */
  clearProcessLogs(processId: string): boolean {
    return this.logs.delete(processId);
  }

  /**
   * 导出日志
   * @param processId - 流程ID
   * @param format - 格式 (json | text)
   */
  exportLogs(processId: string, format: 'json' | 'text' = 'json'): string {
    const logs = this.getProcessLogs(processId);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // Text格式
    const lines = [`# 流程日志 [${processId}]`, ''];

    for (const log of logs) {
      const time = new Date(log.timestamp).toLocaleString('zh-CN');
      const stageName = this.getStageName(log.stage);
      lines.push(`[${time}] [${log.level.toUpperCase()}] [${stageName}] ${log.message}`);

      if (log.data) {
        lines.push(`  数据: ${JSON.stringify(log.data, null, 2)}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 获取阶段名称
   */
  private getStageName(stage: string): string {
    const names: Record<string, string> = {
      'zhongshu': '中书省',
      'menxia': '门下省',
      'shangshu': '尚书省',
      'liubu': '六部',
      'jinyiwei': '锦衣卫',
    };
    return names[stage] || stage;
  }

  /**
   * 输出到控制台
   */
  private printToConsole(entry: LogEntry): void {
    const time = new Date(entry.timestamp).toISOString();
    const stageName = this.getStageName(entry.stage);

    const prefix = `[${time}] [锦衣卫] [${entry.level.toUpperCase()}] [${stageName}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.log(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data || '');
        break;
      case LogLevel.CRITICAL:
        console.error('🚨 ' + message, entry.data || '');
        break;
    }
  }

  /**
   * 清理过期日志
   * @param maxAge - 最大年龄（毫秒）
   */
  cleanupOldLogs(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [processId, logs] of this.logs.entries()) {
      if (logs.length === 0) {
        continue;
      }

      const lastLog = logs[logs.length - 1];
      const age = now - lastLog.timestamp;

      if (age > maxAge) {
        this.logs.delete(processId);
        cleaned++;
        console.log(`[锦衣卫] 清除过期日志: ${processId}, 年龄: ${Math.round(age / 1000 / 60)}分钟`);
      }
    }

    return cleaned;
  }

  /**
   * 启动定时清理
   */
  private startCleanupInterval(): void {
    // 每小时清理一次
    setInterval(() => {
      this.cleanupOldLogs();
    }, 60 * 60 * 1000);
  }

  /**
   * 获取所有流程ID
   */
  getAllProcessIds(): string[] {
    return Array.from(this.logs.keys());
  }

  /**
   * 获取全局日志统计
   */
  getGlobalStats(): {
    totalProcesses: number;
    totalLogs: number;
    byLevel: Record<LogLevel, number>;
    byStage: Record<string, number>;
  } {
    let totalLogs = 0;
    const byLevel: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.CRITICAL]: 0,
    };
    const byStage = {
      zhongshu: 0,
      menxia: 0,
      shangshu: 0,
      liubu: 0,
      jinyiwei: 0,
    };

    for (const logs of this.logs.values()) {
      totalLogs += logs.length;

      for (const log of logs) {
        byLevel[log.level]++;
        byStage[log.stage]++;
      }
    }

    return {
      totalProcesses: this.logs.size,
      totalLogs,
      byLevel,
      byStage,
    };
  }

  /**
   * 记录流程开始
   */
  logProcessStart(processId: string, decree: any): void {
    this.info('jinyiwei', `流程开始: ${processId}`, { decree }, processId);
  }

  /**
   * 记录流程结束
   */
  logProcessEnd(processId: string, success: boolean, result?: any): void {
    this.info(
      'jinyiwei',
      `流程结束: ${processId}, 成功=${success}`,
      { result },
      processId
    );
  }

  /**
   * 记录阶段切换
   */
  logStageTransition(
    processId: string,
    fromStage: string,
    toStage: string
  ): void {
    this.info('jinyiwei', `阶段切换: ${fromStage} -> ${toStage}`, {}, processId);
  }
}

/**
 * 单例实例
 */
export const logSystem = new LogSystem();

/**
 * 便捷函数
 */
export function log(
  level: LogLevel,
  stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
  message: string,
  data?: any,
  processId?: string
): LogEntry {
  return logSystem.log(level, stage, message, data, processId);
}

export function logAnomaly(
  stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei',
  message: string,
  processId: string,
  data?: any
): Anomaly {
  return logSystem.logAnomaly(stage, message, processId, data);
}
