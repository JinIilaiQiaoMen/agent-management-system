"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Printer,
  Share2,
  Filter,
} from 'lucide-react';

export default function AuditReportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  审计报告中心
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  三省六部流程审计与合规报告
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                筛选
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                打印
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                导出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="审计报告总数"
            value="1,234"
            trend="+12%"
            color="blue"
          />
          <StatCard
            title="本月报告"
            value="156"
            trend="+8%"
            color="green"
          />
          <StatCard
            title="平均分数"
            value="92"
            trend="+2.5%"
            color="purple"
          />
          <StatCard
            title="异常报告"
            value="23"
            trend="-15%"
            color="orange"
          />
        </div>

        {/* 报告列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：报告列表 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    审计报告列表
                  </CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="搜索报告..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      processId: 'proc_123456',
                      score: 92,
                      anomalies: 2,
                      conclusion: '流程执行优秀，所有指标均在合理范围内',
                      status: 'completed',
                      timestamp: '2026-03-08 19:30:15',
                    },
                    {
                      id: 2,
                      processId: 'proc_123455',
                      score: 78,
                      anomalies: 5,
                      conclusion: '流程执行良好，有轻微问题但可接受',
                      status: 'completed',
                      timestamp: '2026-03-08 19:25:42',
                    },
                    {
                      id: 3,
                      processId: 'proc_123454',
                      score: 85,
                      anomalies: 3,
                      conclusion: '流程执行良好，有轻微问题但可接受',
                      status: 'completed',
                      timestamp: '2026-03-08 19:20:08',
                    },
                    {
                      id: 4,
                      processId: 'proc_123453',
                      score: 45,
                      anomalies: 12,
                      conclusion: '流程执行较差，存在严重问题需要立即处理',
                      status: 'completed',
                      timestamp: '2026-03-08 19:15:33',
                    },
                    {
                      id: 5,
                      processId: 'proc_123452',
                      score: 88,
                      anomalies: 2,
                      conclusion: '流程执行良好，所有指标均在合理范围内',
                      status: 'completed',
                      timestamp: '2026-03-08 19:10:21',
                    },
                  ].map((report) => (
                    <ReportItem
                      key={report.id}
                      report={report}
                      isSelected={selectedReport === report.id}
                      onClick={() => setSelectedReport(report.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：报告详情 */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  报告详情
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <ReportDetail reportId={selectedReport} />
                ) : (
                  <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>请选择一个审计报告查看详情</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function ReportItem({
  report,
  isSelected,
  onClick,
}: {
  report: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  const scoreColors = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  const scoreColor =
    report.score >= 90 ? 'high' : report.score >= 70 ? 'medium' : 'low';

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${scoreColors[scoreColor]}`}>
            {report.score}
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              流程ID: {report.processId}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {report.timestamp}
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </div>

      <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
        {report.conclusion}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          {report.anomalies > 0 ? (
            <>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {report.anomalies} 个异常
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              无异常
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
          <Download className="h-3 w-3" />
          导出
        </Button>
      </div>
    </div>
  );
}

function ReportDetail({ reportId }: { reportId: string }) {
  // 模拟报告数据
  const report = {
    processId: `proc_${reportId}`,
    score: 92,
    completeness: 95,
    compliance: 88,
    efficiency: 90,
    accuracy: 95,
    traceability: 92,
    anomalies: [
      { id: 1, level: 'warn', message: '时效性指标略低' },
      { id: 2, level: 'info', message: '日志记录可优化' },
    ],
    conclusion: '流程执行优秀，所有指标均在合理范围内',
    recommendations: [
      '优化响应时间，提高时效性指标',
      '完善日志记录，提升可追溯性',
      '定期检查系统性能',
    ],
    metrics: {
      totalProcesses: 1234,
      successRate: 98.5,
      avgExecutionTime: 20.5,
      avgAccuracy: 95.2,
    },
  };

  return (
    <div className="space-y-6">
      {/* 报告概览 */}
      <div>
        <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
          报告概览
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">流程ID</span>
            <span className="font-mono">{report.processId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">审计时间</span>
            <span>2026-03-08 19:30:15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">总评分</span>
            <span className="font-bold text-green-600">{report.score}</span>
          </div>
        </div>
      </div>

      {/* 指标详情 */}
      <div>
        <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
          指标详情
        </h3>
        <div className="space-y-3">
          {[
            { name: '完整性', value: report.completeness },
            { name: '合规性', value: report.compliance },
            { name: '时效性', value: report.efficiency },
            { name: '准确性', value: report.accuracy },
            { name: '可追溯性', value: report.traceability },
          ].map((metric) => (
            <div key={metric.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{metric.name}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {metric.value}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 异常列表 */}
      <div>
        <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
          异常列表 ({report.anomalies.length})
        </h3>
        <div className="space-y-2">
          {report.anomalies.length > 0 ? (
            report.anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                {anomaly.level === 'warn' && (
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                )}
                {anomaly.level === 'info' && (
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {anomaly.message}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-600 dark:text-slate-400">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">无异常记录</p>
            </div>
          )}
        </div>
      </div>

      {/* 结论与建议 */}
      <div>
        <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
          结论与建议
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              结论
            </div>
            <p className="text-sm text-slate-900 dark:text-slate-100">
              {report.conclusion}
            </p>
          </div>
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              建议
            </div>
            <ul className="space-y-1">
              {report.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          下载报告
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-2">
          <Share2 className="h-4 w-4" />
          分享
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  color,
}: {
  title: string;
  value: string;
  trend: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          {value}
        </div>
        <div
          className={`text-sm ${
            trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
          } flex items-center gap-1`}
        >
          {trend.startsWith('+') && <TrendingUp className="h-4 w-4" />}
          {trend.startsWith('-') && <TrendingDown className="h-4 w-4" />}
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
