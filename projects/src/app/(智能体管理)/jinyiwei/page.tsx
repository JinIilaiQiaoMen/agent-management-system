"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function JinyiweiPage() {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  锦衣卫监控中心
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  三省六部全流程监控与审计
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                刷新
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
        {/* 系统健康状态 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                }`}>
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    系统状态: 健康
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    所有服务运行正常
                  </div>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">总流程</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    1,234
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">活跃告警</div>
                  <div className="text-2xl font-bold text-orange-600">
                    23
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">平均准确率</div>
                  <div className="text-2xl font-bold text-green-600">
                    95.2%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 监控指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MetricCard
            title="完整性"
            value="92"
            icon={<FileText className="h-5 w-5" />}
            trend="+2.1%"
            positive={true}
          />
          <MetricCard
            title="合规性"
            value="95"
            icon={<Shield className="h-5 w-5" />}
            trend="+1.5%"
            positive={true}
          />
          <MetricCard
            title="时效性"
            value="88"
            icon={<Clock className="h-5 w-5" />}
            trend="-0.8%"
            positive={false}
          />
          <MetricCard
            title="准确性"
            value="96"
            icon={<CheckCircle className="h-5 w-5" />}
            trend="+3.2%"
            positive={true}
          />
          <MetricCard
            title="可追溯性"
            value="94"
            icon={<Activity className="h-5 w-5" />}
            trend="+1.0%"
            positive={true}
          />
        </div>

        {/* 最近告警 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                最近告警
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="搜索告警..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  leftIcon={<Search className="h-4 w-4" />}
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  level: 'critical',
                  rule: '准确性严重告警',
                  message: '准确性指标低于50%',
                  processId: 'proc_123456',
                  timestamp: '2026-03-08 19:30:15',
                },
                {
                  id: 2,
                  level: 'error',
                  rule: '错误异常告警',
                  message: '检测到错误级别异常',
                  processId: 'proc_123455',
                  timestamp: '2026-03-08 19:25:42',
                },
                {
                  id: 3,
                  level: 'warn',
                  rule: '完整性警告',
                  message: '完整性指标低于70%',
                  processId: 'proc_123454',
                  timestamp: '2026-03-08 19:20:08',
                },
                {
                  id: 4,
                  level: 'warn',
                  rule: '时效性警告',
                  message: '时效性指标低于70%',
                  processId: 'proc_123453',
                  timestamp: '2026-03-08 19:15:33',
                },
                {
                  id: 5,
                  level: 'info',
                  rule: '合规性正常',
                  message: '合规性检查完成，无问题',
                  processId: 'proc_123452',
                  timestamp: '2026-03-08 19:10:21',
                },
              ].map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {alert.level === 'critical' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {alert.level === 'error' && (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    {alert.level === 'warn' && (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    {alert.level === 'info' && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {alert.rule}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {alert.message}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        流程ID: {alert.processId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        alert.level === 'critical'
                          ? 'destructive'
                          : alert.level === 'error'
                          ? 'destructive'
                          : alert.level === 'warn'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {alert.level === 'critical' && '严重'}
                      {alert.level === 'error' && '错误'}
                      {alert.level === 'warn' && '警告'}
                      {alert.level === 'info' && '信息'}
                    </Badge>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      {alert.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 审计报告列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                审计报告
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                导出报告
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  processId: 'proc_123456',
                  overallScore: 92,
                  conclusion: '流程执行优秀，所有指标均在合理范围内',
                  anomalies: 2,
                  status: 'completed',
                  timestamp: '2026-03-08 19:30:15',
                },
                {
                  id: 2,
                  processId: 'proc_123455',
                  overallScore: 78,
                  conclusion: '流程执行良好，有轻微问题但可接受',
                  anomalies: 5,
                  status: 'completed',
                  timestamp: '2026-03-08 19:25:42',
                },
                {
                  id: 3,
                  processId: 'proc_123454',
                  overallScore: 85,
                  conclusion: '流程执行良好，有轻微问题但可接受',
                  anomalies: 3,
                  status: 'completed',
                  timestamp: '2026-03-08 19:20:08',
                },
              ].map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      report.overallScore >= 90
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : report.overallScore >= 70
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
                    }`}>
                      {report.overallScore}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        流程ID: {report.processId}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {report.conclusion}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        异常数: {report.anomalies} | {report.timestamp}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    查看详情
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  positive,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}%
            </div>
            <div
              className={`text-sm ${
                positive ? 'text-green-600' : 'text-red-600'
              } flex items-center gap-1`}
            >
              {positive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {trend}
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
