import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { autoReplyRules } from '@/storage/database/shared/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * 自动回复规则管理 API
 */

// GET - 获取自动回复规则列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const enabled = searchParams.get('enabled');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];
    if (platform) {
      conditions.push(eq(autoReplyRules.platform, platform));
    }
    if (enabled === 'true') {
      conditions.push(eq(autoReplyRules.enabled, true));
    } else if (enabled === 'false') {
      conditions.push(eq(autoReplyRules.enabled, false));
    }

    const rules = await db.select().from(autoReplyRules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(autoReplyRules.priority), desc(autoReplyRules.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      rules,
      total: rules.length
    });
  } catch (error: any) {
    console.error('获取自动回复规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取自动回复规则失败',
      details: error.message
    }, { status: 500 });
  }
}

// POST - 创建自动回复规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, name, keywords, template, replyType = 'rule', priority = 0, maxReplies = 3, cooldownMinutes = 60, sentimentFilter } = body;

    if (!platform || !name || !keywords || !template) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: platform, name, keywords, template'
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const rule = await db
      .insert(autoReplyRules)
      .values({
        platform,
        name,
        keywords: Array.isArray(keywords) ? keywords : [keywords],
        template,
        replyType,
        priority,
        maxReplies,
        cooldownMinutes,
        sentimentFilter,
        enabled: true,
        responseCount: 0,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json({
      success: true,
      rule: rule[0],
      message: '自动回复规则创建成功'
    });
  } catch (error: any) {
    console.error('创建自动回复规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建自动回复规则失败',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - 更新自动回复规则
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, keywords, template, replyType, priority, enabled, maxReplies, cooldownMinutes, sentimentFilter } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少规则 ID'
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const rule = await db
      .update(autoReplyRules)
      .set({
        ...(name && { name }),
        ...(keywords && { keywords: Array.isArray(keywords) ? keywords : [keywords] }),
        ...(template && { template }),
        ...(replyType && { replyType }),
        ...(priority !== undefined && { priority }),
        ...(enabled !== undefined && { enabled }),
        ...(maxReplies !== undefined && { maxReplies }),
        ...(cooldownMinutes !== undefined && { cooldownMinutes }),
        ...(sentimentFilter !== undefined && { sentimentFilter }),
        updatedAt: now
      })
      .where(eq(autoReplyRules.id, id))
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
      message: '自动回复规则更新成功'
    });
  } catch (error: any) {
    console.error('更新自动回复规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '更新自动回复规则失败',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - 删除自动回复规则
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
      .delete(autoReplyRules)
      .where(eq(autoReplyRules.id, id))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        error: '规则不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '自动回复规则删除成功'
    });
  } catch (error: any) {
    console.error('删除自动回复规则失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除自动回复规则失败',
      details: error.message
    }, { status: 500 });
  }
}
