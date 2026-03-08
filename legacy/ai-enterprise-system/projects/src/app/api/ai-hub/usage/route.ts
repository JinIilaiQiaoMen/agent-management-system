import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 用量监控API
 * GET: 获取用量统计和成本分析
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
    const model_provider_id = searchParams.get('model_provider_id');
    const task_type = searchParams.get('task_type');

    const supabase = getSupabaseClient();

    // 计算日期范围
    const endDate = new Date();
    const startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    }

    // 1. 获取基础用量统计
    let query = supabase
      .from('api_usage_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (model_provider_id) {
      query = query.eq('model_provider_id', model_provider_id);
    }

    if (task_type) {
      query = query.eq('task_type', task_type);
    }

    const { data: usageLogs, error: logsError } = await query;

    if (logsError) {
      throw new Error(`获取用量日志失败: ${logsError.message}`);
    }

    // 2. 统计总用量
    const totalRequests = usageLogs?.length || 0;
    const cacheHits = usageLogs?.filter((log) => log.cache_hit).length || 0;
    const actualPaidRequests = totalRequests - cacheHits;
    const totalInputTokens = usageLogs?.reduce((sum, log) => sum + (log.input_tokens || 0), 0) || 0;
    const totalOutputTokens = usageLogs?.reduce((sum, log) => sum + (log.output_tokens || 0), 0) || 0;
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCost = usageLogs?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;
    const avgLatency = usageLogs?.length > 0
      ? usageLogs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / usageLogs.length
      : 0;
    const successRate = usageLogs?.length > 0
      ? (usageLogs.filter((log) => log.status === 'success').length / usageLogs.length) * 100
      : 0;
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    // 3. 计算节省的成本（假设没有缓存时的成本）
    const cacheHitCostSaved = usageLogs
      ?.filter((log) => log.cache_hit)
      .reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;

    const compressionRate = totalRequests > 0
      ? ((totalRequests - actualPaidRequests) / totalRequests) * 100
      : 0;

    // 4. 按模型分组统计
    const modelStats = await groupByModel(usageLogs || [], supabase);

    // 5. 按任务类型分组统计
    const taskTypeStats = await groupByTaskType(usageLogs || []);

    // 6. 按日期分组统计（趋势图）
    const dailyStats = await groupByDate(usageLogs || [], startDate, endDate);

    // 7. 获取成本分析数据
    const costAnalytics = await getCostAnalytics(supabase, startDate, endDate, model_provider_id, task_type);

    // 8. 获取模型性能指标
    const performanceMetrics = await getModelPerformanceMetrics(supabase, startDate, endDate, model_provider_id);

    return NextResponse.json({
      success: true,
      period,
      date_range: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      },
      summary: {
        total_requests: totalRequests,
        cache_hits: cacheHits,
        actual_paid_requests: actualPaidRequests,
        cache_hit_rate: Math.round(cacheHitRate * 100) / 100,
        compression_rate: Math.round(compressionRate * 100) / 100,
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        total_tokens: totalTokens,
        total_cost: Math.round(totalCost * 1000000) / 1000000,
        cache_hit_cost_saved: Math.round(cacheHitCostSaved * 1000000) / 1000000,
        avg_latency_ms: Math.round(avgLatency * 100) / 100,
        success_rate: Math.round(successRate * 100) / 100,
      },
      model_stats: modelStats,
      task_type_stats: taskTypeStats,
      daily_stats: dailyStats,
      cost_analytics: costAnalytics,
      performance_metrics: performanceMetrics,
    });
  } catch (error: any) {
    console.error('获取用量统计错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取用量统计失败',
      },
      { status: 500 }
    );
  }
}

// 按模型分组统计
async function groupByModel(usageLogs: any[], supabase: any) {
  const grouped = usageLogs.reduce((acc, log) => {
    const key = `${log.model_provider_id}-${log.model_name}`;
    if (!acc[key]) {
      acc[key] = {
        model_provider_id: log.model_provider_id,
        model_name: log.model_name,
        total_requests: 0,
        cache_hits: 0,
        total_tokens: 0,
        total_cost: 0,
        avg_latency_ms: 0,
        success_count: 0,
      };
    }
    acc[key].total_requests++;
    if (log.cache_hit) acc[key].cache_hits++;
    acc[key].total_tokens += log.total_tokens || 0;
    acc[key].total_cost += log.total_cost || 0;
    acc[key].avg_latency_ms += log.latency_ms || 0;
    if (log.status === 'success') acc[key].success_count++;
    return acc;
  }, {} as any);

  // 获取模型显示名称
  for (const key in grouped) {
    const stats = grouped[key];
    if (stats.model_provider_id) {
      const { data: provider } = await supabase
        .from('model_providers')
        .select('provider_display_name')
        .eq('id', stats.model_provider_id)
        .single();
      if (provider) {
        stats.provider_display_name = provider.provider_display_name;
      }
    }
    // 计算平均值
    stats.avg_latency_ms = stats.total_requests > 0
      ? stats.avg_latency_ms / stats.total_requests
      : 0;
    stats.success_rate = stats.total_requests > 0
      ? (stats.success_count / stats.total_requests) * 100
      : 0;
    stats.cache_hit_rate = stats.total_requests > 0
      ? (stats.cache_hits / stats.total_requests) * 100
      : 0;
  }

  return Object.values(grouped);
}

// 按任务类型分组统计
function groupByTaskType(usageLogs: any[]) {
  const grouped = usageLogs.reduce((acc, log) => {
    const taskType = log.task_type || 'unknown';
    if (!acc[taskType]) {
      acc[taskType] = {
        task_type: taskType,
        total_requests: 0,
        cache_hits: 0,
        total_tokens: 0,
        total_cost: 0,
      };
    }
    acc[taskType].total_requests++;
    if (log.cache_hit) acc[taskType].cache_hits++;
    acc[taskType].total_tokens += log.total_tokens || 0;
    acc[taskType].total_cost += log.total_cost || 0;
    return acc;
  }, {} as any);

  return Object.values(grouped).map((stats: any) => ({
    ...stats,
    cache_hit_rate: stats.total_requests > 0
      ? (stats.cache_hits / stats.total_requests) * 100
      : 0,
  }));
}

// 按日期分组统计
function groupByDate(usageLogs: any[], startDate: Date, endDate: Date) {
  const dailyData: any = {};

  // 初始化所有日期
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dailyData[dateKey] = {
      date: dateKey,
      total_requests: 0,
      cache_hits: 0,
      total_tokens: 0,
      total_cost: 0,
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 填充数据
  usageLogs.forEach((log) => {
    const dateKey = log.created_at.split('T')[0];
    if (dailyData[dateKey]) {
      dailyData[dateKey].total_requests++;
      if (log.cache_hit) dailyData[dateKey].cache_hits++;
      dailyData[dateKey].total_tokens += log.total_tokens || 0;
      dailyData[dateKey].total_cost += log.total_cost || 0;
    }
  });

  return Object.values(dailyData);
}

// 获取成本分析
async function getCostAnalytics(
  supabase: any,
  startDate: Date,
  endDate: Date,
  model_provider_id?: string | null,
  task_type?: string | null
) {
  let query = supabase
    .from('cost_analytics')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (model_provider_id) {
    query = query.eq('model_provider_id', model_provider_id);
  }

  if (task_type) {
    query = query.eq('task_type', task_type);
  }

  const { data: analytics } = await query;

  return analytics || [];
}

// 获取模型性能指标
async function getModelPerformanceMetrics(
  supabase: any,
  startDate: Date,
  endDate: Date,
  model_provider_id?: string | null
) {
  let query = supabase
    .from('model_performance_metrics')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (model_provider_id) {
    query = query.eq('model_provider_id', model_provider_id);
  }

  const { data: metrics } = await query;

  return metrics || [];
}
