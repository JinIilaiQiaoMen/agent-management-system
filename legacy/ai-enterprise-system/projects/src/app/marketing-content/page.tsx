'use client';

import Link from 'next/link';
import { ArrowLeft, PenTool, FolderOpen, LayoutTemplate, GitCompare } from 'lucide-react';

export default function MarketingContentPage() {
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
                  <PenTool className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    营销内容生成
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI驱动的智能内容创作平台
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
            icon={PenTool}
            title="内容生成"
            description="AI自动生成文案和短视频"
            href="/marketing-content/generator"
            color="pink"
          />
          <FeatureCard
            icon={FolderOpen}
            title="素材库"
            description="本地素材存储与智能检索"
            href="/marketing-content/materials"
            color="purple"
          />
          <FeatureCard
            icon={LayoutTemplate}
            title="模板管理"
            description="内容模板配置与复用"
            href="/marketing-content/templates"
            color="blue"
          />
          <FeatureCard
            icon={GitCompare}
            title="A/B测试"
            description="内容效果对比与优化"
            href="/marketing-content/ab-testing"
            color="green"
          />
        </div>

        {/* 统计信息 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="已生成内容"
            value="0"
            description="AI生成的营销内容"
          />
          <StatCard
            title="素材数量"
            value="0"
            description="素材库中的素材文件"
          />
          <StatCard
            title="进行中测试"
            value="0"
            description="正在进行的A/B测试"
          />
        </div>

        {/* 说明 */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            功能说明
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• 内容生成：文案自动撰写、短视频自动剪辑、多语言内容生成</li>
            <li>• 素材库管理：本地素材存储、标签化管理、智能检索</li>
            <li>• 个性化定制：品牌风格适配、目标受众优化、A/B测试</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, href, color }: any) {
  const colorClasses: any = {
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  };

  return (
    <Link
      href={href}
      className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.pink}`}>
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
