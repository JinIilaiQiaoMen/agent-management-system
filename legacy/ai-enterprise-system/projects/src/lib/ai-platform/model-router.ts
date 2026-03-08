/**
 * AI 模型智能路由系统
 * 根据任务复杂度自动选择最优模型，实现成本最优化
 */

import { SUPPORTED_MODELS, COMPLEXITY_RULES, TaskComplexity } from './config';

interface TaskInfo {
  taskType: string;
  estimatedTokens?: number;
  priority: 'low' | 'medium' | 'high';
  requiresCreativity: boolean;
  requiresAccuracy: boolean;
  estimatedLatency?: number; // 毫秒
}

interface ModelSelection {
  modelName: string;
  modelType: 'llm' | 'image' | 'video';
  source: 'local' | 'paid';
  estimatedCost: number;
  estimatedLatency: number;
  reasoning: string;
}

/**
 * 判断任务复杂度
 */
function determineComplexity(taskType: string): TaskComplexity {
  if (COMPLEXITY_RULES.low.includes(taskType)) {
    return 'low';
  }
  if (COMPLEXITY_RULES.medium.includes(taskType)) {
    return 'medium';
  }
  if (COMPLEXITY_RULES.high.includes(taskType)) {
    return 'high';
  }
  return 'medium'; // 默认中等复杂度
}

/**
 * 选择最优模型
 */
export async function selectModel(taskInfo: TaskInfo): Promise<ModelSelection> {
  const {
    taskType,
    estimatedTokens = 1000,
    priority,
    requiresCreativity,
    requiresAccuracy,
    estimatedLatency = 0
  } = taskInfo;

  const complexity = determineComplexity(taskType);

  // 1. 优先使用本地模型（零成本）
  const localModels = Object.entries(SUPPORTED_MODELS.local);

  // 低复杂度任务：使用最快的本地模型
  if (complexity === 'low') {
    const fastestModel = localModels.find(
      ([, model]) => model.type === 'llm' && model.performance === 'fast'
    );

    if (fastestModel) {
      const [name, model] = fastestModel;
      return {
        modelName: name,
        modelType: model.type,
        source: 'local',
        estimatedCost: 0,
        estimatedLatency: 500,
        reasoning: '低复杂度任务，使用快速本地模型以实现零成本'
      };
    }
  }

  // 中等复杂度任务：使用平衡型本地模型
  if (complexity === 'medium') {
    if (taskType === 'imageGeneration') {
      const imageModel = localModels.find(([, model]) => model.type === 'image');
      if (imageModel) {
        const [name, model] = imageModel;
        return {
          modelName: name,
          modelType: model.type,
          source: 'local',
          estimatedCost: 0,
          estimatedLatency: 2000,
          reasoning: '中等复杂度图像生成任务，使用本地 SD3 模型'
        };
      }
    }

    const balancedModel = localModels.find(
      ([, model]) => model.type === 'llm' && model.performance === 'balanced'
    );

    if (balancedModel) {
      const [name, model] = balancedModel;
      return {
        modelName: name,
        modelType: model.type,
        source: 'local',
        estimatedCost: 0,
        estimatedLatency: 1500,
        reasoning: '中等复杂度任务，使用平衡型本地模型以兼顾速度和质量'
      };
    }
  }

  // 高复杂度任务：根据需求决定
  if (complexity === 'high') {
    // 视频生成任务：必须使用本地 AnimateDiff
    if (taskType === 'videoGeneration') {
      const videoModel = localModels.find(([, model]) => model.type === 'video');
      if (videoModel) {
        const [name, model] = videoModel;
        return {
          modelName: name,
          modelType: model.type,
          source: 'local',
          estimatedCost: 0,
          estimatedLatency: 30000, // 视频生成较慢
          reasoning: '视频生成任务，使用本地 AnimateDiff 模型'
        };
      }
    }

    // 高质量图像生成：使用本地 Flux
    if (taskType === 'highQualityImageGeneration') {
      const fluxModel = localModels.find(([name]) => name === 'flux');
      if (fluxModel) {
        const [name, model] = fluxModel;
        return {
          modelName: name,
          modelType: model.type,
          source: 'local',
          estimatedCost: 0,
          estimatedLatency: 5000,
          reasoning: '高质量图像生成任务，使用本地 Flux 模型'
        };
      }
    }

    // 需要高准确性的复杂文本任务：使用付费模型
    if (requiresAccuracy && priority === 'high') {
      const paidModels = Object.entries(SUPPORTED_MODELS.paid);
      const bestPaidModel = paidModels.find(
        ([, model]) => model.type === 'llm' && model.performance === 'excellent'
      );

      if (bestPaidModel) {
        const [name, model] = bestPaidModel;
        const cost = (estimatedTokens / 1000) * model.cost;
        return {
          modelName: name,
          modelType: model.type,
          source: 'paid',
          estimatedCost: cost,
          estimatedLatency: 1000,
          reasoning: `高复杂度、高准确性任务，使用付费 ${model.name} 模型以确保质量`
        };
      }
    }

    // 需要高创造性的任务：根据预算决定
    if (requiresCreativity) {
      // 如果在预算内，使用付费模型
      const cost = (estimatedTokens / 1000) * 0.005; // GPT-4o 成本
      if (await isWithinBudget(cost)) {
        return {
          modelName: 'gpt4o',
          modelType: 'llm',
          source: 'paid',
          estimatedCost: cost,
          estimatedLatency: 1000,
          reasoning: '高创造性任务，在预算允许范围内使用付费 GPT-4o 模型'
        };
      }
    }
  }

  // 兜底：使用最快速的本地模型
  const defaultModel = localModels.find(
    ([, model]) => model.type === 'llm' && model.performance === 'fast'
  );

  if (defaultModel) {
    const [name, model] = defaultModel;
    return {
      modelName: name,
      modelType: model.type,
      source: 'local',
      estimatedCost: 0,
      estimatedLatency: 500,
      reasoning: '使用默认本地模型以控制成本'
    };
  }

  throw new Error('没有可用的模型');
}

/**
 * 检查是否在预算范围内
 */
async function isWithinBudget(estimatedCost: number): Promise<boolean> {
  // TODO: 从监控系统中获取今日已使用成本
  const todayUsage = await getTodayUsage();
  const dailyLimit = 1000; // 每日 $1000 预算

  return (todayUsage.totalCost + estimatedCost) <= dailyLimit;
}

/**
 * 获取今日用量统计
 */
async function getTodayUsage() {
  // TODO: 从数据库或缓存中获取今日用量
  return {
    totalCalls: 0,
    totalTokens: 0,
    totalCost: 0
  };
}

/**
 * 批量选择模型（优化成本）
 */
export async function batchSelectModels(tasks: TaskInfo[]): Promise<ModelSelection[]> {
  const selections: ModelSelection[] = [];
  const totalBudget = 1000; // 每日总预算
  let allocatedBudget = 0;

  // 按优先级排序
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  for (const task of sortedTasks) {
    const selection = await selectModelWithBudget(task, totalBudget - allocatedBudget);
    selections.push(selection);
    allocatedBudget += selection.estimatedCost;
  }

  return selections;
}

/**
 * 选择模型（考虑预算限制）
 */
async function selectModelWithBudget(
  taskInfo: TaskInfo,
  remainingBudget: number
): Promise<ModelSelection> {
  const originalSelection = await selectModel(taskInfo);

  // 如果选择的模型超出预算，降级到本地模型
  if (originalSelection.source === 'paid' && originalSelection.estimatedCost > remainingBudget) {
    const localModels = Object.entries(SUPPORTED_MODELS.local);
    const balancedModel = localModels.find(
      ([, model]) => model.type === 'llm' && model.performance === 'balanced'
    );

    if (balancedModel) {
      const [name, model] = balancedModel;
      return {
        modelName: name,
        modelType: model.type,
        source: 'local',
        estimatedCost: 0,
        estimatedLatency: 1500,
        reasoning: '预算限制，降级使用本地模型'
      };
    }
  }

  return originalSelection;
}
