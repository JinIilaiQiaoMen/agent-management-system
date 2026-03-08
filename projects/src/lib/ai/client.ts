/**
 * ZAEP - AI能力集成模块
 * 
 * 整合多AI供应商支持：
 * - Coze (原系统)
 * - 智谱AI
 * - 百度文心
 * - 阿里通义
 */

export interface AIConfig {
  provider: 'coze' | 'zhipu' | 'wenxin' | 'tongyi';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI供应商配置
 */
export const AI_PROVIDERS = {
  coze: {
    name: 'Coze',
    baseUrl: process.env.COZE_BASE_URL || 'https://api.coze.com/v1',
    defaultModel: 'doubao-pro-32k',
  },
  zhipu: {
    name: '智谱AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
  },
  wenxin: {
    name: '文心一言',
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    defaultModel: 'ernie-4.0-8k',
  },
  tongyi: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    defaultModel: 'qwen-turbo',
  },
} as const;

/**
 * 统一AI客户端
 */
export class AIClient {
  private config: AIConfig;
  
  constructor(config: AIConfig) {
    this.config = config;
  }
  
  /**
   * 发送聊天请求
   */
  async chat(messages: { role: string; content: string }[]): Promise<AIResponse> {
    const provider = AI_PROVIDERS[this.config.provider];
    
    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || provider.defaultModel,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `API Error: ${error}` };
      }
      
      const data = await response.json();
      return {
        success: true,
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * 流式聊天
   */
  async *chatStream(messages: { role: string; content: string }[]): AsyncGenerator<string> {
    const provider = AI_PROVIDERS[this.config.provider];
    
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || provider.defaultModel,
        messages,
        stream: true,
      }),
    });
    
    if (!response.ok || !response.body) {
      throw new Error('Stream request failed');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
      
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {}
      }
    }
  }
}

/**
 * 创建AI客户端工厂
 */
export function createAIClient(provider: AIConfig['provider'], apiKey: string): AIClient {
  return new AIClient({ provider, apiKey });
}

/**
 * 智能路由 - 根据任务类型选择最优模型
 */
export function selectOptimalModel(taskType: string): AIConfig['provider'] {
  const modelMap: Record<string, AIConfig['provider']> = {
    // 简单任务 - 使用免费/低成本模型
    'simple-chat': 'coze',
    'classification': 'zhipu',
    'summarization': 'tongyi',
    
    // 复杂任务 - 使用高性能模型
    'analysis': 'zhipu',
    'reasoning': 'wenxin',
    'creative': 'tongyi',
    
    // 默认
    'default': 'coze',
  };
  
  return modelMap[taskType] || modelMap['default'];
}

export default {
  AI_PROVIDERS,
  AIClient,
  createAIClient,
  selectOptimalModel,
};
