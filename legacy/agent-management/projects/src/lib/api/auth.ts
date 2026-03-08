import { NextRequest } from 'next/server';

/**
 * API Key 管理
 */

// 有效的 API Keys（生产环境应从数据库或环境变量读取）
const VALID_API_KEYS = new Set([
  process.env.API_MASTER_KEY || '',
  process.env.API_CLIENT_KEY_1 || '',
]);

// 生成随机 API Key
export function generateApiKey(): string {
  const prefix = 'sk-';
  const random = Math.random().toString(36).substring(2, 15) +
                 Math.random().toString(36).substring(2, 15);
  return `${prefix}${random}`;
}

// 验证 API Key
export function validateApiKey(key: string | null): boolean {
  if (!key) return false;
  return VALID_API_KEYS.has(key);
}

// 从请求中提取 API Key
export function extractApiKey(request: NextRequest): string | null {
  // 1. 从 Authorization header 提取
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const [type, key] = authHeader.split(' ');
    if (type === 'Bearer' && key) {
      return key;
    }
  }

  // 2. 从 X-API-Key header 提取
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // 3. 从查询参数提取
  const { searchParams } = new URL(request.url);
  const apiKeyParam = searchParams.get('api_key');
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}

/**
 * API 限流
 */

// 简单的内存限流器（生产环境建议使用 Redis）
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// 限流配置
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 分钟窗口
  maxRequests: 100,    // 每分钟最多 100 次请求
};

// 检查限流
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimits.get(identifier);

  if (!entry || now > entry.resetTime) {
    // 创建新窗口
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    };
    rateLimits.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    // 超过限制
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // 增加计数
  entry.count++;
  rateLimits.set(identifier, entry);

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// 获取客户端标识符
export function getClientIdentifier(request: NextRequest): string {
  // 优先使用 API Key，然后使用 IP
  const apiKey = extractApiKey(request);
  if (apiKey) {
    return `key:${apiKey}`;
  }

  // 从请求头获取真实 IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  return `ip:unknown`;
}

/**
 * API 错误响应
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * 统一的错误响应格式
 */
export function createErrorResponse(
  error: ApiError | Error,
  includeStackTrace = false
): Response {
  if (error instanceof ApiError) {
    const body = {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    };

    return Response.json(body, {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // 未知错误
  const body = {
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Internal server error',
      details: includeStackTrace ? error.stack : undefined,
    },
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * API 认证中间件
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  error?: ApiError;
}> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      success: false,
      error: new ApiError(
        401,
        ERROR_CODES.UNAUTHORIZED,
        'API key is required. Provide it via Authorization header, X-API-Key header, or api_key query parameter.'
      ),
    };
  }

  if (!validateApiKey(apiKey)) {
    return {
      success: false,
      error: new ApiError(
        401,
        ERROR_CODES.INVALID_API_KEY,
        'Invalid API key'
      ),
    };
  }

  return { success: true };
}

/**
 * API 限流中间件
 */
export async function checkApiRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  error?: ApiError;
  remaining?: number;
  resetTime?: number;
}> {
  const identifier = getClientIdentifier(request);
  const result = checkRateLimit(identifier);

  if (!result.allowed) {
    return {
      allowed: false,
      error: new ApiError(
        429,
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded',
        {
          resetTime: result.resetTime,
        }
      ),
      remaining: 0,
      resetTime: result.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetTime: result.resetTime,
  };
}
