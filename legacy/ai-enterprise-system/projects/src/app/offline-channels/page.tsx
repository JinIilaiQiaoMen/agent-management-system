'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowLeft, Store, Users, TrendingUp, DollarSign, Globe, Target, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

export default function OfflineChannelsPage() {
  const router = useRouter();

  const locations = [
    {
      id: 1,
      city: '纽约',
      country: '美国',
      status: 'active',
      stores: 12,
      monthlySales: 85000,
      growth: 15.3
    },
    {
      id: 2,
      city: '洛杉矶',
      country: '美国',
      status: 'active',
      stores: 8,
      monthlySales: 62000,
      growth: 12.8
    },
    {
      id: 3,
      city: '伦敦',
      country: '英国',
      status: 'planned',
      stores: 0,
      monthlySales: 0,
      growth: 0
    }
  ];

  const channelPartners = [
    {
      id: 1,
      name: 'PetSmart',
      type: '大型连锁',
      stores: 1850,
      status: 'active',
      contact: 'contact@petsmart.com'
    },
    {
      id: 2,
      name: 'Petco',
      type: '大型连锁',
      stores: 1500,
      status: 'active',
      contact: 'partners@petco.com'
    },
    {
      id: 3,
      name: 'Local Pet Shop Network',
      type: '本地连锁',
      stores: 85,
      status: 'negotiating',
      contact: 'info@localpetshop.com'
    }
  ];

  const siteAnalysis = [
    {
      id: 1,
      area: '曼哈顿中城',
      score: 92,
      population: 85000,
      competition: 'low',
      rent: 'high',
      recommendation: 'high'
    },
    {
      id: 2,
      area: '洛杉矶圣莫尼卡',
      score: 88,
      population: 62000,
      competition: 'medium',
      rent: 'high',
      recommendation: 'medium'
    },
    {
      id: 3,
      area: '芝加哥林肯公园',
      score: 85,
      population: 45000,
      competition: 'low',
      rent: 'medium',
      recommendation: 'high'
    }
  ];

  const onlineToOfflineData = {
    onlineOrders: 125000,
    offlinePickup: 45000,
    inStoreSales: 68000,
    conversionRate: 36.2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-600">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  欧美线下渠道赋能
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  选址分析、渠道商对接、线上引流闭环、门店运营 AI 管理
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/20">
                <Store className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">门店数量</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">20</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">月销售额</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">$147K</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">渠道商</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">3</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">增长率</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">14.1%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 选址分析 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-violet-600" />
                智能选址分析
              </h2>
              <button className="flex items-center space-x-1 text-sm text-violet-600 hover:text-violet-700">
                <Plus className="h-4 w-4" />
                <span>新选址</span>
              </button>
            </div>
            <div className="space-y-3">
              {siteAnalysis.map((site) => (
                <div
                  key={site.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{site.area}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      site.recommendation === 'high'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {site.recommendation === 'high' ? '强烈推荐' : '可考虑'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center mt-3">
                    <div>
                      <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{site.score}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">综合评分</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {(site.population / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">人口</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {site.competition}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">竞争</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{site.rent}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">租金</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 渠道商对接 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                渠道商对接
              </h2>
              <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
                <Plus className="h-4 w-4" />
                <span>添加渠道</span>
              </button>
            </div>
            <div className="space-y-3">
              {channelPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{partner.name}</h3>
                    <div className="flex items-center space-x-2">
                      {partner.status === 'active' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          已合作
                        </span>
                      )}
                      {partner.status === 'negotiating' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Clock className="h-3 w-3 inline mr-1" />
                          谈判中
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{partner.type}</span>
                    <span>{partner.stores} 家门店</span>
                    <span>{partner.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 线上引流闭环 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-emerald-600" />
              线上引流闭环
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">线上订单</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {onlineToOfflineData.onlineOrders.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                  <p className="text-xs text-violet-600 dark:text-violet-400 mb-1">线下自提</p>
                  <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                    {onlineToOfflineData.offlinePickup.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">门店销售</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {onlineToOfflineData.inStoreSales.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100">线上到线下转化率</p>
                    <p className="text-3xl font-bold text-white mt-1">{onlineToOfflineData.conversionRate}%</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-emerald-200" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-sm text-slate-600 dark:text-slate-400">社交媒体广告引流</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+28%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-sm text-slate-600 dark:text-slate-400">线上优惠券到店核销</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+35%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-sm text-slate-600 dark:text-slate-400">会员积分门店兑换</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+42%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 门店运营 AI 管理 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Store className="h-5 w-5 mr-2 text-pink-600" />
              门店运营 AI 管理
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">智能排班</p>
                  <p className="text-sm text-slate-900 dark:text-white mb-1">AI 自动优化员工排班</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">效率提升 23%</p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">库存预警</p>
                  <p className="text-sm text-slate-900 dark:text-white mb-1">实时库存监控</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">缺货率降低 18%</p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">客户分析</p>
                  <p className="text-sm text-slate-900 dark:text-white mb-1">购买行为预测</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">复购率提升 31%</p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">营销推荐</p>
                  <p className="text-sm text-slate-900 dark:text-white mb-1">个性化促销方案</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">销售额提升 27%</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-pink-100">门店运营综合评分</p>
                    <p className="text-2xl font-bold text-white mt-1">94.5 分</p>
                    <p className="text-xs text-pink-200 mt-1">环比提升 8.3%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
