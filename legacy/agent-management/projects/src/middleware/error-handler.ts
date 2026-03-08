/**
 * 错误状态码监控中间件
 *
 * 功能:
 * - 捕获HTTP错误响应
 * - 记录错误状态码
 * - 返回统一格式的JSON错误响应
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 状态码错误映射
 */
const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请先登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  409: '请求冲突',
  422: '请求参数验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
};

/**
 * 创建错误响应
 */
export function createErrorResponse(
  status: number,
  message?: string,
  code?: string
) {
  const defaultMessage = STATUS_CODE_MESSAGES[status] || '未知错误';
  const responseMessage = message || defaultMessage;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: code || `ERROR_${status}`,
        message: responseMessage,
        status,
      },
      data: null,
    },
    { status }
  );
}

/**
 * 记录错误日志
 */
export function logError(
  request: NextRequest,
  status: number,
  error?: unknown
) {
  const timestamp = new Date().toISOString();
  const url = request.url;
  const method = request.method;

  console.error(`[HTTP Error] ${timestamp}`, {
    url,
    method,
    status,
    error: error instanceof Error ? error.message : String(error),
  });

  // 在生产环境中，这里应该发送到日志服务
  // 例如：Sentry、LogRocket、Datadog等
}

/**
 * 中间件：错误状态码处理
 */
export function errorHandlerMiddleware(
  request: NextRequest,
  error?: unknown
) {
  // 判断错误类型
  let status = 500;
  let message = '服务器内部错误';

  if (error && typeof error === 'object') {
    // 检查是否是Next.js的HTTP错误
    if ('status' in error && typeof error.status === 'number') {
      status = error.status;
    }

    // 检查是否有自定义错误消息
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    }
  }

  // 记录错误
  logError(request, status, error);

  // 返回错误响应
  return createErrorResponse(status, message);
}
