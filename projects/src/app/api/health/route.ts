import { NextResponse } from 'next/server';

/**
 * 健康检查接口
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime?.() || 0,
  });
}
