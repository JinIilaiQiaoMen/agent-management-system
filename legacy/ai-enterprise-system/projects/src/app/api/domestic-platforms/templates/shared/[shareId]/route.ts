import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 分享模板 API
 * 注意：需要在 schema 中定义 shared_templates 表才能正常工作
 */

/**
 * 获取分享的模板
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      error: '模板不存在或已过期'
    }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
