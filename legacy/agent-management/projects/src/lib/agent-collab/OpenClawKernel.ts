/**
 * OpenClaw 深度集成内核
 * 将OpenClaw所有能力直接嵌入智能体管理系统
 * 实现真正的1+1=1融合系统
 */

import { Tool, ToolExecutor } from './types';

/**
 * OpenClaw内核配置
 */
export interface OpenClawKernelConfig {
  // 连接配置
  baseUrl: string;        // OpenClaw Gateway地址
  apiKey: string;         // API密钥
  wsUrl?: string;         // WebSocket地址
  
  // 能力开关
  enableChat: boolean;    // AI对话能力
  enableBrowser: boolean; // 浏览器自动化
  enableMessage: boolean; // 消息通讯
  enableSkills: boolean;  // Skills工具能力
  enableCrawl: boolean;   // 网页爬取
  enableSearch: boolean;   // 联网搜索
  enableCron: boolean;     // 定时任务
  enableDevices: boolean;  // 设备控制
  
  // 高级配置
  defaultModel?: string;  // 默认模型
  timeout: number;        // 请求超时(ms)
  maxRetries: number;    // 最大重试次数
}

/**
 * 默认配置
 */
export const DEFAULT_KERNEL_CONFIG: OpenClawKernelConfig = {
  baseUrl: process.env.OPENCLAW_BASE_URL || 'http://localhost:5000',
  apiKey: process.env.OPENCLAW_API_KEY || '',
  enableChat: true,
  enableBrowser: true,
  enableMessage: true,
  enableSkills: true,
  enableCrawl: true,
  enableSearch: true,
  enableCron: true,
  enableDevices: true,
  defaultModel: 'coze/auto',
  timeout: 30000,
  maxRetries: 3,
};

/**
 * 统一的工具执行结果
 */
export interface KernelResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  executionTime?: number;
}

/**
 * OpenClaw内核类
 * 深度集成了所有OpenClaw能力
 */
export class OpenClawKernel {
  private config: OpenClawKernelConfig;
  private sessionId: string;
  
  constructor(config: Partial<OpenClawKernelConfig> = {}) {
    this.config = { ...DEFAULT_KERNEL_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `kernel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 通用请求方法
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<KernelResult<T>> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Session-Id': this.sessionId,
          ...options.headers,
        },
      });

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      return {
        success: response.ok,
        data,
        message: response.ok ? '操作成功' : '操作失败',
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== 核心能力接口 ====================

  /**
   * AI对话 - 统一入口
   */
  async chat(message: string, options?: {
    model?: string;
    stream?: boolean;
  }): Promise<KernelResult> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        model: options?.model || this.config.defaultModel,
        sessionId: this.sessionId,
      }),
    });
  }

  /**
   * 流式对话
   */
  async *chatStream(message: string, options?: {
    model?: string;
  }): AsyncGenerator<string> {
    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        message,
        model: options?.model || this.config.defaultModel,
        stream: true,
      }),
    });

    if (!response.body) return;
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value);
    }
  }

  /**
   * 浏览器控制
   */
  async browser(action: 'open' | 'screenshot' | 'close', params?: {
    url?: string;
  }): Promise<KernelResult> {
    if (action === 'open') {
      return this.request('/api/browser/open', {
        method: 'POST',
        body: JSON.stringify({ url: params?.url }),
      });
    } else if (action === 'screenshot') {
      return this.request('/api/browser/screenshot', {
        method: 'POST',
      });
    } else {
      return this.request('/api/browser/close', {
        method: 'POST',
      });
    }
  }

  /**
   * 浏览器操作
   */
  async browserAct(action: {
    kind: 'click' | 'type' | 'press' | 'scroll' | 'hover';
    ref?: string;
    text?: string;
    key?: string;
  }): Promise<KernelResult> {
    return this.request('/api/browser/act', {
      method: 'POST',
      body: JSON.stringify({ request: action }),
    });
  }

  /**
   * 发送消息
   */
  async sendMessage(channel: 'feishu' | 'telegram' | 'discord' | 'signal', target: string, message: string): Promise<KernelResult> {
    return this.request('/api/message/send', {
      method: 'POST',
      body: JSON.stringify({ channel, target, message }),
    });
  }

  /**
   * 网页爬取
   */
  async crawl(url: string, options?: {
    depth?: number;
    maxPages?: number;
    extractData?: boolean;
  }): Promise<KernelResult> {
    return this.request('/api/crawl', {
      method: 'POST',
      body: JSON.stringify({
        source: 'url',
        urls: [url],
        depth: options?.depth || 1,
        max_count: options?.maxPages || 10,
      }),
    });
  }

  /**
   * 联网搜索
   */
  async search(query: string, maxResults?: number): Promise<KernelResult> {
    return this.request('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query, maxResults }),
    });
  }

  /**
   * 创建定时任务
   */
  async createCronJob(name: string, schedule: string, command: string): Promise<KernelResult> {
    return this.request('/api/cron/add', {
      method: 'POST',
      body: JSON.stringify({ name, schedule, command }),
    });
  }

  /**
   * 执行Skills
   */
  async executeSkill(skillName: string, params: Record<string, any>): Promise<KernelResult> {
    return this.request(`/api/skills/${skillName}/execute`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * 设备控制 - 截屏
   */
  async deviceScreenshot(): Promise<KernelResult> {
    return this.request('/api/nodes/camera_snap', {
      method: 'POST',
    });
  }

  /**
   * 设备控制 - 屏幕录制
   */
  async deviceScreenRecord(duration?: number): Promise<KernelResult> {
    return this.request('/api/nodes/screen_record', {
      method: 'POST',
      body: JSON.stringify({ duration }),
    });
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<KernelResult> {
    return this.request('/api/status');
  }

  /**
   * 获取可用模型列表
   */
  async listModels(): Promise<KernelResult> {
    return this.request('/api/models');
  }

  /**
   * 获取会话历史
   */
  async getSessionHistory(sessionKey?: string): Promise<KernelResult> {
    const key = sessionKey || this.sessionId;
    return this.request(`/api/sessions/${key}/history`);
  }

  /**
   * 创建子代理
   */
  async createSubAgent(name: string, prompt: string): Promise<KernelResult> {
    return this.request('/api/subagents/create', {
      method: 'POST',
      body: JSON.stringify({ name, prompt }),
    });
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus(): Promise<KernelResult> {
    return this.request('/api/status');
  }
}

/**
 * 导出单例
 */
export const openclawKernel = new OpenClawKernel();
