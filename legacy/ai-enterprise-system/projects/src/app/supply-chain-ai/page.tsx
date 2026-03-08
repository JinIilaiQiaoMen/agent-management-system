'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Factory, ArrowLeft, TrendingUp, Package, AlertTriangle, DollarSign, BarChart3, Boxes, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SupplyChainAIPage() {
  const router = useRouter();

  const predictedProducts = [
    {
      id: 1,
      name: '智能宠物喂食器',
      predictedSales: 50000,
      confidence: 92,
      trend: 'up',
      reasons: ['TikTok 热度上升 45%', '竞品库存不足', '季节性需求增加']
    },
    {
      id: 2,
      name: '抗菌猫砂盆',
      predictedSales: 35000,
      confidence: 85,
      trend: 'up',
      reasons: ['卫生意识提升', 'Instagram 推荐增多', '新品类潜力大']
    },
    {
      id: 3,
      name: '狗狗智能项圈',
      predictedSales: 28000,
      confidence: 78,
      trend: 'stable',
      reasons: ['市场稳定增长', '复购率高', '口碑传播良好']
    }
  ];

  const inventoryItems = [
    {
      id: 1,
      name: '宠物咬胶玩具',
      stock: 12500,
      capacity: 15000,
      status: 'normal',
      daysRemaining: 30
    },
    {
      id: 2,
      name: '猫咪零食礼盒',
      stock: 1800,
      capacity: 5000,
      status: 'low',
      daysRemaining: 5
    },
    {
      id: 3,
      name: '宠物水碗',
      stock: 8500,
      capacity: 10000,
      status: 'normal',
      daysRemaining: 28
    }
  ];

  const qualityMetrics = [
    { name: '合格率', value: 99.2, target: 98 },
    { name: '退货率', value: 0.8, target: 1.5 },
    { name: '客户投诉率', value: 0.3, target: 0.5 },
    { name: '生产良率', value: 98.5, target: 97 }
  ];

  const costAnalysis = {
    materialCost: 42.5,
    laborCost: 15.2,
    overheadCost: 8.3,
    totalCost: 66.0,
    suggestedPrice: 89.9,
    profitMargin: 26.6
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  工厂供应链 AI 协同
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  爆品预测、库存管理、品控分析、成本核算，实现产销全链路 AI 协同
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回</span>
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">预测准确率</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">89.3%</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">库存周转率</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">12.5</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">预警事件</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">3</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">成本节省</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">18.7%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 爆品预测 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
              AI 爆品预测
            </h2>
            <div className="space-y-4">
              {predictedProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{product.name}</h3>
                    <div className="flex items-center space-x-2">
                      {product.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {product.confidence}% 置信度
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {product.predictedSales.toLocaleString()} 件
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">预测销量</span>
                  </div>
                  <div className="space-y-1">
                    {product.reasons.map((reason, index) => (
                      <p key={index} className="text-xs text-slate-600 dark:text-slate-400">
                        • {reason}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 库存管理 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Boxes className="h-5 w-5 mr-2 text-emerald-600" />
              智能库存管理
            </h2>
            <div className="space-y-4">
              {inventoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    item.status === 'low'
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        item.status === 'low' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                      }`}>
                        {item.status === 'low' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          剩余 {item.daysRemaining} 天
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        item.status === 'low' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.stock.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        / {item.capacity.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.status === 'low' ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(item.stock / item.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 品控分析 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              品控分析
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {qualityMetrics.map((metric, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    metric.value >= metric.target
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                      : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                  }`}
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.name}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className={`text-2xl font-bold ${
                      metric.value >= metric.target ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {metric.value}%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      目标: {metric.target}%
                    </p>
                  </div>
                  {metric.value >= metric.target && (
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 成本核算 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              成本核算
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">原材料成本</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">${costAnalysis.materialCost}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">人工成本</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">${costAnalysis.laborCost}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">管理费用</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">${costAnalysis.overheadCost}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-400">总成本</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${costAnalysis.totalCost}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-400">建议售价</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${costAnalysis.suggestedPrice}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600">
                <span className="text-sm font-medium text-white">利润率</span>
                <span className="text-2xl font-bold text-white">{costAnalysis.profitMargin}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
