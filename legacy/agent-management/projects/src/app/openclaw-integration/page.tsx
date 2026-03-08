"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Loader2, Send, ExternalLink, Info, Key, Webhook, Shield, Zap } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { toast } from '@/components/Toast';

interface OpenClawConfig {
  id?: string;
  webhookUrl: string;
  apiKey: string;
  autoTrigger: boolean;
  notifyOnStart: boolean;
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  description: string;
}

export default function OpenClawIntegrationPage() {
  const [config, setConfig] = useState<OpenClawConfig>({
    webhookUrl: '',
    apiKey: '',
    autoTrigger: false,
    notifyOnStart: true,
    notifyOnComplete: true,
    notifyOnError: true,
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  // 加载配置
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ config: OpenClawConfig }>('/api/openclaw/config');
      if (response.config) {
        setConfig(response.config);
      }
    } catch (error) {
      console.error('加载OpenClaw配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // 保存配置
  const handleSave = async () => {
    if (!config.webhookUrl || !config.apiKey) {
      toast.error('请填写Webhook URL和API Key');
      return;
    }

    try {
      setSaving(true);
      if (config.id) {
        await apiPut('/api/openclaw/config', config);
      } else {
        await apiPost('/api/openclaw/config', config);
      }
      toast.success('配置保存成功');
      await loadConfig();
    } catch (error) {
      toast.error('配置保存失败');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 测试连接
  const handleTest = async () => {
    if (!config.webhookUrl || !config.apiKey) {
      toast.error('请先保存配置');
      return;
    }

    try {
      setTesting(true);
      const response = await apiPost<{ success: boolean; message?: string }>('/api/openclaw/test', {
        webhookUrl: config.webhookUrl,
        apiKey: config.apiKey,
      });

      if (response.success) {
        toast.success('连接测试成功');
      } else {
        toast.error(response.message || '连接测试失败');
      }
    } catch (error) {
      toast.error('连接测试失败');
      console.error(error);
    } finally {
      setTesting(false);
    }
  };

  // 复制API端点
  const handleCopyEndpoint = () => {
    const endpoint = `${window.location.origin}/api/openclaw/trigger-task`;
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('已复制到剪贴板');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-6 w-6" />
          <h1 className="text-3xl font-bold">OpenClaw 集成</h1>
        </div>
        <p className="text-muted-foreground">
          将您的系统连接到 OpenClaw，实现自动化任务调度和管理
        </p>
      </div>

      {/* 集成说明卡片 */}
      <Card className="p-6 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-4">
          <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold">集成说明</h3>
            <p className="text-sm text-muted-foreground">
              OpenClaw 可以作为您的任务调度中心，通过 API 触发系统中的任务执行。
              配置完成后，OpenClaw 可以实时管理和监控所有任务。
            </p>
            <div className="flex gap-2 flex-wrap mt-2">
              <Badge variant="outline" className="gap-1">
                <Webhook className="h-3 w-3" />
                Webhook 回调
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                API Key 认证
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Key className="h-3 w-3" />
                任务触发
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* 配置表单 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">配置 OpenClaw 连接</h2>

        <div className="space-y-6">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">
              Webhook URL
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-openclaw.com/webhook"
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              OpenClaw 接收回调通知的 URL 地址
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">
              API Key
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="输入您的 OpenClaw API Key"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              用于身份验证的密钥，请妥善保管
            </p>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="添加关于此集成的说明..."
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* 通知设置 */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">通知设置</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoTrigger">自动触发</Label>
                <p className="text-sm text-muted-foreground">
                  允许 OpenClaw 自动触发任务执行
                </p>
              </div>
              <Switch
                id="autoTrigger"
                checked={config.autoTrigger}
                onCheckedChange={(checked) => setConfig({ ...config, autoTrigger: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyOnStart">任务开始通知</Label>
                <p className="text-sm text-muted-foreground">
                  任务开始执行时通知 OpenClaw
                </p>
              </div>
              <Switch
                id="notifyOnStart"
                checked={config.notifyOnStart}
                onCheckedChange={(checked) => setConfig({ ...config, notifyOnStart: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyOnComplete">任务完成通知</Label>
                <p className="text-sm text-muted-foreground">
                  任务执行完成时通知 OpenClaw
                </p>
              </div>
              <Switch
                id="notifyOnComplete"
                checked={config.notifyOnComplete}
                onCheckedChange={(checked) => setConfig({ ...config, notifyOnComplete: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyOnError">任务错误通知</Label>
                <p className="text-sm text-muted-foreground">
                  任务执行出错时通知 OpenClaw
                </p>
              </div>
              <Switch
                id="notifyOnError"
                checked={config.notifyOnError}
                onCheckedChange={(checked) => setConfig({ ...config, notifyOnError: checked })}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存配置'
              )}
            </Button>

            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  测试连接
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* API 使用说明 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">API 使用说明</h2>

        <div className="space-y-6">
          {/* 触发任务 API */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Send className="h-4 w-4" />
                触发任务 API
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCopyEndpoint}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    复制端点
                  </>
                )}
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-2">POST</p>
                <code className="text-sm bg-background px-3 py-2 rounded block">
                  {window.location.origin}/api/openclaw/trigger-task
                </code>
              </div>

              <div>
                <p className="text-sm font-mono text-muted-foreground mb-2">Request Headers</p>
                <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "Content-Type": "application/json",
  "X-API-Key": "your-api-key"
}`}
                </pre>
              </div>

              <div>
                <p className="text-sm font-mono text-muted-foreground mb-2">Request Body</p>
                <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "taskId": "task-uuid",
  "title": "任务标题",
  "description": "任务描述",
  "priority": "high|medium|low",
  "assigneeIds": ["agent-1", "agent-2"],
  "dueDate": "2025-01-01T00:00:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* 查询任务状态 API */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              查询任务状态 API
            </h3>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-2">GET</p>
                <code className="text-sm bg-background px-3 py-2 rounded block">
                  {window.location.origin}/api/openclaw/task-status/:taskId
                </code>
              </div>

              <div>
                <p className="text-sm font-mono text-muted-foreground mb-2">Request Headers</p>
                <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "X-API-Key": "your-api-key"
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Webhook 通知格式 */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhook 通知格式
            </h3>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                当任务状态变更时，系统会向配置的 Webhook URL 发送 POST 请求：
              </p>

              <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "event": "task.started|task.completed|task.failed",
  "taskId": "task-uuid",
  "status": "in_progress|completed|failed",
  "message": "任务消息",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "result": {},
    "error": {}
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* 查看文档按钮 */}
        <div className="mt-6 pt-6 border-t">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            查看完整 API 文档
          </Button>
        </div>
      </Card>
    </div>
  );
}
