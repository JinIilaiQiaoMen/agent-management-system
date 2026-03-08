import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import {
  authenticateRequest,
  checkApiRateLimit,
  createErrorResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/auth';

/**
 * POST /api/ai/completion
 *
 * AI 文本补全接口
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 认证
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return createErrorResponse(authResult.error!);
    }

    // 2. 限流检查
    const rateLimitResult = await checkApiRateLimit(request);
    if (!rateLimitResult.allowed) {
      return createErrorResponse(rateLimitResult.error!);
    }

    // 3. 解析请求体
    const body = await request.json();

    const {
      prompt,
      temperature = 0.7,
      suffix,
    } = body;

    // 4. 验证请求参数
    if (!prompt || typeof prompt !== 'string') {
      throw new ApiError(
        400,
        ERROR_CODES.INVALID_REQUEST,
        'prompt is required and must be a string'
      );
    }

    // 5. 配置 LLM 客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmClient = new LLMClient(config);

    // 6. 调用 LLM
    const fullPrompt = suffix ? `${prompt} ${suffix}` : prompt;
    const messages = [{ role: 'user' as const, content: fullPrompt }];

    const llmStream = llmClient.stream(
      messages,
      { temperature },
      undefined,
      customHeaders
    );

    let fullContent = '';

    for await (const chunk of llmStream) {
      if (chunk.content) {
        fullContent += chunk.content.toString();
      }
    }

    // 7. 构建响应
    const result = {
      id: `cmpl-${Date.now()}`,
      object: 'text_completion',
      created: Date.now(),
      choices: [{
        index: 0,
        text: fullContent,
        finishReason: 'stop',
      }],
      usage: {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
      },
    };

    return Response.json(result, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '0',
      },
    });
  } catch (error: any) {
    console.error('Completion API error:', error);

    if (error instanceof ApiError) {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      new ApiError(
        500,
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to process completion request',
        process.env.NODE_ENV === 'development' ? error.stack : undefined
      )
    );
  }
}

/**
 * GET /api/ai/completion
 *
 * 获取文本补全 API 信息
 */
export async function GET() {
  return Response.json({
    name: 'AI Completion API',
    version: '1.0.0',
    description: 'AI 文本补全接口，用于生成文本、代码等',
    endpoints: {
      POST: {
        path: '/api/ai/completion',
        description: '发送文本补全请求',
        parameters: {
          prompt: {
            type: 'string',
            required: true,
            description: '待补全的文本提示',
          },
          temperature: {
            type: 'number',
            required: false,
            default: 0.7,
            description: '温度参数，控制输出的随机性',
          },
          suffix: {
            type: 'string',
            required: false,
            description: '补全后缀',
          },
        },
      },
    },
    authentication: {
      type: 'Bearer Token',
      description: '在 Authorization header 中提供 API Key',
    },
    rateLimit: {
      window: '1 minute',
      maxRequests: 100,
    },
  });
}
