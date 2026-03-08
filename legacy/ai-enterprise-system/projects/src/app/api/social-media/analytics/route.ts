import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialMediaPosts, analyticsData } from '@/storage/database/shared/schema';
import { eq, and, desc, gte, lte, sql, count } from 'drizzle-orm';
import { generateText } from '@/lib/llm';

/**
 * 趋势分析 API
 * 实时数据分析、AI 趋势预测
 */

// GET - 获取分析数据
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // overview, trends, best-time, content-type

    const conditions = [];
    if (platform) {
      conditions.push(eq(analyticsData.platform, platform));
    }
    if (startDate) {
      conditions.push(gte(analyticsData.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(analyticsData.date, endDate));
    }

    if (type === 'overview') {
      // 获取概览数据
      const stats = await db
        .select({
          totalPosts: count(),
          totalViews: sql<number>`COALESCE(SUM(${analyticsData.views}), 0)`,
          totalLikes: sql<number>`COALESCE(SUM(${analyticsData.likes}), 0)`,
          totalComments: sql<number>`COALESCE(SUM(${analyticsData.comments}), 0)`,
          totalShares: sql<number>`COALESCE(SUM(${analyticsData.shares}), 0)`,
          avgEngagementRate: sql<number>`COALESCE(AVG(${analyticsData.engagementRate}), 0)`
        })
        .from(analyticsData)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return NextResponse.json({
        success: true,
        data: stats[0]
      });
    } else if (type === 'trends') {
      // 获取趋势数据（按日期）
      const trends = await db
        .select()
        .from(analyticsData)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(analyticsData.date));

      return NextResponse.json({
        success: true,
        trends
      });
    } else if (type === 'best-time') {
      // 获取最佳发布时段
      const results = await db
        .select({
          date: analyticsData.date,
          views: analyticsData.views,
          likes: analyticsData.likes,
          comments: analyticsData.comments,
          engagementRate: analyticsData.engagementRate
        })
        .from(analyticsData)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(analyticsData.engagementRate))
        .limit(20);

      // 按小时分组
      const timeStats: Record<string, { views: number; likes: number; comments: number; engagement: number; count: number }> = {};

      results.forEach((row: { date: string | Date; views: number | null; likes: number | null; comments: number | null; engagementRate: string | number | null }) => {
        const hour = new Date(row.date).getHours();
        if (!timeStats[hour]) {
          timeStats[hour] = { views: 0, likes: 0, comments: 0, engagement: 0, count: 0 };
        }
        timeStats[hour].views += row.views || 0;
        timeStats[hour].likes += row.likes || 0;
        timeStats[hour].comments += row.comments || 0;
        timeStats[hour].engagement += parseFloat(row.engagementRate?.toString() || '0');
        timeStats[hour].count += 1;
      });

      // 计算平均值并排序
      const bestTimes = Object.entries(timeStats)
        .map(([hour, data]) => ({
          hour: parseInt(hour),
          avgEngagementRate: data.engagement / data.count,
          totalViews: data.views,
          totalLikes: data.likes,
          totalComments: data.comments,
          postCount: data.count
        }))
        .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
        .slice(0, 5);

      return NextResponse.json({
        success: true,
        bestTimes
      });
    } else if (type === 'content-type') {
      // 获取内容类型分析（这里简化为按平台统计）
      const results = await db
        .select({
          platform: analyticsData.platform,
          totalViews: sql<number>`COALESCE(SUM(${analyticsData.views}), 0)`,
          totalLikes: sql<number>`COALESCE(SUM(${analyticsData.likes}), 0)`,
          totalComments: sql<number>`COALESCE(SUM(${analyticsData.comments}), 0)`,
          totalShares: sql<number>`COALESCE(SUM(${analyticsData.shares}), 0)`,
          postCount: count()
        })
        .from(analyticsData)
        .groupBy(analyticsData.platform);

      const total = results.reduce((sum: number, r: { totalViews: number | null }) => sum + (r.totalViews || 0), 0);

      const contentTypes = results.map((r: { platform: string | null; totalViews: number | null; totalLikes: number | null; totalComments: number | null; totalShares: number | null }) => ({
        platform: r.platform,
        views: r.totalViews || 0,
        likes: r.totalLikes || 0,
        comments: r.totalComments || 0,
        shares: r.totalShares || 0,
        percentage: total > 0 ? ((r.totalViews || 0) / total * 100).toFixed(1) : '0'
      }));

      return NextResponse.json({
        success: true,
        contentTypes
      });
    } else {
      // 默认返回所有数据
      const data = await db
        .select()
        .from(analyticsData)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(analyticsData.date));

      return NextResponse.json({
        success: true,
        data
      });
    }
  } catch (error: any) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取分析数据失败',
      details: error.message
    }, { status: 500 });
  }
}

// AI 趋势预测
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, days = 7 } = body;

    // 获取过去 30 天的数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalData = await db
      .select({
        date: analyticsData.date,
        views: analyticsData.views,
        likes: analyticsData.likes,
        comments: analyticsData.comments,
        engagementRate: analyticsData.engagementRate
      })
      .from(analyticsData)
      .where(and(
        platform ? eq(analyticsData.platform, platform) : undefined,
        gte(analyticsData.date, thirtyDaysAgo.toISOString())
      ))
      .orderBy(desc(analyticsData.date));

    // 格式化数据给 LLM
    const dataSummary = historicalData.slice(0, 14).map((d: { date: string | Date; views: number | null; likes: number | null; engagementRate: string | number | null }) => ({
      date: new Date(d.date).toLocaleDateString('zh-CN'),
      views: d.views,
      likes: d.likes,
      engagement: d.engagementRate
    }));

    // 调用 LLM 进行趋势预测
    const systemPrompt = `你是一位资深的数据分析专家，擅长社媒运营数据分析和趋势预测。`;

    const userPrompt = `作为数据分析专家，基于以下社媒运营数据，预测未来 ${days} 天的趋势：

历史数据（最近14天）：
${JSON.stringify(dataSummary, null, 2)}

请提供以下分析（JSON格式）：
1. 趋势方向（上升/下降/稳定）
2. 预测的每日互动量（按天）
3. 关键发现和建议
4. 风险提示

返回格式：
{
  "trend": "上升",
  "predictions": [
    {"date": "3月3日", "views": 10000, "likes": 500, "comments": 50},
    ...
  ],
  "insights": ["关键发现1", "关键发现2"],
  "suggestions": ["建议1", "建议2"],
  "risks": ["风险1", "风险2"]
}`;

    const responseText = await generateText(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { model: 'doubao', temperature: 0.7 }
    );

    // 尝试解析 JSON
    let predictionData;
    try {
      predictionData = JSON.parse(responseText);
    } catch {
      predictionData = {
        trend: '未知',
        predictions: [],
        insights: ['无法解析预测数据'],
        suggestions: [],
        risks: []
      };
    }

    return NextResponse.json({
      success: true,
      prediction: predictionData,
      historicalData: dataSummary
    });
  } catch (error: any) {
    console.error('AI 趋势预测失败:', error);
    return NextResponse.json({
      success: false,
      error: 'AI 趋势预测失败',
      details: error.message
    }, { status: 500 });
  }
}
