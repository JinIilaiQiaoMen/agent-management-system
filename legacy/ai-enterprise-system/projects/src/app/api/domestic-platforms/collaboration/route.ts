import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 团队协作管理 API
 * 注意：需要在 schema 中定义 team_members 和 publish_tasks 表才能正常工作
 */

/**
 * 获取团队成员和任务列表
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'members' | 'tasks'

    if (type === 'members') {
      return NextResponse.json({
        members: [],
        message: '请在数据库中创建 team_members 表以使用此功能'
      });
    } else if (type === 'tasks') {
      return NextResponse.json({
        tasks: [],
        message: '请在数据库中创建 publish_tasks 表以使用此功能'
      });
    }

    return NextResponse.json({
      members: [],
      tasks: [],
      message: '请指定 type 参数 (members 或 tasks)'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * 创建团队成员或任务
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
      error: '请在数据库中创建相应表以使用此功能'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
