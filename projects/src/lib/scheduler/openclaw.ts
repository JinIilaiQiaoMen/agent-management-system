/**
 * ZAEP - OpenClaw 调度集成模块
 * 
 * 实现定时任务、工作流编排、监控告警能力
 */

import { AgentManagementAPI, AIEnterpriseAPI, CrawlerAPI } from '../api/integration';

/**
 * 场景配置
 */
export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'cron' | 'manual' | 'event';
    expression?: string; // cron表达式
    event?: string;
  };
  steps: TaskStep[];
}

/**
 * 任务步骤
 */
export interface TaskStep {
  id: string;
  name: string;
  type: 'crawl' | 'analyze' | 'task' | 'notify';
  config: {
    api_endpoint: string;
    method: 'POST' | 'GET';
    params?: object;
    retry?: number;
    timeout?: number;
  };
  on_success?: string; // 下一步ID
  on_failure?: string; // 失败处理ID
}

/**
 * 预定义场景
 */
export const PREDEFINED_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'daily-competitor-analysis',
    name: '每日竞品分析',
    description: '每天9点自动采集竞品数据并生成分析报告',
    trigger: {
      type: 'cron',
      expression: '0 9 * * *'
    },
    steps: [
      {
        id: 'step-1',
        name: '采集竞品数据',
        type: 'crawl',
        config: {
          api_endpoint: '/api/crawl',
          method: 'POST',
          retry: 3
        },
        on_success: 'step-2'
      },
      {
        id: 'step-2',
        name: 'AI分析',
        type: 'analyze',
        config: {
          api_endpoint: '/api/customer-analysis',
          method: 'POST'
        },
        on_success: 'step-3'
      },
      {
        id: 'step-3',
        name: '创建任务',
        type: 'task',
        config: {
          api_endpoint: '/api/tasks',
          method: 'POST'
        },
        on_success: 'step-4'
      },
      {
        id: 'step-4',
        name: '通知相关人员',
        type: 'notify',
        config: {
          api_endpoint: '/api/notify',
          method: 'POST'
        }
      }
    ]
  },
  {
    id: 'hourly-lead-scoring',
    name: '每小时线索评分',
    description: '每小时自动评分最新线索',
    trigger: {
      type: 'cron',
      expression: '0 * * * *'
    },
    steps: [
      {
        id: 'step-1',
        name: '获取新线索',
        type: 'crawl',
        config: {
          api_endpoint: '/api/leads/new',
          method: 'GET'
        },
        on_success: 'step-2'
      },
      {
        id: 'step-2',
        name: 'AI评分',
        type: 'analyze',
        config: {
          api_endpoint: '/api/lead-scoring',
          method: 'POST'
        }
      }
    ]
  }
];

/**
 * OpenClaw 调度器
 */
export class OpenClawScheduler {
  private scenarios: Map<string, ScenarioConfig> = new Map();
  
  constructor() {
    // 加载预定义场景
    PREDEFINED_SCENARIOS.forEach(s => this.scenarios.set(s.id, s));
  }
  
  /**
   * 注册场景
   */
  registerScenario(scenario: ScenarioConfig): void {
    this.scenarios.set(scenario.id, scenario);
  }
  
  /**
   * 获取场景
   */
  getScenario(id: string): ScenarioConfig | undefined {
    return this.scenarios.get(id);
  }
  
  /**
   * 列出所有场景
   */
  listScenarios(): ScenarioConfig[] {
    return Array.from(this.scenarios.values());
  }
  
  /**
   * 执行场景
   */
  async executeScenario(scenarioId: string, params?: object): Promise<{
    success: boolean;
    results: any[];
    errors: any[];
  }> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      return { success: false, results: [], errors: [{ message: 'Scenario not found' }] };
    }
    
    const results: any[] = [];
    const errors: any[] = [];
    let currentStepId: string | undefined = scenario.steps[0]?.id;
    
    while (currentStepId) {
      const step = scenario.steps.find(s => s.id === currentStepId);
      if (!step) break;
      
      try {
        const result = await this.executeStep(step, params);
        results.push({ step: step.name, success: true, data: result });
        
        if (result.success) {
          currentStepId = step.on_success || undefined;
        } else {
          currentStepId = step.on_failure || undefined;
          if (!currentStepId) {
            errors.push({ step: step.name, error: result.error });
            break;
          }
        }
      } catch (error) {
        errors.push({ step: step.name, error });
        break;
      }
    }
    
    return {
      success: errors.length === 0,
      results,
      errors
    };
  }
  
  /**
   * 执行单个步骤
   */
  private async executeStep(step: TaskStep, globalParams?: object): Promise<any> {
    const { config } = step;
    
    switch (step.type) {
      case 'crawl':
        return await CrawlerAPI.crawl(
          (config.params as any)?.url || '',
          config.params as any
        );
        
      case 'analyze':
        return await AIEnterpriseAPI.analyzeCustomer(
          (config.params as any)?.companyName || ''
        );
        
      case 'task':
        return await AgentManagementAPI.createTask(config.params);
        
      case 'notify':
        // 通知逻辑
        return { success: true, message: 'Notification sent' };
        
      default:
        return { success: false, error: 'Unknown step type' };
    }
  }
  
  /**
   * 获取cron下次的执行时间
   */
  static getNextExecution(cronExpression: string): Date | null {
    // 简化的cron解析，实际需要使用node-cron库
    // 这里返回1小时后的时间作为示例
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now;
  }
}

// 导出单例
export const openClawScheduler = new OpenClawScheduler();

export default openClawScheduler;
