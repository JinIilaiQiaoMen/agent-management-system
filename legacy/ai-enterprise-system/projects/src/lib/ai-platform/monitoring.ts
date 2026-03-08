/**
 * AI API 用量监控与管控系统
 * 实时监控 API 调用量和成本，防止超额浪费
 */

import { MONITORING_CONFIG } from './config';

interface UsageRecord {
  timestamp: number;
  modelName: string;
  modelType: 'llm' | 'image' | 'video';
  source: 'local' | 'paid';
  department: string;
  userId: string;
  tokens?: number;
  cost: number;
  success: boolean;
  errorMessage?: string;
}

interface DailyUsage {
  date: string;
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
  byDepartment: Record<string, {
    calls: number;
    tokens: number;
    cost: number;
  }>;
  byModel: Record<string, {
    calls: number;
    cost: number;
  }>;
}

// 内存存储（生产环境应使用数据库）
const usageRecords: UsageRecord[] = [];
const todayUsage: DailyUsage = {
  date: new Date().toISOString().split('T')[0],
  totalCalls: 0,
  totalTokens: 0,
  totalCost: 0,
  successRate: 1,
  byDepartment: {},
  byModel: {}
};

/**
 * 记录 API 调用
 */
export async function recordApiCall(record: Omit<UsageRecord, 'timestamp'>): Promise<void> {
  const fullRecord: UsageRecord = {
    ...record,
    timestamp: Date.now()
  };

  // 保存记录
  usageRecords.push(fullRecord);

  // 更新今日统计
  updateDailyUsage(fullRecord);

  // 检查是否超出限额
  await checkThresholds(fullRecord);

  // 清理过期记录（保留最近 7 天）
  cleanupOldRecords();
}

/**
 * 更新今日用量统计
 */
function updateDailyUsage(record: UsageRecord): void {
  // 检查是否是新的一天
  const today = new Date().toISOString().split('T')[0];
  if (todayUsage.date !== today) {
    resetDailyUsage(today);
  }

  // 更新总计
  todayUsage.totalCalls++;
  todayUsage.totalTokens += record.tokens || 0;
  todayUsage.totalCost += record.cost;

  if (!record.success) {
    todayUsage.successRate = (
      (todayUsage.totalCalls - 1) * todayUsage.successRate
    ) / todayUsage.totalCalls;
  }

  // 按部门统计
  if (!todayUsage.byDepartment[record.department]) {
    todayUsage.byDepartment[record.department] = { calls: 0, tokens: 0, cost: 0 };
  }
  todayUsage.byDepartment[record.department].calls++;
  todayUsage.byDepartment[record.department].tokens += record.tokens || 0;
  todayUsage.byDepartment[record.department].cost += record.cost;

  // 按模型统计
  if (!todayUsage.byModel[record.modelName]) {
    todayUsage.byModel[record.modelName] = { calls: 0, cost: 0 };
  }
  todayUsage.byModel[record.modelName].calls++;
  todayUsage.byModel[record.modelName].cost += record.cost;
}

/**
 * 重置今日统计
 */
function resetDailyUsage(date: string): void {
  todayUsage.date = date;
  todayUsage.totalCalls = 0;
  todayUsage.totalTokens = 0;
  todayUsage.totalCost = 0;
  todayUsage.successRate = 1;
  todayUsage.byDepartment = {};
  todayUsage.byModel = {};
}

/**
 * 检查是否超出限额
 */
async function checkThresholds(record: UsageRecord): Promise<void> {
  const { dailyLimit, costLimit, departmentLimits } = MONITORING_CONFIG.thresholds;

  // 检查每日调用次数限制
  if (todayUsage.totalCalls >= dailyLimit) {
    await sendAlert(
      'API 调用次数达到每日上限',
      `今日已调用 ${todayUsage.totalCalls} 次，达到上限 ${dailyLimit} 次`,
      'critical'
    );
    throw new Error('API 调用次数达到每日上限');
  }

  // 检查每日成本限制
  if (todayUsage.totalCost >= costLimit) {
    await sendAlert(
      'API 成本达到每日上限',
      `今日已使用 $${todayUsage.totalCost.toFixed(2)}，达到上限 $${costLimit}`,
      'critical'
    );
    throw new Error('API 成本达到每日上限');
  }

  // 检查部门限额
  const departmentLimit = departmentLimits[record.department as keyof typeof departmentLimits];
  if (departmentLimit) {
    const departmentUsage = todayUsage.byDepartment[record.department];
    if (departmentUsage && departmentUsage.calls >= departmentLimit) {
      await sendAlert(
        `部门 ${record.department} 调用次数达到上限`,
        `部门 ${record.department} 今日已调用 ${departmentUsage.calls} 次`,
        'warning'
      );
      throw new Error(`部门 ${record.department} 调用次数达到上限`);
    }
  }

  // 检查单次调用成本
  if (record.cost > 10) {
    await sendAlert(
      '单次调用成本异常',
      `单次调用成本 $${record.cost.toFixed(2)}，模型: ${record.modelName}`,
      'warning'
    );
  }
}

/**
 * 清理过期记录
 */
function cleanupOldRecords(): void {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const index = usageRecords.findIndex(record => record.timestamp > sevenDaysAgo);

  if (index > 0) {
    usageRecords.splice(0, index);
  }
}

/**
 * 发送告警
 */
async function sendAlert(title: string, message: string, level: 'info' | 'warning' | 'critical'): Promise<void> {
  console.log(`[ALERT ${level.toUpperCase()}] ${title}: ${message}`);

  // TODO: 集成邮件或消息通知
  if (level === 'critical' && MONITORING_CONFIG.alertEmail) {
    // 发送邮件告警
  }
}

/**
 * 获取今日用量统计
 */
export function getTodayUsage(): DailyUsage {
  return { ...todayUsage };
}

/**
 * 获取用量统计（指定时间范围）
 */
export function getUsageStats(startDate: Date, endDate: Date): UsageRecord[] {
  const start = startDate.getTime();
  const end = endDate.getTime();

  return usageRecords.filter(
    record => record.timestamp >= start && record.timestamp <= end
  );
}

/**
 * 获取部门用量统计
 */
export function getDepartmentUsage(department: string, days: number = 7): UsageRecord[] {
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

  return usageRecords.filter(
    record => record.department === department && record.timestamp >= startTime
  );
}

/**
 * 获取成本预测
 */
export function getCostForecast(days: number = 30): {
  predictedTotalCost: number;
  predictedDailyAverage: number;
  trends: {
    date: string;
    cost: number;
  }[];
} {
  // 基于过去 7 天的数据预测未来 30 天
  const last7Days = getUsageStats(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  );

  const dailyAverage = last7Days.reduce((sum, record) => sum + record.cost, 0) / 7;
  const predictedTotalCost = dailyAverage * days;

  const trends: { date: string; cost: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    trends.push({
      date: date.toISOString().split('T')[0],
      cost: dailyAverage
    });
  }

  return {
    predictedTotalCost,
    predictedDailyAverage: dailyAverage,
    trends
  };
}

/**
 * 获取效率分析
 */
export function getEfficiencyAnalysis() {
  const today = getTodayUsage();

  // 缓存命中率（从缓存系统获取）
  // TODO: 集成缓存统计
  const cacheHitRate = 0; // 占位

  // 本地模型使用率
  const localModelCalls = todayUsage.byModel['llama3']?.calls || 0 +
                        todayUsage.byModel['qwen2']?.calls || 0 +
                        todayUsage.byModel['mistral']?.calls || 0;
  const localModelRate = today.totalCalls > 0 ? (localModelCalls / today.totalCalls) * 100 : 0;

  // 成本节省（假设全部使用付费 API 的成本）
  const paidModelCost = today.totalTokens * 0.005; // GPT-4o 成本
  const costSaved = paidModelCost - today.totalCost;
  const costSavedRate = paidModelCost > 0 ? (costSaved / paidModelCost) * 100 : 0;

  return {
    cacheHitRate,
    localModelRate: localModelRate.toFixed(2) + '%',
    costSaved: costSaved.toFixed(2),
    costSavedRate: costSavedRate.toFixed(2) + '%',
    totalCalls: today.totalCalls,
    totalCost: today.totalCost.toFixed(2),
    successRate: (today.successRate * 100).toFixed(2) + '%'
  };
}
