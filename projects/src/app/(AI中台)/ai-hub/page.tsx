'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Activity,
  Database,
  TrendingUp,
  DollarSign,
  Zap,
  BarChart3,
  RefreshCw,
  Settings,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
} from 'lucide-react';

interface UsageData {
  success: boolean;
  period: string;
  summary: {
    total_requests: number;
    cache_hits: number;
    actual_paid_requests: number;
    cache_hit_rate: number;
    compression_rate: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    total_cost: number;
    cache_hit_cost_saved: number;
    avg_latency_ms: number;
    success_rate: number;
  };
  model_stats: any[];
  task_type_stats: any[];
  daily_stats: any[];
}

interface ModelsData {
  success: boolean;
  providers: any[];
  rules: any[];
  cache_stats: {
    total_entries: number;
    total_hits: number;
    avg_hits_per_entry: number;
  };
  model_performance: any[];
}

export default function AIHubPage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [modelsData, setModelsData] = useState<ModelsData | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  // 对话框状态
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [editingRule, setEditingRule] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usageRes, modelsRes] = await Promise.all([
        fetch(`/api/ai-hub/usage?period=${period}`),
        fetch('/api/ai-hub/models'),
      ]);

      const usage = await usageRes.json();
      const models = await modelsRes.json();

      setUsageData(usage);
      setModelsData(models);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    AI 能力中台
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    模型智能路由 · 智能缓存 · 用量监控
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="总请求量"
            value={usageData?.summary.total_requests || 0}
            icon={<Activity className="h-4 w-4" />}
            color="blue"
            change="+12.5%"
          />
          <StatCard
            title="缓存命中率"
            value={`${usageData?.summary.cache_hit_rate.toFixed(1)}%`}
            icon={<Database className="h-4 w-4" />}
            color="green"
            change="+8.3%"
          />
          <StatCard
            title="调用量压缩率"
            value={`${usageData?.summary.compression_rate.toFixed(1)}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            color="purple"
            change="+15.2%"
          />
          <StatCard
            title="节省成本"
            value={`$${usageData?.summary.cache_hit_cost_saved.toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4" />}
            color="orange"
            change="+22.8%"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="models">模型管理</TabsTrigger>
            <TabsTrigger value="cache">缓存系统</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <UsageChartCard usageData={usageData} />
              <ModelPerformanceCard modelsData={modelsData} />
            </div>
            <TaskTypeDistributionCard taskTypeStats={usageData?.task_type_stats || []} />
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <ModelProvidersCard
              providers={modelsData?.providers || []}
              onAdd={() => {
                setEditingProvider(null);
                setProviderDialogOpen(true);
              }}
              onEdit={(provider) => {
                setEditingProvider(provider);
                setProviderDialogOpen(true);
              }}
              onDelete={(id) => handleDeleteProvider(id)}
              refreshData={refreshData}
            />
            <RoutingRulesCard
              rules={modelsData?.rules || []}
              providers={modelsData?.providers || []}
              onAdd={() => {
                setEditingRule(null);
                setRuleDialogOpen(true);
              }}
              onEdit={(rule) => {
                setEditingRule(rule);
                setRuleDialogOpen(true);
              }}
              onDelete={(id) => handleDeleteRule(id)}
              refreshData={refreshData}
            />
          </TabsContent>

          {/* Cache Tab */}
          <TabsContent value="cache" className="space-y-4">
            <CacheStatsCard cacheStats={modelsData?.cache_stats} />
            <CacheOptimizationCard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsFilters period={period} onPeriodChange={setPeriod} />
            <DetailedAnalyticsCard usageData={usageData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Provider Dialog */}
      <ProviderFormDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        provider={editingProvider}
        onSuccess={refreshData}
      />

      {/* Rule Dialog */}
      <RuleFormDialog
        open={ruleDialogOpen}
        onOpenChange={setRuleDialogOpen}
        rule={editingRule}
        providers={modelsData?.providers || []}
        onSuccess={refreshData}
      />
    </div>
  );
}

// 删除提供商
const handleDeleteProvider = async (id: string) => {
  if (!confirm('确定要删除这个模型提供商吗？')) return;

  try {
    const res = await fetch(`/api/ai-hub/providers?id=${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.success) {
      alert('删除成功');
      window.location.reload();
    } else {
      alert(`删除失败: ${data.error}`);
    }
  } catch (error) {
    alert('删除失败，请稍后重试');
  }
};

// 删除路由规则
const handleDeleteRule = async (id: string) => {
  if (!confirm('确定要删除这个路由规则吗？')) return;

  try {
    const res = await fetch(`/api/ai-hub/rules?id=${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.success) {
      alert('删除成功');
      window.location.reload();
    } else {
      alert(`删除失败: ${data.error}`);
    }
  } catch (error) {
    alert('删除失败，请稍后重试');
  }
};

// 提供商表单对话框
function ProviderFormDialog({
  open,
  onOpenChange,
  provider,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: any;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    provider_name: '',
    provider_display_name: '',
    api_endpoint: '',
    auth_type: 'api_key',
    priority: 100,
    rate_limit_per_minute: 100,
    cost_per_1k_tokens: 0.008,
    cost_per_1k_input_tokens: 0.004,
    cost_per_1k_output_tokens: 0.012,
    max_tokens: 8192,
    supports_streaming: false,
    supports_function_calling: false,
    supports_vision: false,
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        provider_name: provider.provider_name,
        provider_display_name: provider.provider_display_name,
        api_endpoint: provider.api_endpoint,
        auth_type: provider.auth_type,
        priority: provider.priority,
        rate_limit_per_minute: provider.rate_limit_per_minute,
        cost_per_1k_tokens: provider.cost_per_1k_tokens,
        cost_per_1k_input_tokens: provider.cost_per_1k_input_tokens,
        cost_per_1k_output_tokens: provider.cost_per_1k_output_tokens,
        max_tokens: provider.max_tokens,
        supports_streaming: provider.supports_streaming,
        supports_function_calling: provider.supports_function_calling,
        supports_vision: provider.supports_vision,
      });
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = provider
        ? `/api/ai-hub/providers`
        : `/api/ai-hub/providers`;
      const method = provider ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider ? { ...formData, id: provider.id } : formData),
      });

      const data = await res.json();

      if (data.success) {
        alert(provider ? '更新成功' : '创建成功');
        onOpenChange(false);
        onSuccess();
      } else {
        alert(`操作失败: ${data.error}`);
      }
    } catch (error) {
      alert('操作失败，请稍后重试');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{provider ? '编辑模型提供商' : '添加模型提供商'}</DialogTitle>
          <DialogDescription>
            {provider ? '更新模型提供商的配置信息' : '配置新的AI模型提供商'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>提供商名称 *</Label>
              <Input
                value={formData.provider_name}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                placeholder="例如: doubao"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>显示名称 *</Label>
              <Input
                value={formData.provider_display_name}
                onChange={(e) => setFormData({ ...formData, provider_display_name: e.target.value })}
                placeholder="例如: 豆包"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Endpoint *</Label>
            <Input
              value={formData.api_endpoint}
              onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
              placeholder="例如: https://api.example.com/v1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>认证方式 *</Label>
            <Select
              value={formData.auth_type}
              onValueChange={(value) => setFormData({ ...formData, auth_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>优先级 (数字越小优先级越高)</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>每分钟调用限制</Label>
              <Input
                type="number"
                value={formData.rate_limit_per_minute}
                onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>每1K tokens总成本 ($)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.cost_per_1k_tokens}
                onChange={(e) => setFormData({ ...formData, cost_per_1k_tokens: parseFloat(e.target.value) })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>每1K输入tokens成本 ($)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.cost_per_1k_input_tokens}
                onChange={(e) => setFormData({ ...formData, cost_per_1k_input_tokens: parseFloat(e.target.value) })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>每1K输出tokens成本 ($)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.cost_per_1k_output_tokens}
                onChange={(e) => setFormData({ ...formData, cost_per_1k_output_tokens: parseFloat(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>最大tokens限制</Label>
              <Input
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <Label>支持流式输出</Label>
                <Switch
                  checked={formData.supports_streaming}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_streaming: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>支持函数调用</Label>
                <Switch
                  checked={formData.supports_function_calling}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_function_calling: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>支持视觉理解</Label>
                <Switch
                  checked={formData.supports_vision}
                  onCheckedChange={(checked) => setFormData({ ...formData, supports_vision: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{provider ? '更新' : '创建'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 路由规则表单对话框
function RuleFormDialog({
  open,
  onOpenChange,
  rule,
  providers,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: any;
  providers: any[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_description: '',
    task_type: 'conversation',
    priority: 100,
    max_tokens: 4000,
    complexity: 'medium',
    requires_reasoning: false,
    model_provider_id: '',
    model_name: '',
    cache_enabled: true,
    cache_ttl_seconds: 3600,
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        rule_name: rule.rule_name,
        rule_description: rule.rule_description || '',
        task_type: rule.task_type,
        priority: rule.priority,
        max_tokens: rule.conditions?.max_tokens || 4000,
        complexity: rule.conditions?.complexity || 'medium',
        requires_reasoning: rule.conditions?.requires_reasoning || false,
        model_provider_id: rule.model_provider_id,
        model_name: rule.model_name,
        cache_enabled: rule.cache_enabled !== undefined ? rule.cache_enabled : true,
        cache_ttl_seconds: rule.cache_ttl_seconds || 3600,
      });
    }
  }, [rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = rule ? `/api/ai-hub/rules` : `/api/ai-hub/rules`;
      const method = rule ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        conditions: {
          complexity: formData.complexity,
          max_tokens: formData.max_tokens,
          requires_reasoning: formData.requires_reasoning,
        },
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule ? { ...payload, id: rule.id } : payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(rule ? '更新成功' : '创建成功');
        onOpenChange(false);
        onSuccess();
      } else {
        alert(`操作失败: ${data.error}`);
      }
    } catch (error) {
      alert('操作失败，请稍后重试');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? '编辑路由规则' : '添加路由规则'}</DialogTitle>
          <DialogDescription>
            {rule ? '更新模型路由规则配置' : '配置新的模型路由规则'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>规则名称 *</Label>
            <Input
              value={formData.rule_name}
              onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
              placeholder="例如: 简单对话任务"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>规则描述</Label>
            <Textarea
              value={formData.rule_description}
              onChange={(e) => setFormData({ ...formData, rule_description: e.target.value })}
              placeholder="描述这个路由规则的用途"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>任务类型 *</Label>
              <Select
                value={formData.task_type}
                onValueChange={(value) => setFormData({ ...formData, task_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text_generation">文本生成</SelectItem>
                  <SelectItem value="conversation">对话</SelectItem>
                  <SelectItem value="summarization">摘要</SelectItem>
                  <SelectItem value="translation">翻译</SelectItem>
                  <SelectItem value="code_generation">代码生成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>优先级</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>最大tokens</Label>
              <Input
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>复杂度</Label>
              <Select
                value={formData.complexity}
                onValueChange={(value) => setFormData({ ...formData, complexity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>需要推理能力</Label>
            <Switch
              checked={formData.requires_reasoning}
              onCheckedChange={(checked) => setFormData({ ...formData, requires_reasoning: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>选择模型提供商 *</Label>
            <Select
              value={formData.model_provider_id}
              onValueChange={(value) => setFormData({ ...formData, model_provider_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择模型提供商" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.provider_display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>模型名称 *</Label>
            <Input
              value={formData.model_name}
              onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              placeholder="例如: doubao-pro-32k"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>启用缓存</Label>
              <Switch
                checked={formData.cache_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, cache_enabled: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>缓存TTL (秒)</Label>
              <Input
                type="number"
                value={formData.cache_ttl_seconds}
                onChange={(e) => setFormData({ ...formData, cache_ttl_seconds: parseInt(e.target.value) })}
                min={60}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{rule ? '更新' : '创建'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ... (保留原有的其他组件函数)
function StatCard({ title, value, icon, color, change }: { title: string; value: number | string; icon: React.ReactNode; color: 'blue' | 'green' | 'purple' | 'orange'; change: string; }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-lg bg-gradient-to-br ${colorClasses[color]} p-2`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="text-green-600">↑ {change}</span> 较上周期
        </p>
      </CardContent>
    </Card>
  );
}

function UsageChartCard({ usageData }: { usageData: UsageData | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          用量趋势
        </CardTitle>
        <CardDescription>最近7天调用量变化</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usageData?.daily_stats.slice(0, 7).map((day, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{day.date}</span>
                <span className="font-medium">{day.total_requests} 次请求</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{
                    width: `${(day.total_requests / (usageData.summary.total_requests / 7)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ModelPerformanceCard({ modelsData }: { modelsData: ModelsData | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          模型性能
        </CardTitle>
        <CardDescription>各模型运行指标对比</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modelsData?.model_performance.slice(0, 5).map((model, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{model.model_name}</span>
                <Badge variant="secondary">{model.total_requests} 次</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>成功率: {model.avg_success_rate.toFixed(1)}%</div>
                <div>缓存命中: {model.avg_cache_hit_rate.toFixed(1)}%</div>
                <div>延迟: {model.avg_latency_ms.toFixed(0)}ms</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskTypeDistributionCard({ taskTypeStats }: { taskTypeStats: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>任务类型分布</CardTitle>
        <CardDescription>各类AI任务的调用量统计</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          {taskTypeStats.map((stat, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-4">
              <div className="text-2xl font-bold">{stat.total_requests}</div>
              <div className="text-sm text-muted-foreground">{stat.task_type}</div>
              <div className="text-xs text-green-600">
                缓存命中: {stat.cache_hit_rate.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ModelProvidersCard({
  providers,
  onAdd,
  onEdit,
  onDelete,
  refreshData,
}: {
  providers: any[];
  onAdd: () => void;
  onEdit: (provider: any) => void;
  onDelete: (id: string) => void;
  refreshData: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>模型提供商</span>
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            添加提供商
          </Button>
        </CardTitle>
        <CardDescription>已接入的AI模型服务</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`rounded-full p-2 ${
                    provider.health_status === 'healthy'
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-yellow-100 dark:bg-yellow-900'
                  }`}
                >
                  {provider.health_status === 'healthy' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{provider.provider_display_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {provider.provider_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right text-sm">
                  <div className="font-medium">${provider.cost_per_1k_tokens}/1K tokens</div>
                  <div className="text-muted-foreground">
                    延迟: {provider.average_latency_ms}ms
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(provider)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(provider.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RoutingRulesCard({
  rules,
  providers,
  onAdd,
  onEdit,
  onDelete,
  refreshData,
}: {
  rules: any[];
  providers: any[];
  onAdd: () => void;
  onEdit: (rule: any) => void;
  onDelete: (id: string) => void;
  refreshData: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>路由规则</span>
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            添加规则
          </Button>
        </CardTitle>
        <CardDescription>模型智能路由配置</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-3">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{rule.rule_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {rule.rule_description}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                  {rule.is_active ? '启用' : '禁用'}
                </Badge>
                <Badge variant="outline">优先级: {rule.priority}</Badge>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(rule)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(rule.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CacheStatsCard({ cacheStats }: { cacheStats: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>缓存统计</CardTitle>
        <CardDescription>智能缓存系统运行指标</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4">
            <div className="text-2xl font-bold">{cacheStats?.total_entries || 0}</div>
            <div className="text-sm text-muted-foreground">缓存条目数</div>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="text-2xl font-bold">{cacheStats?.total_hits || 0}</div>
            <div className="text-sm text-muted-foreground">总命中次数</div>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="text-2xl font-bold">
              {cacheStats?.avg_hits_per_entry.toFixed(1) || 0}
            </div>
            <div className="text-sm text-muted-foreground">平均命中/条目</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CacheOptimizationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>缓存优化建议</CardTitle>
        <CardDescription>基于使用数据的优化策略</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium">高命中率缓存</div>
              <div className="text-sm text-muted-foreground">
                对话类任务缓存命中率已达85%，建议保持当前配置
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium">TTL优化建议</div>
              <div className="text-sm text-muted-foreground">
                摘要类任务缓存TTL可从1小时延长至4小时，提升命中率
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Zap className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">预热缓存</div>
              <div className="text-sm text-muted-foreground">
                建议对高频查询进行缓存预热，降低首次调用延迟
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsFilters({
  period,
  onPeriodChange,
}: {
  period: string;
  onPeriodChange: (period: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>分析筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Label>时间范围:</Label>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailedAnalyticsCard({ usageData }: { usageData: UsageData | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>详细分析</CardTitle>
        <CardDescription>用量统计与成本分析</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-medium">用量统计</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">总请求量</span>
                <span>{usageData?.summary.total_requests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">缓存命中</span>
                <span className="text-green-600">{usageData?.summary.cache_hits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">实际付费</span>
                <span className="text-orange-600">{usageData?.summary.actual_paid_requests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">总Tokens</span>
                <span>{usageData?.summary.total_tokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">成本分析</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">总成本</span>
                <span className="font-medium">${usageData?.summary.total_cost.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">节省成本</span>
                <span className="text-green-600">
                  ${usageData?.summary.cache_hit_cost_saved.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">平均延迟</span>
                <span>{usageData?.summary.avg_latency_ms.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">成功率</span>
                <span className="text-green-600">{usageData?.summary.success_rate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
