/**
 * ZAEP - 智元企业AI中台
 * 首页
 */

import ZAEPLayout from '@/components/layout/ZAEPLayout';

export default function HomePage() {
  return (
    <ZAEPLayout>
      <div className="space-y-6">
        {/* 欢迎标题 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">欢迎使用智元AI中台</h1>
          <p className="mt-2 text-gray-600">企业级AI智能化管理平台 · 融合三大核心系统</p>
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard 
            title="客户背调" 
            desc="AI智能分析" 
            href="/customer-due-diligence"
            color="bg-blue-500"
          />
          <QuickCard 
            title="邮件生成" 
            desc="多模板双语" 
            href="/email-generator"
            color="bg-green-500"
          />
          <QuickCard 
            title="内容发布" 
            desc="30+平台" 
            href="/domestic-platforms"
            color="bg-purple-500"
          />
          <QuickCard 
            title="数据采集" 
            desc="智能爬虫" 
            href="/data-crawler"
            color="bg-orange-500"
          />
        </div>

        {/* 数据概览 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">数据概览</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="客户总数" value="125" />
            <StatCard label="活跃线索" value="89" />
            <StatCard label="待办任务" value="56" />
            <StatCard label="待审核" value="12" />
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">最近活动</h2>
          <div className="space-y-3">
            <ActivityItem time="10:30" action="客户背调" detail="完成对某科技公司的分析" />
            <ActivityItem time="10:15" action="邮件生成" detail="生成产品介绍邮件" />
            <ActivityItem time="09:45" action="数据采集" detail="完成竞品价格监控" />
            <ActivityItem time="09:30" action="任务派发" detail="创建本周销售跟进任务" />
          </div>
        </div>
      </div>
    </ZAEPLayout>
  );
}

function QuickCard({ title, desc, href, color }: { 
  title: string; 
  desc: string; 
  href: string;
  color: string;
}) {
  return (
    <a 
      href={href}
      className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <span className="text-white text-lg">→</span>
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </a>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function ActivityItem({ time, action, detail }: { 
  time: string; 
  action: string; 
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-sm text-gray-400 min-w-[60px]">{time}</div>
      <div>
        <div className="font-medium text-gray-900">{action}</div>
        <div className="text-sm text-gray-500">{detail}</div>
      </div>
    </div>
  );
}
