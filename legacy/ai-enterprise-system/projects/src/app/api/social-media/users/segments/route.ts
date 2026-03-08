import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSegments, segmentRules, socialMediaComments } from '@/storage/database/shared/schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

/**
 * 用户分层 API
 * 自动分层、分层统计、分层规则管理
 */

// GET - 获取用户分层列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const segmentType = searchParams.get('segmentType');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions = [];
    if (platform) {
      conditions.push(eq(userSegments.platform, platform));
    }
    if (segmentType) {
      conditions.push(eq(userSegments.segmentType, segmentType));
    }

    const segments = await db.select().from(userSegments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(userSegments.engagementLevel))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      segments,
      total: segments.length
    });
  } catch (error: any) {
    console.error('获取用户分层失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取用户分层失败',
      details: error.message
    }, { status: 500 });
  }
}

// POST - 手动添加/更新用户分层
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, platform, segmentType, metadata = {} } = body;

    if (!userId || !platform || !segmentType) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: userId, platform, segmentType'
      }, { status: 400 });
    }

    // 检查用户是否已存在
    const existing = await db
      .select()
      .from(userSegments)
      .where(and(
        eq(userSegments.userId, userId),
        eq(userSegments.platform, platform)
      ))
      .limit(1);

    const now = new Date().toISOString();

    let result;
    if (existing && existing.length > 0) {
      // 更新现有记录
      result = await db
        .update(userSegments)
        .set({
          segmentType,
          metadata: { ...(existing[0].metadata || {}), ...metadata },
          updatedAt: now
        })
        .where(eq(userSegments.id, existing[0].id))
        .returning();
    } else {
      // 创建新记录
      result = await db
        .insert(userSegments)
        .values({
          userId,
          platform,
          segmentType,
          metadata,
          engagementLevel: 0,
          totalInteractions: 0,
          createdAt: now,
          updatedAt: now
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      segment: result[0],
      message: '用户分层更新成功'
    });
  } catch (error: any) {
    console.error('更新用户分层失败:', error);
    return NextResponse.json({
      success: false,
      error: '更新用户分层失败',
      details: error.message
    }, { status: 500 });
  }
}

// 自动分层逻辑
async function autoClassifyUser(userId: string, platform: string): Promise<string> {
  try {
    // 获取用户互动数据
    const comments = await db
      .select()
      .from(socialMediaComments)
      .where(and(
        eq(socialMediaComments.userId, userId),
        eq(socialMediaComments.platform, platform)
      ));

    const totalInteractions = comments.length;

    // 计算最近30天的互动
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInteractions = comments.filter(
      (c: { createdAt: string | Date }) => new Date(c.createdAt) >= thirtyDaysAgo
    ).length;

    // 计算互动评分（0-100）
    let score = 0;
    score += Math.min(totalInteractions * 2, 50); // 最多50分
    score += Math.min(recentInteractions * 5, 30); // 最多30分
    score += comments.filter((c: { sentiment: string | null }) => c.sentiment === 'positive').length * 5; // 正面评论加分

    // 分层逻辑
    let segmentType = 'new';

    if (totalInteractions >= 20 && recentInteractions >= 5) {
      segmentType = 'VIP';
    } else if (totalInteractions >= 10 && recentInteractions >= 3) {
      segmentType = 'active';
    } else if (totalInteractions > 0 && recentInteractions === 0) {
      segmentType = 'dormant';
    } else if (totalInteractions === 0) {
      segmentType = 'new';
    }

    // 更新或创建用户分层
    const existing = await db
      .select()
      .from(userSegments)
      .where(and(
        eq(userSegments.userId, userId),
        eq(userSegments.platform, platform)
      ))
      .limit(1);

    const now = new Date().toISOString();

    if (existing && existing.length > 0) {
      await db
        .update(userSegments)
        .set({
          segmentType,
          score,
          engagementLevel: Math.min(recentInteractions * 10, 100),
          totalInteractions,
          lastInteractionAt: comments.length > 0 ? comments[0].createdAt : null,
          updatedAt: now
        })
        .where(eq(userSegments.id, existing[0].id));
    } else {
      await db.insert(userSegments).values({
        userId,
        platform,
        segmentType,
        score,
        engagementLevel: Math.min(recentInteractions * 10, 100),
        totalInteractions,
        lastInteractionAt: comments.length > 0 ? comments[0].createdAt : null,
        createdAt: now,
        updatedAt: now
      });
    }

    return segmentType;
  } catch (error) {
    console.error('自动分层失败:', error);
    return 'new';
  }
}

// 批量自动分层
async function POST_BATCH_CLASSIFY(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    // 获取所有有互动的用户
    const users = await db
      .selectDistinct({
        userId: socialMediaComments.userId,
        platform: socialMediaComments.platform
      })
      .from(socialMediaComments)
      .where(platform ? eq(socialMediaComments.platform, platform) : undefined);

    let successCount = 0;
    const results = [];

    for (const user of users) {
      if (!user.userId) continue;

      const segmentType = await autoClassifyUser(user.userId, user.platform);

      successCount++;
      results.push({
        userId: user.userId,
        platform: user.platform,
        segmentType
      });
    }

    return NextResponse.json({
      success: true,
      message: `成功分层 ${successCount} 个用户`,
      results
    });
  } catch (error: any) {
    console.error('批量自动分层失败:', error);
    return NextResponse.json({
      success: false,
      error: '批量自动分层失败',
      details: error.message
    }, { status: 500 });
  }
}

// 分层统计
async function GET_STATS(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');

    const conditions = [];
    if (platform) {
      conditions.push(eq(userSegments.platform, platform));
    }

    // 统计各分层人数
    const stats = await db
      .select({
        segmentType: userSegments.segmentType,
        count: count()
      })
      .from(userSegments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(userSegments.segmentType);

    // 转换为键值对
    const statsMap: Record<string, number> = {};
    stats.forEach((stat: { segmentType: string | null; count: number }) => {
      if (stat.segmentType) {
        statsMap[stat.segmentType] = stat.count;
      }
    });

    // 默认分层类型
    const segmentTypes = ['VIP', 'active', 'dormant', 'new', 'churned'];
    segmentTypes.forEach(type => {
      if (!statsMap[type]) {
        statsMap[type] = 0;
      }
    });

    return NextResponse.json({
      success: true,
      stats: statsMap,
      total: Object.values(statsMap).reduce((a, b) => a + b, 0)
    });
  } catch (error: any) {
    console.error('获取分层统计失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取分层统计失败',
      details: error.message
    }, { status: 500 });
  }
}
