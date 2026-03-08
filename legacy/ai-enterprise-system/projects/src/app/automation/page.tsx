'use client';

import { useState, useEffect } from 'react';
import {
  Workflow, Zap, Play, Plus, Trash2, Edit2, ArrowLeft, Loader2, CheckCircle, XCircle,
  Calendar, Mail, Database, Bot, Bell, ChevronDown, ChevronUp
} from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: any[];
  actions: any[];
  enabled: boolean;
  createdAt: string;
}

export default function AutomationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/automation/workflows');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWorkflows(data.workflows);
        }
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
    }
  };

  const toggleWorkflow = async (workflowId: string, enabled: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/automation/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workflowId, enabled })
      });

      if (response.ok) {
        loadWorkflows();
      }
    } catch (error) {
      console.error('切换工作流状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/automation/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      });

      const data = await response.json();
      alert(data.success ? '✅ 工作流已触发' : `❌ ${data.message}`);
    } catch (error: any) {
      alert(`❌ 触发失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'webhook': return <Zap className="h-4 w-4 text-amber-600" />;
      case 'schedule': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'event': return <Bell className="h-4 w-4 text-purple-600" />;
      default: return <Workflow className="h-4 w-4 text-slate-600" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'api_call': return <Workflow className="h-4 w-4 text-blue-600" />;
      case 'email': return <Mail className="h-4 w-4 text-emerald-600" />;
      case 'notification': return <Bell className="h-4 w-4 text-amber-600" />;
      case 'database': return <Database className="h-4 w-4 text-purple-600" />;
      case 'ai_task': return <Bot className="h-4 w-4 text-pink-600" />;
      default: return <Workflow className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  自动化办公
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  工作流自动化，提高办公效率
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回</span>
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">总工作流</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{workflows.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">已启用</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {workflows.filter(w => w.enabled).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">定时任务</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {workflows.filter(w => w.triggers.some((t: any) => t.type === 'schedule')).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI 任务</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {workflows.filter(w => w.actions.some((a: any) => a.type === 'ai_task')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 工作流列表 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">工作流列表</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>新建工作流</span>
            </button>
          </div>

          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                {/* 工作流头部 */}
                <div
                  className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {workflow.triggers.slice(0, 2).map((trigger, index) => (
                          <div key={index} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            {getTriggerIcon(trigger.type)}
                          </div>
                        ))}
                        {workflow.triggers.length > 2 && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            +{workflow.triggers.length - 2}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{workflow.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {workflow.description || '暂无描述'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {workflow.enabled ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-400" />
                      )}
                      {expandedWorkflow === workflow.id ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 工作流详情 */}
                {expandedWorkflow === workflow.id && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      {/* 触发器 */}
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <span>触发器</span>
                        </h5>
                        <div className="space-y-2">
                          {workflow.triggers.map((trigger, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="p-1.5 rounded bg-white dark:bg-slate-700">
                                {getTriggerIcon(trigger.type)}
                              </div>
                              <span className="text-slate-600 dark:text-slate-400">
                                {trigger.type === 'webhook' ? 'Webhook' :
                                 trigger.type === 'schedule' ? '定时任务' :
                                 trigger.type === 'event' ? '事件触发' : '手动'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 动作 */}
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                          <Play className="h-4 w-4" />
                          <span>动作</span>
                        </h5>
                        <div className="space-y-2">
                          {workflow.actions.map((action, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="p-1.5 rounded bg-white dark:bg-slate-700">
                                {getActionIcon(action.type)}
                              </div>
                              <span className="text-slate-600 dark:text-slate-400">
                                {action.type === 'api_call' ? 'API 调用' :
                                 action.type === 'email' ? '发送邮件' :
                                 action.type === 'notification' ? '发送通知' :
                                 action.type === 'database' ? '数据库操作' :
                                 action.type === 'ai_task' ? 'AI 任务' : '其他'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        创建于 {new Date(workflow.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerWorkflow(workflow.id);
                          }}
                          disabled={loading}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm transition-colors disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                          <span>手动触发</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWorkflow(workflow.id, !workflow.enabled);
                          }}
                          disabled={loading}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            workflow.enabled
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}
                        >
                          {workflow.enabled ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          <span>{workflow.enabled ? '禁用' : '启用'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {workflows.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Workflow className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无工作流</p>
              <p className="text-sm mt-1">点击"新建工作流"开始创建</p>
            </div>
          )}
        </div>

        {/* Webhook 说明 */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>Webhook 集成</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Webhook URL：</p>
              <code className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/automation/webhooks` : 'http://localhost:5000/api/automation/webhooks'}
              </code>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">请求示例：</p>
              <pre className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm overflow-x-auto">
{`{
  "workflowId": "your_workflow_id",
  "event": "your_event",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "timestamp": "2024-03-01T00:00:00Z"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from 'next/navigation';
