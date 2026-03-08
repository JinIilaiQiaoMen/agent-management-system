/**
 * API响应辅助工具
 * 确保所有API路由都返回统一的JSON格式响应
 */
import { NextResponse } from "next/server";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * 成功响应
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

/**
 * 错误响应
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    } as ApiResponse,
    { status }
  );
}

/**
 * 包装API处理器
 * 自动处理异常，确保始终返回JSON响应
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error("API Error:", error);

      // 检查是否是Next.js响应（已经处理过的错误）
      if (error instanceof NextResponse) {
        return error;
      }

      // 返回JSON格式的错误
      return errorResponse(
        error.message || "服务器内部错误",
        error.status || 500,
        process.env.NODE_ENV === "development" ? error.stack : undefined
      );
    }
  }) as T;
}
