'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Target,
  Mail,
  Database,
  Package,
  Building2,
  DollarSign,
  PenTool,
  Camera,
  Brain,
  Activity,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  Hexagon,
  Cpu,
  Network,
  Shield
} from 'lucide-react';

export default function TechStyleHomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'all', name: '全部系统', icon: Hexagon, color: 'from-cyan-400 to-blue-500' },
    { id: 'foreign', name: '外贸业务', icon: Globe, color: 'from-purple-400 to-pink-500' },
    { id: 'enterprise', name: '企业管理', icon: Building2, color: 'from-blue-400 to-indigo-500' },
    { id: 'marketing', name: '智能营销', icon: TrendingUp, color: 'from-green-400 to-teal-500' }
  ];

  const modules = [
    // 外贸业务
    {
      id: 'customer-analysis',
      name: '客户背调系统',
      description: 'AI深度分析企业背景与风险',
      icon: Globe,
      category: 'foreign',
      status: 'active',
      color: 'purple',
      stats: { usage: 234, growth: '+12%' }
    },
    {
      id: 'chat-assistant',
      name: '谈单辅助系统',
      description: '实时对话助手，提升转化率',
      icon: Brain,
      category: 'foreign',
      status: 'active',
      color: 'pink',
      stats: { usage: 567, growth: '+28%' }
    },
    {
      id: 'email-generator',
      name: '邮件生成系统',
      description: '多语言场景化邮件生成',
      icon: Mail,
      category: 'foreign',
      status: 'active',
      color: 'green',
      stats: { usage: 189, growth: '+15%' }
    },
    {
      id: 'lead-scoring',
      name: '线索筛选系统',
      description: '智能评分与自动抓取',
      icon: Target,
      category: 'foreign',
      status: 'active',
      color: 'orange',
      stats: { usage: 423, growth: '+22%' }
    },
    // 企业管理
    {
      id: 'data-governance',
      name: '数据治理与API集成',
      description: '统一数据模型与API网关',
      icon: Database,
      category: 'enterprise',
      status: 'active',
      color: 'indigo',
      stats: { usage: 89, growth: '+8%' }
    },
    {
      id: 'asset-management',
      name: '资产数字化管控',
      description: '一物一码全流程管理',
      icon: Package,
      category: 'enterprise',
      status: 'pending',
      color: 'teal',
      stats: { usage: 0, growth: 'N/A' }
    },
    {
      id: 'hr-system',
      name: '智能人事系统',
      description: 'AI驱动的全流程人力资源',
      icon: Users,
      category: 'enterprise',
      status: 'pending',
      color: 'rose',
      stats: { usage: 0, growth: 'N/A' }
    },
    {
      id: 'finance-audit',
      name: '财务审计系统',
      description: 'AI智能财务与审计管理',
      icon: DollarSign,
      category: 'enterprise',
      status: 'pending',
      color: 'amber',
      stats: { usage: 0, growth: 'N/A' }
    },
    // 智能营销
    {
      id: 'marketing-content',
      name: '营销内容生成',
      description: 'AI驱动的智能内容创作',
      icon: PenTool,
      category: 'marketing',
      status: 'pending',
      color: 'pink',
      stats: { usage: 0, growth: 'N/A' }
    },
    {
      id: 'customer-intelligence',
      name: '客户智能分析',
      description: '影像分析与个性化方案',
      icon: Camera,
      category: 'marketing',
      status: 'pending',
      color: 'violet',
      stats: { usage: 0, growth: 'N/A' }
    },
    {
      id: 'knowledge-base',
      name: '知识库管理',
      description: '企业知识资产智能化管理',
      icon: Database,
      category: 'marketing',
      status: 'active',
      color: 'blue',
      stats: { usage: 2847, growth: '+35%' }
    },
    {
      id: 'monitoring',
      name: '系统监控',
      description: '性能监控与异常追踪',
      icon: Activity,
      category: 'marketing',
      status: 'active',
      color: 'red',
      stats: { usage: 999, growth: '+5%' }
    }
  ];

  const filteredModules = activeCategory === 'all'
    ? modules
    : modules.filter(m => m.category === activeCategory);

  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-rose-500',
    green: 'from-green-400 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    indigo: 'from-indigo-500 to-purple-500',
    teal: 'from-teal-400 to-cyan-500',
    rose: 'from-rose-500 to-pink-500',
    amber: 'from-amber-500 to-orange-500',
    violet: 'from-violet-500 to-purple-500',
    blue: 'from-blue-500 to-indigo-500',
    red: 'from-red-500 to-orange-500'
  };

  const bgGlowClasses: Record<string, string> = {
    purple: 'group-hover:shadow-purple-500/20',
    pink: 'group-hover:shadow-pink-500/20',
    green: 'group-hover:shadow-green-500/20',
    orange: 'group-hover:shadow-orange-500/20',
    indigo: 'group-hover:shadow-indigo-500/20',
    teal: 'group-hover:shadow-teal-500/20',
    rose: 'group-hover:shadow-rose-500/20',
    amber: 'group-hover:shadow-amber-500/20',
    violet: 'group-hover:shadow-violet-500/20',
    blue: 'group-hover:shadow-blue-500/20',
    red: 'group-hover:shadow-red-500/20'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* 动态粒子背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* 扫描线效果 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" style={{ animation: 'scan 3s linear infinite' }} />
      </div>

      <div className="relative z-10">
        {/* 顶部导航栏 */}
        <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 blur-lg opacity-50 animate-pulse" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600">
                    <Hexagon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI 智能化企业系统
                  </h1>
                  <p className="text-xs text-slate-400">Future Enterprise AI Platform</p>
                </div>
              </div>

              {/* 系统状态 */}
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-slate-300">系统运行正常</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <Cpu className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">12个模块</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-slate-300">{time.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="container mx-auto px-6 py-8">
          {/* 欢迎横幅 */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Welcome Back</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                探索智能化未来
              </h2>
              <p className="text-slate-300 max-w-2xl">
                AI驱动的全流程企业解决方案，赋能外贸、管理、营销三大领域，助力企业数字化转型
              </p>
              <div className="mt-6 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-slate-400">6个模块已激活</span>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse delay-100" />
                  <span className="text-sm text-slate-400">6个模块待激活</span>
                </div>
              </div>
            </div>
          </div>

          {/* 分类标签 */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 overflow-x-auto pb-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl border transition-all duration-300 whitespace-nowrap ${
                    activeCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} border-transparent shadow-lg shadow-purple-500/20`
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <cat.icon className={`h-5 w-5 ${activeCategory === cat.id ? 'text-white' : 'text-slate-400'}`} />
                  <span className={`font-medium ${activeCategory === cat.id ? 'text-white' : 'text-slate-300'}`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 模块卡片网格 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredModules.map((module, index) => (
              <Link
                key={module.id}
                href={`/${module.id}`}
                className={`group relative overflow-hidden rounded-2xl border bg-white/5 backdrop-blur-xl transition-all duration-500 hover:scale-105 ${
                  module.status === 'active'
                    ? 'border-white/20 hover:border-white/30'
                    : 'border-white/5 hover:border-white/10 opacity-60 hover:opacity-100'
                }`}
                style={{
                  animation: mounted ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                {/* 光晕效果 */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses[module.color]} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30 ${bgGlowClasses[module.color]}`} />

                {/* 卡片内容 */}
                <div className="relative p-6">
                  {/* 顶部图标 */}
                  <div className="mb-4">
                    <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[module.color]} shadow-lg ${bgGlowClasses[module.color]}`}>
                      <module.icon className="h-7 w-7 text-white" />
                      {module.status === 'active' && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-slate-900" />
                      )}
                    </div>
                  </div>

                  {/* 标题和描述 */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {module.description}
                  </p>

                  {/* 状态标签 */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      module.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${module.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'} ${module.status === 'active' ? 'animate-pulse' : ''}`} />
                      <span>{module.status === 'active' ? '已激活' : '待激活'}</span>
                    </span>
                  </div>

                  {/* 统计数据 */}
                  {module.stats.usage > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500">本月使用</span>
                        <span className="ml-2 font-semibold text-white">{module.stats.usage}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        module.stats.growth.startsWith('+') ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-semibold">{module.stats.growth}</span>
                      </div>
                    </div>
                  )}

                  {/* 底部箭头 */}
                  <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowRight className="h-5 w-5 text-cyan-400" />
                  </div>
                </div>

                {/* 底部发光线 */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colorClasses[module.color]} transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100`} />
              </Link>
            ))}
          </div>

          {/* 底部信息栏 */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                  <Network className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">API调用次数</p>
                  <p className="text-2xl font-bold text-white">128,459</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">AI处理请求</p>
                  <p className="text-2xl font-bold text-white">45,678</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">系统运行天数</p>
                  <p className="text-2xl font-bold text-white">365天</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
              </div>
            </div>
          </div>
        </main>

        {/* 底部版权 */}
        <footer className="border-t border-white/10 bg-black/30 backdrop-blur-xl mt-12">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div>© 2024 AI Enterprise Platform. All rights reserved.</div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span>系统正常运行</span>
                </span>
                <span>|</span>
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
