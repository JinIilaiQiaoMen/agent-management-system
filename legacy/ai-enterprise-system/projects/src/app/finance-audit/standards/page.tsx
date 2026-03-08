'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  ArrowLeft,
  Eye,
  Edit,
  Scale,
  DollarSign,
  Clock,
  Calendar,
  CreditCard,
  Building2,
  Users,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FinanceStandard {
  id: string;
  standard_name: string;
  standard_type: string;
  description: string;
  department: string;
  effective_date: string;
  is_active: boolean;
  version: string;
}

interface Budget {
  id: string;
  budget_year: string;
  budget_quarter: string;
  department: string;
  budget_type: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  utilization_rate: number;
  status: string;
  approved_at: string;
}

export default function StandardsPage() {
  const [activeTab, setActiveTab] = useState('standards');
  const [standards, setStandards] = useState<FinanceStandard[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNewStandardDialog, setShowNewStandardDialog] = useState(false);
  const [showNewBudgetDialog, setShowNewBudgetDialog] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<FinanceStandard | null>(null);

  // 新建制度表单
  const [newStandard, setNewStandard] = useState({
    standard_name: '',
    standard_type: '',
    description: '',
    department: 'all',
  });

  // 新建预算表单
  const [newBudget, setNewBudget] = useState({
    budget_year: '2025',
    budget_quarter: 'Q1',
    department: '',
    budget_type: 'operating',
    allocated_amount: '',
  });

  // 加载数据
  useEffect(() => {
    if (activeTab === 'standards') {
      loadStandards();
    } else {
      loadBudgets();
    }
  }, [activeTab, selectedYear, selectedQuarter]);

  const loadStandards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/finance-audit/standards?type=standards');
      const result = await response.json();

      if (result.success) {
        setStandards(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedQuarter) params.append('quarter', selectedQuarter);

      const response = await fetch(
        `/api/finance-audit/standards?type=budgets&${params}`
      );
      const result = await response.json();

      if (result.success) {
        setBudgets(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStandard = async () => {
    try {
      const response = await fetch('/api/finance-audit/standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'standard',
          standard_name: newStandard.standard_name,
          standard_type: newStandard.standard_type,
          description: newStandard.description,
          department: newStandard.department,
          effective_date: new Date().toISOString().split('T')[0],
          is_active: true,
          version: '1.0',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowNewStandardDialog(false);
        setNewStandard({
          standard_name: '',
          standard_type: '',
          description: '',
          department: 'all',
        });
        loadStandards();
      } else {
        alert('创建失败：' + result.error);
      }
    } catch (error) {
      alert('创建失败');
    }
  };

  const handleCreateBudget = async () => {
    try {
      const response = await fetch('/api/finance-audit/standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'budget',
          budget_year: newBudget.budget_year,
          budget_quarter: newBudget.budget_quarter,
          department: newBudget.department,
          budget_type: newBudget.budget_type,
          allocated_amount: parseFloat(newBudget.allocated_amount),
          spent_amount: 0,
          remaining_amount: parseFloat(newBudget.allocated_amount),
          utilization_rate: 0,
          status: 'active',
          approved_at: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowNewBudgetDialog(false);
        setNewBudget({
          budget_year: '2025',
          budget_quarter: 'Q1',
          department: '',
          budget_type: 'operating',
          allocated_amount: '',
        });
        loadBudgets();
      } else {
        alert('创建失败：' + result.error);
      }
    } catch (error) {
      alert('创建失败');
    }
  };

  const getStandardTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      expense_policy: '报销政策',
      travel_policy: '差旅政策',
      entertainment_policy: '招待政策',
      procurement_policy: '采购政策',
      budget_policy: '预算政策',
      financial_policy: '财务政策',
      tax_policy: '税务政策',
    };
    return typeLabels[type] || type;
  };

  const getBudgetStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string }> = {
      active: { label: '执行中', variant: 'default' },
      warning: { label: '预警', variant: 'destructive' },
      completed: { label: '已完成', variant: 'secondary' },
      pending: { label: '待审批', variant: 'secondary' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 95) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (rate >= 80) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    if (rate >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    return 'text-green-600 bg-green-50 dark:bg-green-900/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/finance-audit"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                财务标准
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                制度管理、预算控制、标准规范
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新建标准
          </Button>
        </div>

        {/* 功能说明卡片 */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              财务标准化管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">制度规范</div>
                  <div className="text-sm text-white/80">统一财务制度</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">标准管理</div>
                  <div className="text-sm text-white/80">费用标准控制</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">预算管理</div>
                  <div className="text-sm text-white/80">预算执行监控</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">合规检查</div>
                  <div className="text-sm text-white/80">自动合规检测</div>
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
                  财务制度
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{standards.length}</div>
              <p className="text-xs text-slate-500 mt-1">项有效制度</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  年度预算
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ¥
                {budgets
                  .reduce((sum, b) => sum + (b.allocated_amount || 0), 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">总预算</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  已执行
                </CardTitle>
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {budgets.length > 0
                  ? (
                      (budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0) /
                        budgets.reduce((sum, b) => sum + (b.allocated_amount || 0), 0)) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
              <p className="text-xs text-slate-500 mt-1">预算使用率</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  预警部门
                </CardTitle>
                <Building2 className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {budgets.filter((b) => b.status === 'warning').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">接近预算上限</p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standards" className="gap-2">
              <FileText className="h-4 w-4" />
              财务制度
            </TabsTrigger>
            <TabsTrigger value="budgets" className="gap-2">
              <Calendar className="h-4 w-4" />
              预算管理
            </TabsTrigger>
          </TabsList>

          {/* 财务制度 */}
          <TabsContent value="standards" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>财务制度</CardTitle>
                    <CardDescription>查看和管理财务制度规范</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowNewStandardDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    新建制度
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-slate-500">加载中...</div>
                ) : standards.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暂无财务制度</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>制度名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>部门</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>生效日期</TableHead>
                        <TableHead>版本</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standards.map((standard) => (
                        <TableRow key={standard.id}>
                          <TableCell className="font-medium">
                            {standard.standard_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getStandardTypeLabel(standard.standard_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {standard.department === 'all' ? '全公司' : standard.department}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {standard.description}
                          </TableCell>
                          <TableCell>{standard.effective_date}</TableCell>
                          <TableCell>v{standard.version}</TableCell>
                          <TableCell>
                            <Badge variant={standard.is_active ? 'default' : 'secondary'}>
                              {standard.is_active ? '生效' : '失效'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedStandard(standard);
                                  setShowDetailDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 预算管理 */}
          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>预算管理</CardTitle>
                    <CardDescription>查看和管理部门预算执行情况</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="年份" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025年</SelectItem>
                        <SelectItem value="2024">2024年</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="季度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">第一季度</SelectItem>
                        <SelectItem value="Q2">第二季度</SelectItem>
                        <SelectItem value="Q3">第三季度</SelectItem>
                        <SelectItem value="Q4">第四季度</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setShowNewBudgetDialog(true)}
                    >
                      <Plus className="h-4 w-4" />
                      新建预算
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-slate-500">加载中...</div>
                ) : budgets.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暂无预算记录</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>部门</TableHead>
                        <TableHead>预算类型</TableHead>
                        <TableHead>分配金额</TableHead>
                        <TableHead>已用金额</TableHead>
                        <TableHead>剩余金额</TableHead>
                        <TableHead>使用率</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgets.map((budget) => (
                        <TableRow key={budget.id}>
                          <TableCell className="font-medium">{budget.department}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {budget.budget_type === 'operating' ? '运营预算' : '资本预算'}
                            </Badge>
                          </TableCell>
                          <TableCell>¥{(budget.allocated_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>¥{(budget.spent_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>¥{(budget.remaining_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${getUtilizationColor(
                                budget.utilization_rate || 0
                              )}`}
                            >
                              {(budget.utilization_rate || 0).toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell>{getBudgetStatusBadge(budget.status)}</TableCell>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 查看详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>财务制度详情</DialogTitle>
          </DialogHeader>
          {selectedStandard && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">制度名称</Label>
                  <div className="font-semibold">{selectedStandard.standard_name}</div>
                </div>
                <div>
                  <Label className="text-slate-500">类型</Label>
                  <div>{getStandardTypeLabel(selectedStandard.standard_type)}</div>
                </div>
                <div>
                  <Label className="text-slate-500">生效日期</Label>
                  <div>{selectedStandard.effective_date}</div>
                </div>
                <div>
                  <Label className="text-slate-500">版本</Label>
                  <div>v{selectedStandard.version}</div>
                </div>
                <div>
                  <Label className="text-slate-500">部门</Label>
                  <div>
                    {selectedStandard.department === 'all'
                      ? '全公司'
                      : selectedStandard.department}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500">状态</Label>
                  <Badge variant={selectedStandard.is_active ? 'default' : 'secondary'}>
                    {selectedStandard.is_active ? '生效' : '失效'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-slate-500">描述</Label>
                <div className="mt-1">{selectedStandard.description}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 新建制度对话框 */}
      <Dialog open={showNewStandardDialog} onOpenChange={setShowNewStandardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建财务制度</DialogTitle>
            <DialogDescription>创建新的财务制度规范</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>制度名称</Label>
              <Input
                value={newStandard.standard_name}
                onChange={(e) =>
                  setNewStandard({ ...newStandard, standard_name: e.target.value })
                }
                placeholder="例如：报销标准管理制度"
              />
            </div>
            <div>
              <Label>制度类型</Label>
              <Select
                value={newStandard.standard_type}
                onValueChange={(value) =>
                  setNewStandard({ ...newStandard, standard_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择制度类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense_policy">报销政策</SelectItem>
                  <SelectItem value="travel_policy">差旅政策</SelectItem>
                  <SelectItem value="entertainment_policy">招待政策</SelectItem>
                  <SelectItem value="procurement_policy">采购政策</SelectItem>
                  <SelectItem value="budget_policy">预算政策</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                value={newStandard.description}
                onChange={(e) =>
                  setNewStandard({ ...newStandard, description: e.target.value })
                }
                placeholder="描述制度的内容和目的"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewStandardDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateStandard}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建预算对话框 */}
      <Dialog open={showNewBudgetDialog} onOpenChange={setShowNewBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建预算</DialogTitle>
            <DialogDescription>为部门创建新的预算</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>年份</Label>
                <Select
                  value={newBudget.budget_year}
                  onValueChange={(value) => setNewBudget({ ...newBudget, budget_year: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025年</SelectItem>
                    <SelectItem value="2024">2024年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>季度</Label>
                <Select
                  value={newBudget.budget_quarter}
                  onValueChange={(value) =>
                    setNewBudget({ ...newBudget, budget_quarter: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">第一季度</SelectItem>
                    <SelectItem value="Q2">第二季度</SelectItem>
                    <SelectItem value="Q3">第三季度</SelectItem>
                    <SelectItem value="Q4">第四季度</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>部门</Label>
              <Input
                value={newBudget.department}
                onChange={(e) => setNewBudget({ ...newBudget, department: e.target.value })}
                placeholder="例如：销售部"
              />
            </div>
            <div>
              <Label>预算类型</Label>
              <Select
                value={newBudget.budget_type}
                onValueChange={(value) =>
                  setNewBudget({ ...newBudget, budget_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operating">运营预算</SelectItem>
                  <SelectItem value="capital">资本预算</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>分配金额</Label>
              <Input
                type="number"
                value={newBudget.allocated_amount}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, allocated_amount: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBudgetDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateBudget}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
