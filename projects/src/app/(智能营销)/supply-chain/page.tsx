'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Package,
  ShieldCheck,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  Download,
  Eye,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

type TabType = 'overview' | 'forecast' | 'inventory' | 'quality' | 'cost';

interface SummaryCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface InventoryAlert {
  id: string;
  product_name: string;
  sku: string;
  quantity_available: number;
  alert_level: string;
  reorder_point: number;
}

interface HotProduct {
  productId: string;
  productName: string;
  sku: string;
  hotProductScore: number;
  predictedDemand30Days: number;
  currentStock: number;
  recommendation: string;
}

export default function SupplyChainPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 模态框状态
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'inventory' | 'quality' | 'cost' | 'forecast'>('inventory');
  const [formData, setFormData] = useState<any>({});

  // 概览数据
  const [overviewData, setOverviewData] = useState<any>(null);

  // 爆品预测数据
  const [forecasts, setForecasts] = useState<HotProduct[]>([]);
  const [forecastPeriod, setForecastPeriod] = useState('30');

  // 库存数据
  const [inventory, setInventory] = useState<InventoryAlert[]>([]);
  const [inventoryStats, setInventoryStats] = useState<any>(null);

  // 品控数据
  const [qualityData, setQualityData] = useState<any>(null);
  const [showAllQuality, setShowAllQuality] = useState(false);

  // 成本数据
  const [costData, setCostData] = useState<any>(null);
  const [showAllCost, setShowAllCost] = useState(false);

  // 加载概览数据
  const loadOverview = async () => {
    try {
      const response = await fetch('/api/supply-chain/collaboration?period=30');
      const data = await response.json();
      setOverviewData(data);
    } catch (error) {
      console.error('加载概览数据失败:', error);
    }
  };

  // 加载爆品预测
  const loadForecasts = async () => {
    try {
      const response = await fetch(`/api/supply-chain/forecast?period=${forecastPeriod}&limit=10`);
      const data = await response.json();
      setForecasts(data.forecasts || []);
    } catch (error) {
      console.error('加载预测数据失败:', error);
    }
  };

  // 加载库存数据
  const loadInventory = async () => {
    try {
      const response = await fetch('/api/supply-chain/inventory?limit=50');
      const data = await response.json();
      setInventory(data.inventory || []);
      setInventoryStats(data.stats);
    } catch (error) {
      console.error('加载库存数据失败:', error);
    }
  };

  // 加载品控数据
  const loadQuality = async () => {
    try {
      const response = await fetch('/api/supply-chain/quality?limit=30');
      const data = await response.json();
      setQualityData(data);
    } catch (error) {
      console.error('加载品控数据失败:', error);
    }
  };

  // 加载成本数据
  const loadCost = async () => {
    try {
      const response = await fetch('/api/supply-chain/cost?period=30');
      const data = await response.json();
      setCostData(data);
    } catch (error) {
      console.error('加载成本数据失败:', error);
    }
  };

  // 刷新所有数据
  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      loadOverview(),
      loadForecasts(),
      loadInventory(),
      loadQuality(),
      loadCost()
    ]);
    setRefreshing(false);
  };

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadOverview(),
        loadForecasts(),
        loadInventory(),
        loadQuality(),
        loadCost()
      ]);
      setLoading(false);
    };

    init();
  }, [forecastPeriod]);

  // 打开添加模态框
  const handleOpenModal = (type: 'inventory' | 'quality' | 'cost' | 'forecast') => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({});
  };

  // 表单提交处理
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let url = '';
      let method = 'POST';
      let body = formData;

      switch (modalType) {
        case 'inventory':
          url = '/api/supply-chain/inventory';
          break;
        case 'quality':
          url = '/api/supply-chain/quality';
          break;
        case 'cost':
          url = '/api/supply-chain/cost';
          break;
        case 'forecast':
          url = '/api/supply-chain/forecast';
          break;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        // 刷新数据
        await Promise.all([
          loadInventory(),
          loadQuality(),
          loadCost(),
          loadForecasts()
        ]);
        handleCloseModal();
        alert('添加成功！');
      } else {
        alert(`添加失败：${result.error}`);
      }
    } catch (error: any) {
      alert(`操作失败：${error.message}`);
    }
  };

  // 概览卡片
  const renderSummaryCards = () => {
    const cards: SummaryCard[] = [
      {
        title: '活跃销售订单',
        value: overviewData?.summary?.sales?.activeSalesOrders || 0,
        change: '+12%',
        trend: 'up',
        icon: Package,
        color: 'blue'
      },
      {
        title: '库存总值',
        value: `¥${(overviewData?.summary?.inventory?.totalValue || 0).toLocaleString()}`,
        change: '+5.3%',
        trend: 'up',
        icon: DollarSign,
        color: 'green'
      },
      {
        title: '生产中订单',
        value: overviewData?.summary?.production?.inProgressOrders || 0,
        change: '0%',
        trend: 'neutral',
        icon: RefreshCw,
        color: 'purple'
      },
      {
        title: '库存预警',
        value: (overviewData?.summary?.inventory?.critical || 0) + (overviewData?.summary?.inventory?.lowStock || 0),
        change: '+3',
        trend: 'up',
        icon: AlertTriangle,
        color: 'red'
      }
    ];

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/30`}
              >
                <card.icon className={`h-5 w-5 text-${card.color}-600 dark:text-${card.color}-400`} />
              </div>
            </div>
            {card.change && (
              <div className="mt-4 flex items-center space-x-1">
                {card.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : card.trend === 'down' ? (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                ) : null}
                <span
                  className={`text-sm ${
                    card.trend === 'up'
                      ? 'text-green-600'
                      : card.trend === 'down'
                      ? 'text-red-600'
                      : 'text-slate-600'
                  }`}
                >
                  {card.change} 较上月
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染爆品预测
  const renderForecast = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            爆品预测分析
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            基于AI预测未来30天的爆品趋势
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="30">30天</option>
            <option value="60">60天</option>
            <option value="90">90天</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {forecasts.slice(0, 5).map((product) => (
          <div
            key={product.productId}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {product.productName}
                  </h3>
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    {product.sku}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  预测需求: <span className="font-semibold">{product.predictedDemand30Days}</span> 件
                  {' · '}
                  当前库存: <span className="font-semibold">{product.currentStock}</span> 件
                </p>
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  {product.recommendation}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {product.hotProductScore}
                </div>
                <div className="text-xs text-slate-500">爆品分数</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染库存管理
  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            库存管理
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            实时监控库存状态
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal('inventory')}
            className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Plus className="h-4 w-4" />
            <span>新增</span>
          </button>
        </div>
      </div>

      {/* 库存统计 */}
      {inventoryStats && (
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="text-lg font-bold text-red-900 dark:text-red-400">
              {inventoryStats.outOfStock}
            </div>
            <div className="text-xs text-red-700 dark:text-red-400">缺货</div>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
            <div className="text-lg font-bold text-orange-900 dark:text-orange-400">
              {inventoryStats.critical}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-400">危急</div>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/30">
            <div className="text-lg font-bold text-yellow-900 dark:text-yellow-400">
              {inventoryStats.lowStock}
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-400">低库存</div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <div className="text-lg font-bold text-green-900 dark:text-green-400">
              {inventoryStats.normal}
            </div>
            <div className="text-xs text-green-700 dark:text-green-400">正常</div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="text-lg font-bold text-blue-900 dark:text-blue-400">
              {inventoryStats.overstock}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400">积压</div>
          </div>
        </div>
      )}

      {/* 库存列表 */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                产品
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                可用库存
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                补货点
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {inventory.slice(0, 10).map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {item.product_name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {item.sku}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                  {item.quantity_available}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {item.reorder_point}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      item.alert_level === 'out_of_stock'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : item.alert_level === 'critical'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : item.alert_level === 'low_stock'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {item.alert_level === 'out_of_stock'
                      ? '缺货'
                      : item.alert_level === 'critical'
                      ? '危急'
                      : item.alert_level === 'low_stock'
                      ? '低库存'
                      : '正常'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 渲染品控分析
  const renderQuality = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            品控分析
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            质量检查记录与分析
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal('quality')}
            className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Plus className="h-4 w-4" />
            <span>新增检查</span>
          </button>
        </div>
      </div>

      {qualityData && qualityData.stats && (
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {qualityData.stats.total || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">总检查次数</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-3xl font-bold text-green-600">
              {qualityData.stats.avgPassRate || 0}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">平均合格率</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-3xl font-bold text-blue-600">
              {qualityData.stats.todayChecks || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">今日检查</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-3xl font-bold text-purple-600">
              {qualityData.stats.final || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">最终检查</div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-center text-slate-500 dark:text-slate-400">
          暂无详细检查记录数据
        </p>
      </div>
    </div>
  );

  // 渲染成本核算
  const renderCost = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            成本核算
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            成本分析与利润率计算
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal('cost')}
            className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Plus className="h-4 w-4" />
            <span>新增成本</span>
          </button>
        </div>
      </div>

      {costData && costData.costSummary && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">成本汇总</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">材料成本</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ¥{(costData.costSummary.material?.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">人工成本</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ¥{(costData.costSummary.labor?.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">制造费用</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ¥{(costData.costSummary.overhead?.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">总成本</span>
                  <span className="text-lg font-bold text-blue-600">
                    ¥{(costData.totalCost || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {costData.productCosts && costData.productCosts.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">产品利润率分析</h3>
                <button
                  onClick={() => setShowAllCost(!showAllCost)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <span>{showAllCost ? '收起' : '查看全部'}</span>
                  {showAllCost ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                        产品
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                        总成本
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                        售价
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                        利润率
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {(showAllCost ? costData.productCosts : costData.productCosts.slice(0, 5)).map((product: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          ¥{product.totalCost?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          ¥{product.sellingPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`font-medium ${
                              parseFloat(product.profitMargin || 0) > 20
                                ? 'text-green-600'
                                : parseFloat(product.profitMargin || 0) > 10
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {product.profitMargin || 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    工厂供应链 AI 协同系统
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    爆品预测 · 库存管理 · 品控分析 · 成本核算
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshAll}
                disabled={refreshing}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">刷新</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 标签页导航 */}
        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'overview' as TabType, label: '协同概览', icon: TrendingUp },
              { id: 'forecast' as TabType, label: '爆品预测', icon: TrendingUp },
              { id: 'inventory' as TabType, label: '库存管理', icon: Package },
              { id: 'quality' as TabType, label: '品控分析', icon: ShieldCheck },
              { id: 'cost' as TabType, label: '成本核算', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 协同建议 */}
        {activeTab === 'overview' && overviewData?.recommendations && overviewData.recommendations.length > 0 && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-400">AI 协同建议</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                  {overviewData.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 内容区域 */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {renderSummaryCards()}
              {renderInventory()}
            </>
          )}
          {activeTab === 'forecast' && renderForecast()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'quality' && renderQuality()}
          {activeTab === 'cost' && renderCost()}
        </div>
      </div>
    </div>
  );
}
