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
  AlertTriangle,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  TrendingUp,
  Activity,
  AlertOctagon,
  Plus,
  Filter,
  Trash2,
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

interface AuditRecord {
  id: string;
  rule_name: string;
  audit_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  risk_level: string;
  risk_description: string;
  detected_at: string;
  detected_by: string;
  status: string;
  resolution_note: string | null;
}

interface AuditRule {
  id: string;
  rule_name: string;
  rule_type: string;
  rule_description: string;
  parameters: any;
  severity: string;
  is_active: boolean;
  trigger_count: number;
}

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState('records');
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [auditRules, setAuditRules] = useState<AuditRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [resolveForm, setResolveForm] = useState({ status: '', note: '' });
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    rule_type: '',
    rule_description: '',
    severity: 'medium',
  });

  // 加载数据
  useEffect(() => {
    loadAuditRecords();
    loadAuditRules();
  }, [activeTab]);

  const loadAuditRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/finance-audit/audit?type=records');
      const result = await response.json();

      if (result.success) {
        setAuditRecords(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load audit records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditRules = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/finance-audit/audit?type=rules');
      const result = await response.json();

      if (result.success) {
        setAuditRules(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load audit rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setRunningAudit(true);

    try {
      const response = await fetch('/api/finance-audit/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'run_audit' }),
      });

      const result = await response.json();
      if (result.success) {
        loadAuditRecords();
        alert(result.message);
      }
    } catch (error) {
      console.error('Audit failed:', error);
      alert('审计失败');
    } finally {
      setRunningAudit(false);
    }
  };

  const handleResolveRecord = async () => {
    if (!selectedRecord) return;

    try {
      const response = await fetch('/api/finance-audit/audit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'record',
          id: selectedRecord.id,
          status: resolveForm.status,
          resolution_note: resolveForm.note,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowResolveDialog(false);
        setResolveForm({ status: '', note: '' });
        setSelectedRecord(null);
        loadAuditRecords();
      } else {
        alert('操作失败：' + result.error);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/finance-audit/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rule',
          rule_name: newRule.rule_name,
          rule_type: newRule.rule_type,
          rule_description: newRule.rule_description,
          parameters: {},
          severity: newRule.severity,
          is_active: true,
          trigger_count: 0,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowNewRuleDialog(false);
        setNewRule({
          rule_name: '',
          rule_type: '',
          rule_description: '',
          severity: 'medium',
        });
        loadAuditRules();
      } else {
        alert('创建失败：' + result.error);
      }
    } catch (error) {
      alert('创建失败');
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const levelConfig: Record<string, { label: string; variant: string }> = {
      low: { label: '低', variant: 'secondary' },
      medium: { label: '中', variant: 'default' },
      high: { label: '高', variant: 'destructive' },
      critical: { label: '严重', variant: 'destructive' },
    };
    const config = levelConfig[level] || { label: level, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string }> = {
      open: { label: '待处理', variant: 'secondary' },
      investigating: { label: '调查中', variant: 'default' },
      resolved: { label: '已解决', variant: 'default' },
      dismissed: { label: '已忽略', variant: 'secondary' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<string, { label: string; variant: string }> = {
      low: { label: '低', variant: 'secondary' },
      medium: { label: '中', variant: 'default' },
      high: { label: '高', variant: 'destructive' },
      critical: { label: '严重', variant: 'destructive' },
    };
    const config = severityConfig[severity] || { label: severity, variant: 'default' };
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                审计管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                异常检测、合规检查、风险预警
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              筛选
            </Button>
            <Button className="gap-2" onClick={handleRunAudit}>
              <Activity className={`h-4 w-4 ${runningAudit ? 'animate-pulse' : ''}`} />
              {runningAudit ? '审计中...' : '开始审计'}
            </Button>
          </div>
        </div>

        {/* 功能说明卡片 */}
        <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              智能审计系统
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">异常检测</div>
                  <div className="text-sm text-white/80">AI识别异常交易</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">合规检查</div>
                  <div className="text-sm text-white/80">自动检测违规操作</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">风险预警</div>
                  <div className="text-sm text-white/80">实时风险提醒</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">自动处理</div>
                  <div className="text-sm text-white/80">智能分析和建议</div>
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
                  待处理风险
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {auditRecords.filter((r) => r.status === 'open').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">需要处理</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  严重风险
                </CardTitle>
                <AlertOctagon className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {auditRecords.filter((r) => r.risk_level === 'critical').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">需立即处理</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  本月审计
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{auditRecords.length}</div>
              <p className="text-xs text-slate-500 mt-1">次触发</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  已解决
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {auditRecords.filter((r) => r.status === 'resolved').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">已完成处理</p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="records" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              审计记录
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              审计规则
            </TabsTrigger>
          </TabsList>

          {/* 审计记录 */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>审计记录</CardTitle>
                  <CardDescription>查看和管理审计风险记录</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-slate-500">加载中...</div>
                ) : auditRecords.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暂无审计记录</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>规则名称</TableHead>
                        <TableHead>实体名称</TableHead>
                        <TableHead>风险描述</TableHead>
                        <TableHead>风险等级</TableHead>
                        <TableHead>检测时间</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.rule_name}</TableCell>
                          <TableCell>{record.entity_name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.risk_description}
                          </TableCell>
                          <TableCell>{getRiskLevelBadge(record.risk_level)}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(record.detected_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
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
                              {record.status === 'open' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setShowResolveDialog(true);
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
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

          {/* 审计规则 */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>审计规则</CardTitle>
                    <CardDescription>配置和管理审计规则</CardDescription>
                  </div>
                  <Button
                    className="gap-2"
                    onClick={() => setShowNewRuleDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    新建规则
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-slate-500">加载中...</div>
                ) : auditRules.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暂无审计规则</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>规则名称</TableHead>
                        <TableHead>规则类型</TableHead>
                        <TableHead>规则描述</TableHead>
                        <TableHead>严重程度</TableHead>
                        <TableHead>触发次数</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.rule_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.rule_type}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {rule.rule_description}
                          </TableCell>
                          <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                          <TableCell>{rule.trigger_count}</TableCell>
                          <TableCell>
                            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                              {rule.is_active ? '启用' : '禁用'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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

      {/* 查看详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审计记录详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">规则名称</Label>
                  <div className="font-semibold">{selectedRecord.rule_name}</div>
                </div>
                <div>
                  <Label className="text-slate-500">风险等级</Label>
                  <div>{getRiskLevelBadge(selectedRecord.risk_level)}</div>
                </div>
                <div>
                  <Label className="text-slate-500">实体名称</Label>
                  <div>{selectedRecord.entity_name}</div>
                </div>
                <div>
                  <Label className="text-slate-500">状态</Label>
                  <div>{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-slate-500">风险描述</Label>
                  <div className="mt-1">{selectedRecord.risk_description}</div>
                </div>
                <div>
                  <Label className="text-slate-500">检测时间</Label>
                  <div className="text-sm">
                    {new Date(selectedRecord.detected_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-500">检测方式</Label>
                  <div>{selectedRecord.detected_by === 'auto' ? '自动' : '人工'}</div>
                </div>
              </div>
              {selectedRecord.resolution_note && (
                <div>
                  <Label className="text-slate-500">处理说明</Label>
                  <div className="mt-1">{selectedRecord.resolution_note}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 解决对话框 */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>处理审计记录</DialogTitle>
            <DialogDescription>对风险记录进行处理</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div className="font-semibold">{selectedRecord.rule_name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {selectedRecord.risk_description}
                </div>
              </div>
              <div>
                <Label>处理结果</Label>
                <Select
                  value={resolveForm.status}
                  onValueChange={(value) => setResolveForm({ ...resolveForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择处理结果" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolved">已解决</SelectItem>
                    <SelectItem value="dismissed">已忽略</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>处理说明</Label>
                <Input
                  value={resolveForm.note}
                  onChange={(e) => setResolveForm({ ...resolveForm, note: e.target.value })}
                  placeholder="填写处理说明"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              取消
            </Button>
            <Button onClick={handleResolveRecord} disabled={!resolveForm.status}>
              提交处理
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建规则对话框 */}
      <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建审计规则</DialogTitle>
            <DialogDescription>创建新的审计规则</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>规则名称</Label>
              <Input
                value={newRule.rule_name}
                onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                placeholder="例如：大额报销检测"
              />
            </div>
            <div>
              <Label>规则类型</Label>
              <Select
                value={newRule.rule_type}
                onValueChange={(value) => setNewRule({ ...newRule, rule_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择规则类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount_limit">金额限制</SelectItem>
                  <SelectItem value="duplicate_check">重复检查</SelectItem>
                  <SelectItem value="time_pattern">时间模式</SelectItem>
                  <SelectItem value="frequency_check">频率检查</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>严重程度</Label>
              <Select
                value={newRule.severity}
                onValueChange={(value) => setNewRule({ ...newRule, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择严重程度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="critical">严重</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>规则描述</Label>
              <Input
                value={newRule.rule_description}
                onChange={(e) =>
                  setNewRule({ ...newRule, rule_description: e.target.value })
                }
                placeholder="描述规则的作用"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRuleDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateRule}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
