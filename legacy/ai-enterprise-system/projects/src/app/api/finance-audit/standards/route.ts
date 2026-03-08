import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 财务准则管理 API
 * 注意：需要在 schema 中定义 finance_standards 表才能正常工作
 */

// GET - 获取财务准则列表
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: [],
      message: '请在数据库中创建 finance_standards 表以使用此功能'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - 创建财务准则
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      error: '请在数据库中创建 finance_standards 表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
