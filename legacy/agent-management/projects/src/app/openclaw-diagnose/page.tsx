"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from '@/components/Toast';

interface DiagnosticInfo {
  configExists: boolean;
  webhookUrl: string;
  apiKeyValid: boolean;
  autoTrigger: boolean;
  notifyOnStart: boolean;
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  systemUrl: string;
  apiEndpoints: {
    triggerTask: string;
    taskStatus: string;
    testConnection: string;
  };
}

interface WebhookAnalysis {
  hasInstanceId: boolean;
  instanceId?: string;
  issues: string[];
  warnings: string[];
}

interface ConnectionTest {
  success?: boolean;
  status?: number;
  statusText?: string;
  error?: string;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  message: string;
  actions?: string[];
}

interface DiagnosticResult {
  success: boolean;
  status?: string;
  message?: string;
  diagnosticInfo?: DiagnosticInfo;
  webhookAnalysis?: WebhookAnalysis;
  connectionTest?: ConnectionTest;
  recommendations?: Recommendation[];
}

export default function OpenClawDiagnosePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const runDiagnostic = async () => {
    try {
      setLoading(true);
      const response = await apiPost<DiagnosticResult>('/api/openclaw/diagnose', {});
      setResult(response);
      toast.success('诊断完成');
    } catch (error) {
      toast.error('诊断失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">OpenClaw 诊断工具</h1>
        <p className="text-muted-foreground">
          诊断 OpenClaw 集成问题，快速定位和解决配置错误
        </p>
      </div>

      {/* 运行诊断 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">诊断检查</h2>
            <p className="text-sm text-muted-foreground">
              运行完整的诊断检查，识别配置问题和连接错误
            </p>
          </div>
          <Button onClick={runDiagnostic} disabled={loading} size="lg">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                诊断中...
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                运行诊断
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* 诊断结果 */}
      {result && (
        <div className="space-y-6">
          {/* 未配置状态 */}
          {!result.success && result.status === 'not_configured' && (
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">OpenClaw 未配置</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {result.message}
                  </p>
                  <Button asChild>
                    <a href="/openclaw-integration" className="gap-2">
                      <Settings className="h-4 w-4" />
                      前往配置
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 诊断信息 */}
          {result.diagnosticInfo && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">配置信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Webhook URL</p>
                  <code className="text-xs bg-muted px-3 py-2 rounded block break-all">
                    {result.diagnosticInfo.webhookUrl}
                  </code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">系统 URL</p>
                  <code className="text-xs bg-muted px-3 py-2 rounded block">
                    {result.diagnosticInfo.systemUrl}
                  </code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">API Key</p>
                  <div className="flex items-center gap-2">
                    {result.diagnosticInfo.apiKeyValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-sm">
                      {result.diagnosticInfo.apiKeyValid ? '已配置' : '未配置'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">自动触发</p>
                  <div className="flex items-center gap-2">
                    {result.diagnosticInfo.autoTrigger ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {result.diagnosticInfo.autoTrigger ? '已启用' : '未启用'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Webhook 分析 */}
          {result.webhookAnalysis && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Webhook URL 分析</h3>
              {result.webhookAnalysis.hasInstanceId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">检测到实例 ID</span>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm mb-2">
                      <strong>实例 ID:</strong> {result.webhookAnalysis.instanceId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      OpenClaw 无法找到此实例。这通常意味着：
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>实例 ID 不正确</li>
                      <li>实例已被删除</li>
                      <li>实例未在 OpenClaw 平台创建</li>
                    </ul>
                  </div>
                  {result.webhookAnalysis.warnings.length > 0 && (
                    <div className="space-y-2">
                      {result.webhookAnalysis.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">未检测到实例 ID</span>
                  </div>
                  {result.webhookAnalysis.issues.length > 0 && (
                    <div className="space-y-2">
                      {result.webhookAnalysis.issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}
                  {result.webhookAnalysis.warnings.length > 0 && (
                    <div className="space-y-2">
                      {result.webhookAnalysis.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* 连接测试 */}
          {result.connectionTest && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">连接测试</h3>
              {result.connectionTest.success ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">连接成功</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">连接失败</span>
                  </div>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>错误:</strong> {result.connectionTest.error || result.connectionTest.statusText}
                    </p>
                    {result.connectionTest.status && (
                      <p className="text-sm mt-2">
                        <strong>状态码:</strong> {result.connectionTest.status}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* 建议 */}
          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">建议和解决方案</h3>
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-l-foreground/10 pl-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(rec.priority) as any}>
                        {rec.priority}
                      </Badge>
                      <span className="text-sm font-medium">{rec.category}</span>
                    </div>
                    <p className="text-sm">{rec.message}</p>
                    {rec.actions && rec.actions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">操作步骤:</p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                          {rec.actions.map((action, actionIndex) => (
                            <li key={actionIndex}>{action}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 快速链接 */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">快速链接</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild variant="outline" className="justify-start">
            <a href="/openclaw-integration" className="gap-2">
              <Settings className="h-4 w-4" />
              配置 OpenClaw
            </a>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <a href="/api-configs" className="gap-2">
              <Settings className="h-4 w-4" />
              管理 API 配置
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
