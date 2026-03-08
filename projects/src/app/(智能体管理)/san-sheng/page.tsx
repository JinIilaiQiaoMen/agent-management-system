"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  FileText,
  Shield,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function SanShengPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  三省六部管理系统
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  企业级AI智能化管理平台
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              总览
            </TabsTrigger>
            <TabsTrigger value="zhongshu" className="gap-2">
              <FileText className="h-4 w-4" />
              中书省
            </TabsTrigger>
            <TabsTrigger value="menxia" className="gap-2">
              <Shield className="h-4 w-4" />
              门下省
            </TabsTrigger>
            <TabsTrigger value="shangshu" className="gap-2">
              <Building2 className="h-4 w-4" />
              尚书省
            </TabsTrigger>
            <TabsTrigger value="liubu" className="gap-2">
              <Users className="h-4 w-4" />
              六部
            </TabsTrigger>
          </TabsList>

          {/* 总览 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="总流程数"
                value="1,234"
                icon={<FileText className="h-5 w-5" />}
                trend="+12%"
                color="blue"
              />
              <StatCard
                title="成功率"
                value="98.5%"
                icon={<CheckCircle className="h-5 w-5" />}
                trend="+2.3%"
                color="green"
              />
              <StatCard
                title="平均耗时"
                value="2.3s"
                icon={<Clock className="h-5 w-5" />}
                trend="-15%"
                color="purple"
              />
              <StatCard
                title="异常数"
                value="23"
                icon={<AlertTriangle className="h-5 w-5" />}
                trend="-5"
                color="orange"
              />
            </div>

            {/* 实时流程 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  实时流程监控
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, name: '客户分析-ABC科技', status: 'completed', time: '2.3s' },
                    { id: 2, name: '邮件生成-产品介绍', status: 'running', time: '1.5s' },
                    { id: 3, name: '数据采集-竞品分析', status: 'pending', time: '-' },
                    { id: 4, name: '风险评估-系统安全', status: 'completed', time: '1.8s' },
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
                          <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
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
                          {process.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 中书省 */}
          <TabsContent value="zhongshu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>中书省 - 决策草拟机构</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">意图识别引擎</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        已识别 11 种意图
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">参数提取系统</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        支持 5 种场景提取
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">诏令草拟系统</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        完整决策流程
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">对话历史管理</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        活跃会话: 45
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      正常
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 门下省 */}
          <TabsContent value="menxia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>门下省 - 审核封驳机构</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">权限检查器</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        6 种权限规则
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">安全检查器</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        4 类危险操作检测
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">风险评估系统</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        4 个风险因素
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">审核统计</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        通过率: 95.2%
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      正常
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 尚书省 */}
          <TabsContent value="shangshu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>尚书省 - 执行机构</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">六部识别系统</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        6 个六部能力
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Agent分配系统</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        12 个 Agent 在线
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">任务调度中心</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        队列: 3, 执行中: 2
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      正常
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">任务执行器</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        支持 12 种任务
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      运行中
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 六部 */}
          <TabsContent value="liubu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>六部 - 执行部门</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: '吏部', agent: 2, status: 'healthy' },
                    { name: '户部', agent: 2, status: 'healthy' },
                    { name: '礼部', agent: 2, status: 'healthy' },
                    { name: '兵部', agent: 2, status: 'healthy' },
                    { name: '刑部', agent: 1, status: 'healthy' },
                    { name: '工部', agent: 2, status: 'warning' },
                  ].map((ministry) => (
                    <div
                      key={ministry.name}
                      className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{ministry.name}</div>
                        <Badge
                          variant={
                            ministry.status === 'healthy' ? 'default' : 'secondary'
                          }
                        >
                          {ministry.status === 'healthy' ? '正常' : '警告'}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Agent 数量: {ministry.agent}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        负载: {Math.floor(Math.random() * 20) + 40}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{title}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </div>
            <div className={`text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </div>
          </div>
          <div className={`h-12 w-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
