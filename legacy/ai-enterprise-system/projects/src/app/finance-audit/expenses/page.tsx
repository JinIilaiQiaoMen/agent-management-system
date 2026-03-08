'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Download,
  FileText,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  submitter_name: string;
  submit_date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  approval_note?: string;
}

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // 新建报销单表单
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: '',
    amount: '',
    submitter: '',
    description: '',
  });

  // 审批表单
  const [approvalForm, setApprovalForm] = useState({
    status: '',
    note: '',
  });

  const categories = ['差旅', '办公', '招待', '培训', '团建', '其他'];

  // 加载报销单数据
  useEffect(() => {
    loadExpenses();
  }, [searchTerm, selectedStatus, selectedCategory]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/finance-audit/expenses?${params}`);
      const result = await response.json();

      if (result.success) {
        setExpenses(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    try {
      const response = await fetch('/api/finance-audit/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newExpense.title,
          category: newExpense.category,
          amount: parseFloat(newExpense.amount),
          submitter: newExpense.submitter,
          description: newExpense.description,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowCreateDialog(false);
        setNewExpense({ title: '', category: '', amount: '', submitter: '', description: '' });
        loadExpenses();
      } else {
        alert('创建失败：' + result.error);
      }
    } catch (error) {
      alert('创建失败');
    }
  };

  const handleApproveExpense = async () => {
    if (!selectedExpense) return;

    try {
      const response = await fetch('/api/finance-audit/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedExpense.id,
          status: approvalForm.status,
          approval_note: approvalForm.note,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowApproveDialog(false);
        setApprovalForm({ status: '', note: '' });
        setSelectedExpense(null);
        loadExpenses();
      } else {
        alert('审批失败：' + result.error);
      }
    } catch (error) {
      alert('审批失败');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('确定要删除这条报销记录吗？')) return;

    try {
      const response = await fetch(`/api/finance-audit/expenses?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        loadExpenses();
      } else {
        alert('删除失败：' + result.error);
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    };
    return icons[status] || icons.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待审批',
      approved: '已批准',
      rejected: '已拒绝',
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
                href="/finance-audit"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    报销管理
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    报销申请、审批、AI风险检测
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              新建报销单
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 筛选栏 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="搜索报销单..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审批</SelectItem>
                  <SelectItem value="approved">已批准</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类别</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 报销单列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              报销单列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">加载中...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-slate-500">暂无报销记录</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>提交人</TableHead>
                    <TableHead>提交日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const StatusIcon = getStatusIcon(expense.status);
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">¥{(expense.amount || 0).toFixed(2)}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          {expense.submitter_name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(expense.submit_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(expense.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(expense.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {expense.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedExpense(expense);
                                  setShowApproveDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 新建报销单对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建报销单</DialogTitle>
            <DialogDescription>填写报销单信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>标题</Label>
              <Input
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                placeholder="例如：差旅费报销"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>类别</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>金额</Label>
                <Input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label>提交人</Label>
              <Input
                value={newExpense.submitter}
                onChange={(e) => setNewExpense({ ...newExpense, submitter: e.target.value })}
                placeholder="提交人姓名"
              />
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="详细描述报销内容"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateExpense}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>报销单详情</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">标题</Label>
                  <div className="font-semibold">{selectedExpense.title}</div>
                </div>
                <div>
                  <Label className="text-slate-500">类别</Label>
                  <div>{selectedExpense.category}</div>
                </div>
                <div>
                  <Label className="text-slate-500">金额</Label>
                  <div className="font-semibold text-lg">¥{(selectedExpense.amount || 0).toFixed(2)}</div>
                </div>
                <div>
                  <Label className="text-slate-500">状态</Label>
                  <Badge className={getStatusColor(selectedExpense.status)}>
                    {getStatusLabel(selectedExpense.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-500">提交人</Label>
                  <div>{selectedExpense.submitter_name}</div>
                </div>
                <div>
                  <Label className="text-slate-500">提交日期</Label>
                  <div>{new Date(selectedExpense.submit_date).toLocaleDateString()}</div>
                </div>
              </div>
              <div>
                <Label className="text-slate-500">描述</Label>
                <div className="mt-1">{selectedExpense.description}</div>
              </div>
              {selectedExpense.approval_note && (
                <div>
                  <Label className="text-slate-500">审批备注</Label>
                  <div className="mt-1">{selectedExpense.approval_note}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 审批对话框 */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审批报销单</DialogTitle>
            <DialogDescription>对报销单进行审批</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div className="font-semibold">{selectedExpense.title}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {selectedExpense.category} - ¥{(selectedExpense.amount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <Label>审批结果</Label>
                <Select
                  value={approvalForm.status}
                  onValueChange={(value) => setApprovalForm({ ...approvalForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择审批结果" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">批准</SelectItem>
                    <SelectItem value="rejected">拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>审批备注</Label>
                <Textarea
                  value={approvalForm.note}
                  onChange={(e) => setApprovalForm({ ...approvalForm, note: e.target.value })}
                  placeholder="填写审批备注"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              取消
            </Button>
            <Button onClick={handleApproveExpense} disabled={!approvalForm.status}>
              提交审批
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
