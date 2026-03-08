/**
 * LLM 模块
 * 使用 coze-coding-dev-sdk 提供的大语言模型功能
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  caching?: 'enabled' | 'disabled';
  thinking?: 'enabled' | 'disabled';
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

// 创建全局 LLM 客户端实例
let llmClient: LLMClient | null = null;

function getLLMClient(): LLMClient {
  if (!llmClient) {
    const config = new Config();
    llmClient = new LLMClient(config);
  }
  return llmClient;
}

/**
 * 生成文本（非流式）
 */
export async function generateText(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const {
    model = 'doubao-seed-1-8-251228',
    temperature = 0.7,
    caching = 'disabled',
    thinking = 'disabled',
  } = options;

  try {
    const client = getLLMClient();
    const result = await client.invoke(messages, {
      model,
      temperature,
      caching,
      thinking,
    });

    return result.content || '';
  } catch (error: unknown) {
    console.error('LLM 生成失败:', error);
    throw new Error(`LLM 生成失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 生成文本（流式）
 */
export async function generateTextStream(
  messages: LLMMessage[],
  options: LLMOptions = {},
  onChunk: (chunk: string) => void
): Promise<string> {
  const {
    model = 'doubao-seed-1-8-251228',
    temperature = 0.7,
    caching = 'disabled',
    thinking = 'disabled',
  } = options;

  try {
    const client = getLLMClient();
    const stream = client.stream(messages, {
      model,
      temperature,
      caching,
      thinking,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = typeof chunk.content === 'string' ? chunk.content : '';
      fullContent += content;
      onChunk(content);
    }

    return fullContent;
  } catch (error: unknown) {
    console.error('LLM 流式生成失败:', error);
    throw new Error(`LLM 流式生成失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取可用的模型列表
 */
export function getAvailableModels(): string[] {
  return [
    'doubao-seed-2-0-pro-260215',
    'doubao-seed-2-0-lite-260215',
    'doubao-seed-2-0-mini-260215',
    'doubao-seed-1-8-251228',
    'doubao-seed-1-6-251015',
    'doubao-seed-1-6-flash-250615',
    'doubao-seed-1-6-thinking-250715',
    'doubao-seed-1-6-vision-250815',
    'doubao-seed-1-6-lite-251015',
    'deepseek-v3-2-251201',
    'glm-4-7-251222',
    'deepseek-r1-250528',
    'kimi-k2-250905',
    'kimi-k2-5-260127',
  ];
}

/**
 * 根据任务类型推荐模型
 */
export function getRecommendedModel(taskType: 'reasoning' | 'vision' | 'fast' | 'balanced' = 'balanced'): string {
  const recommendations: Record<string, string> = {
    reasoning: 'doubao-seed-1-6-thinking-250715',
    vision: 'doubao-seed-1-6-vision-250815',
    fast: 'doubao-seed-1-6-flash-250615',
    balanced: 'doubao-seed-1-8-251228',
  };
  return recommendations[taskType];
}
