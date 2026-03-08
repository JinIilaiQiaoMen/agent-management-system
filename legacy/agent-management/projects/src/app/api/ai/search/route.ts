import { NextRequest } from 'next/server';
import { SearchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import {
  authenticateRequest,
  checkApiRateLimit,
  createErrorResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/auth';

/**
 * POST /api/ai/search
 *
 * AI 联网搜索接口
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
      query,
      count = 10,
    } = body;

    // 4. 验证请求参数
    if (!query || typeof query !== 'string') {
      throw new ApiError(
        400,
        ERROR_CODES.INVALID_REQUEST,
        'query is required and must be a string'
      );
    }

    if (count && (typeof count !== 'number' || count < 1 || count > 50)) {
      throw new ApiError(
        400,
        ERROR_CODES.INVALID_REQUEST,
        'count must be between 1 and 50'
      );
    }

    // 5. 配置搜索客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const searchClient = new SearchClient(config, customHeaders);

    // 6. 执行搜索
    const searchResults = await searchClient.search({
      query,
      count,
    });

    // 7. 构建响应
    const results = (searchResults as any).results?.map((result: any) => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet || result.content || '',
      publishedDate: result.publishedDate,
      source: result.source || 'unknown',
    })) || [];

    const response = {
      query,
      results,
      totalCount: results.length,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return Response.json(response, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '0',
      },
    });
  } catch (error: any) {
    console.error('Search API error:', error);

    if (error instanceof ApiError) {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      new ApiError(
        500,
        ERROR_CODES.INTERNAL_ERROR,
        'Failed to perform search',
        process.env.NODE_ENV === 'development' ? error.stack : undefined
      )
    );
  }
}

/**
 * GET /api/ai/search
 *
 * 获取联网搜索 API 信息
 */
export async function GET() {
  return Response.json({
    name: 'AI Search API',
    version: '1.0.0',
    description: 'AI 联网搜索接口，支持实时搜索互联网信息',
    endpoints: {
      POST: {
        path: '/api/ai/search',
        description: '执行联网搜索',
        parameters: {
          query: {
            type: 'string',
            required: true,
            description: '搜索查询字符串',
          },
          count: {
            type: 'number',
            required: false,
            default: 10,
            min: 1,
            max: 50,
            description: '返回结果数量',
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
      maxRequests: 50,
    },
  });
}
