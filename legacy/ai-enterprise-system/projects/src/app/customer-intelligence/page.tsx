'use client';

import Link from 'next/link';
import { ArrowLeft, Camera, FileText, Calendar, MessageSquare } from 'lucide-react';

export default function CustomerIntelligencePage() {
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    客户智能分析
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    影像分析与个性化方案生成
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
            icon={Camera}
            title="影像分析"
            description="客户照片量化、标注、特征提取"
            href="/customer-intelligence/image-analysis"
            color="violet"
          />
          <FeatureCard
            icon={FileText}
            title="方案匹配"
            description="智能推荐、个性化定制、效果预测"
            href="/customer-intelligence/solution-matching"
            color="blue"
          />
          <FeatureCard
            icon={Calendar}
            title="预约管理"
            description="自动化预约、提醒、状态跟踪"
            href="/customer-intelligence/appointments"
            color="green"
          />
          <FeatureCard
            icon={MessageSquare}
            title="跟进管理"
            description="智能跟进、AI建议、效果追踪"
            href="/customer-intelligence/follow-up"
            color="orange"
          />
        </div>

        {/* 统计信息 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="已分析影像"
            value="0"
            description="AI分析的客户影像数"
          />
          <StatCard
            title="生成方案"
            value="0"
            description="生成的个性化方案数"
          />
          <StatCard
            title="待跟进"
            value="0"
            description="需要跟进的客户数"
          />
        </div>

        {/* 说明 */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            功能说明
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• 影像分析：客户照片量化、智能标注、特征提取</li>
            <li>• 方案匹配：智能推荐、个性化定制、效果预测</li>
            <li>• 报告生成：自动化报告、数据可视化、趋势分析</li>
            <li>• 客户管理：自动化预约、智能跟进、CRM集成</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, href, color }: any) {
  const colorClasses: any = {
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  };

  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.violet}`}>
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
