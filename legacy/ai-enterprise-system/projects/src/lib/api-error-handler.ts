import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * API 错误类型
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 处理 API 错误并返回统一的错误响应
 */
export function handleAPIError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  // Zod 验证错误
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        details: error.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // 自定义 API 错误
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // 其他错误
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json(
    {
      error: message,
    },
    { status: 500 }
  );
}

/**
 * 验证请求体的装饰器
 */
export function validateRequest<T>(schema: any, data: T): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new APIError(
        'Validation failed',
        400,
        error.issues
      );
    }
    throw error;
  }
}

/**
 * 创建成功响应
 */
export function successResponse<T>(data: T, statusCode: number = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data,
  }, { status: statusCode });
}

/**
 * 创建分页响应
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
