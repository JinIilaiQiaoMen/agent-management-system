import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 模板管理 API
 * 注意：需要在 schema 中定义 content_templates 表才能正常工作
 */

/**
 * 获取模板列表
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
      templates: [],
      message: '请在数据库中创建 content_templates 表以使用此功能'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * 创建模板
 */
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
      error: '请在数据库中创建 content_templates 表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * 更新模板
 */
export async function PUT(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      error: '请在数据库中创建 content_templates 表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * 删除模板
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      error: '请在数据库中创建 content_templates 表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
