'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface ApiConfig {
  id: string;
  name: string;
  description: string | null;
  api_url: string;
  api_type: string;
  method: string;
  status: string;
  created_at: string;
}

export default function ApiGatewayPage() {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    api_url: '',
    api_key: '',
    api_type: 'external',
    method: 'POST'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, [filterStatus, filterType]);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`/api/data-governance/api-configs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('加载API配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setFormData({
      name: '',
      description: '',
      api_url: '',
      api_key: '',
      api_type: 'external',
      method: 'POST'
    });
    setModalOpen(true);
  };

  const handleEdit = (config: ApiConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      description: config.description || '',
      api_url: config.api_url,
      api_key: '',
      api_type: config.api_type,
      method: config.method
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.api_url) {
      alert('请填写名称和API地址');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/data-governance/api-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setModalOpen(false);
        loadConfigs();
      } else {
        const data = await response.json();
        alert(data.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此API配置吗？')) return;

    try {
      const response = await fetch(`/api/data-governance/api-configs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadConfigs();
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const filteredConfigs = configs.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.api_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-slate-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/data-governance"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    API网关管理
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    统一管理所有外部API接口
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
              <span>添加API</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索API名称或地址..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">所有状态</option>
              <option value="active">激活</option>
              <option value="inactive">未激活</option>
              <option value="error">错误</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">所有类型</option>
              <option value="llm">LLM</option>
              <option value="external">外部API</option>
              <option value="internal">内部API</option>
            </select>
          </div>
        </div>

        {/* API List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Globe className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? '未找到匹配的API配置' : '暂无API配置'}
              </p>
              <button
                onClick={handleCreate}
                className="mt-4 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                添加第一个API配置
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      名称
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      API地址
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      类型
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      方法
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      状态
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredConfigs.map((config) => (
                    <tr key={config.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {config.name}
                          </p>
                          {config.description && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {config.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {config.api_url}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {config.api_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          {config.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(config.status)}
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {config.status === 'active' ? '激活' : config.status === 'inactive' ? '未激活' : '错误'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            title="编辑"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="rounded p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              {editingConfig ? '编辑API配置' : '添加API配置'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  API地址 *
                </label>
                <input
                  type="text"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  placeholder="https://api.example.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  API密钥
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="可选"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    类型
                  </label>
                  <select
                    value={formData.api_type}
                    onChange={(e) => setFormData({ ...formData, api_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="external">外部API</option>
                    <option value="llm">LLM</option>
                    <option value="internal">内部API</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    方法
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <span>{editingConfig ? '更新' : '创建'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
