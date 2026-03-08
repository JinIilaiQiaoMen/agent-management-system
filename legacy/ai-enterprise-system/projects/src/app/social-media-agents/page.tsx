'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot, ArrowLeft, Plus, Settings, Play, Pause, RefreshCw,
  TrendingUp, Users, MessageSquare, Calendar, BarChart3,
  Zap, Clock, CheckCircle, XCircle, AlertCircle, Loader2,
  Send, Edit2, Trash2, Eye, Activity, Target, Globe,
  ShoppingBag, Sparkles, ChevronRight, Layers, Shield, FileText
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AgentConfigModal from '@/components/social-media-agents/AgentConfigModal';
import CreateTaskModal from '@/components/social-media-agents/CreateTaskModal';

// Agent类型定义
interface SocialMediaAgent {
  id: string;
  name: string;
  platform: string;
  platformIcon: string;
  status: 'active' | 'idle' | 'offline' | 'error';
  capabilities: AgentCapability[];
  tasks: AgentTask[];
  stats: AgentStats;
  config: AgentConfig;
  createdAt: string;
  lastActiveAt: string;
}

interface AgentCapability {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
  description: string;
}

interface AgentTask {
  id: string;
  type: 'content_gen' | 'auto_reply' | 'schedule' | 'analytics' | 'engage';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

interface AgentStats {
  totalTasks: number;
  successRate: number;
  avgResponseTime: number;
  engagementRate: number;
  followers: number;
  posts: number;
  replies: number;
}

interface AgentConfig {
  autoReply: boolean;
  autoSchedule: boolean;
  contentStyle: string;
  targetAudience: string;
  postingSchedule: string[];
  replyRules: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SocialMediaAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<SocialMediaAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SocialMediaAgent | null>(null);
  const [activeView, setActiveView] = useState<'matrix' | 'monitor' | 'tasks' | 'analytics'>('matrix');
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SocialMediaAgent | null>(null);
  
  // 定时任务相关状态
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any>({});
  const [loadingTasks, setLoadingTasks] = useState(false);

  // 加载Agent列表
  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social-media-agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('加载Agent列表失败:', error);
      // 如果加载失败，可以设置一些默认空数据
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载Agent列表
  useEffect(() => {
    loadAgents();
  }, []);

  // 加载定时任务
  const loadScheduledTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await fetch('/api/social-media-agents/tasks');
      const data = await response.json();
      setScheduledTasks(data.tasks || []);
      setTaskStats(data.stats || {});
    } catch (error) {
      console.error('加载任务失败:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // 当切换到任务视图时加载任务
  useEffect(() => {
    if (activeView === 'tasks') {
      loadScheduledTasks();
    }
  }, [activeView]);

  // 计算总体统计
  const overallStats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalTasks: agents.reduce((sum, a) => sum + (a.stats?.totalTasks || 0), 0),
    avgSuccessRate: agents.length > 0 ? (agents.reduce((sum, a) => sum + (a.stats?.successRate || 0), 0) / agents.length).toFixed(1) : '0',
    totalFollowers: agents.reduce((sum, a) => sum + (a.stats?.followers || 0), 0),
    totalPosts: agents.reduce((sum, a) => sum + (a.stats?.posts || 0), 0),
  };

  // 切换Agent状态
  const toggleAgentStatus = async (agentId: string) => {
    // 先更新本地状态
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const newStatus = agent.status === 'active' ? 'idle' : 'active';
        return { ...agent, status: newStatus, lastActiveAt: new Date().toISOString() };
      }
      return agent;
    }));

    // 然后更新数据库
    try {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        const newStatus = agent.status === 'active' ? 'idle' : 'active';
        await fetch('/api/social-media-agents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: agentId, status: newStatus }),
        });
      }
    } catch (error) {
      console.error('更新Agent状态失败:', error);
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'idle': return 'bg-amber-500';
      case 'offline': return 'bg-slate-400';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  // 获取状态标签
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '运行中';
      case 'idle': return '待机';
      case 'offline': return '离线';
      case 'error': return '异常';
      default: return '未知';
    }
  };

  // 渲染Agent矩阵视图
  const renderMatrixView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800"
          onClick={() => setSelectedAgent(agent)}
        >
          {/* Agent头部 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-xl">
                {agent.platformIcon}
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                  {agent.name}
                </h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`}></span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {getStatusLabel(agent.status)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAgentStatus(agent.id);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {agent.status === 'active' ? (
                <Pause className="h-4 w-4 text-amber-600" />
              ) : (
                <Play className="h-4 w-4 text-emerald-600" />
              )}
            </button>
          </div>

          {/* 能力标签 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {agent.capabilities.filter(c => c.enabled).slice(0, 3).map((cap) => (
              <span
                key={cap.id}
                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              >
                {cap.icon} {cap.name}
              </span>
            ))}
            {agent.capabilities.filter(c => c.enabled).length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                +{agent.capabilities.filter(c => c.enabled).length - 3}
              </span>
            )}
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {agent.stats.successRate}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">成功率</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {agent.stats.totalTasks}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">任务数</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {(agent.stats.followers / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">粉丝</p>
            </div>
          </div>
        </div>
      ))}

      {/* 添加新Agent卡片 */}
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 flex flex-col items-center justify-center min-h-[180px] hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-900/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 mb-3">
          <Plus className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          添加新Agent
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          配置社媒运营助手
        </p>
      </div>
    </div>
  );

  // 渲染监控视图
  const renderMonitorView = () => (
    <div className="space-y-6">
      {/* 实时状态概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">活跃Agent</p>
              <p className="text-3xl font-bold mt-1">{overallStats.activeAgents}/{overallStats.totalAgents}</p>
            </div>
            <Bot className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">平均成功率</p>
              <p className="text-3xl font-bold mt-1">{overallStats.avgSuccessRate}%</p>
            </div>
            <Target className="h-8 w-8 text-emerald-200" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">总任务数</p>
              <p className="text-3xl font-bold mt-1">{overallStats.totalTasks}</p>
            </div>
            <Layers className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">总粉丝数</p>
              <p className="text-3xl font-bold mt-1">{(overallStats.totalFollowers / 1000).toFixed(1)}k</p>
            </div>
            <Users className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Agent状态列表 */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Agent运行状态</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {agents.map((agent) => (
            <div key={agent.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-xl">
                  {agent.platformIcon}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{agent.name}</p>
                  <div className="flex items-center space-x-3 mt-0.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      上次活跃: {new Date(agent.lastActiveAt).toLocaleTimeString('zh-CN')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      agent.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {getStatusLabel(agent.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {agent.stats.totalTasks} 任务
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    成功率 {agent.stats.successRate}%
                  </p>
                </div>
                <button
                  onClick={() => toggleAgentStatus(agent.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    agent.status === 'active'
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  {agent.status === 'active' ? '暂停' : '启动'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染分析视图
  const renderAnalyticsView = () => {
    const platformData = agents.map(a => ({
      name: a.platformIcon + ' ' + a.platform.charAt(0).toUpperCase() + a.platform.slice(1),
      followers: a.stats.followers,
      posts: a.stats.posts,
      engagement: a.stats.engagementRate,
      success: a.stats.successRate,
    }));

    return (
      <div className="space-y-6">
        {/* 平台粉丝分布 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">各平台粉丝分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="followers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 互动率和成功率 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">互动率对比</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">任务成功率</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[80, 100]} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="success" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染定时任务视图
  const renderTasksView = () => {
    const getTaskStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'running': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      }
    };

    const getTaskStatusLabel = (status: string) => {
      switch (status) {
        case 'pending': return '待执行';
        case 'running': return '执行中';
        case 'completed': return '已完成';
        case 'failed': return '失败';
        case 'cancelled': return '已取消';
        default: return '未知';
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'border-l-red-500';
        case 'medium': return 'border-l-amber-500';
        case 'low': return 'border-l-blue-500';
        default: return 'border-l-slate-300';
      }
    };

    const getRepeatLabel = (repeat: string) => {
      switch (repeat) {
        case 'daily': return '每天';
        case 'weekly': return '每周';
        case 'monthly': return '每月';
        default: return '单次';
      }
    };

    const handleDeleteTask = async (taskId: string) => {
      if (!confirm('确定要删除这个任务吗？')) return;

      try {
        const response = await fetch(`/api/social-media-agents/tasks?id=${taskId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          loadScheduledTasks();
        } else {
          alert(`删除失败: ${result.error}`);
        }
      } catch (error: any) {
        alert(`删除失败: ${error.message}`);
      }
    };

    const handleCancelTask = async (taskId: string) => {
      try {
        const response = await fetch('/api/social-media-agents/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, status: 'cancelled' }),
        });
        const result = await response.json();
        if (result.success) {
          loadScheduledTasks();
        } else {
          alert(`取消失败: ${result.error}`);
        }
      } catch (error: any) {
        alert(`取消失败: ${error.message}`);
      }
    };

    return (
      <div className="space-y-6">
        {/* 任务统计 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">总任务</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{taskStats.total || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">待执行</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{taskStats.pending || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">执行中</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{taskStats.running || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">已完成</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{taskStats.completed || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">今日待执行</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{taskStats.upcomingToday || 0}</p>
          </div>
        </div>

        {/* 创建任务按钮 */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">定时任务列表</h3>
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>创建定时任务</span>
          </button>
        </div>

        {/* 任务列表 */}
        {loadingTasks ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : scheduledTasks.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">暂无定时任务</p>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              创建第一个任务
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-xl border border-slate-200 bg-white p-4 border-l-4 ${getPriorityColor(task.priority)} dark:border-slate-700 dark:bg-slate-800`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl dark:bg-slate-700">
                      {task.platformIcon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">{task.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTaskStatusColor(task.status)}`}>
                          {getTaskStatusLabel(task.status)}
                        </span>
                        {task.repeat !== 'none' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                            {getRepeatLabel(task.repeat)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {task.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(task.scheduledTime).toLocaleString('zh-CN')}</span>
                        </span>
                        <span>{task.agentName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleCancelTask(task.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-700 dark:text-slate-400"
                          title="取消任务"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 dark:hover:bg-red-900/30"
                          title="删除任务"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {task.status === 'completed' && task.result && (
                      <div className="text-right text-xs">
                        <p className="text-emerald-600 dark:text-emerald-400">执行成功</p>
                        {task.result.views && <p className="text-slate-500">{task.result.views.toLocaleString()} 浏览</p>}
                      </div>
                    )}
                    {task.status === 'failed' && (
                      <span className="text-xs text-red-600 dark:text-red-400">{task.errorMessage || '执行失败'}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  社媒运营 Agent 矩阵
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  多平台智能运营助手统一管理与协作
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span>创建定时任务</span>
              </button>
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Agent总数</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{overallStats.totalAgents}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">活跃中</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{overallStats.activeAgents}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">总任务</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{overallStats.totalTasks}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">成功率</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{overallStats.avgSuccessRate}%</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">总粉丝</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{(overallStats.totalFollowers / 1000).toFixed(1)}k</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">总发布</p>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">{overallStats.totalPosts}</p>
            </div>
          </div>
        </div>

        {/* 视图切换 */}
        <div className="mb-6">
          <div className="inline-flex rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
            <button
              onClick={() => setActiveView('matrix')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === 'matrix'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>矩阵视图</span>
            </button>
            <button
              onClick={() => setActiveView('monitor')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === 'monitor'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>监控面板</span>
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === 'analytics'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>数据分析</span>
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === 'tasks'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>定时任务</span>
              {taskStats.pending > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {taskStats.pending}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        {activeView === 'matrix' && renderMatrixView()}
        {activeView === 'monitor' && renderMonitorView()}
        {activeView === 'analytics' && renderAnalyticsView()}
        {activeView === 'tasks' && renderTasksView()}

        {/* Agent详情侧边栏 */}
        {selectedAgent && (
          <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-slate-200 shadow-xl overflow-y-auto dark:bg-slate-800 dark:border-slate-700 z-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl">
                    {selectedAgent.platformIcon}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      {selectedAgent.name}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedAgent.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {getStatusLabel(selectedAgent.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <XCircle className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* 能力配置 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">能力配置</h3>
                <div className="space-y-2">
                  {selectedAgent.capabilities.map((cap) => (
                    <div
                      key={cap.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{cap.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{cap.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cap.description}</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                        cap.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}>
                        {cap.enabled && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 运营配置 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">运营配置</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">自动回复</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedAgent.config.autoReply
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {selectedAgent.config.autoReply ? '已启用' : '已关闭'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">定时发布</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedAgent.config.autoSchedule
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {selectedAgent.config.autoSchedule ? '已启用' : '已关闭'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">内容风格</span>
                    <span className="text-sm text-slate-900 dark:text-white">{selectedAgent.config.contentStyle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">目标受众</span>
                    <span className="text-sm text-slate-900 dark:text-white">{selectedAgent.config.targetAudience}</span>
                  </div>
                </div>
              </div>

              {/* 发布时间表 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">发布时间表</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.config.postingSchedule.map((time, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleAgentStatus(selectedAgent.id)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedAgent.status === 'active'
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                  }`}
                >
                  {selectedAgent.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>暂停Agent</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>启动Agent</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  <span>创建定时任务</span>
                </button>
                <button
                  onClick={() => {
                    setEditingAgent(selectedAgent);
                    setShowConfigModal(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  <Settings className="h-4 w-4" />
                  <span>配置Agent</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent配置对话框 */}
      <AgentConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setEditingAgent(null);
        }}
        agent={editingAgent}
        onSave={(agentId, newConfig, newCapabilities) => {
          // 更新Agent配置
          setAgents((prev) =>
            prev.map((agent) => {
              if (agent.id === agentId) {
                return {
                  ...agent,
                  config: newConfig,
                  capabilities: newCapabilities,
                  lastActiveAt: new Date().toISOString(),
                };
              }
              return agent;
            })
          );
          // 同步更新选中Agent
          if (selectedAgent?.id === agentId) {
            setSelectedAgent((prev) =>
              prev
                ? {
                    ...prev,
                    config: newConfig,
                    capabilities: newCapabilities,
                    lastActiveAt: new Date().toISOString(),
                  }
                : null
            );
          }
        }}
      />

      {/* 创建定时任务对话框 */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        agents={agents}
        selectedAgent={selectedAgent}
        onCreated={() => {
          loadScheduledTasks();
        }}
      />
    </div>
  );
}
