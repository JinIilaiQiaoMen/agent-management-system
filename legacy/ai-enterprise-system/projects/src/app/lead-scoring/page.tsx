'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Target,
  Search,
  Filter,
  Download,
  Loader2,
  Star,
  Building2,
  Mail,
  Globe,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  email: string | null;
  contactPerson: string | null;
  country: string | null;
  industry: string | null;
  score: number;
  status: string;
  priority: string;
  source: string;
  sourceUrl: string | null;
  createdAt: string;
}

export default function LeadScoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // 模拟数据
  const mockLeads: Lead[] = [
    {
      id: '1',
      companyName: 'ABC Technology',
      email: 'contact@abctech.com',
      contactPerson: 'John Smith',
      country: 'USA',
      industry: 'Electronics',
      score: 85,
      status: 'qualified',
      priority: 'high',
      source: 'LinkedIn',
      sourceUrl: 'https://linkedin.com/company/abctech',
      createdAt: '2024-02-20T10:30:00Z'
    },
    {
      id: '2',
      companyName: 'Global Solutions',
      email: 'info@globalsolutions.com',
      contactPerson: 'Sarah Johnson',
      country: 'UK',
      industry: 'Software',
      score: 72,
      status: 'new',
      priority: 'medium',
      source: 'Website',
      sourceUrl: 'https://globalsolutions.com',
      createdAt: '2024-02-19T15:45:00Z'
    },
    {
      id: '3',
      companyName: 'Innovate Corp',
      email: null,
      contactPerson: 'Mike Brown',
      country: 'Germany',
      industry: 'Manufacturing',
      score: 65,
      status: 'new',
      priority: 'medium',
      source: 'Exhibition',
      sourceUrl: null,
      createdAt: '2024-02-18T09:15:00Z'
    }
  ];

  const handleScrape = async () => {
    setLoading(true);
    setLeads([]);

    try {
      const response = await fetch('/api/lead-scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: ['LinkedIn', 'ThomasNet', 'Alibaba'],
          keywords: searchTerm,
          industry: selectedIndustry
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '抓取失败');
      }

      setLeads(data.leads || []);
    } catch (error: any) {
      console.error('抓取线索失败:', error);
      alert(error.message || '抓取线索失败，请稍后重试');
      // 如果API失败，使用模拟数据作为fallback
      setLeads(mockLeads);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      qualified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || colors.new;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[priority] || colors.medium;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    线索筛选系统
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    智能评分与自动抓取
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <BookOpen className="h-4 w-4" />
                <span>使用说明</span>
              </button>
              <button
                onClick={handleScrape}
                disabled={loading}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>抓取线索</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <Download className="h-4 w-4" />
                <span>导出</span>
              </button>
            </div>
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
                  placeholder="搜索公司、联系人或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">所有状态</option>
              <option value="new">新线索</option>
              <option value="qualified">已合格</option>
              <option value="contacted">已联系</option>
              <option value="converted">已转化</option>
              <option value="rejected">已拒绝</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">所有优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                    公司信息
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                    联系人
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                    地区/行业
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                    评分
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                    优先级
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                    来源
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <Target className="h-12 w-12 mb-3 opacity-50" />
                        <p>暂无线索数据，点击"抓取线索"开始</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {lead.companyName}
                            </div>
                            {lead.sourceUrl && (
                              <a
                                href={lead.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                <Globe className="h-3 w-3" />
                                <span>查看网站</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {lead.contactPerson || '-'}
                          </div>
                          {lead.email && (
                            <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400">
                              <Mail className="h-3 w-3" />
                              <span>{lead.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-slate-900 dark:text-white">
                            {lead.country || '-'}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {lead.industry || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Star className={`h-4 w-4 ${getScoreColor(lead.score)}`} />
                          <span className={`text-sm font-semibold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {lead.source}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 使用说明模态框 */}
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
              <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">线索筛选系统使用说明</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">智能评分与线索捕获指南</p>
                  </div>
                  <button
                    onClick={() => setShowGuide(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* 快速开始 */}
                <section>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-sm">1</span>
                    快速开始
                  </h3>
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                    <p className="text-slate-700 dark:text-slate-300 mb-3">通过以下 3 个步骤开始使用：</p>
                    <ol className="space-y-2 text-slate-600 dark:text-slate-400">
                      <li className="flex items-start">
                        <span className="mr-2 font-semibold text-blue-600">•</span>
                        <span>在搜索框输入关键词（公司名称、行业、产品等）</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 font-semibold text-blue-600">•</span>
                        <span>点击<strong>「抓取线索」</strong>按钮，系统会从多个数据源自动抓取</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 font-semibold text-blue-600">•</span>
                        <span>查看抓取结果，按评分筛选高价值线索</span>
                      </li>
                    </ol>
                  </div>
                </section>

                {/* 如何捕获线索 */}
                <section>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 text-sm">2</span>
                    如何捕获线索
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-purple-200 p-4 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">方法 1：自动抓取（推荐）</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">点击「抓取线索」，系统从 LinkedIn、ThomasNet 等平台批量抓取</p>
                      <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                        <li>✅ 支持多个数据源</li>
                        <li>✅ 自动评分排序</li>
                        <li>✅ 批量获取效率高</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-indigo-200 p-4 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">方法 2：手动搜索</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">使用搜索框输入关键词，精准查找特定线索</p>
                      <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                        <li>✅ 精准控制</li>
                        <li>✅ 快速定位</li>
                        <li>✅ 适合目标明确的情况</li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-blue-200 p-4 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">方法 3：批量导入</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">导入已有的 Excel 或 CSV 格式的线索数据</p>
                      <ul className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                        <li>✅ 支持现有数据</li>
                        <li>✅ 自动评分</li>
                        <li>✅ 统一管理</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 评分说明 */}
                <section>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-sm">3</span>
                    线索评分说明
                  </h3>
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">系统采用多维度评分模型，总分为 100 分，包含以下维度：</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">行业相关性</span>
                            <span className="text-blue-600 font-semibold">30 分</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">公司规模潜力</span>
                            <span className="text-purple-600 font-semibold">25 分</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">市场吸引力</span>
                            <span className="text-green-600 font-semibold">25 分</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">网站质量</span>
                            <span className="text-orange-600 font-semibold">20 分</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: '20%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">总分等级：</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium dark:bg-green-900/30 dark:text-green-400">80-100：高价值（立即跟进）</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium dark:bg-yellow-900/30 dark:text-yellow-400">60-79：中高价值（优先跟进）</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium dark:bg-orange-900/30 dark:text-orange-400">40-59：中等价值（适时跟进）</span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium dark:bg-red-900/30 dark:text-red-400">0-39：低价值（暂缓）</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 使用流程 */}
                <section>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-sm">4</span>
                    完整使用流程
                  </h3>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold mr-3">1</div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">定义目标</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">明确您要找的行业、产品、目标市场</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold mr-3">2</div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">配置数据源</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">选择合适的数据源（LinkedIn、ThomasNet、Alibaba）</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold mr-3">3</div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">执行抓取</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">点击「抓取线索」，等待 1-3 分钟</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold mr-3">4</div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">筛选线索</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">按评分、状态、优先级筛选高分线索</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold mr-3">5</div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">导出联系</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">导出 Excel，使用邮件生成系统发送开发信</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 最佳实践 */}
                <section>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-sm">5</span>
                    最佳实践
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        推荐做法
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-start">
                          <span className="mr-2 text-green-500">✓</span>
                          <span>每周定期抓取新线索，保持线索池新鲜</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-green-500">✓</span>
                          <span>优先跟进 80 分以上的高价值线索</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-green-500">✓</span>
                          <span>联系前查看公司网站，了解业务背景</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-green-500">✓</span>
                          <span>使用邮件生成系统编写个性化开发信</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-green-500">✓</span>
                          <span>记录联系历史，持续跟进</span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        避免误区
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-start">
                          <span className="mr-2 text-red-500">✗</span>
                          <span>不要只抓取一次就停止，定期更新</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-red-500">✗</span>
                          <span>不要忽视低分线索，可能隐藏机会</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-red-500">✗</span>
                          <span>不要群发通用邮件，要个性化沟通</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-red-500">✗</span>
                          <span>不要一次没回复就放弃，持续跟进</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-red-500">✗</span>
                          <span>不要忽略记录联系历史，便于分析</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 常见问题 */}
                <section>
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 text-sm">6</span>
                    常见问题
                  </h3>
                  <div className="space-y-3">
                    <details className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                      <summary className="cursor-pointer p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700">
                        抓取到的线索数量很少怎么办？
                      </summary>
                      <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                        <p>尝试以下方法：</p>
                        <ul className="mt-2 space-y-1">
                          <li>• 扩大关键词范围（使用同义词）</li>
                          <li>• 增加目标国家或地区</li>
                          <li>• 尝试不同的数据源</li>
                          <li>• 使用更通用的关键词</li>
                        </ul>
                      </div>
                    </details>
                    <details className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                      <summary className="cursor-pointer p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700">
                        如何判断线索的真实性？
                      </summary>
                      <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                        <p>建议进行以下验证：</p>
                        <ul className="mt-2 space-y-1">
                          <li>• 检查公司网站是否正规</li>
                          <li>• 在 LinkedIn 查看公司页面</li>
                          <li>• 搜索公司名称和相关评论</li>
                          <li>• 尝试发送测试邮件</li>
                          <li>• 使用第三方工具验证（如 D&B）</li>
                        </ul>
                      </div>
                    </details>
                    <details className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                      <summary className="cursor-pointer p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700">
                        当前数据源是模拟的吗？
                      </summary>
                      <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                        <p>是的，当前版本的数据源是模拟的演示数据。在实际使用中，您需要：</p>
                        <ul className="mt-2 space-y-1">
                          <li>• 配置真实的 API 接口（如 LinkedIn API、ThomasNet API）</li>
                          <li>• 或者通过「批量导入」功能导入您的线索数据</li>
                          <li>• 联系管理员获取真实数据源接入帮助</li>
                        </ul>
                      </div>
                    </details>
                    <details className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                      <summary className="cursor-pointer p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700">
                        如何提高线索转化率？
                      </summary>
                      <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                        <p>提升转化率的建议：</p>
                        <ul className="mt-2 space-y-1">
                          <li>• 优化筛选：只跟进真正相关的线索</li>
                          <li>• 个性化沟通：根据线索特点定制开发信</li>
                          <li>• 及时跟进：快速响应客户咨询</li>
                          <li>• 持续跟进：不要一次没回复就放弃</li>
                          <li>• 提供价值：在沟通中提供有用的信息</li>
                          <li>• 学习改进：分析成功案例，总结经验</li>
                        </ul>
                      </div>
                    </details>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
