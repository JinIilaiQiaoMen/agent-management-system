'use client';

import Link from 'next/link';
import { ArrowLeft, DollarSign, FileText, AlertTriangle, BarChart3 } from 'lucide-react';

export default function FinanceAuditPage() {
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    财务审计系统
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI驱动的智能财务与审计管理
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 功能卡片 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={FileText}
            title="报销管理"
            description="报销申请、审批、AI风险检测"
            href="/finance-audit/expenses"
            color="amber"
            available={true}
          />
          <FeatureCard
            icon={BarChart3}
            title="对账管理"
            description="自动对账、差异分析、报表生成"
            href="/finance-audit/reconciliation"
            color="blue"
            available={true}
          />
          <FeatureCard
            icon={AlertTriangle}
            title="审计管理"
            description="异常检测、合规检查、风险预警"
            href="/finance-audit/audit"
            color="red"
            available={true}
          />
          <FeatureCard
            icon={DollarSign}
            title="财务标准"
            description="报销标准、审批流程、规则配置"
            href="/finance-audit/standards"
            color="green"
            available={true}
          />
        </div>

        {/* 统计信息 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="待审批报销"
            value="2"
            description="需要审批的报销单"
          />
          <StatCard
            title="本月支出"
            value="¥24.6K"
            description="本月报销总金额"
          />
          <StatCard
            title="风险预警"
            value="3"
            description="需要关注的风险项"
          />
        </div>

        {/* 说明 */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            功能说明
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• 数据接入：钉钉审批数据、银行流水数据、发票数据</li>
            <li>• AI比对模型：异常检测、合规性检查、风险预警</li>
            <li>• 自动化处理：报销自动审核、对账自动化、凭证自动生成</li>
            <li>• 财务标准制定：报销标准、审批流程、风险控制</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, href, color, available = true }: any) {
  const colorClasses: any = {
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  };

  if (available) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.amber}`}>
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

function StatCard({ title, value, description }: any) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
  );
}
