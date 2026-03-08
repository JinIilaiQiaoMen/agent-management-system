'use client';

import Link from 'next/link';
import { ArrowLeft, Package, Plus, ShoppingBag, Warehouse, AlertCircle } from 'lucide-react';

export default function AssetManagementPage() {
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-green-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    资产数字化管控
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    一物一码体系，全流程线上化管理
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
            icon={Package}
            title="资产管理"
            description="查看和管理所有固定资产"
            href="/asset-management/assets"
            color="teal"
            available={true}
          />
          <FeatureCard
            icon={ShoppingBag}
            title="采购管理"
            description="资产采购申请与审批流程"
            href="/asset-management/procurement"
            color="green"
            available={false}
          />
          <FeatureCard
            icon={Warehouse}
            title="入库管理"
            description="资产入库验收与登记"
            href="/asset-management/inbound"
            color="blue"
            available={false}
          />
          <FeatureCard
            icon={AlertCircle}
            title="报废管理"
            description="资产报废审批与处理"
            href="/asset-management/dispose"
            color="red"
            available={false}
          />
        </div>

        {/* 统计信息 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="资产总数"
            value="0"
            description="已登记的资产数量"
          />
          <StatCard
            title="库存预警"
            value="0"
            description="需要关注的库存预警"
          />
          <StatCard
            title="采购申请"
            value="0"
            description="待处理的采购申请"
          />
        </div>

        {/* 说明 */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            功能说明
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• 一物一码：为每个物品/资产分配唯一标识码</li>
            <li>• 全流程线上化：采购-入库-领用-报废全链路管理</li>
            <li>• 实时库存预警：库存不足、即将过期、异常消耗预警</li>
            <li>• 财务对接：自动对账、成本核算、报表生成</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, href, color, available = true }: any) {
  const colorClasses: any = {
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };

  if (available) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.teal}`}>
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
