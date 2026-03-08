"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Shield,
  Building2,
  Users,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export default function ProcessFlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  流程可视化
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  三省六部全流程实时监控
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <ZoomOut className="h-4 w-4" />
                缩小
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ZoomIn className="h-4 w-4" />
                放大
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
        {/* 流程图 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>流程执行实时监控</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 完整流程 */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                {/* 皇帝 */}
                <div className="relative pl-12 pb-8">
                  <div className="absolute left-4 top-1 h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                    👑
                  </div>
                  <ProcessStep
                    title="皇帝"
                    subtitle="圣旨下达"
                    status="completed"
                    time="19:30:00"
                    details="帮我分析一下ABC科技公司的客户背景"
                  />
                </div>

                {/* 中书省 */}
                <div className="relative pl-12 pb-8">
                  <div className="absolute left-3 top-1 h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <ProcessStep
                    title="中书省"
                    subtitle="决策草拟"
                    status="completed"
                    time="19:30:02"
                    timeTaken="2.3s"
                    details={[
                      '意图识别: customer_analysis',
                      '参数提取: { company: "ABC科技公司" }',
                      '目标六部: 户部',
                    ]}
                  />
                </div>

                {/* 门下省 */}
                <div className="relative pl-12 pb-8">
                  <div className="absolute left-3 top-1 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <ProcessStep
                    title="门下省"
                    subtitle="审核封驳"
                    status="completed"
                    time="19:30:05"
                    timeTaken="3.1s"
                    details={[
                      '✅ 权限检查: 通过',
                      '✅ 安全检查: 通过',
                      '✅ 逻辑检查: 通过',
                      '✅ 风险评估: 低风险 (85分)',
                    ]}
                  />
                </div>

                {/* 尚书省 */}
                <div className="relative pl-12 pb-8">
                  <div className="absolute left-3 top-1 h-6 w-6 rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <ProcessStep
                    title="尚书省"
                    subtitle="任务分配与执行"
                    status="completed"
                    time="19:30:10"
                    timeTaken="5.2s"
                    details={[
                      '✅ 六部识别: 户部',
                      '✅ Agent分配: 客户分析Agent',
                      '✅ 任务创建: task_abc123',
                      '✅ 任务执行: 成功',
                    ]}
                  />
                </div>

                {/* 六部 */}
                <div className="relative pl-12 pb-8">
                  <div className="absolute left-3 top-1 h-6 w-6 rounded-full bg-orange-500 text-white flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <ProcessStep
                    title="户部"
                    subtitle="客户分析执行"
                    status="completed"
                    time="19:30:15"
                    timeTaken="5.0s"
                    details={[
                      'Agent: 客户分析Agent',
                      '结果: 信用评分 85, 风险等级 低',
                      '数据: { creditScore: 85, riskLevel: "low" }',
                    ]}
                  />
                </div>

                {/* 结果 */}
                <div className="relative pl-12">
                  <div className="absolute left-4 top-1 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <ProcessStep
                    title="流程完成"
                    subtitle="结果返回"
                    status="completed"
                    time="19:30:20"
                    timeTaken="0.5s"
                    details={[
                      '✅ 流程执行成功',
                      '总耗时: 20秒',
                      '结果已返回给皇帝',
                    ]}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 流程统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总流程数"
            value="1,234"
            trend="+12%"
            color="blue"
          />
          <StatCard
            title="成功率"
            value="98.5%"
            trend="+2.3%"
            color="green"
          />
          <StatCard
            title="平均耗时"
            value="20.5s"
            trend="-5.2%"
            color="purple"
          />
          <StatCard
            title="今日执行"
            value="156"
            trend="+8%"
            color="orange"
          />
        </div>

        {/* 最近流程 */}
        <Card>
          <CardHeader>
            <CardTitle>最近执行的流程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  name: '客户分析-ABC科技',
                  status: 'completed',
                  time: '19:30:20',
                  duration: '20s',
                },
                {
                  id: 2,
                  name: '邮件生成-产品介绍',
                  status: 'running',
                  time: '19:29:45',
                  duration: '15s',
                },
                {
                  id: 3,
                  name: '风险评估-系统安全',
                  status: 'completed',
                  time: '19:28:30',
                  duration: '18s',
                },
                {
                  id: 4,
                  name: '数据采集-竞品分析',
                  status: 'pending',
                  time: '-',
                  duration: '-',
                },
              ].map((process) => (
                <div
                  key={process.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    {process.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {process.status === 'running' && (
                      <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                    )}
                    {process.status === 'pending' && (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {process.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        ID: {process.id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        process.status === 'completed'
                          ? 'default'
                          : process.status === 'running'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {process.status === 'completed' && '已完成'}
                      {process.status === 'running' && '执行中'}
                      {process.status === 'pending' && '等待中'}
                    </Badge>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {process.time} · {process.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ProcessStep({
  title,
  subtitle,
  status,
  time,
  timeTaken,
  details,
}: {
  title: string;
  subtitle: string;
  status: 'completed' | 'running' | 'pending' | 'error';
  time: string;
  timeTaken?: string;
  details: string | string[];
}) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  const detailsArray = Array.isArray(details) ? details : [details];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
            {title}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </div>
        </div>
        <Badge className={statusColors[status]}>
          {status === 'completed' && '已完成'}
          {status === 'running' && '执行中'}
          {status === 'pending' && '等待中'}
          {status === 'error' && '失败'}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        {detailsArray.map((detail, index) => (
          <div
            key={index}
            className="text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded"
          >
            {detail}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {time}
        </div>
        {timeTaken && (
          <div className="flex items-center gap-1">
            <span>耗时:</span>
            <span className="font-medium">{timeTaken}</span>
          </div>
        )}
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
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}
