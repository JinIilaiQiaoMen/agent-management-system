'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Plus,
  Briefcase,
  UserPlus,
  FileText,
  Video,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'needs' | 'resumes' | 'interviews' | 'offers'>('needs');
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟招聘需求数据
  const mockNeeds = [
    {
      id: '1',
      position: '高级前端工程师',
      department: '技术部',
      headcount: 2,
      urgency: 'high',
      deadline: '2024-03-31',
      status: 'approved',
      applicants: 15,
      interviewed: 8,
      offered: 2
    },
    {
      id: '2',
      position: '产品经理',
      department: '产品部',
      headcount: 1,
      urgency: 'medium',
      deadline: '2024-04-15',
      status: 'pending',
      applicants: 8,
      interviewed: 0,
      offered: 0
    },
    {
      id: '3',
      position: '销售经理',
      department: '市场部',
      headcount: 3,
      urgency: 'high',
      deadline: '2024-03-20',
      status: 'approved',
      applicants: 25,
      interviewed: 12,
      offered: 5
    }
  ];

  // 模拟简历数据
  const mockResumes = [
    {
      id: '1',
      name: '张小明',
      position: '高级前端工程师',
      education: '本科',
      experience: 5,
      matchScore: 92,
      status: 'interviewing',
      source: '拉勾网',
      applyDate: '2024-02-20'
    },
    {
      id: '2',
      name: '李小红',
      position: '高级前端工程师',
      education: '硕士',
      experience: 6,
      matchScore: 88,
      status: 'screening',
      source: 'BOSS直聘',
      applyDate: '2024-02-18'
    },
    {
      id: '3',
      name: '王小明',
      position: '产品经理',
      education: '本科',
      experience: 4,
      matchScore: 85,
      status: 'new',
      source: '猎聘',
      applyDate: '2024-02-25'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[urgency] || colors.low;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      screening: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      interviewing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      offered: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      new: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝',
      screening: '筛选中',
      interviewing: '面试中',
      offered: '已发Offer',
      new: '新申请'
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
                href="/hr-system"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    智能招聘系统
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI简历筛选、智能邀约、AI面试
                  </p>
                </div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              新建招聘需求
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                招聘中职位
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {mockNeeds.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                收到简历
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {mockResumes.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                AI筛选完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                12
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                待处理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                5
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab 切换 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="needs">
              <Briefcase className="h-4 w-4 mr-2" />
              招聘需求
            </TabsTrigger>
            <TabsTrigger value="resumes">
              <FileText className="h-4 w-4 mr-2" />
              简历管理
            </TabsTrigger>
            <TabsTrigger value="interviews">
              <Video className="h-4 w-4 mr-2" />
              AI面试
            </TabsTrigger>
            <TabsTrigger value="offers">
              <DollarSign className="h-4 w-4 mr-2" />
              Offer管理
            </TabsTrigger>
          </TabsList>

          {/* 招聘需求 */}
          <TabsContent value="needs">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="搜索招聘需求..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {mockNeeds.map(need => (
                    <Card key={need.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {need.position}
                              </h3>
                              <Badge className={getUrgencyColor(need.urgency)}>
                                {need.urgency === 'high' ? '紧急' : need.urgency === 'medium' ? '一般' : '不急'}
                              </Badge>
                              <Badge className={getStatusColor(need.status)}>
                                {getStatusLabel(need.status)}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                              {need.department} • 招聘 {need.headcount} 人 • 截止日期：{need.deadline}
                            </div>
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="flex items-center space-x-2">
                                <UserPlus className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">申请：{need.applicants}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Video className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">面试：{need.interviewed}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400">Offer：{need.offered}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">查看详情</Button>
                            <Button size="sm">添加简历</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 简历管理 */}
          <TabsContent value="resumes">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="搜索候选人..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    导入简历
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockResumes.map(resume => (
                    <Card key={resume.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                              {resume.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {resume.position}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {resume.matchScore}
                            </div>
                            <div className="text-xs text-slate-500">匹配度</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                          <span>{resume.education}</span>
                          <span>•</span>
                          <span>{resume.experience}年经验</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500">来源：{resume.source}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{resume.applyDate}</span>
                          </div>
                          <Badge className={getStatusColor(resume.status)}>
                            {getStatusLabel(resume.status)}
                          </Badge>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" className="flex-1">查看简历</Button>
                          <Button size="sm" variant="outline">安排面试</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI面试 */}
          <TabsContent value="interviews">
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  AI面试功能开发中
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  支持 AI 面试邀约、语音视频面试、AI 评分等功能
                </p>
                <div className="max-w-md mx-auto bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>核心功能：</strong>
                    <br />• 自动发送面试邀约（短信/邮件）
                    <br />• AI 面试（语音/视频）
                    <br />• 自动语音转文字
                    <br />• AI 评分（逻辑、匹配度、表达能力）
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offer管理 */}
          <TabsContent value="offers">
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Offer管理功能开发中
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  支持 AI 生成 Offer、审批流程、电子签署等功能
                </p>
                <div className="max-w-md mx-auto bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>核心功能：</strong>
                    <br />• AI 自动生成标准化 Offer
                    <br />• Offer 审批流程
                    <br />• 电子签署
                    <br />• 接受/拒绝跟踪
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI 能力说明 */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
              AI 能力展示
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">AI 简历筛选</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  根据岗位要求自动分析简历，输出 0-100 分匹配度评分，以及匹配点和不匹配点
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">AI 面试评分</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  从逻辑清晰性、岗位匹配度、表达能力三个维度评分，生成面试评语
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
