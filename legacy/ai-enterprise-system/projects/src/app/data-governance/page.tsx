'use client';

import Link from 'next/link';
import { ArrowLeft, Settings, Plus, Globe, Zap, Server, Database } from 'lucide-react';

export default function DataGovernancePage() {
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    数据治理与API集成
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    统一数据模型与API网关管理
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
            icon={Globe}
            title="API网关管理"
            description="统一管理所有外部API接口"
            href="/data-governance/api-gateway"
            color="indigo"
          />
          <FeatureCard
            icon={Database}
            title="数据模型配置"
            description="定义和管理数据模型结构"
            href="/data-governance/data-models"
            color="purple"
          />
          <FeatureCard
            icon={Server}
            title="系统集成配置"
            description="配置第三方系统对接"
            href="/data-governance/system-integration"
            color="pink"
          />
          <FeatureCard
            icon={Zap}
            title="大模型API管理"
            description="管理和调用LLM能力"
            href="/data-governance/llm-management"
            color="orange"
          />
        </div>

        {/* 统计信息 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="API配置数量"
            value="0"
            description="已配置的API接口"
          />
          <StatCard
            title="数据模型"
            value="0"
            description="已定义的数据模型"
          />
          <StatCard
            title="集成系统"
            value="0"
            description="已对接的第三方系统"
          />
        </div>

        {/* 说明 */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            功能说明
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• 统一数据模型：建立标准化的数据格式和接口规范</li>
            <li>• API网关：构建统一的API管理和监控平台</li>
            <li>• 系统同步：实现SaaS、财务、物料系统的实时数据同步</li>
            <li>• 大模型接入：集成ChatGPT、Stable Diffusion等AI能力</li>
            <li>• 数据孤岛解决：打破部门数据壁垒，实现数据共享</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, href, color }: any) {
  const colorClasses: any = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  };

  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
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
