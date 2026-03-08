'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Download,
  Package,
  DollarSign,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
  location: string;
  status: 'normal' | 'maintenance' | 'retired';
  purchaseDate: string;
  responsible: string;
}

export default function AssetListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // 模拟数据
  const mockAssets: Asset[] = [
    {
      id: '1',
      name: 'MacBook Pro M3',
      type: '电子设备',
      value: 15999,
      location: '北京',
      status: 'normal',
      purchaseDate: '2023-06-15',
      responsible: '张三'
    },
    {
      id: '2',
      name: '会议室投影仪',
      type: '办公设备',
      value: 8500,
      location: '上海',
      status: 'maintenance',
      purchaseDate: '2022-03-10',
      responsible: '李四'
    },
    {
      id: '3',
      name: '办公桌椅套装',
      type: '家具',
      value: 3200,
      location: '深圳',
      status: 'normal',
      purchaseDate: '2023-01-20',
      responsible: '王五'
    },
    {
      id: '4',
      name: '服务器 Dell PowerEdge',
      type: '电子设备',
      value: 45000,
      location: '北京',
      status: 'normal',
      purchaseDate: '2022-08-05',
      responsible: '赵六'
    },
    {
      id: '5',
      name: '旧打印机',
      type: '办公设备',
      value: 1200,
      location: '广州',
      status: 'retired',
      purchaseDate: '2020-11-15',
      responsible: '孙七'
    }
  ];

  const assetTypes = ['all', '电子设备', '办公设备', '家具', '其他'];

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      retired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || colors.normal;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      normal: '正常',
      maintenance: '维护中',
      retired: '已报废'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/asset-management"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    资产管理
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    统一管理企业固定资产
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加资产
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                资产总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {mockAssets.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                总价值
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                ¥{mockAssets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                正常使用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockAssets.filter(a => a.status === 'normal').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                需要维护
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockAssets.filter(a => a.status === 'maintenance').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索资产名称或负责人..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {assetTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? '所有类型' : type}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 资产列表 */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-500">未找到匹配的资产</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                        <Package className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {asset.type}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(asset.status)}>
                      {getStatusLabel(asset.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        价值：¥{asset.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        位置：{asset.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        购置日期：{asset.purchaseDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        负责人：{asset.responsible}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 说明 */}
        <Card className="mt-8 bg-gradient-to-r from-slate-50 to-teal-50 dark:from-slate-900 dark:to-teal-950">
          <CardHeader>
            <CardTitle className="text-base">💡 功能说明</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>当前展示的是模拟数据，实际使用时将从数据库加载真实资产信息</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>支持按名称、负责人搜索，以及按类型筛选</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>资产状态管理：正常、维护中、已报废</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>资产折旧计算和提醒功能正在开发中</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
