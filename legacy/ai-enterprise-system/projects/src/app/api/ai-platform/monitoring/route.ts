import { NextRequest, NextResponse } from 'next/server';
import { getTodayUsage, getUsageStats, getCostForecast, getEfficiencyAnalysis } from '@/lib/ai-platform/monitoring';

/**
 * 获取今日用量统计
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'today';

    let data;

    switch (type) {
      case 'today':
        data = getTodayUsage();
        break;

      case 'efficiency':
        data = getEfficiencyAnalysis();
        break;

      case 'forecast':
        data = getCostForecast(30);
        break;

      case 'history': {
        const days = parseInt(searchParams.get('days') || '7');
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const endDate = new Date();
        data = getUsageStats(startDate, endDate);
        break;
      }

      default:
        return NextResponse.json(
          { error: '不支持的查询类型' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('获取监控数据失败:', error);
    return NextResponse.json(
      { error: '获取监控数据失败', details: error.message },
      { status: 500 }
    );
  }
}
