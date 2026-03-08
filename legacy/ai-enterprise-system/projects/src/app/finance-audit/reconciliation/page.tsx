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
  BarChart3,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Plus,
  Download,
  Eye,
  FileText,
  TrendingUp,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileJson,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ReconciliationRecord {
  id: string;
  reconciliation_date: string;
  reconciliation_period: string;
  account_name: string;
  book_balance: number;
  bank_balance: number;
  difference: number;
  adjustment_amount: number;
  status: string;
  reconciled_at: string | null;
}

interface BankTransaction {
  id: string;
  account_name: string;
  transaction_date: string;
  transaction_type: string;
  amount: number;
  balance: number;
  counterparty: string;
  summary: string;
  is_reconciled: boolean;
}

export default function ReconciliationPage() {
  const [activeTab, setActiveTab] = useState('records');
  const [reconciling, setReconciling] = useState(false);
  const [reconciliationRecords, setReconciliationRecords] = useState<ReconciliationRecord[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // 导出相关状态
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('all');

  // 对话框状态
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false);
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // 选中项
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);

  // 表单数据
  const [newTransaction, setNewTransaction] = useState({
    account_name: '',
    transaction_type: 'credit',
    amount: '',
    counterparty: '',
    summary: '',
  });

  const [editTransaction, setEditTransaction] = useState({
    id: '',
    account_name: '',
    transaction_type: 'credit',
    amount: '',
    counterparty: '',
    summary: '',
  });

  const [newRecord, setNewRecord] = useState({
    account_name: '',
    book_balance: '',
    bank_balance: '',
  });

  // 加载数据
  useEffect(() => {
    loadReconciliationRecords();
    loadBankTransactions();
  }, []);

  // 当切换标签页时重新加载数据
  useEffect(() => {
    // 标签页切换不需要重新加载，数据已经加载过了
  }, [activeTab]);

  const loadReconciliationRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/finance-audit/reconciliation?type=records');
      const result = await response.json();

      if (result.success) {
        setReconciliationRecords(result.data || []);
        console.log('加载对账记录成功:', result.data);
      } else {
        console.error('加载对账记录失败:', result.error);
      }
    } catch (error) {
      console.error('Failed to load reconciliation records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBankTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/finance-audit/reconciliation?type=transactions');
      const result = await response.json();

      if (result.success) {
        setBankTransactions(result.data || []);
        console.log('加载银行流水成功:', result.data);
      } else {
        console.error('加载银行流水失败:', result.error);
      }
    } catch (error) {
      console.error('Failed to load bank transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);

    setTimeout(async () => {
      try {
        const response = await fetch('/api/finance-audit/reconciliation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reconcile',
            account_name: '工商银行主账户',
            book_balance: 1234567.89,
            bank_balance: 1234567.89,
          }),
        });

        const result = await response.json();
        if (result.success) {
          loadReconciliationRecords();
          alert('对账完成！');
        }
      } catch (error) {
        console.error('Reconciliation failed:', error);
        alert('对账失败');
      } finally {
        setReconciling(false);
      }
    }, 2000);
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `对账报表_${exportType}_${timestamp}`;

    if (exportType === 'all') {
      // 导出当前标签页的数据
      const dataToExport = activeTab === 'records' ? reconciliationRecords : bankTransactions;
      const actualFilename = `对账报表_${activeTab === 'records' ? '对账记录' : '银行流水'}_${timestamp}`;
      
      if (exportFormat === 'csv') {
        exportToCSV(dataToExport, actualFilename);
      } else if (exportFormat === 'json') {
        exportToJSON(dataToExport, actualFilename);
      } else if (exportFormat === 'excel') {
        exportToExcel(dataToExport, actualFilename);
      }
    } else if (exportType === 'records') {
      // 仅导出对账记录
      const actualFilename = `对账报表_对账记录_${timestamp}`;
      if (exportFormat === 'csv') {
        exportToCSV(reconciliationRecords, actualFilename);
      } else if (exportFormat === 'json') {
        exportToJSON(reconciliationRecords, actualFilename);
      } else if (exportFormat === 'excel') {
        exportToExcel(reconciliationRecords, actualFilename);
      }
    } else if (exportType === 'transactions') {
      // 仅导出银行流水
      const actualFilename = `对账报表_银行流水_${timestamp}`;
      if (exportFormat === 'csv') {
        exportToCSV(bankTransactions, actualFilename);
      } else if (exportFormat === 'json') {
        exportToJSON(bankTransactions, actualFilename);
      } else if (exportFormat === 'excel') {
        exportToExcel(bankTransactions, actualFilename);
      }
    } else if (exportType === 'both') {
      // 两个都导出
      const timestamp1 = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const recordsFilename = `对账报表_对账记录_${timestamp1}`;
      const transactionsFilename = `对账报表_银行流水_${timestamp1}`;
      
      if (exportFormat === 'csv') {
        exportToCSV(reconciliationRecords, recordsFilename);
        setTimeout(() => {
          exportToCSV(bankTransactions, transactionsFilename);
        }, 500);
      } else if (exportFormat === 'json') {
        exportToJSON(reconciliationRecords, recordsFilename);
        setTimeout(() => {
          exportToJSON(bankTransactions, transactionsFilename);
        }, 500);
      } else if (exportFormat === 'excel') {
        exportToExcel(reconciliationRecords, recordsFilename);
        setTimeout(() => {
          exportToExcel(bankTransactions, transactionsFilename);
        }, 500);
      }
    }

    setShowExportDialog(false);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('没有数据可导出');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // 处理包含逗号的值
            const stringValue = String(value ?? '');
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      ),
    ].join('\n');

    // 添加 BOM 以支持 Excel 中文
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('没有数据可导出');
      return;
    }

    // 简单的 Excel HTML 导出
    const headers = Object.keys(data[0]);
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h2>${filename}</h2>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${headers
                      .map((h) => `<td>${row[h] ?? ''}</td>`)
                      .join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTransaction = async () => {
    try {
      // 验证必填字段
      if (!newTransaction.account_name || !newTransaction.amount || !newTransaction.counterparty) {
        alert('请填写必填字段：账户名称、金额、对方户名');
        return;
      }

      const response = await fetch('/api/finance-audit/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transaction',
          account_name: newTransaction.account_name,
          transaction_type: newTransaction.transaction_type,
          amount: parseFloat(newTransaction.amount),
          counterparty: newTransaction.counterparty,
          summary: newTransaction.summary,
          is_reconciled: false,
        }),
      });

      const result = await response.json();
      
      console.log('添加银行流水响应:', result);
      
      if (result.success) {
        setShowNewTransactionDialog(false);
        setNewTransaction({
          account_name: '',
          transaction_type: 'credit',
          amount: '',
          counterparty: '',
          summary: '',
        });
        loadBankTransactions();
        alert('添加成功！');
      } else {
        alert('添加失败：' + result.error);
      }
    } catch (error: any) {
      console.error('添加银行流水错误:', error);
      alert('添加失败：' + error.message);
    }
  };

  const handleEditTransaction = async () => {
    try {
      const response = await fetch('/api/finance-audit/reconciliation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_transaction',
          id: editTransaction.id,
          account_name: editTransaction.account_name,
          transaction_type: editTransaction.transaction_type,
          amount: parseFloat(editTransaction.amount),
          counterparty: editTransaction.counterparty,
          summary: editTransaction.summary,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowEditTransactionDialog(false);
        setEditTransaction({
          id: '',
          account_name: '',
          transaction_type: 'credit',
          amount: '',
          counterparty: '',
          summary: '',
        });
        loadBankTransactions();
      } else {
        alert('更新失败：' + result.error);
      }
    } catch (error) {
      alert('更新失败');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('确定要删除这条银行流水吗？')) return;

    try {
      const response = await fetch(`/api/finance-audit/reconciliation?id=${id}&type=transaction`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        loadBankTransactions();
      } else {
        alert('删除失败：' + result.error);
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleAddRecord = async () => {
    try {
      // 验证必填字段
      if (!newRecord.account_name || !newRecord.book_balance || !newRecord.bank_balance) {
        alert('请填写必填字段：账户名称、账面余额、银行余额');
        return;
      }

      const book_balance = parseFloat(newRecord.book_balance);
      const bank_balance = parseFloat(newRecord.bank_balance);
      const difference = Math.abs(book_balance - bank_balance);

      const response = await fetch('/api/finance-audit/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reconcile',
          account_name: newRecord.account_name,
          book_balance,
          bank_balance,
        }),
      });

      const result = await response.json();
      
      console.log('添加对账记录响应:', result);
      
      if (result.success) {
        setShowNewRecordDialog(false);
        setNewRecord({
          account_name: '',
          book_balance: '',
          bank_balance: '',
        });
        loadReconciliationRecords();
        alert('添加成功！');
      } else {
        alert('添加失败：' + result.error);
      }
    } catch (error: any) {
      console.error('添加对账记录错误:', error);
      alert('添加失败：' + error.message);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('确定要删除这条对账记录吗？')) return;

    try {
      const response = await fetch(`/api/finance-audit/reconciliation?id=${id}&type=record`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        loadReconciliationRecords();
      } else {
        alert('删除失败：' + result.error);
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  // 计算统计数据
  const stats = {
    // 待对账账户数（不重复的账户名称数量）
    pendingAccounts: new Set(
      reconciliationRecords
        .filter((r) => r.status === 'pending')
        .map((r) => r.account_name)
    ).size + new Set(bankTransactions.map((t) => t.account_name)).size,
    
    // 本月已完成的对账记录数
    monthlyReconciled: reconciliationRecords.filter((r) => {
      const recordDate = new Date(r.reconciliation_date);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear() &&
             r.status === 'reconciled';
    }).length,
    
    // 账面余额总和
    totalBookBalance: reconciliationRecords.reduce((sum, r) => sum + (r.book_balance || 0), 0),
    
    // 差异金额总和
    totalDifference: reconciliationRecords.reduce((sum, r) => sum + (r.difference || 0), 0),
  };

  // 格式化大金额显示
  const formatLargeAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `¥${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `¥${(amount / 1000).toFixed(1)}K`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string }> = {
      pending: { label: '待对账', variant: 'secondary' },
      reconciled: { label: '已对账', variant: 'default' },
      failed: { label: '对账失败', variant: 'destructive' },
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
              href="/finance-audit"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                对账管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                自动对账、差异分析、报表生成
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4" />
              导出报表
            </Button>
            <Button className="gap-2" onClick={handleReconcile}>
              <RefreshCw className={`h-4 w-4 ${reconciling ? 'animate-spin' : ''}`} />
              {reconciling ? '对账中...' : '开始对账'}
            </Button>
          </div>
        </div>

        {/* 功能说明卡片 */}
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              智能对账系统
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">自动对账</div>
                  <div className="text-sm text-white/80">自动匹配银行流水</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">差异分析</div>
                  <div className="text-sm text-white/80">自动检测账面差异</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">智能调整</div>
                  <div className="text-sm text-white/80">自动生成调整凭证</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">报表生成</div>
                  <div className="text-sm text-white/80">支持多种格式导出</div>
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
                  待对账账户
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.pendingAccounts}</div>
              <p className="text-xs text-slate-500 mt-1">个账户</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  本月对账
                </CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.monthlyReconciled}</div>
              <p className="text-xs text-slate-500 mt-1">已完成</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  账面余额
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatLargeAmount(stats.totalBookBalance)}</div>
              <p className="text-xs text-slate-500 mt-1">总计余额</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  差异金额
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.totalDifference > 0 ? 'text-orange-600' : 'text-green-600'
                }`}
              >
                {formatLargeAmount(stats.totalDifference)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.totalDifference > 0 ? '存在差异' : '无差异'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="records" className="gap-2">
              <FileText className="h-4 w-4" />
              对账记录
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <CreditCard className="h-4 w-4" />
              银行流水
            </TabsTrigger>
          </TabsList>

          {/* 对账记录 */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>对账记录</CardTitle>
                    <CardDescription>查看和管理对账记录</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowNewRecordDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    手动添加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-slate-500">加载中...</div>
                ) : reconciliationRecords.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暂无对账记录</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>对账日期</TableHead>
                        <TableHead>对账周期</TableHead>
                        <TableHead>账户名称</TableHead>
                        <TableHead>账面余额</TableHead>
                        <TableHead>银行余额</TableHead>
                        <TableHead>差额</TableHead>
                        <TableHead>调整金额</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>对账时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciliationRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.reconciliation_date}</TableCell>
                          <TableCell>{record.reconciliation_period}</TableCell>
                          <TableCell className="font-medium">{record.account_name}</TableCell>
                          <TableCell>¥{(record.book_balance || 0).toLocaleString()}</TableCell>
                          <TableCell>¥{(record.bank_balance || 0).toLocaleString()}</TableCell>
                          <TableCell
                            className={
                              (record.difference || 0) !== 0 ? 'text-red-600 font-medium' : ''
                            }
                          >
                            ¥{(record.difference || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>¥{(record.adjustment_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{record.reconciled_at || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setShowDetailDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecord(record.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

          {/* 银行流水 */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>银行流水</CardTitle>
                    <CardDescription>查看银行交易记录</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowNewTransactionDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    新增流水
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-slate-500">加载中...</div>
                ) : bankTransactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暂无银行流水</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>账户</TableHead>
                        <TableHead>交易日期</TableHead>
                        <TableHead>交易类型</TableHead>
                        <TableHead>金额</TableHead>
                        <TableHead>余额</TableHead>
                        <TableHead>对方户名</TableHead>
                        <TableHead>摘要</TableHead>
                        <TableHead>对账状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.account_name}</TableCell>
                          <TableCell>{transaction.transaction_date}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.transaction_type === 'credit'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {transaction.transaction_type === 'credit' ? '收入' : '支出'}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={
                              transaction.transaction_type === 'credit'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {transaction.transaction_type === 'credit' ? '+' : '-'}
                            ¥{(transaction.amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>¥{(transaction.balance || 0).toLocaleString()}</TableCell>
                          <TableCell>{transaction.counterparty}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.summary}
                          </TableCell>
                          <TableCell>
                            {transaction.is_reconciled ? (
                              <Badge variant="default">已对账</Badge>
                            ) : (
                              <Badge variant="secondary">未对账</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowDetailDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditTransaction({
                                    id: transaction.id,
                                    account_name: transaction.account_name,
                                    transaction_type: transaction.transaction_type,
                                    amount: transaction.amount.toString(),
                                    counterparty: transaction.counterparty,
                                    summary: transaction.summary,
                                  });
                                  setShowEditTransactionDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

      {/* 导出报表对话框 */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出报表</DialogTitle>
            <DialogDescription>选择导出格式和类型</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>导出格式</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    CSV - 逗号分隔值文件，兼容所有表格软件
                  </Label>
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel - 带格式的表格文件
                  </Label>
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                    <FileJson className="h-4 w-4" />
                    JSON - 结构化数据格式
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>导出内容</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">当前标签页数据</SelectItem>
                  <SelectItem value="records">仅对账记录</SelectItem>
                  <SelectItem value="transactions">仅银行流水</SelectItem>
                  <SelectItem value="both">两个都导出</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-2">
                {exportType === 'all' && '将导出当前标签页的数据'}
                {exportType === 'records' && '将导出所有对账记录'}
                {exportType === 'transactions' && '将导出所有银行流水'}
                {exportType === 'both' && '将分别导出对账记录和银行流水两个文件'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              取消
            </Button>
            <Button onClick={handleExport}>导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增银行流水对话框 */}
      <Dialog open={showNewTransactionDialog} onOpenChange={setShowNewTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增银行流水</DialogTitle>
            <DialogDescription>添加新的银行交易记录</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>账户名称</Label>
              <Input
                value={newTransaction.account_name}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, account_name: e.target.value })
                }
                placeholder="例如：工商银行主账户"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>交易类型</Label>
                <Select
                  value={newTransaction.transaction_type}
                  onValueChange={(value) =>
                    setNewTransaction({ ...newTransaction, transaction_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">收入</SelectItem>
                    <SelectItem value="debit">支出</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>金额</Label>
                <Input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label>对方户名</Label>
              <Input
                value={newTransaction.counterparty}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, counterparty: e.target.value })
                }
                placeholder="交易对方名称"
              />
            </div>
            <div>
              <Label>摘要</Label>
              <Input
                value={newTransaction.summary}
                onChange={(e) => setNewTransaction({ ...newTransaction, summary: e.target.value })}
                placeholder="交易摘要"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTransactionDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddTransaction}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑银行流水对话框 */}
      <Dialog open={showEditTransactionDialog} onOpenChange={setShowEditTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑银行流水</DialogTitle>
            <DialogDescription>修改银行交易记录</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>账户名称</Label>
              <Input
                value={editTransaction.account_name}
                onChange={(e) =>
                  setEditTransaction({ ...editTransaction, account_name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>交易类型</Label>
                <Select
                  value={editTransaction.transaction_type}
                  onValueChange={(value) =>
                    setEditTransaction({ ...editTransaction, transaction_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">收入</SelectItem>
                    <SelectItem value="debit">支出</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>金额</Label>
                <Input
                  type="number"
                  value={editTransaction.amount}
                  onChange={(e) => setEditTransaction({ ...editTransaction, amount: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>对方户名</Label>
              <Input
                value={editTransaction.counterparty}
                onChange={(e) =>
                  setEditTransaction({ ...editTransaction, counterparty: e.target.value })
                }
              />
            </div>
            <div>
              <Label>摘要</Label>
              <Input
                value={editTransaction.summary}
                onChange={(e) => setEditTransaction({ ...editTransaction, summary: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTransactionDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEditTransaction}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 手动添加对账记录对话框 */}
      <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手动添加对账记录</DialogTitle>
            <DialogDescription>添加新的对账记录</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>账户名称</Label>
              <Input
                value={newRecord.account_name}
                onChange={(e) => setNewRecord({ ...newRecord, account_name: e.target.value })}
                placeholder="例如：工商银行主账户"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>账面余额</Label>
                <Input
                  type="number"
                  value={newRecord.book_balance}
                  onChange={(e) => setNewRecord({ ...newRecord, book_balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>银行余额</Label>
                <Input
                  type="number"
                  value={newRecord.bank_balance}
                  onChange={(e) => setNewRecord({ ...newRecord, bank_balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRecordDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddRecord}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">账户名称</Label>
                  <div className="font-semibold">{selectedRecord.account_name}</div>
                </div>
                <div>
                  <Label className="text-slate-500">对账日期</Label>
                  <div>{selectedRecord.reconciliation_date}</div>
                </div>
                <div>
                  <Label className="text-slate-500">账面余额</Label>
                  <div>¥{(selectedRecord.book_balance || 0).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-slate-500">银行余额</Label>
                  <div>¥{(selectedRecord.bank_balance || 0).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-slate-500">差额</Label>
                  <div>¥{(selectedRecord.difference || 0).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-slate-500">状态</Label>
                  <div>{getStatusBadge(selectedRecord.status)}</div>
                </div>
              </div>
            </div>
          )}
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">账户</Label>
                  <div className="font-semibold">{selectedTransaction.account_name}</div>
                </div>
                <div>
                  <Label className="text-slate-500">交易日期</Label>
                  <div>{selectedTransaction.transaction_date}</div>
                </div>
                <div>
                  <Label className="text-slate-500">交易类型</Label>
                  <div>
                    {selectedTransaction.transaction_type === 'credit' ? '收入' : '支出'}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500">金额</Label>
                  <div className="font-semibold">
                    ¥{(selectedTransaction.amount || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500">对方户名</Label>
                  <div>{selectedTransaction.counterparty}</div>
                </div>
                <div>
                  <Label className="text-slate-500">对账状态</Label>
                  <div>
                    {selectedTransaction.is_reconciled ? (
                      <Badge variant="default">已对账</Badge>
                    ) : (
                      <Badge variant="secondary">未对账</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-slate-500">摘要</Label>
                <div className="mt-1">{selectedTransaction.summary}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
