import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 财务报销管理 API
 * 注意：需要在 schema 中定义 expenses 表才能正常工作
 */

// GET - 获取报销单列表
export async function GET(request: NextRequest) {
  try {
    // 检查数据库连接
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    // 返回空数据，需要先创建 expenses 表
    return NextResponse.json({ 
      success: true, 
      data: [],
      message: '请在数据库中创建 expenses 表以使用此功能'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - 创建报销单
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    // 需要先创建 expenses 表
    return NextResponse.json({ 
      success: false, 
      error: '请在数据库中创建 expenses 表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - 更新报销单（审批）
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
      error: '请在数据库中创建 expenses 表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - 删除报销单
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
      error: '请在数据库中创建 expenses 表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
