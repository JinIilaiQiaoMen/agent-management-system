"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  Shield,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  LogOut,
  Settings,
  ChevronRight,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  // 模拟数据
  const [stats, setStats] = useState({
    totalDecrees: 1234,
    successRate: 98.5,
    avgExecutionTime: 2.3,
    totalAlerts: 23,
    totalUsers: 156,
    monthlyRevenue: 280000,
  });

  const [recentProcesses, setRecentProcesses] = useState([
    {
      id: 1,
      name: '客户分析-ABC科技',
      status: 'completed',
      time: '2.3s',
      timestamp: '19:30:15',
    },
    {
      id: 2,
      name: '邮件生成-产品介绍',
      status: 'running',
      time: '1.5s',
      timestamp: '19:29:45',
    },
    {
      id: 3,
      name: '数据采集-竞品分析',
      status: 'pending',
      time: '-',
      timestamp: '19:28:30',
    },
    {
      id: 4,
      name: '风险评估-系统安全',
      status: 'completed',
      time: '1.8s',
      timestamp: '19:27:15',
    },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      level: 'critical',
      message: '准确性指标低于50%',
      processId: 'proc_123456',
      timestamp: '19:30:10',
    },
    {
      id: 2,
      level: 'error',
      message: '检测到错误级别异常',
      processId: 'proc_123455',
      timestamp: '19:29:40',
    },
    {
      id: 3,
      level: 'warn',
      message: '完整性指标低于70%',
      processId: 'proc_123454',
      timestamp: '19:28:20',
    },
  ]);

  const handleLogout = async () => {
    await signOut({ redirect: '/' });
    router.push('/');
  };

  // 模拟数据加载
  setTimeout(() => {
    setLoading(false);
  }, 500);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 导航栏 */}
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ZAEP 仪表盘
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {session?.user?.email || '未登录'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                设置
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="总圣旨数"
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

        {/* 快捷操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <QuickActionCard
            title="提交圣旨"
            description="创建新的圣旨并执行"
            icon={<FileText className="h-8 w-8" />}
            color="blue"
            onClick={() => router.push('/san-sheng')}
          />
          <QuickActionCard
            title="查看报告"
            description="查看三省六部执行报告"
            icon={<Shield className="h-8 w-8" />}
            color="green"
            onClick={() => router.push('/jinyiwei')}
          />
          <QuickActionCard
            title="管理用户"
            description="管理系统用户和权限"
            icon={<Users className="h-8 w-8" />}
            color="purple"
            onClick={() => router.push('/users')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 最近圣旨 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  最近圣旨
                </CardTitle>
                <Button variant="outline" size="sm">
                  查看全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProcesses.map((process) => (
                  <div
                    key={process.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
                          {process.timestamp}
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

          {/* 最近告警 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  最近告警
                </CardTitle>
                <Button variant="outline" size="sm">
                  查看全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      {alert.level === 'critical' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      {alert.level === 'error' && (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      {alert.level === 'warn' && (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {alert.message}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          流程: {alert.processId}
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
                            : 'secondary'
                        }
                      >
                        {alert.level === 'critical' && '严重'}
                        {alert.level === 'error' && '错误'}
                        {alert.level === 'warn' && '警告'}
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
        </div>

        {/* 收入统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              收入统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-slate-700 dark:text-slate-300">本月收入</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ¥280,000
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+18%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-slate-700 dark:text-slate-300">总收入</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ¥4,630,000
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-slate-700 dark:text-slate-300">新增用户</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  156
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+23%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colors[color]} ${iconColors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  color,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick: () => void;
}) {
  const colors = {
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
    green: 'hover:bg-green-50 dark:hover:bg-green-900/30',
    purple: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
    orange: 'hover:bg-orange-50 dark:hover:bg-orange-900/30',
  };

  const iconColors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-100',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-100',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-100',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-100',
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${colors[color]}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${iconColors[color]}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
