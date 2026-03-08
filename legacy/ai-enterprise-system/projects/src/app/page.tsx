'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  MessageSquare,
  Mail,
  Target,
  Database,
  Activity,
  Globe,
  FileText,
  LogOut,
  User,
  Loader2,
  Settings,
  Package,
  Building2,
  DollarSign,
  PenTool,
  Camera,
  Zap,
  Sparkles,
  Moon,
  Shield,
  Share2,
  Factory,
  MapPin,
  ShoppingBag,
  Cpu
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  features: string[];
  category: 'pet-business' | 'foreign-trade' | 'enterprise' | 'marketing';
}

export default function Dashboard() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'pet-business' | 'foreign-trade' | 'enterprise' | 'marketing'>('pet-business');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  const modules: Module[] = [
    // 宠物跨境业务模块（核心升级）
    {
      id: 'pet-content-generator',
      title: '宠物内容生成 Agent',
      description: '零成本生成 TikTok/Ins/亚马逊多语种文案、标题、关键词，适配欧美养宠用户习惯',
      icon: PenTool,
      href: '/pet-content-generator',
      color: 'emerald',
      features: ['多平台文案', '多语种支持', '零API成本', 'ComfyUI工作流'],
      category: 'pet-business'
    },
    {
      id: 'compliance-check',
      title: '内容合规审核 Agent',
      description: '自动检测内容合规性，规避平台规则、广告法、知识产权风险，无额外成本',
      icon: Shield,
      href: '/compliance-check',
      color: 'amber',
      features: ['平台规则', '广告法合规', '知识产权', '风险预警'],
      category: 'pet-business'
    },
    {
      id: 'social-media-automation',
      title: '社媒运营 Agent 矩阵',
      description: '7×24小时自动化社媒运营，智能回复、定时发布、用户分层、趋势分析',
      icon: Share2,
      href: '/social-media-automation',
      color: 'blue',
      features: ['多平台管理', '智能回复', '定时发布', '用户分层'],
      category: 'pet-business'
    },
    {
      id: 'supply-chain-ai',
      title: '工厂供应链 AI 协同',
      description: '爆品预测、库存管理、品控分析、成本核算，实现产销全链路 AI 协同',
      icon: Factory,
      href: '/supply-chain',
      color: 'indigo',
      features: ['爆品预测', '库存管理', '品控分析', '成本核算'],
      category: 'pet-business'
    },
    {
      id: 'offline-channels',
      title: '欧美线下渠道赋能',
      description: '客流热区分析、智能排班、库存动销预测、AI远程巡店、会员营销，GDPR/CCPA合规',
      icon: MapPin,
      href: '/offline-empowerment',
      color: 'violet',
      features: ['客流分析', '智能排班', '库存预测', 'AI巡店', '会员营销'],
      category: 'pet-business'
    },
    {
      id: 'ai-hub',
      title: 'AI 能力中台',
      description: '模型智能路由、缓存系统、用量监控，将付费 API 调用量压缩 80% 以上',
      icon: Cpu,
      href: '/ai-hub',
      color: 'cyan',
      features: ['模型路由', '智能缓存', '用量监控', '成本优化'],
      category: 'pet-business'
    },
    {
      id: 'domestic-platforms',
      title: '国内全渠道发布',
      description: '一键发布到淘宝、京东、抖音、小红书等30+主流平台，支持电商、社交、内容、直播多品类',
      icon: ShoppingBag,
      href: '/domestic-platforms',
      color: 'orange',
      features: ['30+平台', '一键发布', '定时计划', '全品类支持'],
      category: 'pet-business'
    },

    // 外贸业务模块
    {
      id: 'customer-analysis',
      title: '客户背调系统',
      description: '自动抓取客户信息，AI 深度分析企业背景、规模、行业地位',
      icon: FileText,
      href: '/customer-analysis',
      color: 'blue',
      features: ['网页抓取', 'AI 分析', '风险评估'],
      category: 'foreign-trade'
    },
    {
      id: 'chat-assistant',
      title: '谈单辅助系统',
      description: '实时 AI 对话助手，基于知识库提供专业回复建议',
      icon: MessageSquare,
      href: '/chat-assistant',
      color: 'purple',
      features: ['实时对话', '知识库支持', '智能推荐'],
      category: 'foreign-trade'
    },
    {
      id: 'email-generator',
      title: '邮件生成系统',
      description: '场景化模板，AI 个性化生成多语言开发信',
      icon: Mail,
      href: '/email-generator',
      color: 'green',
      features: ['场景模板', '个性化', '多语言'],
      category: 'foreign-trade'
    },
    {
      id: 'lead-scoring',
      title: '线索筛选系统',
      description: '自动抓取潜在客户，智能评分排序，批量筛选高质量线索',
      icon: Target,
      href: '/lead-scoring',
      color: 'orange',
      features: ['自动抓取', '智能评分', '批量处理'],
      category: 'foreign-trade'
    },

    // 企业管理模块
    {
      id: 'agent-system',
      title: '智能体管理系统',
      description: 'AI智能体协作与任务管理，自动生成智能体团队，智能对话与知识库',
      icon: Building2,
      href: '/agent-system',
      color: 'purple',
      features: ['智能体管理', '任务分配', '知识库', '流式对话'],
      category: 'enterprise'
    },
    {
      id: 'data-governance',
      title: '数据治理与API集成',
      description: '打通数据链路，建立统一数据模型/API网关，实现系统无缝同步',
      icon: Settings,
      href: '/data-governance',
      color: 'indigo',
      features: ['API网关', '数据模型', '系统集成'],
      category: 'enterprise'
    },
    {
      id: 'asset-management',
      title: '资产数字化管控',
      description: '一物一码体系，实现采购-入库-领用-报废全链路线上化',
      icon: Package,
      href: '/asset-management',
      color: 'teal',
      features: ['一物一码', '库存预警', '财务对接'],
      category: 'enterprise'
    },
    {
      id: 'hr-system',
      title: '智能人事系统',
      description: '自动化招聘-入职流程，AI简历筛选、面试评分、绩效薪酬',
      icon: Building2,
      href: '/hr-system',
      color: 'rose',
      features: ['智能招聘', '考勤排班', '绩效薪酬'],
      category: 'enterprise'
    },
    {
      id: 'finance-audit',
      title: '财务审计系统',
      description: 'AI比对模型，实现报销/对账自动化，异常检测与风险预警',
      icon: DollarSign,
      href: '/finance-audit',
      color: 'amber',
      features: ['报销管理', '对账自动化', '异常检测'],
      category: 'enterprise'
    },

    // 智能营销模块
    {
      id: 'marketing-content',
      title: '营销内容生成',
      description: '自动生成文案/短视频，调用本地素材库，个性化内容创作',
      icon: PenTool,
      href: '/marketing-content',
      color: 'pink',
      features: ['文案生成', '视频制作', '素材库'],
      category: 'marketing'
    },
    {
      id: 'customer-intelligence',
      title: '客户智能分析',
      description: '影像分析API，客户照片量化标注，方案匹配与报告生成',
      icon: Camera,
      href: '/customer-intelligence',
      color: 'violet',
      features: ['影像分析', '方案匹配', '报告生成'],
      category: 'marketing'
    },
    {
      id: 'knowledge-base',
      title: '知识库管理',
      description: 'RAG 知识库系统，文档向量化与语义检索，AI智能识别',
      icon: Database,
      href: '/knowledge-base',
      color: 'cyan',
      features: ['文档导入', '向量检索', '知识管理'],
      category: 'marketing'
    },
    {
      id: 'monitoring',
      title: '系统监控',
      description: '性能监控与异常处理，系统运行状态实时追踪与日志分析',
      icon: Activity,
      href: '/monitoring',
      color: 'red',
      features: ['性能监控', '异常处理', '日志分析'],
      category: 'marketing'
    }
  ];

  const categoryColors = {
    foreignTrade: {
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      text: 'text-blue-600 dark:text-blue-400'
    },
    enterprise: {
      bg: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    marketing: {
      bg: 'bg-gradient-to-r from-pink-500 to-rose-500',
      text: 'text-pink-600 dark:text-pink-400'
    }
  };

  const getModuleColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
      amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
      cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    };
    return colors[color] || colors.blue;
  };

  const getCategoryModules = (category: 'pet-business' | 'foreign-trade' | 'enterprise' | 'marketing') => {
    return modules.filter(m => m.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI 智能化企业系统
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  企业级 AI 全流程解决方案
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span>系统运行正常</span>
                  </div>
                  <Link
                    href="/tech-home"
                    className="hidden md:flex items-center space-x-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 transition-all hover:bg-purple-500/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>科技风格</span>
                  </Link>
                  <div className="flex items-center space-x-3 rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {user.role === 'admin' ? '管理员' : '用户'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">登出</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-cyan-600 hover:to-blue-700"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 分类标签页 */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('pet-business')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeCategory === 'pet-business'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🐾</span>
              <span>宠物跨境</span>
            </button>
            <button
              onClick={() => setActiveCategory('foreign-trade')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === 'foreign-trade'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🌍 外贸业务
            </button>
            <button
              onClick={() => setActiveCategory('enterprise')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === 'enterprise'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🏢 企业管理
            </button>
            <button
              onClick={() => setActiveCategory('marketing')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === 'marketing'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🚀 智能营销
            </button>
          </div>
        </div>

        {/* 模块卡片 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {getCategoryModules(activeCategory).map((module) => {
            const ModuleIcon = module.icon;
            return (
              <Link
                key={module.id}
                href={module.href}
                className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${getModuleColor(module.color)} flex-shrink-0`}>
                    <ModuleIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {module.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {module.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
                    <Zap className="h-5 w-5 text-slate-400 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 快速统计 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <StatCard
            icon={Sparkles}
            title="宠物模块"
            value="6"
            change="零成本 AI"
            trend="up"
            color="emerald"
          />
          <StatCard
            icon={Database}
            title="知识库文档"
            value={`${modules.length}+`}
            change="持续更新"
            trend="up"
            color="cyan"
          />
          <StatCard
            icon={Activity}
            title="系统模块"
            value="18"
            change="全功能覆盖"
            trend="up"
            color="purple"
          />
          <StatCard
            icon={Zap}
            title="AI 能力"
            value="∞"
            change="智能无限"
            trend="up"
            color="blue"
          />
        </div>

        {/* 系统简介 */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Globe className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <span>AI 智能化企业系统 - 宠物跨境专版</span>
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            针对宠物跨境业务升级的完整解决方案，集成 18 大核心模块，涵盖宠物跨境、外贸业务、企业管理、智能营销四大领域。
            通过 AI 能力中台实现零 API 成本，本地开源模型 + ComfyUI 工作流，实现内容生产全流程零人工、零付费。
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              🐾 宠物跨境
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              🌍 外贸业务
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
              🏢 企业管理
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400">
              🚀 智能营销
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ✨ <strong>核心优势：</strong>零 API 成本 • 本地开源模型 • ComfyUI 工作流 • 模型智能路由 • 智能缓存系统 • 实时用量监控
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, change, trend, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400'
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${colorClasses[color] || colorClasses.blue}`} />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{change}</p>
    </div>
  );
}
