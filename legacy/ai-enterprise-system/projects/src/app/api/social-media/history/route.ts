import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 发布历史 API
 * 注意：需要在 schema 中定义 publish_history 表才能正常工作
 */

/**
 * 获取发布历史
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      history: [],
      message: '请在数据库中创建 publish_history 表以使用此功能'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
