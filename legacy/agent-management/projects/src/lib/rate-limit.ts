/**
 * 简单的内存限速中间件
 * 用于防止API滥用
 */

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// 内存存储限速信息
const rateLimitStore = new Map<string, RateLimitInfo>();

/**
 * 限速配置
 */
export interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  skipSuccessfulRequests?: boolean; // 跳过成功请求的计数
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 100, // 100次请求
  skipSuccessfulRequests: false,
};

/**
 * 检查限速
 * @param identifier 唯一标识符（IP地址、用户ID等）
 * @param config 限速配置
 * @returns { success: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { success: boolean; remaining: number; resetTime: number } {
  const finalConfig = { ...defaultConfig, ...config };
  const now = Date.now();

  // 获取或创建限速信息
  let info = rateLimitStore.get(identifier);

  // 如果窗口已过期，重置计数
  if (!info || now > info.resetTime) {
    info = {
      count: 0,
      resetTime: now + finalConfig.windowMs,
    };
    rateLimitStore.set(identifier, info);
  }

  // 增加计数
  info.count++;

  // 检查是否超过限制
  const success = info.count <= finalConfig.maxRequests;
  const remaining = Math.max(0, finalConfig.maxRequests - info.count);
  const resetTime = info.resetTime;

  // 清理过期的记录（可选，定期清理）
  if (rateLimitStore.size > 1000) {
    const oldNow = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (oldNow > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  return { success, remaining, resetTime };
}

/**
 * 获取IP地址
 */
export function getClientIP(request: Request): string {
  // 尝试从各种头中获取IP
  const headers = Object.fromEntries(request.headers.entries());

  return (
    headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    headers["x-real-ip"] ||
    headers["cf-connecting-ip"] || // Cloudflare
    "unknown"
  );
}

/**
 * 限速中间件
 */
export function rateLimitMiddleware(config?: Partial<RateLimitConfig>) {
  return (request: Request) => {
    const ip = getClientIP(request);
    const result = checkRateLimit(ip, config);

    return result;
  };
}

/**
 * 限速助手类 - 用于不同API的不同限速策略
 */
export class RateLimiter {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  check(identifier: string, config?: Partial<RateLimitConfig>) {
    return checkRateLimit(`${this.prefix}:${identifier}`, config);
  }
}

// 预定义的限速器
export const strictRateLimiter = new RateLimiter("strict");
export const normalRateLimiter = new RateLimiter("normal");
export const looseRateLimiter = new RateLimiter("loose");

/**
 * API限速策略
 */
export const rateLimitStrategies = {
  // 严格限速：用于敏感操作
  strict: { windowMs: 60 * 1000, maxRequests: 10 }, // 10次/分钟

  // 标准限速：用于普通API
  normal: { windowMs: 60 * 1000, maxRequests: 100 }, // 100次/分钟

  // 宽松限速：用于查询类API
  loose: { windowMs: 60 * 1000, maxRequests: 300 }, // 300次/分钟

  // 上传限速：用于文件上传
  upload: { windowMs: 60 * 1000, maxRequests: 5 }, // 5次/分钟

  // 分析限速：用于AI分析
  analysis: { windowMs: 60 * 1000, maxRequests: 20 }, // 20次/分钟
};
