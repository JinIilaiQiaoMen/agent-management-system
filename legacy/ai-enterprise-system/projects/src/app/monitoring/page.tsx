'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  Activity, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Zap
} from 'lucide-react';

export default function MonitoringPage() {
  const systemHealth = {
    status: 'healthy',
    uptime: '15天 8小时',
    lastCheck: '2024-02-27 10:30:00'
  };

  const modules = [
    {
      name: '客户背调系统',
      status: 'healthy',
      requests: 234,
      errors: 2,
      avgResponseTime: '1.2s'
    },
    {
      name: '谈单辅助系统',
      status: 'healthy',
      requests: 567,
      errors: 5,
      avgResponseTime: '0.8s'
    },
    {
      name: '邮件生成系统',
      status: 'warning',
      requests: 89,
      errors: 12,
      avgResponseTime: '2.3s'
    },
    {
      name: '线索筛选系统',
      status: 'healthy',
      requests: 156,
      errors: 1,
      avgResponseTime: '1.5s'
    },
    {
      name: '知识库系统',
      status: 'healthy',
      requests: 2847,
      errors: 8,
      avgResponseTime: '0.3s'
    },
    {
      name: 'LLM 服务',
      status: 'healthy',
      requests: 3893,
      errors: 45,
      avgResponseTime: '1.8s'
    }
  ];

  const recentLogs = [
    {
      id: '1',
      module: '邮件生成系统',
      action: 'generate_email',
      status: 'error',
      message: 'LLM API 超时',
      timestamp: '2024-02-27 10:28:15'
    },
    {
      id: '2',
      module: '谈单辅助系统',
      action: 'chat',
      status: 'success',
      message: '对话处理完成',
      timestamp: '2024-02-27 10:27:30'
    },
    {
      id: '3',
      module: '客户背调系统',
      action: 'analyze_company',
      status: 'success',
      message: '分析完成: ABC Technology',
      timestamp: '2024-02-27 10:25:00'
    },
    {
      id: '4',
      module: 'LLM 服务',
      action: 'invoke',
      status: 'warning',
      message: '响应时间较长 (3.2s)',
      timestamp: '2024-02-27 10:22:45'
    },
    {
      id: '5',
      module: '知识库系统',
      action: 'search',
      status: 'success',
      message: '检索到 5 条相关文档',
      timestamp: '2024-02-27 10:20:00'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  系统监控
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  性能监控与异常追踪
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* System Health */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  系统状态
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    运行时间: {systemHealth.uptime}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    最后检查: {systemHealth.lastCheck}
                  </span>
                </div>
              </div>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(systemHealth.status)}`}>
              运行正常
            </span>
          </div>
        </div>

        {/* Module Status */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            模块状态
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {module.name}
                  </h3>
                  {getStatusIcon(module.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">请求数</span>
                    <span className="font-medium text-slate-900 dark:text-white">{module.requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">错误数</span>
                    <span className={`font-medium ${module.errors > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                      {module.errors}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">平均响应</span>
                    <span className="font-medium text-slate-900 dark:text-white">{module.avgResponseTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <Server className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">CPU 使用率</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">45%</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">内存使用</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">3.2 GB</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">API 调用</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">7,836</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">错误率</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">0.8%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            最近日志
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                      模块
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                      操作
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                      消息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                      时间
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                        {log.module}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {log.action}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
