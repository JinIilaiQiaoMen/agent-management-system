'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share2, ArrowLeft, Clock, Users, TrendingUp, MessageSquare,
  Calendar, BarChart3, Zap, Loader2, CheckCircle, Plus, X,
  Settings, Upload, AlertCircle, ExternalLink, Trash2,
  Layers, FileText, Bot, PieChart, Reply, Send, Sparkles,
  Target, Shield, Edit2, Save, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  needsAuth: boolean;
  posts: number;
}

interface Post {
  id: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: string;
  publishedAt?: string;
  createdAt: string;
  platformPostId?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  errorMessage?: string;
}

interface Comment {
  id: string;
  postId: string;
  platform: string;
  userId: string;
  username: string;
  commentText: string;
  replyText?: string;
  isAutoReplied: boolean;
  replyStrategy?: string;
  repliedAt?: string;
  likes: number;
  sentiment?: string;
  createdAt: string;
}

interface UserSegment {
  id: string;
  userId: string;
  platform: string;
  segmentType: string;
  score: number;
  engagementLevel: number;
  totalInteractions: number;
  lastInteractionAt?: string;
}

interface ReplyRule {
  id: string;
  platform: string;
  name: string;
  keywords: string[];
  template: string;
  replyType: string;
  priority: number;
  enabled: boolean;
  responseCount: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SocialMediaAutomationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'posts' | 'comments' | 'segments' | 'reply-rules' | 'segment-rules' | 'analytics'>('schedule');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'tiktok', name: 'TikTok', icon: '🎵', connected: false, needsAuth: true, posts: 0 },
    { id: 'instagram', name: 'Instagram', icon: '📷', connected: false, needsAuth: true, posts: 0 },
    { id: 'youtube', name: 'YouTube', icon: '▶️', connected: false, needsAuth: true, posts: 0 },
    { id: 'facebook', name: 'Facebook', icon: '📘', connected: false, needsAuth: true, posts: 0 }
  ]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [segmentStats, setSegmentStats] = useState<Record<string, number>>({});
  const [replyRules, setReplyRules] = useState<ReplyRule[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [publishForm, setPublishForm] = useState<any>({
    platform: 'tiktok',
    content: '',
    hashtags: []
  });
  const [configForm, setConfigForm] = useState<Record<string, any>>({});
  const [replyForm, setReplyForm] = useState<Record<string, any>>({});
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState<any>({});
  const [prediction, setPrediction] = useState<any>(null);

  // 加载数据
  useEffect(() => {
    loadPlatforms();
    loadPosts();

    if (activeTab === 'comments') loadComments();
    if (activeTab === 'segments') loadSegments();
    if (activeTab === 'reply-rules') loadReplyRules();
    if (activeTab === 'analytics') loadAnalytics();

    // 检查 OAuth 回调
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('oauth_success')) {
      const platform = urlParams.get('oauth_success');
      alert(`🎉 ${platform} 授权成功！`);
      window.history.replaceState({}, '', '/social-media-automation');
      loadPlatforms();
    }
  }, [activeTab]);

  const loadPlatforms = async () => {
    try {
      const response = await fetch('/api/social-media/config');
      if (response.ok) {
        const data = await response.json();
        if (data.platforms) {
          setPlatforms(data.platforms);
        }
      }
    } catch (error) {
      console.error('加载平台配置失败:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/social-media/history');
      if (response.ok) {
        const data = await response.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      }
    } catch (error) {
      console.error('加载发布历史失败:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch('/api/social-media/comments?limit=20');
      if (response.ok) {
        const data = await response.json();
        if (data.comments) {
          setComments(data.comments);
        }
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    }
  };

  const loadSegments = async () => {
    try {
      const response = await fetch('/api/social-media/users/segments/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setSegmentStats(data.stats);
        }
      }

      const segmentsRes = await fetch('/api/social-media/users/segments?limit=20');
      if (segmentsRes.ok) {
        const data = await segmentsRes.json();
        if (data.segments) {
          setSegments(data.segments);
        }
      }
    } catch (error) {
      console.error('加载用户分层失败:', error);
    }
  };

  const loadReplyRules = async () => {
    try {
      const response = await fetch('/api/social-media/reply-rules?limit=20');
      if (response.ok) {
        const data = await response.json();
        if (data.rules) {
          setReplyRules(data.rules);
        }
      }
    } catch (error) {
      console.error('加载回复规则失败:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/social-media/analytics?type=overview');
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setAnalytics(data.data);
        }
      }
    } catch (error) {
      console.error('加载分析数据失败:', error);
    }
  };

  const handleBatchAutoReply = async () => {
    if (!confirm('确定要批量自动回复所有未回复的评论吗？')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/social-media/comments/batch-auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform || undefined })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        loadComments();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ 批量自动回复失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedComment || !replyForm.replyText) {
      alert('请输入回复内容');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social-media/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: selectedComment.id,
          replyText: replyForm.replyText,
          replyStrategy: 'manual'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ 回复成功');
        setShowReplyModal(false);
        setReplyForm({});
        loadComments();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ 回复失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClassify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social-media/users/segments/batch-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform || undefined })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        loadSegments();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ 批量分层失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReplyRule = async () => {
    if (!ruleForm.name || !ruleForm.keywords || !ruleForm.template) {
      alert('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social-media/reply-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform || 'tiktok',
          name: ruleForm.name,
          keywords: Array.isArray(ruleForm.keywords) ? ruleForm.keywords : ruleForm.keywords.split(','),
          template: ruleForm.template,
          replyType: 'rule',
          priority: ruleForm.priority || 0
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ 规则创建成功');
        setShowRuleModal(false);
        setRuleForm({});
        loadReplyRules();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ 创建规则失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/social-media/reply-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, enabled })
      });

      if (response.ok) {
        loadReplyRules();
      }
    } catch (error) {
      console.error('切换规则状态失败:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('确定要删除这条规则吗？')) return;

    try {
      const response = await fetch(`/api/social-media/reply-rules?id=${ruleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadReplyRules();
      }
    } catch (error) {
      console.error('删除规则失败:', error);
    }
  };

  const handleAIPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social-media/analytics/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform || 'tiktok',
          days: 7
        })
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data.prediction);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ AI 预测失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 统计数据
  const stats = {
    totalPosts: posts.length,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    totalEngagement: posts.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0),
    unrepliedComments: comments.filter(c => !c.isAutoReplied).length
  };

  // 图表数据
  const segmentData = Object.entries(segmentStats).map(([name, value]) => ({ name, value }));

  const trendData = [
    { date: '3月1日', views: 12000, likes: 600, comments: 50 },
    { date: '3月2日', views: 15000, likes: 750, comments: 65 },
    { date: '3月3日', views: 18000, likes: 900, comments: 80 },
    { date: '3月4日', views: 16000, likes: 800, comments: 70 },
    { date: '3月5日', views: 20000, likes: 1000, comments: 90 },
    { date: '3月6日', views: 22000, likes: 1100, comments: 100 },
    { date: '3月7日', views: 25000, likes: 1250, comments: 115 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  社媒运营 Agent 矩阵
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  7×24小时自动化社媒运营，智能回复、用户分层、趋势分析
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
                <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">总发布数</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalPosts}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">总浏览量</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.totalViews > 0 ? (stats.totalViews / 1000).toFixed(1) + 'K' : '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">待回复评论</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.unrepliedComments}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">总互动量</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalEngagement}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="mb-6 overflow-x-auto">
          <div className="border-b border-slate-200 dark:border-slate-700 min-w-max">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`pb-4 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'schedule'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-1.5" />
                定时发布
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'posts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Share2 className="h-4 w-4 inline mr-1.5" />
                发布历史
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-4 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'comments'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-1.5" />
                评论管理
                {stats.unrepliedComments > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {stats.unrepliedComments}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('segments')}
                className={`pb-4 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'segments'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Layers className="h-4 w-4 inline mr-1.5" />
                用户分层
              </button>
              <button
                onClick={() => setActiveTab('reply-rules')}
                className={`pb-4 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'reply-rules'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Bot className="h-4 w-4 inline mr-1.5" />
                回复规则
              </button>
              <button
                onClick={() => setActiveTab('segment-rules')}
                className={`pb-4 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'segment-rules'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Target className="h-4 w-4 inline mr-1.5" />
                分层规则
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-4 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1.5" />
                数据分析
              </button>
            </nav>
          </div>
        </div>

        {/* 内容区域 - 根据标签页显示不同内容 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[500px]">
          {activeTab === 'schedule' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">发布计划</h3>
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>创建发布</span>
                </button>
              </div>

              {posts.filter(p => p.status === 'scheduled').length > 0 ? (
                <div className="space-y-3">
                  {posts.filter(p => p.status === 'scheduled').map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{platforms.find(p => p.id === post.platform)?.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {post.scheduledTime ? new Date(post.scheduledTime).toLocaleString('zh-CN') : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        已安排
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无定时发布计划</p>
                  <p className="text-sm mt-1">点击"创建发布"开始安排内容</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>评论管理</span>
                  {stats.unrepliedComments > 0 && (
                    <span className="text-sm text-red-600 dark:text-red-400">
                      ({stats.unrepliedComments} 条待回复)
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">全部平台</option>
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBatchAutoReply}
                    disabled={loading || stats.unrepliedComments === 0}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                    <span>批量自动回复</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      comment.isAutoReplied
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                        : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{platforms.find(p => p.id === comment.platform)?.icon}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{comment.username}</span>
                        {comment.sentiment && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            comment.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                            comment.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          } dark:bg-opacity-20`}>
                            {comment.sentiment === 'positive' ? '积极' :
                             comment.sentiment === 'negative' ? '消极' : '中性'}
                          </span>
                        )}
                      </div>
                      {!comment.isAutoReplied && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          待回复
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{comment.commentText}</p>

                    {comment.replyText && (
                      <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center space-x-2 mb-1">
                          <Reply className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {comment.replyStrategy === 'auto' ? '自动回复' : '手动回复'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{comment.replyText}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>❤️ {comment.likes}</span>
                        <span>📅 {new Date(comment.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>

                      {!comment.isAutoReplied && (
                        <button
                          onClick={() => {
                            setSelectedComment(comment);
                            setShowReplyModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm transition-colors"
                        >
                          <Reply className="h-3 w-3" />
                          <span>回复</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {comments.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无评论</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'segments' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>用户分层</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">全部平台</option>
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBatchClassify}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>批量分层</span>
                  </button>
                </div>
              </div>

              {/* 分层统计图表 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">分层分布</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {Object.entries(segmentStats).map(([name, value], index) => (
                      <div key={name} className="text-center">
                        <div
                          className="w-3 h-3 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <p className="text-xs text-slate-600 dark:text-slate-400">{name}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">分层说明</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-slate-700 dark:text-slate-300"><strong>VIP</strong> - 高价值客户</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-slate-700 dark:text-slate-300"><strong>活跃</strong> - 经常互动</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-slate-700 dark:text-slate-300"><strong>沉睡</strong> - 近期无互动</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-slate-700 dark:text-slate-300"><strong>新用户</strong> - 首次互动</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-slate-700 dark:text-slate-300"><strong>流失</strong> - 长期无互动</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 用户列表 */}
              <div className="space-y-3">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xl">{platforms.find(p => p.id === segment.platform)?.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            用户 {segment.userId.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            互动 {segment.totalInteractions} 次 · 评分 {segment.score}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        segment.segmentType === 'VIP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        segment.segmentType === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        segment.segmentType === 'dormant' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        segment.segmentType === 'churned' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {segment.segmentType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {segments.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无分层用户</p>
                  <p className="text-sm mt-1">点击"批量分层"开始自动分层</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reply-rules' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  <span>自动回复规则</span>
                </h3>
                <button
                  onClick={() => setShowRuleModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>添加规则</span>
                </button>
              </div>

              <div className="space-y-3">
                {replyRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xl">{platforms.find(p => p.id === rule.platform)?.icon}</span>
                          <h4 className="font-medium text-slate-900 dark:text-white">{rule.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            rule.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {rule.enabled ? '启用' : '禁用'}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">关键词:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(rule.keywords as string[]).map((keyword, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">回复模板:</span>
                          <span className="ml-1">{rule.template}</span>
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>优先级: {rule.priority}</span>
                          <span>已使用: {rule.responseCount} 次</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                          className={`p-2 rounded-lg transition-colors ${
                            rule.enabled
                              ? 'text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {replyRules.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无回复规则</p>
                  <p className="text-sm mt-1">点击"添加规则"开始创建</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'segment-rules' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2 mb-4">
                <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span>分层规则</span>
              </h3>
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>分层规则配置</p>
                <p className="text-sm mt-1">通过 API 创建和管理分层规则</p>
                <code className="block mt-4 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  POST /api/social-media/users/segment-rules
                </code>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>数据分析</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">全部平台</option>
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAIPrediction}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>AI 趋势预测</span>
                  </button>
                </div>
              </div>

              {/* AI 预测结果 */}
              {prediction && (
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-semibold text-slate-900 dark:text-white">AI 趋势预测</h4>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      prediction.trend === '上升' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      prediction.trend === '下降' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      趋势: {prediction.trend}
                    </span>
                  </div>

                  {prediction.insights && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">关键发现:</p>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                        {prediction.insights.map((insight: string, idx: number) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {prediction.suggestions && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">建议:</p>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                        {prediction.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 趋势图表 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">浏览量趋势</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">互动量趋势</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="likes" fill="#10b981" name="点赞" />
                      <Bar dataKey="comments" fill="#f59e0b" name="评论" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 数据统计 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.totalViews || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">总浏览量</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.totalLikes || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">总点赞数</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.totalComments || 0}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">总评论数</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.avgEngagementRate || 0}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">平均互动率</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">发布历史</h3>
              {posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map((post) => {
                    const platform = platforms.find(p => p.id === post.platform);
                    return (
                      <div
                        key={post.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          post.status === 'published'
                            ? 'border-slate-200 dark:border-slate-700'
                            : post.status === 'failed'
                            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            : 'border-amber-200 dark:border-amber-800 dark:bg-amber-900/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <span className="text-2xl">{platform?.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                {post.content}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleString('zh-CN') :
                                 post.scheduledTime ? `计划于 ${new Date(post.scheduledTime).toLocaleString('zh-CN')} 发布` :
                                 new Date(post.createdAt).toLocaleString('zh-CN')}
                              </p>
                              {post.errorMessage && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{post.errorMessage}</p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : post.status === 'failed'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {post.status === 'published' ? '已发布' :
                             post.status === 'failed' ? '发布失败' : '已安排'}
                          </span>
                        </div>

                        {post.status === 'published' && (post.views || post.likes || post.comments) && (
                          <div className="grid grid-cols-4 gap-4 text-center pt-3 border-t border-slate-100 dark:border-slate-700">
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {post.views ? (post.views / 1000).toFixed(1) + 'K' : '-'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">浏览</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {post.likes ? (post.likes / 1000).toFixed(1) + 'K' : '-'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">点赞</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {post.comments || '-'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">评论</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {post.shares || '-'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">分享</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Share2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无发布记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 回复评论模态框 */}
      {showReplyModal && selectedComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">回复评论</h3>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedComment(null);
                  setReplyForm({});
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {selectedComment.username}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedComment.commentText}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  回复内容
                </label>
                <textarea
                  value={replyForm.replyText || ''}
                  onChange={(e) => setReplyForm({ ...replyForm, replyText: e.target.value })}
                  placeholder="输入回复内容..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedComment(null);
                    setReplyForm({});
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  onClick={handleReply}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Send className="h-4 w-4" />
                  <span>发送回复</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 创建回复规则模态框 */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">创建回复规则</h3>
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setRuleForm({});
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  规则名称
                </label>
                <input
                  type="text"
                  value={ruleForm.name || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="例如：感谢评论规则"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  触发关键词（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={ruleForm.keywords || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, keywords: e.target.value })}
                  placeholder="例如：谢谢, 感谢, 赞"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  回复模板
                </label>
                <textarea
                  value={ruleForm.template || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, template: e.target.value })}
                  placeholder="感谢您的支持！💪"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  优先级 (0-100)
                </label>
                <input
                  type="number"
                  value={ruleForm.priority || 0}
                  onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowRuleModal(false);
                    setRuleForm({});
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveReplyRule}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  <span>保存规则</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
