'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  MoreVertical,
  Calculator,
  FileText,
  Download,
  Upload,
  Info,
  Users,
  ArrowLeft,
} from 'lucide-react';

interface SocialInsuranceConfig {
  id: string;
  city: string;
  year: number;
  pension_employee_rate: number;
  pension_company_rate: number;
  medical_employee_rate: number;
  medical_company_rate: number;
  unemployment_employee_rate: number;
  unemployment_company_rate: number;
  injury_company_rate: number;
  maternity_company_rate: number;
  min_base: number;
  max_base: number;
  is_active: boolean;
}

interface EmployeeSocialInsurance {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_department: string;
  pension_base: number;
  medical_base: number;
  unemployment_base: number;
  start_date: string;
  end_date: string | null;
  status: string;
  total_employee_amount: number;
  total_company_amount: number;
}

interface SocialInsuranceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  record_month: string;
  pension_base: number;
  pension_employee_amount: number;
  pension_company_amount: number;
  medical_base: number;
  medical_employee_amount: number;
  medical_company_amount: number;
  unemployment_base: number;
  unemployment_employee_amount: number;
  unemployment_company_amount: number;
  total_employee_amount: number;
  total_company_amount: number;
  payment_status: string;
  payment_date: string | null;
}

interface HousingFundConfig {
  id: string;
  city: string;
  year: number;
  employee_rate: number;
  company_rate: number;
  min_base: number;
  max_base: number;
  is_active: boolean;
}

interface EmployeeHousingFund {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_department: string;
  fund_base: number;
  start_date: string;
  end_date: string | null;
  status: string;
  employee_amount: number;
  company_amount: number;
}

interface HousingFundRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  record_month: string;
  fund_base: number;
  employee_amount: number;
  company_amount: number;
  total_amount: number;
  payment_status: string;
  payment_date: string | null;
}

const mockSocialInsuranceConfigs: SocialInsuranceConfig[] = [
  {
    id: '1',
    city: '北京',
    year: 2025,
    pension_employee_rate: 0.08,
    pension_company_rate: 0.16,
    medical_employee_rate: 0.02,
    medical_company_rate: 0.10,
    unemployment_employee_rate: 0.005,
    unemployment_company_rate: 0.005,
    injury_company_rate: 0.005,
    maternity_company_rate: 0.008,
    min_base: 5360.0,
    max_base: 33891.0,
    is_active: true,
  },
  {
    id: '2',
    city: '上海',
    year: 2025,
    pension_employee_rate: 0.08,
    pension_company_rate: 0.16,
    medical_employee_rate: 0.02,
    medical_company_rate: 0.10,
    unemployment_employee_rate: 0.005,
    unemployment_company_rate: 0.005,
    injury_company_rate: 0.005,
    maternity_company_rate: 0.008,
    min_base: 6520.0,
    max_base: 36549.0,
    is_active: true,
  },
];

const mockEmployeeSocialInsurance: EmployeeSocialInsurance[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: '张三',
    employee_department: '研发部',
    pension_base: 12000.0,
    medical_base: 12000.0,
    unemployment_base: 12000.0,
    start_date: '2024-01-01',
    end_date: null,
    status: 'active',
    total_employee_amount: 1236.0,
    total_company_amount: 2754.0,
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: '李四',
    employee_department: '销售部',
    pension_base: 10000.0,
    medical_base: 10000.0,
    unemployment_base: 10000.0,
    start_date: '2024-03-01',
    end_date: null,
    status: 'active',
    total_employee_amount: 1030.0,
    total_company_amount: 2295.0,
  },
];

const mockSocialInsuranceRecords: SocialInsuranceRecord[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: '张三',
    record_month: '2025-01',
    pension_base: 12000.0,
    pension_employee_amount: 960.0,
    pension_company_amount: 1920.0,
    medical_base: 12000.0,
    medical_employee_amount: 240.0,
    medical_company_amount: 1200.0,
    unemployment_base: 12000.0,
    unemployment_employee_amount: 60.0,
    unemployment_company_amount: 60.0,
    total_employee_amount: 1260.0,
    total_company_amount: 3180.0,
    payment_status: 'paid',
    payment_date: '2025-01-10',
  },
];

const mockHousingFundConfigs: HousingFundConfig[] = [
  {
    id: '1',
    city: '北京',
    year: 2025,
    employee_rate: 0.12,
    company_rate: 0.12,
    min_base: 2420.0,
    max_base: 33891.0,
    is_active: true,
  },
  {
    id: '2',
    city: '上海',
    year: 2025,
    employee_rate: 0.07,
    company_rate: 0.07,
    min_base: 2590.0,
    max_base: 36549.0,
    is_active: true,
  },
];

const mockEmployeeHousingFund: EmployeeHousingFund[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: '张三',
    employee_department: '研发部',
    fund_base: 12000.0,
    start_date: '2024-01-01',
    end_date: null,
    status: 'active',
    employee_amount: 1440.0,
    company_amount: 1440.0,
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: '李四',
    employee_department: '销售部',
    fund_base: 10000.0,
    start_date: '2024-03-01',
    end_date: null,
    status: 'active',
    employee_amount: 1200.0,
    company_amount: 1200.0,
  },
];

const mockHousingFundRecords: HousingFundRecord[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: '张三',
    record_month: '2025-01',
    fund_base: 12000.0,
    employee_amount: 1440.0,
    company_amount: 1440.0,
    total_amount: 2880.0,
    payment_status: 'paid',
    payment_date: '2025-01-10',
  },
];

export default function BenefitsPage() {
  const [activeTab, setActiveTab] = useState('social-insurance');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string }> = {
      active: { label: '正常', variant: 'success' },
      suspended: { label: '暂停', variant: 'secondary' },
      terminated: { label: '终止', variant: 'destructive' },
      paid: { label: '已缴纳', variant: 'success' },
      unpaid: { label: '未缴纳', variant: 'destructive' },
      partial: { label: '部分缴纳', variant: 'default' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/hr-system"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                社保公积金管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                管理员工社保和公积金缴纳、查询历史记录
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calculator className="h-4 w-4" />
              费用计算器
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              导出报表
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              批量缴纳
            </Button>
          </div>
        </div>

        {/* 功能说明卡片 */}
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              社保公积金管理系统
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">社保管理</div>
                  <div className="text-sm text-white/80">五险一金社保配置</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">公积金管理</div>
                  <div className="text-sm text-white/80">住房公积金缴纳</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">自动计算</div>
                  <div className="text-sm text-white/80">智能计算缴纳金额</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">报表导出</div>
                  <div className="text-sm text-white/80">生成缴纳明细报表</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  本月社保总额
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">¥89,400</div>
              <p className="text-xs text-slate-500 mt-1">单位+个人</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  本月公积金总额
                </CardTitle>
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">¥67,200</div>
              <p className="text-xs text-slate-500 mt-1">单位+个人</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  缴纳人数
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">148</div>
              <p className="text-xs text-slate-500 mt-1">人在缴</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  未缴纳金额
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">¥12,800</div>
              <p className="text-xs text-slate-500 mt-1">待支付</p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social-insurance" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              社保管理
            </TabsTrigger>
            <TabsTrigger value="housing-fund" className="gap-2">
              <Building2 className="h-4 w-4" />
              公积金管理
            </TabsTrigger>
          </TabsList>

          {/* 社保管理 */}
          <TabsContent value="social-insurance" className="space-y-4">
            <Tabs defaultValue="employees" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="employees">员工社保</TabsTrigger>
                  <TabsTrigger value="records">缴纳记录</TabsTrigger>
                  <TabsTrigger value="config">费率配置</TabsTrigger>
                </TabsList>
              </div>

              {/* 员工社保 */}
              <TabsContent value="employees">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>员工社保配置</CardTitle>
                        <CardDescription>查看和管理员工社保基数和状态</CardDescription>
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        新增配置
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>员工姓名</TableHead>
                          <TableHead>部门</TableHead>
                          <TableHead>养老基数</TableHead>
                          <TableHead>医疗基数</TableHead>
                          <TableHead>失业基数</TableHead>
                          <TableHead>个人金额</TableHead>
                          <TableHead>公司金额</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockEmployeeSocialInsurance.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.employee_name}
                            </TableCell>
                            <TableCell>{record.employee_department}</TableCell>
                            <TableCell>¥{record.pension_base.toLocaleString()}</TableCell>
                            <TableCell>¥{record.medical_base.toLocaleString()}</TableCell>
                            <TableCell>¥{record.unemployment_base.toLocaleString()}</TableCell>
                            <TableCell>
                              ¥{record.total_employee_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ¥{record.total_company_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 缴纳记录 */}
              <TabsContent value="records">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>社保缴纳记录</CardTitle>
                        <CardDescription>查看历史缴纳记录和状态</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="2025-01">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="月份" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2025-01">2025年1月</SelectItem>
                            <SelectItem value="2024-12">2024年12月</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          导出
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>员工姓名</TableHead>
                          <TableHead>月份</TableHead>
                          <TableHead>养老</TableHead>
                          <TableHead>医疗</TableHead>
                          <TableHead>失业</TableHead>
                          <TableHead>个人总额</TableHead>
                          <TableHead>公司总额</TableHead>
                          <TableHead>缴纳状态</TableHead>
                          <TableHead>缴纳日期</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSocialInsuranceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.employee_name}
                            </TableCell>
                            <TableCell>{record.record_month}</TableCell>
                            <TableCell>
                              {record.pension_employee_amount +
                                record.pension_company_amount}
                            </TableCell>
                            <TableCell>
                              {record.medical_employee_amount +
                                record.medical_company_amount}
                            </TableCell>
                            <TableCell>
                              {record.unemployment_employee_amount +
                                record.unemployment_company_amount}
                            </TableCell>
                            <TableCell>
                              ¥{record.total_employee_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ¥{record.total_company_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.payment_status)}</TableCell>
                            <TableCell>{record.payment_date || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 费率配置 */}
              <TabsContent value="config">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>社保费率配置</CardTitle>
                        <CardDescription>查看和配置各城市社保费率</CardDescription>
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        新增配置
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {mockSocialInsuranceConfigs.map((config) => (
                        <Card key={config.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {config.city} - {config.year}年
                              </CardTitle>
                              {config.is_active && (
                                <Badge variant="outline">生效中</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">养老个人</span>
                                <span className="font-medium">
                                  {(config.pension_employee_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">养老公司</span>
                                <span className="font-medium">
                                  {(config.pension_company_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">医疗个人</span>
                                <span className="font-medium">
                                  {(config.medical_employee_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">医疗公司</span>
                                <span className="font-medium">
                                  {(config.medical_company_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">失业个人</span>
                                <span className="font-medium">
                                  {(config.unemployment_employee_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">失业公司</span>
                                <span className="font-medium">
                                  {(config.unemployment_company_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">基数范围</span>
                              <span className="font-medium">
                                ¥{config.min_base.toLocaleString()} - ¥{config.max_base.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                查看
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* 公积金管理 */}
          <TabsContent value="housing-fund" className="space-y-4">
            <Tabs defaultValue="employees" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="employees">员工公积金</TabsTrigger>
                  <TabsTrigger value="records">缴纳记录</TabsTrigger>
                  <TabsTrigger value="config">费率配置</TabsTrigger>
                </TabsList>
              </div>

              {/* 员工公积金 */}
              <TabsContent value="employees">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>员工公积金配置</CardTitle>
                        <CardDescription>查看和管理员工公积金基数和状态</CardDescription>
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        新增配置
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>员工姓名</TableHead>
                          <TableHead>部门</TableHead>
                          <TableHead>公积金基数</TableHead>
                          <TableHead>个人金额</TableHead>
                          <TableHead>公司金额</TableHead>
                          <TableHead>总金额</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockEmployeeHousingFund.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.employee_name}
                            </TableCell>
                            <TableCell>{record.employee_department}</TableCell>
                            <TableCell>¥{record.fund_base.toLocaleString()}</TableCell>
                            <TableCell>
                              ¥{record.employee_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ¥{record.company_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ¥{(record.employee_amount + record.company_amount).toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 缴纳记录 */}
              <TabsContent value="records">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>公积金缴纳记录</CardTitle>
                        <CardDescription>查看历史缴纳记录和状态</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="2025-01">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="月份" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2025-01">2025年1月</SelectItem>
                            <SelectItem value="2024-12">2024年12月</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          导出
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>员工姓名</TableHead>
                          <TableHead>月份</TableHead>
                          <TableHead>公积金基数</TableHead>
                          <TableHead>个人金额</TableHead>
                          <TableHead>公司金额</TableHead>
                          <TableHead>总金额</TableHead>
                          <TableHead>缴纳状态</TableHead>
                          <TableHead>缴纳日期</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockHousingFundRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.employee_name}
                            </TableCell>
                            <TableCell>{record.record_month}</TableCell>
                            <TableCell>¥{record.fund_base.toLocaleString()}</TableCell>
                            <TableCell>¥{record.employee_amount.toLocaleString()}</TableCell>
                            <TableCell>¥{record.company_amount.toLocaleString()}</TableCell>
                            <TableCell>¥{record.total_amount.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(record.payment_status)}</TableCell>
                            <TableCell>{record.payment_date || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 费率配置 */}
              <TabsContent value="config">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>公积金费率配置</CardTitle>
                        <CardDescription>查看和配置各城市公积金费率</CardDescription>
                      </div>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        新增配置
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {mockHousingFundConfigs.map((config) => (
                        <Card key={config.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {config.city} - {config.year}年
                              </CardTitle>
                              {config.is_active && (
                                <Badge variant="outline">生效中</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">个人费率</span>
                                <span className="font-medium">
                                  {(config.employee_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">公司费率</span>
                                <span className="font-medium">
                                  {(config.company_rate * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">基数范围</span>
                              <span className="font-medium">
                                ¥{config.min_base.toLocaleString()} - ¥{config.max_base.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                查看
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
