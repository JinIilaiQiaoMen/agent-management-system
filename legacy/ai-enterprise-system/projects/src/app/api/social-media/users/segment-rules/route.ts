import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { segmentRules } from '@/storage/database/shared/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * 分层规则管理 API
 */

// GET - 获取分层规则列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const segmentType = searchParams.get('segmentType');
    const enabled = searchParams.get('enabled');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];
    if (segmentType) {
      conditions.push(eq(segmentRules.segmentType, segmentType));
    }
    if (enabled === 'true') {
      conditions.push(eq(segmentRules.enabled, true));
    } else if (enabled === 'false') {
      conditions.push(eq(segmentRules.enabled, false));
    }

    const rules = await db.select().from(segmentRules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(segmentRules.priority), desc(segmentRules.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      rules,
      total: rules.length
    });
  } catch (error: any) {
    console.error('获取分层规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取分层规则失败',
      details: error.message
    }, { status: 500 });
  }
}

// POST - 创建分层规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, segmentType, platform, conditions, priority = 0, description } = body;

    if (!name || !segmentType || !conditions) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: name, segmentType, conditions'
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const rule = await db
      .insert(segmentRules)
      .values({
        name,
        segmentType,
        platform,
        conditions,
        priority,
        description,
        enabled: true,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json({
      success: true,
      rule: rule[0],
      message: '分层规则创建成功'
    });
  } catch (error: any) {
    console.error('创建分层规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建分层规则失败',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - 更新分层规则
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, segmentType, platform, conditions, priority, enabled, description } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少规则 ID'
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const rule = await db
      .update(segmentRules)
      .set({
        ...(name && { name }),
        ...(segmentType && { segmentType }),
        ...(platform !== undefined && { platform }),
        ...(conditions && { conditions }),
        ...(priority !== undefined && { priority }),
        ...(enabled !== undefined && { enabled }),
        ...(description !== undefined && { description }),
        updatedAt: now
      })
      .where(eq(segmentRules.id, id))
      .returning();

    if (!rule || rule.length === 0) {
      return NextResponse.json({
        success: false,
        error: '规则不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rule: rule[0],
      message: '分层规则更新成功'
    });
  } catch (error: any) {
    console.error('更新分层规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '更新分层规则失败',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - 删除分层规则
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少规则 ID'
      }, { status: 400 });
    }

    const result = await db
      .delete(segmentRules)
      .where(eq(segmentRules.id, id))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        error: '规则不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '分层规则删除成功'
    });
  } catch (error: any) {
    console.error('删除分层规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除分层规则失败',
      details: error.message
    }, { status: 500 });
  }
}
