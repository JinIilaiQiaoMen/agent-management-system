import { NextRequest } from "next/server";
import { successResponse, errorResponse, withErrorHandler } from "@/lib/api-response";

/**
 * GET /api/health - 健康检查端点
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 检查数据库连接
  const { getDb } = await import("coze-coding-dev-sdk");
  const db = await getDb();

  // 简单的健康检查
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    services: {
      database: "connected",
    },
  };

  return successResponse(health, "系统运行正常");
});
