import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  checkApiRateLimit,
  createErrorResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/auth';

/**
 * POST /api/ai/image-understand
 *
 * AI 图像理解接口
 *
 * 注意：此功能需要 vision 支持，当前版本可能不可用
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
      image,
      prompt = '请详细描述这张图片的内容',
    } = body;

    // 4. 验证请求参数
    if (!image || typeof image !== 'string') {
      throw new ApiError(
        400,
        ERROR_CODES.INVALID_REQUEST,
        'image is required and must be a string (base64 or URL)'
      );
    }

    // 5. 返回模拟响应（实际需要调用 vision API）
    const response = {
      id: `imgund-${Date.now()}`,
      object: 'image.understanding',
      created: Date.now(),
      content: '抱歉，当前版本暂不支持图像理解功能。请使用聊天接口，通过文字描述需要的信息。',
      usage: {
        totalTokens: 50,
        promptTokens: 30,
        completionTokens: 20,
      },
    };

    return Response.json(response, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '0',
      },
    });
  } catch (error: any) {
    console.error('Image Understanding API error:', error);

    if (error instanceof ApiError) {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      new ApiError(
        500,
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to understand image',
        process.env.NODE_ENV === 'development' ? error.stack : undefined
      )
    );
  }
}

/**
 * GET /api/ai/image-understand
 *
 * 获取图像理解 API 信息
 */
export async function GET() {
  return Response.json({
    name: 'AI Image Understanding API',
    version: '1.0.0',
    description: 'AI 图像理解接口，支持图像识别、描述、分析等',
    endpoints: {
      POST: {
        path: '/api/ai/image-understand',
        description: '分析并理解图片内容',
        parameters: {
          image: {
            type: 'string',
            required: true,
            description: '图片数据（base64 编码或图片 URL）',
          },
          prompt: {
            type: 'string',
            required: false,
            default: '请详细描述这张图片的内容',
            description: '提示词，描述你想从图片中获取什么信息',
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
      maxRequests: 30,
    },
    note: '当前版本暂不支持图像理解功能，请使用聊天接口',
  });
}
