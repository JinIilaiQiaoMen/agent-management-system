import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 模型管理API
 * GET: 获取模型提供商和路由规则列表
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // 1. 获取所有模型提供商
    const { data: providers, error: providersError } = await supabase
      .from('model_providers')
      .select('*')
      .order('priority', { ascending: true });

    if (providersError) {
      throw new Error(`获取模型提供商失败: ${providersError.message}`);
    }

    // 2. 获取所有路由规则
    const { data: rules, error: rulesError } = await supabase
      .from('model_routing_rules')
      .select('*')
      .order('priority', { ascending: true });

    if (rulesError) {
      throw new Error(`获取路由规则失败: ${rulesError.message}`);
    }

    // 手动关联模型提供商信息
    const rulesWithProviders = (rules || []).map((rule: any) => {
      const provider = (providers || []).find((p: any) => p.id === rule.model_provider_id);
      return {
        ...rule,
        model_provider: provider || null,
        fallback_provider: provider || null,
      };
    });

    // 3. 获取缓存统计
    const { data: cacheStats } = await supabase
      .from('ai_cache')
      .select('cache_hit_count, created_at')
      .eq('is_valid', true)
      .gt('expires_at', new Date().toISOString());

    const totalCacheEntries = cacheStats?.length || 0;
    const totalCacheHits = cacheStats?.reduce((sum, c) => sum + (c.cache_hit_count || 0), 0) || 0;

    // 4. 获取模型性能统计（最近7天）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: performanceMetrics } = await supabase
      .from('model_performance_metrics')
      .select('*')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // 按模型聚合性能数据
    const modelPerformance = (performanceMetrics || []).reduce((acc: any, metric: any) => {
      const key = `${metric.model_provider_id}-${metric.model_name}`;
      if (!acc[key]) {
        acc[key] = {
          model_provider_id: metric.model_provider_id,
          model_name: metric.model_name,
          total_requests: 0,
          avg_success_rate: 0,
          avg_cache_hit_rate: 0,
          avg_latency_ms: 0,
          total_cost: 0,
        };
      }
      acc[key].total_requests += metric.total_requests || 0;
      acc[key].avg_success_rate += metric.success_rate || 0;
      acc[key].avg_cache_hit_rate += metric.cache_hit_rate || 0;
      acc[key].avg_latency_ms += metric.avg_latency_ms || 0;
      acc[key].total_cost += metric.total_cost || 0;
      return acc;
    }, {});

    // 计算平均值
    Object.values(modelPerformance).forEach((perf: any) => {
      const count = performanceMetrics!.filter(
        (m: any) => m.model_provider_id === perf.model_provider_id && m.model_name === perf.model_name
      ).length;
      perf.avg_success_rate = count > 0 ? perf.avg_success_rate / count : 0;
      perf.avg_cache_hit_rate = count > 0 ? perf.avg_cache_hit_rate / count : 0;
      perf.avg_latency_ms = count > 0 ? perf.avg_latency_ms / count : 0;
    });

    return NextResponse.json({
      success: true,
      providers: providers || [],
      rules: rulesWithProviders || [],
      cache_stats: {
        total_entries: totalCacheEntries,
        total_hits: totalCacheHits,
        avg_hits_per_entry: totalCacheEntries > 0 ? totalCacheHits / totalCacheEntries : 0,
      },
      model_performance: Object.values(modelPerformance),
    });
  } catch (error: any) {
    console.error('获取模型管理数据错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取模型管理数据失败',
      },
      { status: 500 }
    );
  }
}
