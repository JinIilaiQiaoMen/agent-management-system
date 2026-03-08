'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Filter } from 'lucide-react';

interface AnalyticsData {
  stats: {
    total: number;
    success: number;
    failed: number;
    pending: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
  };
  platformDistribution: Record<string, {
    count: number;
    success: number;
    failed: number;
    likes: number;
    views: number;
  }>;
  contentTypeDistribution: Record<string, {
    count: number;
    likes: number;
    views: number;
  }>;
  trendData: Array<{
    date: string;
    count: number;
    success: number;
    likes: number;
    views: number;
  }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate(timeRange);
      const response = await fetch(
        `/api/domestic-platforms/analytics?startDate=${startDate}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('获取分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    now.setDate(now.getDate() - days);
    return now.toISOString().split('T')[0];
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  const { stats, platformDistribution, contentTypeDistribution, trendData } = data;
  const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* 时间范围选择器 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">数据概览</h3>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          >
            <option value="7d">最近 7 天</option>
            <option value="30d">最近 30 天</option>
            <option value="90d">最近 90 天</option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="总发布数"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="成功率"
          value={`${successRate}%`}
          color="green"
        />
        <StatCard
          icon={<PieChart className="h-5 w-5" />}
          label="总互动"
          value={formatNumber(stats.totalLikes + stats.totalComments + stats.totalShares)}
          color="orange"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="总浏览量"
          value={formatNumber(stats.totalViews)}
          color="purple"
        />
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 平台分布 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            平台分布
          </h4>
          <div className="space-y-3">
            {Object.entries(platformDistribution).map(([platform, data]) => {
              const percentage = stats.total > 0 ? (data.count / stats.total) * 100 : 0;
              return (
                <div key={platform} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                        {platform}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {data.count} 次 ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 内容类型分布 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            内容类型分布
          </h4>
          <div className="space-y-3">
            {Object.entries(contentTypeDistribution).map(([type, data]) => {
              const percentage = stats.total > 0 ? (data.count / stats.total) * 100 : 0;
              const typeNames: Record<string, string> = {
                product: '商品',
                post: '动态',
                video: '视频',
                article: '文章'
              };
              return (
                <div key={type} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {typeNames[type] || type}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {data.count} 次 ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 趋势数据 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          每日趋势
        </h4>
        <div className="space-y-2">
          {trendData.slice(-7).map((day) => {
            const maxViews = Math.max(...trendData.map(d => d.views));
            const barWidth = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
            return (
              <div key={day.date} className="flex items-center space-x-3">
                <div className="w-24 text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(day.date)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {day.count} 次发布
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatNumber(day.views)} 浏览
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 互动详情 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {formatNumber(stats.totalLikes)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">总点赞</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {formatNumber(stats.totalComments)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">总评论</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {formatNumber(stats.totalShares)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">总分享</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}
