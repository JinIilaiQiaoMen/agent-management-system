'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Briefcase,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HRSystemPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    attendanceRecords: 0,
    activeRecruitments: 0,
    pendingApprovals: 0,
    abnormalAttendance: 0
  });

  useEffect(() => {
    // 这里应该从 API 获取实际数据
    // 暂时使用模拟数据
    setStats({
      totalEmployees: 156,
      activeEmployees: 148,
      attendanceRecords: 3240,
      activeRecruitments: 12,
      pendingApprovals: 23,
      abnormalAttendance: 8
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    智能人事系统
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI驱动的全流程人力资源管理
                  </p>
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              AI 驱动
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 数据仪表盘 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            数据概览
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={Users}
              title="员工总数"
              value={stats.totalEmployees}
              color="rose"
              description="在职员工数量"
            />
            <StatCard
              icon={Building2}
              title="在职员工"
              value={stats.activeEmployees}
              color="blue"
              description="正常在职"
            />
            <StatCard
              icon={Calendar}
              title="本月考勤"
              value={stats.attendanceRecords}
              color="green"
              description="考勤记录数"
            />
            <StatCard
              icon={Briefcase}
              title="招聘中"
              value={stats.activeRecruitments}
              color="purple"
              description="职位数量"
            />
            <StatCard
              icon={FileText}
              title="待审批"
              value={stats.pendingApprovals}
              color="orange"
              description="需要处理"
            />
            <StatCard
              icon={AlertCircle}
              title="异常考勤"
              value={stats.abnormalAttendance}
              color="red"
              description="需关注"
            />
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            功能模块
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Users}
              title="员工管理"
              description="查看、管理所有员工全量信息"
              href="/hr-system/employees"
              color="rose"
              available={true}
            />
            <FeatureCard
              icon={Briefcase}
              title="组织架构"
              description="部门、岗位、汇报关系管理"
              href="/hr-system/organization"
              color="blue"
              available={true}
            />
            <FeatureCard
              icon={TrendingUp}
              title="智能招聘"
              description="AI简历筛选、智能邀约、AI面试"
              href="/hr-system/recruitment"
              color="purple"
              available={true}
            />
            <FeatureCard
              icon={Briefcase}
              title="招聘平台集成"
              description="集成多平台发布职位、同步简历"
              href="/hr-system/recruitment-platforms"
              color="indigo"
              available={true}
            />
            <FeatureCard
              icon={Calendar}
              title="考勤排班"
              description="自动打卡、智能排班、请假管理"
              href="/hr-system/attendance"
              color="green"
              available={true}
            />
            <FeatureCard
              icon={DollarSign}
              title="绩效薪酬"
              description="KPI考核、薪资计算、税务处理"
              href="/hr-system/performance"
              color="orange"
              available={false}
            />
            <FeatureCard
              icon={GraduationCap}
              title="员工培训"
              description="培训课程、期次管理、学习进度"
              href="/hr-system/training"
              color="purple"
              available={true}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="社保公积金"
              description="社保缴纳、公积金管理"
              href="/hr-system/benefits"
              color="blue"
              available={true}
            />
          </div>
        </div>

        {/* 系统说明 */}
        <Card className="bg-gradient-to-r from-slate-50 to-rose-50 dark:from-slate-900 dark:to-rose-950">
          <CardHeader>
            <CardTitle className="text-base">🚀 系统升级说明</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">员工管理</strong>：支持员工信息录入、变更、离职处理及档案查询
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">组织架构</strong>：部门管理、岗位体系、汇报关系配置
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔄</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">智能招聘</strong>（开发中）：AI简历筛选、智能邀约、AI面试、Offer管理
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔄</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">考勤排班</strong>（开发中）：自动打卡、智能排班、请假/加班管理
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔄</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">绩效薪酬</strong>（开发中）：KPI考核、AI辅助评分、薪资自动计算
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, description }: any) {
  const colorClasses: any = {
    rose: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800',
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    purple: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
    orange: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
    red: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
  };

  const iconColorClasses: any = {
    rose: 'text-rose-600 dark:text-rose-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400'
  };

  return (
    <Card className={`border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.rose}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon: Icon, title, description, href, color, available = true }: any) {
  const colorClasses: any = {
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  };

  if (available) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.rose}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            可用
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </Link>
    );
  } else {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm opacity-60 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
            开发中
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    );
  }
}
