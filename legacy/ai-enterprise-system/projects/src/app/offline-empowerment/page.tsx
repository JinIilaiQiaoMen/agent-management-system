'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Package,
  ShieldCheck,
  Target,
  Store,
  Calendar,
  BarChart3,
  Activity,
  RefreshCw,
  Globe,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  UserCheck
} from 'lucide-react';

type TabType = 'overview' | 'traffic' | 'scheduling' | 'inventory' | 'audit' | 'marketing';

export default function OfflineEmpowermentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // 数据状态
  const [stores, setStores] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [schedulingData, setSchedulingData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [marketingData, setMarketingData] = useState<any>(null);

  // 加载门店列表
  useEffect(() => {
    loadStores();
  }, []);

  // 加载所有数据
  useEffect(() => {
    if (selectedStore) {
      loadAllData();
    }
  }, [selectedStore, selectedLanguage]);

  const loadStores = async () => {
    try {
      const response = await fetch('/api/offline-empowerment/stores');
      const data = await response.json();
      if (data.success && data.stores) {
        setStores(data.stores);
        if (data.stores.length > 0) {
          setSelectedStore(data.stores[0].id);
        }
      }
    } catch (error) {
      console.error('加载门店失败:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTrafficData(),
        loadSchedulingData(),
        loadInventoryData(),
        loadAuditData(),
        loadMarketingData()
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrafficData = async () => {
    try {
      const response = await fetch(
        `/api/offline-empowerment/heatmap?store_id=${selectedStore}&days=7&language=${selectedLanguage}`
      );
      const data = await response.json();
      if (data.success) {
        setTrafficData(data);
      }
    } catch (error) {
      console.error('加载客流数据失败:', error);
    }
  };

  const loadSchedulingData = async () => {
    try {
      const response = await fetch(
        `/api/offline-empowerment/scheduling?store_id=${selectedStore}&days=7&language=${selectedLanguage}`
      );
      const data = await response.json();
      if (data.success) {
        setSchedulingData(data);
      }
    } catch (error) {
      console.error('加载排班数据失败:', error);
    }
  };

  const loadInventoryData = async () => {
    try {
      const response = await fetch(
        `/api/offline-empowerment/inventory-forecast?store_id=${selectedStore}&days=30&language=${selectedLanguage}`
      );
      const data = await response.json();
      if (data.success) {
        setInventoryData(data);
      }
    } catch (error) {
      console.error('加载库存数据失败:', error);
    }
  };

  const loadAuditData = async () => {
    try {
      const response = await fetch(
        `/api/offline-empowerment/store-audit?store_id=${selectedStore}&language=${selectedLanguage}`
      );
      const data = await response.json();
      if (data.success) {
        setAuditData(data);
      }
    } catch (error) {
      console.error('加载巡店数据失败:', error);
    }
  };

  const loadMarketingData = async () => {
    try {
      const response = await fetch(
        `/api/offline-empowerment/member-marketing?store_id=${selectedStore}&language=${selectedLanguage}`
      );
      const data = await response.json();
      if (data.success) {
        setMarketingData(data);
      }
    } catch (error) {
      console.error('加载营销数据失败:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
    } finally {
      setRefreshing(false);
    }
  };

  // 渲染概览
  const renderOverview = () => (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">日均客流</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {trafficData?.heatmap?.total_customers || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">排班效率</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {schedulingData?.cost_summary?.total_shifts || 0}班次
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">库存预警</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {inventoryData?.summary?.critical_items || 0}项
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">巡店得分</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {auditData?.current_audit?.overall_score || 0}分
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 会员概览 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">会员营销概览</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">会员总数</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {marketingData?.member_summary?.total_members || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">高风险流失</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {marketingData?.churn_analysis?.high_risk_members || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">营销预算</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${marketingData?.cost_estimate?.total_cost?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染客流分析
  const renderTraffic = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">客流热区分析</h3>
        {trafficData?.heatmap ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">高流量区</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {trafficData.heatmap.high_traffic_zone.percentage}%
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">中流量区</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {trafficData.heatmap.medium_traffic_zone.percentage}%
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">低流量区</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {trafficData.heatmap.low_traffic_zone.percentage}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">总客流量</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {trafficData.heatmap.total_customers}人
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">平均停留时间</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {Math.floor(trafficData.heatmap.avg_duration_seconds / 60)}分{trafficData.heatmap.avg_duration_seconds % 60}秒
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无数据</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">客流预测 (未来7天)</h3>
        {trafficData?.forecasts && trafficData.forecasts.length > 0 ? (
          <div className="space-y-2">
            {trafficData.forecasts.slice(0, 7).map((forecast: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">{forecast.date}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {forecast.lower_bound} - {forecast.upper_bound}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {forecast.predicted_customers}人
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无预测数据</p>
        )}
      </div>
    </div>
  );

  // 渲染智能排班
  const renderScheduling = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">排班成本汇总</h3>
        {schedulingData?.cost_summary ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">总成本</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${schedulingData.cost_summary.total_cost.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">常规工时成本</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${schedulingData.cost_summary.regular_hours_cost.toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">加班成本</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${schedulingData.cost_summary.overtime_hours_cost.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无数据</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">排班详情 (未来7天)</h3>
        {schedulingData?.schedules && schedulingData.schedules.length > 0 ? (
          <div className="space-y-3">
            {schedulingData.schedules.slice(0, 7).map((schedule: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{schedule.employee.position}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{schedule.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {schedule.start_time} - {schedule.end_time}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{schedule.hours}小时</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无排班数据</p>
        )}
      </div>
    </div>
  );

  // 渲染库存预测
  const renderInventory = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">库存预警汇总</h3>
        {inventoryData?.summary ? (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 mb-1">紧急缺货</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {inventoryData.summary.critical_items}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">低库存</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {inventoryData.summary.low_stock_items}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">库存积压</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {inventoryData.summary.overstocked_items}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">库存总值</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${inventoryData.summary.total_inventory_value.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无数据</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">补货建议</h3>
        {inventoryData?.recommendations && inventoryData.recommendations.length > 0 ? (
          <div className="space-y-3">
            {inventoryData.recommendations.slice(0, 10).map((rec: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{rec.product_name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">当前库存: {rec.current_quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white">
                    建议补货: {rec.suggested_order_quantity}
                  </p>
                  <p className={`text-sm ${
                    rec.urgency_level === 'critical' ? 'text-red-600 dark:text-red-400' :
                    rec.urgency_level === 'high' ? 'text-orange-600 dark:text-orange-400' :
                    'text-slate-600 dark:text-slate-400'
                  }`}>
                    {rec.status_label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无补货建议</p>
        )}
      </div>
    </div>
  );

  // 渲染AI巡店
  const renderAudit = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">巡店评分</h3>
        {auditData?.current_audit ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">综合得分</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {auditData.current_audit.overall_score}分
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">评级</p>
              <p className={`text-3xl font-bold ${
                auditData.current_audit.grade.startsWith('A') ? 'text-green-600 dark:text-green-400' :
                auditData.current_audit.grade.startsWith('B') ? 'text-blue-600 dark:text-blue-400' :
                'text-orange-600 dark:text-orange-400'
              }`}>
                {auditData.current_audit.grade}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">违规数</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {auditData.current_audit.total_violations}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无巡店数据</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">违规记录</h3>
        {auditData?.current_audit?.violations && auditData.current_audit.violations.length > 0 ? (
          <div className="space-y-3">
            {auditData.current_audit.violations.map((violation: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    violation.violation_severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                    violation.violation_severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    violation.violation_severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      violation.violation_severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                      violation.violation_severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                      violation.violation_severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-slate-600 dark:text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{violation.violation_label}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{violation.location_in_store}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  violation.violation_severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                  violation.violation_severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                  violation.violation_severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-slate-600 dark:text-slate-400'
                }`}>
                  {violation.violation_severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无违规记录</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">整改建议</h3>
        {auditData?.current_audit?.recommendations && auditData.current_audit.recommendations.length > 0 ? (
          <div className="space-y-3">
            {auditData.current_audit.recommendations.slice(0, 5).map((rec: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    rec.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                    rec.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <CheckCircle className={`h-5 w-5 ${
                      rec.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                      rec.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                      'text-slate-600 dark:text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{rec.issue}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{rec.action_required}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  rec.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                  rec.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                  'text-slate-600 dark:text-slate-400'
                }`}>
                  {rec.priority.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无建议</p>
        )}
      </div>
    </div>
  );

  // 渲染会员营销
  const renderMarketing = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">会员分布</h3>
        {marketingData?.member_summary ? (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">总会员数</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {marketingData.member_summary.total_members}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">VIP会员</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {marketingData.member_summary.tier_distribution?.vip || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">金牌会员</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {marketingData.member_summary.tier_distribution?.gold || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">营销授权率</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(marketingData.member_summary.marketing_consent_rate * 100)}%
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无数据</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">营销建议</h3>
        {marketingData?.marketing_recommendations && marketingData.marketing_recommendations.length > 0 ? (
          <div className="space-y-3">
            {marketingData.marketing_recommendations.slice(0, 10).map((rec: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Target className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{rec.campaign_type_label}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{rec.member_code} • {rec.membership_tier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white">{rec.channel}</p>
                  <p className={`text-sm ${
                    rec.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                    rec.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                    'text-slate-600 dark:text-slate-400'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">暂无营销建议</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
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
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900 dark:text-white">欧美线下渠道赋能</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Offline Channel Empowerment</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.store_name} ({store.city})
                  </option>
                ))}
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="fr">🇫🇷 Français</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-2">
              {[
                { id: 'overview' as TabType, label: '概览', icon: BarChart3 },
                { id: 'traffic' as TabType, label: '客流分析', icon: Users },
                { id: 'scheduling' as TabType, label: '智能排班', icon: Calendar },
                { id: 'inventory' as TabType, label: '库存预测', icon: Package },
                { id: 'audit' as TabType, label: 'AI巡店', icon: ShieldCheck },
                { id: 'marketing' as TabType, label: '会员营销', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-5">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'traffic' && renderTraffic()}
            {activeTab === 'scheduling' && renderScheduling()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'audit' && renderAudit()}
            {activeTab === 'marketing' && renderMarketing()}
          </div>
        </div>
      </div>

      {/* GDPR Notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm px-6 py-3">
        <div className="container mx-auto flex items-center justify-between text-sm text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>GDPR/CCPA Compliant • Data Anonymized • Privacy Protected</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Multi-language Support: EN/ES/DE/FR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
