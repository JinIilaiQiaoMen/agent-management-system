/**
 * ZAEP - 智元企业AI中台
 * 统一布局组件
 * 
 * 实现新的导航结构和UI布局
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, Globe, Building2, Smartphone, 
  Bot, Database, BookOpen, Settings,
  Cpu, Search, Bell, User, Menu, X
} from 'lucide-react';

// 导航配置
const NAV_ITEMS = [
  {
    category: '外贸业务',
    icon: Globe,
    color: 'text-blue-500',
    items: [
      { name: '智能客户背调', href: '/customer-due-diligence', desc: '对话式AI分析' },
      { name: '销售谈单助手', href: '/negotiation-assistant', desc: '实时建议支持' },
      { name: 'AI邮件生成', href: '/email-generator', desc: '多模板双语' },
      { name: '智能线索库', href: '/lead-qualification', desc: 'AI评分批量' },
    ]
  },
  {
    category: '企业管理',
    icon: Building2,
    color: 'text-green-500',
    items: [
      { name: '组织管理', href: '/hr-system/organization', desc: '部门岗位员工' },
      { name: '智能招聘', href: '/hr-system/recruitment', desc: '简历解析面试' },
      { name: '考勤系统', href: '/hr-system/attendance', desc: '打卡请假加班' },
      { name: '绩效管理', href: '/hr-system/performance', desc: 'KPI评估报表' },
      { name: '薪资管理', href: '/hr-system/salary', desc: '工资单发放' },
      { name: '财务审计', href: '/finance-audit', desc: '凭证对账报告' },
    ]
  },
  {
    category: '智能营销',
    icon: Smartphone,
    color: 'text-purple-500',
    items: [
      { name: '供应链智能', href: '/supply-chain', desc: '爆品预测库存' },
      { name: '跨境内容', href: '/pet-content-generator', desc: 'AI生成评分' },
      { name: '全渠道发布', href: '/domestic-platforms', desc: '30+平台一键' },
      { name: '线下赋能', href: '/offline-empowerment', desc: '客流排班巡店' },
    ]
  },
  {
    category: '智能体管理',
    icon: Bot,
    color: 'text-orange-500',
    items: [
      { name: 'Agent管理', href: '/agent-system', desc: '配置调试' },
      { name: '任务中心', href: '/tasks', desc: '创建分配追踪' },
      { name: '对话管理', href: '/conversations', desc: '多会话历史' },
      { name: '调度中心', href: '/openclaw-integration', desc: '工作流定时' },
    ]
  },
  {
    category: '数据获取',
    icon: Database,
    color: 'text-red-500',
    items: [
      { name: '数据采集', href: '/data-crawler', desc: '可视化AI识别' },
      { name: '批量采集', href: '/batch-crawl', desc: '20+格式反爬' },
      { name: '内容提取', href: '/content-extract', desc: '文章图片视频' },
      { name: '高级爬虫', href: '/advanced-crawl', desc: '反反爬动态' },
    ]
  },
  {
    category: '支撑系统',
    icon: BookOpen,
    color: 'text-yellow-500',
    items: [
      { name: '知识库管理', href: '/knowledge-base', desc: 'RAG向量检索' },
      { name: '系统监控', href: '/monitoring', desc: '性能日志' },
      { name: '数据治理', href: '/data-governance', desc: 'API网关模型' },
      { name: '资产管理', href: '/asset-management', desc: '采购入库领用' },
      { name: '合规审核', href: '/compliance-check', desc: '内容审核风控' },
    ]
  },
  {
    category: 'AI能力中台',
    icon: Cpu,
    color: 'text-cyan-500',
    items: [
      { name: '模型管理', href: '/ai-hub/models', desc: '配置切换' },
      { name: '路由配置', href: '/ai-hub/rules', desc: '智能路由' },
      { name: '用量统计', href: '/ai-hub/usage', desc: '成本分析' },
      { name: '成本分析', href: '/ai-hub/cost', desc: '优化建议' },
    ]
  },
];

/**
 * 主布局组件
 */
export default function ZAEPLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                智元AI中台
              </span>
            </Link>
          </div>

          {/* 搜索框 */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索功能..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </button>
            <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* 侧边栏 */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-gray-200 
        transform transition-transform duration-200 z-40
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <nav className="p-4 overflow-y-auto h-full">
          {NAV_ITEMS.map((category, idx) => (
            <div key={category.category} className="mb-4">
              <button
                onClick={() => setActiveCategory(activeCategory === idx ? -1 : idx)}
                className={`
                  flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left
                  ${activeCategory === idx ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}
                `}
              >
                <category.icon className={`w-5 h-5 ${category.color}`} />
                <span className="font-medium">{category.category}</span>
              </button>
              
              {activeCategory === idx && (
                <div className="mt-1 ml-4 space-y-1">
                  {category.items.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="pt-16 lg:pl-72">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export { NAV_ITEMS };
