'use client';

import { Construction, Clock, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UnderConstructionProps {
  featureName: string;
  description?: string;
  estimatedTime?: string;
  contactEmail?: string;
}

export default function UnderConstruction({
  featureName,
  description = '该功能正在开发中，即将上线',
  estimatedTime = '预计 1-2 周内完成',
  contactEmail = 'support@example.com'
}: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回首页</span>
        </Link>

        {/* 主要内容卡片 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-200 dark:border-slate-800">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Construction className="h-12 w-12 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              功能开发中
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {featureName}
            </p>
            <p className="text-slate-500 dark:text-slate-500 mt-2">
              {description}
            </p>
          </div>

          {/* 信息卡片 */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">预计上线时间</p>
                <p className="text-blue-700 dark:text-blue-400 text-sm">{estimatedTime}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-300 text-sm">当前状态</p>
                <p className="text-purple-700 dark:text-purple-400 text-sm">开发进行中</p>
              </div>
            </div>
          </div>

          {/* 功能预览 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
              即将推出的功能
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">完整的用户界面和交互流程</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">数据持久化和查询功能</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">AI 智能分析和推荐</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">实时数据监控和报表</span>
              </div>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              如有紧急需求，请联系我们：
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <span>{contactEmail}</span>
            </a>
          </div>
        </div>

        {/* 额外提示 */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-6">
          感谢您的耐心等待，我们会尽快完成开发
        </p>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
