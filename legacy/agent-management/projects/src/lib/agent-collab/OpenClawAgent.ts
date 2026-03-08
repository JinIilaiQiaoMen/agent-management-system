/**
 * OpenClaw集成智能体基类
 * 深度融合OpenClaw能力的智能体
 * 实现1+1=1的真正融合
 */

import { IAgent, AgentTask, AgentResult, AgentRole, Tool } from './types';
import { OpenClawKernel, KernelResult } from './OpenClawKernel';

/**
 * OpenClaw集成智能体配置
 */
export interface OpenClawAgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt?: string;
  
  // OpenClaw能力开关
  enableChat?: boolean;        // AI对话
  enableBrowser?: boolean;    // 浏览器
  enableMessage?: boolean;    // 消息通讯
  enableSkills?: boolean;    // Skills
  enableCrawl?: boolean;     // 爬取
  enableSearch?: boolean;     // 搜索
  enableCron?: boolean;      // 定时任务
  enableDevices?: boolean;    // 设备控制
  
  // 行为配置
  autoExecute?: boolean;     // 自动执行任务
  maxRetries?: number;       // 最大重试次数
  defaultModel?: string;     // 默认模型
}

/**
 * OpenClaw集成智能体
 * 每个智能体都内置OpenClaw全部能力
 */
export class OpenClawAgent implements IAgent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt?: string;
  
  // OpenClaw内核
  private kernel: OpenClawKernel;
  
  // 能力开关
  public enableChat: boolean;
  public enableBrowser: boolean;
  public enableMessage: boolean;
  public enableSkills: boolean;
  public enableCrawl: boolean;
  public enableSearch: boolean;
  public enableCron: boolean;
  public enableDevices: boolean;
  
  // 行为配置
  public autoExecute: boolean;
  public maxRetries: number;
  public defaultModel: string;
  
  // 工具注册表
  public tools: Tool[] = [];

  constructor(config: OpenClawAgentConfig, kernel?: OpenClawKernel) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.description = config.description;
    this.systemPrompt = config.systemPrompt;
    
    // 初始化内核
    this.kernel = kernel || new OpenClawKernel();
    
    // 设置能力开关
    this.enableChat = config.enableChat ?? true;
    this.enableBrowser = config.enableBrowser ?? true;
    this.enableMessage = config.enableMessage ?? true;
    this.enableSkills = config.enableSkills ?? true;
    this.enableCrawl = config.enableCrawl ?? true;
    this.enableSearch = config.enableSearch ?? true;
    this.enableCron = config.enableCron ?? true;
    this.enableDevices = config.enableDevices ?? true;
    
    // 行为配置
    this.autoExecute = config.autoExecute ?? true;
    this.maxRetries = config.maxRetries ?? 3;
    this.defaultModel = config.defaultModel ?? 'coze/auto';
    
    // 注册内置工具
    this.registerTools();
  }

  /**
   * 注册OpenClaw工具到智能体
   */
  private registerTools() {
    // AI对话工具
    if (this.enableChat) {
      this.tools.push({
        name: 'chat',
        description: '与AI进行对话，获取智能回答',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            message: { type: 'string', description: '对话内容' },
            model: { type: 'string', description: '可选：指定模型' },
          },
          required: ['message'],
        },
        executor: async (params) => {
          return await this.kernel.chat(params.message, { model: params.model });
        },
      });
    }

    // 浏览器工具
    if (this.enableBrowser) {
      this.tools.push({
        name: 'browser_open',
        description: '打开网页',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: '网址' },
          },
          required: ['url'],
        },
        executor: async (params) => {
          return await this.kernel.browser('open', { url: params.url });
        },
      });

      this.tools.push({
        name: 'browser_screenshot',
        description: '截取当前网页截图',
        type: 'api',
        parameters: { type: 'object', properties: {} },
        executor: async () => {
          return await this.kernel.browser('screenshot');
        },
      });
    }

    // 消息通讯工具
    if (this.enableMessage) {
      this.tools.push({
        name: 'send_message',
        description: '发送消息到通讯平台',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            channel: { 
              type: 'string', 
              description: '通讯渠道',
              enum: ['feishu', 'telegram', 'discord', 'signal'] 
            },
            target: { type: 'string', description: '接收者ID' },
            message: { type: 'string', description: '消息内容' },
          },
          required: ['channel', 'target', 'message'],
        },
        executor: async (params) => {
          return await this.kernel.sendMessage(params.channel, params.target, params.message);
        },
      });
    }

    // 网页爬取工具
    if (this.enableCrawl) {
      this.tools.push({
        name: 'crawl',
        description: '爬取网页内容并结构化',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: '要爬取的URL' },
            depth: { type: 'number', description: '爬取深度' },
            maxPages: { type: 'number', description: '最大页面数' },
          },
          required: ['url'],
        },
        executor: async (params) => {
          return await this.kernel.crawl(params.url, {
            depth: params.depth,
            maxPages: params.maxPages,
          });
        },
      });
    }

    // 联网搜索工具
    if (this.enableSearch) {
      this.tools.push({
        name: 'search',
        description: '使用AI进行互联网搜索',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词' },
            maxResults: { type: 'number', description: '最大结果数' },
          },
          required: ['query'],
        },
        executor: async (params) => {
          return await this.kernel.search(params.query, params.maxResults);
        },
      });
    }

    // 定时任务工具
    if (this.enableCron) {
      this.tools.push({
        name: 'schedule_task',
        description: '创建定时任务',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '任务名称' },
            schedule: { type: 'string', description: 'Cron表达式' },
            command: { type: 'string', description: '执行命令' },
          },
          required: ['name', 'schedule', 'command'],
        },
        executor: async (params) => {
          return await this.kernel.createCronJob(params.name, params.schedule, params.command);
        },
      });
    }

    // Skills工具
    if (this.enableSkills) {
      this.tools.push({
        name: 'execute_skill',
        description: '执行指定技能',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            skillName: { type: 'string', description: '技能名称' },
            params: { type: 'object', description: '技能参数' },
          },
          required: ['skillName'],
        },
        executor: async (params) => {
          return await this.kernel.executeSkill(params.skillName, params.params || {});
        },
      });
    }

    // 设备控制工具
    if (this.enableDevices) {
      this.tools.push({
        name: 'device_screenshot',
        description: '截取设备屏幕',
        type: 'api',
        parameters: { type: 'object', properties: {} },
        executor: async () => {
          return await this.kernel.deviceScreenshot();
        },
      });

      this.tools.push({
        name: 'device_record',
        description: '录制设备屏幕',
        type: 'api',
        parameters: {
          type: 'object',
          properties: {
            duration: { type: 'number', description: '录制时长(秒)' },
          },
        },
        executor: async (params) => {
          return await this.kernel.deviceScreenRecord(params.duration);
        },
      });
    }
  }

  /**
   * 处理任务
   */
  async process(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // 智能判断任务类型并执行
      const result = await this.autoExecuteTask(task);
      
      return {
        taskId: task.id,
        agentId: this.id,
        status: result.success ? 'success' : 'failed',
        output: result,
        metadata: {
          executionTime: Date.now() - startTime,
          toolsUsed: this.extractToolsUsed(result),
        },
      };
    } catch (error) {
      return {
        taskId: task.id,
        agentId: this.id,
        status: 'failed',
        output: null,
        error: error instanceof Error ? error.message : '任务执行失败',
        metadata: {
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 自动执行任务 - 智能路由
   */
  private async autoExecuteTask(task: AgentTask): Promise<KernelResult> {
    const description = task.description.toLowerCase();
    
    // 1. 搜索任务
    if (description.includes('搜索') || description.includes('查询') || description.includes('search')) {
      const query = this.extractKeyword(task.description);
      return await this.kernel.search(query);
    }
    
    // 2. 爬取任务
    if (description.includes('爬取') || description.includes('抓取') || description.includes('crawl')) {
      const url = this.extractUrl(task.description);
      return await this.kernel.crawl(url);
    }
    
    // 3. 发送消息任务
    if (description.includes('发送') || description.includes('通知') || description.includes('message')) {
      return await this.kernel.sendMessage('feishu', 'default', task.description);
    }
    
    // 4. 浏览器任务
    if (description.includes('打开') || description.includes('浏览') || description.includes('browser')) {
      const url = this.extractUrl(task.description) || 'https://www.google.com';
      return await this.kernel.browser('open', { url });
    }
    
    // 5. 默认：AI对话处理
    return await this.kernel.chat(task.description, { model: this.defaultModel });
  }

  /**
   * 从描述中提取关键词
   */
  private extractKeyword(description: string): string {
    // 简单提取引号中的内容或关键词
    const match = description.match(/[""](.+?)[""]/);
    if (match) return match[1];
    return description.replace(/^(搜索|查询|search)/, '').trim();
  }

  /**
   * 从描述中提取URL
   */
  private extractUrl(description: string): string | null {
    const match = description.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  }

  /**
   * 提取使用的工具
   */
  private extractToolsUsed(result: KernelResult): string[] {
    const tools: string[] = [];
    if (result.data?.type) tools.push(result.data.type);
    return tools;
  }

  /**
   * 流式处理任务
   */
  async *processStream(task: AgentTask): AsyncGenerator<string> {
    const description = task.description;
    
    // 使用流式AI对话
    yield* this.kernel.chatStream(description, { model: this.defaultModel });
  }

  /**
   * 发送消息给其他智能体
   */
  async sendMessage(toAgent: string, content: any): Promise<void> {
    // 通过消息总线发送
    console.log(`[${this.name}] -> [${toAgent}]:`, content);
  }

  /**
   * 接收消息
   */
  async receiveMessages(): Promise<any[]> {
    return [];
  }

  /**
   * 获取内核实例
   */
  getKernel(): OpenClawKernel {
    return this.kernel;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    const result = await this.kernel.healthCheck();
    return result.success;
  }
}

/**
 * 快速创建OpenClaw集成智能体
 */
export function createOpenClawAgent(config: OpenClawAgentConfig): OpenClawAgent {
  return new OpenClawAgent(config);
}
