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
 * POST /api/ai/chat
 *
 * AI 聊天对话接口
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
      messages,
      temperature = 0.7,
      stream = false,
    } = body;

    // 4. 验证请求参数
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(
        400,
        ERROR_CODES.INVALID_REQUEST,
        'messages is required and must be a non-empty array'
      );
    }

    // 5. 配置 LLM 客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmClient = new LLMClient(config);

    // 6. 处理请求
    if (stream) {
      // 流式响应
      const encoder = new TextEncoder();

      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            // 使用流式聊天
            const llmStream = llmClient.stream(
              messages,
              { temperature },
              undefined,
              customHeaders
            );

            for await (const chunk of llmStream) {
              if (chunk.content) {
                const data = JSON.stringify({
                  id: `chatcmpl-${Date.now()}`,
                  object: 'chat.completion.chunk',
                  created: Date.now(),
                  choices: [{
                    delta: { content: chunk.content.toString() },
                    index: 0,
                  }],
                });

                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }

            // 发送完成信号
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error: any) {
            controller.error(error);
          }
        },
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '0',
        },
      });
    } else {
      // 非流式响应 - 使用stream方法收集所有内容
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

      const result = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Date.now(),
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: fullContent,
          },
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
    }
  } catch (error: any) {
    console.error('Chat API error:', error);

    if (error instanceof ApiError) {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      new ApiError(
        500,
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to process chat request',
        process.env.NODE_ENV === 'development' ? error.stack : undefined
      )
    );
  }
}

/**
 * GET /api/ai/chat
 *
 * 获取聊天 API 信息
 */
export async function GET() {
  return Response.json({
    name: 'AI Chat API',
    version: '1.0.0',
    description: 'AI 聊天对话接口，支持多轮对话和流式输出',
    endpoints: {
      POST: {
        path: '/api/ai/chat',
        description: '发送聊天请求',
        parameters: {
          messages: {
            type: 'array',
            required: true,
            description: '对话消息数组',
            items: {
              role: 'user | assistant | system',
              content: 'string',
            },
          },
          temperature: {
            type: 'number',
            required: false,
            default: 0.7,
            description: '温度参数，控制输出的随机性',
          },
          stream: {
            type: 'boolean',
            required: false,
            default: false,
            description: '是否使用流式输出',
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
