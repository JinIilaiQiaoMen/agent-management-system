"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApiRoute {
  route: string;
  url: string;
  status: number;
  success: boolean;
  isJson: boolean;
  contentType: string | null;
  error: string | null;
  responseTime: number;
}

export default function ApiMonitorPage() {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // 模拟API路由列表
  const apiRoutes = [
    '/api/health',
    '/api/agents',
    '/api/tasks',
    '/api/knowledge-bases',
    '/api/documents',
    '/api/achievements',
  ];

  // 测试单个API路由
  const testRoute = async (route: string): Promise<ApiRoute> => {
    const startTime = Date.now();

    try {
      const response = await fetch(route, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const endTime = Date.now();
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json') ?? false;

      return {
        route,
        url: route,
        status: response.status,
        success: response.ok && isJson,
        isJson: isJson,
        contentType,
        error: null,
        responseTime: endTime - startTime,
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        route,
        url: route,
        status: 0,
        success: false,
        isJson: false,
        contentType: null,
        error: error instanceof Error ? error.message : String(error),
        responseTime: endTime - startTime,
      };
    }
  };

  // 测试所有路由
  const testAllRoutes = async () => {
    setLoading(true);
    const results: ApiRoute[] = [];

    for (const route of apiRoutes) {
      const result = await testRoute(route);
      results.push(result);
    }

    setRoutes(results);
    setLastChecked(new Date());
    setLoading(false);
  };

  // 首次加载时测试
  useEffect(() => {
    testAllRoutes();
  }, []);

  // 获取状态图标
  const getStatusIcon = (route: ApiRoute) => {
    if (!route.success) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (route.status >= 200 && route.status < 300) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (route.status >= 400 && route.status < 500) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  // 获取状态徽章
  const getStatusBadge = (route: ApiRoute) => {
    if (!route.success) {
      return <Badge variant="destructive">失败</Badge>;
    }
    if (route.status >= 200 && route.status < 300) {
      return <Badge variant="default">成功</Badge>;
    }
    if (route.status >= 400 && route.status < 500) {
      return <Badge variant="secondary">客户端错误</Badge>;
    }
    return <Badge variant="destructive">服务器错误</Badge>;
  };

  // 计算统计信息
  const stats = {
    total: routes.length,
    success: routes.filter((r) => r.success).length,
    failed: routes.filter((r) => !r.success).length,
    avgResponseTime:
      routes.reduce((acc, r) => acc + r.responseTime, 0) / routes.length || 0,
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API 状态监控</h1>
        <p className="text-muted-foreground">
          实时监控所有API路由的运行状态
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">总路由数</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">成功</div>
          <div className="text-2xl font-bold text-green-500">
            {stats.success}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">失败</div>
          <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">平均响应时间</div>
          <div className="text-2xl font-bold">
            {stats.avgResponseTime.toFixed(0)}ms
          </div>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {lastChecked && `最后检查: ${lastChecked.toLocaleString()}`}
        </div>
        <Button onClick={testAllRoutes} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 路由列表 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>路由</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>状态码</TableHead>
              <TableHead>JSON格式</TableHead>
              <TableHead>响应时间</TableHead>
              <TableHead>错误</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.route}>
                <TableCell className="font-medium">{route.route}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(route)}
                    {getStatusBadge(route)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={route.status >= 200 && route.status < 300 ? 'default' : 'destructive'}>
                    {route.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {route.isJson ? (
                    <Badge variant="default">JSON</Badge>
                  ) : (
                    <Badge variant="secondary">非JSON</Badge>
                  )}
                </TableCell>
                <TableCell>{route.responseTime}ms</TableCell>
                <TableCell className="max-w-xs truncate">
                  {route.error || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
