/**
 * ZAEP - 智元企业AI中台
 * 统一API集成模块
 * 
 * 本模块整合三个项目的API能力：
 * - AI智能化企业系统 (业务处理)
 * - 公司智能体管理系统 (任务调度)
 * - 内容爬取Agent (数据获取)
 */

// API端点配置
export const API_CONFIG = {
  // AI企业系统 API
  aiEnterprise: {
    baseUrl: process.env.AI_ENTERPRISE_URL || 'http://localhost:3000',
    endpoints: {
      customerAnalysis: '/api/customer-analysis',
      emailGenerator: '/api/email-generator',
      leadScoring: '/api/lead-scoring',
      knowledgeBase: '/api/knowledge-bases',
      supplyChain: '/api/supply-chain',
      domesticPlatforms: '/api/domestic-platforms',
    }
  },
  
  // 智能体管理系统 API
  agentManagement: {
    baseUrl: process.env.AGENT_MANAGEMENT_URL || 'http://localhost:3001',
    endpoints: {
      agents: '/api/agents',
      tasks: '/api/tasks',
      conversations: '/api/conversations',
      openclaw: '/api/openclaw',
    }
  },
  
  // 内容爬取Agent API
  crawlerAgent: {
    baseUrl: process.env.CRAWLER_AGENT_URL || 'http://localhost:5000',
    endpoints: {
      crawl: '/api/crawl',
      extract: '/api/extract',
      batch: '/api/batch',
    }
  }
};

// 统一响应格式
export interface ZAEPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  trace_id: string;
  source: string;
  timestamp: number;
}

/**
 * 创建统一响应
 */
export function createResponse<T>(
  success: boolean, 
  data?: T, 
  error?: { code: string; message: string },
  source: string = 'zaep'
): ZAEPResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    trace_id: `zaep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source,
    timestamp: Date.now()
  };
}

/**
 * API调用基础方法
 */
async function apiCall<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<ZAEPResponse<T>> {
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    
    const data = await response.json();
    
    return createResponse<T>(response.ok, data);
  } catch (error) {
    return createResponse<T>(false, undefined, {
      code: 'API_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// AI企业系统 API
export const AIEnterpriseAPI = {
  // 客户分析
  async analyzeCustomer(companyName: string) {
    return apiCall(
      API_CONFIG.aiEnterprise.baseUrl,
      `${API_CONFIG.aiEnterprise.endpoints.customerAnalysis}/chat`,
      {
        method: 'POST',
        body: JSON.stringify({ company_name: companyName })
      }
    );
  },
  
  // 邮件生成
  async generateEmail(template: string, params: object) {
    return apiCall(
      API_CONFIG.aiEnterprise.baseUrl,
      API_CONFIG.aiEnterprise.endpoints.emailGenerator,
      {
        method: 'POST',
        body: JSON.stringify({ template, ...params })
      }
    );
  },
  
  // 线索评分
  async scoreLeads(leads: any[]) {
    return apiCall(
      API_CONFIG.aiEnterprise.baseUrl,
      API_CONFIG.aiEnterprise.endpoints.leadScoring,
      {
        method: 'POST',
        body: JSON.stringify({ leads })
      }
    );
  }
};

// 智能体管理 API
export const AgentManagementAPI = {
  // 创建任务
  async createTask(taskData: any) {
    return apiCall(
      API_CONFIG.agentManagement.baseUrl,
      API_CONFIG.agentManagement.endpoints.tasks,
      {
        method: 'POST',
        body: JSON.stringify(taskData)
      }
    );
  },
  
  // 触发OpenClaw场景
  async triggerScenario(scenarioId: string, params?: object) {
    return apiCall(
      API_CONFIG.agentManagement.baseUrl,
      `${API_CONFIG.agentManagement.endpoints.openclaw}/trigger-task`,
      {
        method: 'POST',
        body: JSON.stringify({ scenario_id: scenarioId, params })
      }
    );
  },
  
  // 获取任务状态
  async getTaskStatus(taskId: string) {
    return apiCall(
      API_CONFIG.agentManagement.baseUrl,
      `${API_CONFIG.agentManagement.endpoints.openclaw}/task-status/${taskId}`
    );
  }
};

// 内容爬取 API
export const CrawlerAPI = {
  // 单URL采集
  async crawl(url: string, options?: object) {
    return apiCall(
      API_CONFIG.crawlerAgent.baseUrl,
      API_CONFIG.crawlerAgent.endpoints.crawl,
      {
        method: 'POST',
        body: JSON.stringify({ url, ...options })
      }
    );
  },
  
  // 批量采集
  async batchCrawl(urls: string[], options?: object) {
    return apiCall(
      API_CONFIG.crawlerAgent.baseUrl,
      API_CONFIG.crawlerAgent.endpoints.batch,
      {
        method: 'POST',
        body: JSON.stringify({ urls, ...options })
      }
    );
  },
  
  // 内容提取
  async extract(url: string, selectors: object) {
    return apiCall(
      API_CONFIG.crawlerAgent.baseUrl,
      API_CONFIG.crawlerAgent.endpoints.extract,
      {
        method: 'POST',
        body: JSON.stringify({ url, selectors })
      }
    );
  }
};

export default {
  API_CONFIG,
  createResponse,
  AIEnterpriseAPI,
  AgentManagementAPI,
  CrawlerAPI
};
