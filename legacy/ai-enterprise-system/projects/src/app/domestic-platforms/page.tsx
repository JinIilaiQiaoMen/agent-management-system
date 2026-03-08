'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Share2, Video, MonitorPlay, Building2,
  ArrowLeft, Plus, Loader2, CheckCircle, AlertCircle, X,
  Calendar, Clock, TrendingUp, Eye, Heart, MessageCircle,
  Filter, Search, Settings, ExternalLink, BarChart3,
  Wand2, Users, Zap, Image as ImageIcon,
  Globe, LayoutDashboard, BookOpen
} from 'lucide-react';
import { DOMESTIC_PLATFORMS, PLATFORMS_BY_CATEGORY, POPULAR_PLATFORMS, DomesticPlatform } from '@/lib/social-media/domestic-platforms';
import { MediaUploaderEnhanced } from '@/components/media-uploader-enhanced';
import { AIGenerateButton } from '@/components/ai-generate-button';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { CollaborationPanel } from '@/components/collaboration-panel';
import { ExportButton } from '@/components/export-button';
import { AutoPublishRules } from '@/components/auto-publish-rules';

interface PlatformStatus {
  id: string;
  connected: boolean;
  posts: number;
}

interface PublishPlan {
  id: string;
  platform: string;
  title: string;
  contentType: string;
  content: string;
  scheduledTime: string;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
}

// 辅助函数：获取类别名称
const getCategoryName = (category: string) => {
  switch (category) {
    case 'ecommerce':
      return '电商平台';
    case 'social':
      return '社交媒体';
    case 'content':
      return '内容创作';
    case 'live':
      return '直播平台';
    default:
      return '全部';
  }
};

export default function DomesticPlatformsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'platforms' | 'publish' | 'ai' | 'analytics' | 'team' | 'rules'>('platforms');
  const [activeCategory, setActiveCategory] = useState<'all' | 'ecommerce' | 'social' | 'content' | 'live'>('all');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, PlatformStatus>>({});
  const [publishPlans, setPublishPlans] = useState<PublishPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const [publishForm, setPublishForm] = useState({
    platform: 'taobao',
    contentType: 'product',
    title: '',
    content: '',
    scheduledTime: '',
    hashtags: [] as string[],
    productInfo: {
      price: '',
      originalPrice: '',
      stock: '',
      category: ''
    }
  });

  // 加载平台状态和发布计划
  useEffect(() => {
    loadPlatformStatuses();
    loadPublishPlans();
  }, []);

  const loadPlatformStatuses = () => {
    const statuses: Record<string, PlatformStatus> = {};
    Object.keys(DOMESTIC_PLATFORMS).forEach(id => {
      statuses[id] = {
        id,
        connected: false,
        posts: 0
      };
    });

    const connectedPlatforms = ['taobao', 'jd', 'douyin', 'xiaohongshu'];
    connectedPlatforms.forEach(id => {
      statuses[id] = {
        id,
        connected: true,
        posts: Math.floor(Math.random() * 50) + 10
      };
    });

    setPlatformStatuses(statuses);
  };

  const loadPublishPlans = () => {
    setPublishPlans([
      {
        id: '1',
        platform: 'taobao',
        title: '新款宠物狗粮',
        contentType: 'product',
        content: '营养均衡，口感鲜美，您的爱犬的最佳选择！',
        scheduledTime: '2026-03-02T10:00:00',
        status: 'scheduled',
        createdAt: '2026-03-01T08:00:00'
      },
      {
        id: '2',
        platform: 'douyin',
        title: '萌宠搞笑合集',
        contentType: 'video',
        content: '狗狗的搞笑日常，保证让你笑出眼泪！',
        scheduledTime: '2026-03-03T14:30:00',
        status: 'scheduled',
        createdAt: '2026-03-01T09:30:00'
      },
      {
        id: '3',
        platform: 'xiaohongshu',
        title: '猫咪用品推荐',
        contentType: 'article',
        content: '今天给大家推荐几款超好用的猫咪用品，性价比超高！',
        scheduledTime: '2026-03-04T16:00:00',
        status: 'scheduled',
        createdAt: '2026-03-01T10:00:00'
      }
    ]);
  };

  const handlePublish = async () => {
    if (!publishForm.content.trim()) {
      alert('请输入发布内容');
      return;
    }

    setPublishing(true);
    try {
      const cleanForm = {
        ...publishForm,
        hashtags: publishForm.hashtags.filter(tag => tag.trim()),
        productInfo: publishForm.contentType === 'product' ? {
          price: publishForm.productInfo?.price || undefined,
          originalPrice: publishForm.productInfo?.originalPrice || undefined,
          stock: publishForm.productInfo?.stock || undefined,
          category: publishForm.productInfo?.category || undefined
        } : undefined
      };

      const response = await fetch('/api/domestic-platforms/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanForm)
      });

      const result = await response.json();

      if (result.success || result.status === 'scheduled') {
        alert(result.message || '发布计划创建成功！');
        setShowPublishModal(false);
        resetPublishForm();
        loadPublishPlans();
      } else {
        alert(`发布失败: ${result.error || result.message}`);
      }
    } catch (error: any) {
      alert(`发布失败: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const resetPublishForm = () => {
    setPublishForm({
      platform: 'taobao',
      contentType: 'product',
      title: '',
      content: '',
      scheduledTime: '',
      hashtags: [],
      productInfo: {
        price: '',
        originalPrice: '',
        stock: '',
        category: ''
      }
    });
    setMediaUrls([]);
  };

  const getFilteredPlatforms = () => {
    let platforms = Object.values(DOMESTIC_PLATFORMS);

    if (activeCategory !== 'all') {
      platforms = platforms.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      platforms = platforms.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return platforms;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ecommerce':
        return <ShoppingBag className="h-4 w-4" />;
      case 'social':
        return <Share2 className="h-4 w-4" />;
      case 'content':
        return <Video className="h-4 w-4" />;
      case 'live':
        return <MonitorPlay className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  国内全渠道发布中心
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  一键发布到淘宝、京东、抖音、小红书等30+主流平台
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">支持平台</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{Object.keys(DOMESTIC_PLATFORMS).length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">已连接</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {Object.values(platformStatuses).filter(p => p.connected).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">发布计划</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{publishPlans.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">累计发布</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {Object.values(platformStatuses).reduce((sum, p) => sum + p.posts, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2 mb-6">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <TabButton
              active={activeTab === 'platforms'}
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="平台管理"
              onClick={() => setActiveTab('platforms')}
            />
            <TabButton
              active={activeTab === 'publish'}
              icon={<Plus className="h-4 w-4" />}
              label="发布管理"
              onClick={() => setActiveTab('publish')}
            />
            <TabButton
              active={activeTab === 'ai'}
              icon={<Wand2 className="h-4 w-4" />}
              label="AI 创作"
              onClick={() => setActiveTab('ai')}
            />
            <TabButton
              active={activeTab === 'analytics'}
              icon={<BarChart3 className="h-4 w-4" />}
              label="数据分析"
              onClick={() => setActiveTab('analytics')}
            />
            <TabButton
              active={activeTab === 'team'}
              icon={<Users className="h-4 w-4" />}
              label="团队协作"
              onClick={() => setActiveTab('team')}
            />
            <TabButton
              active={activeTab === 'rules'}
              icon={<Zap className="h-4 w-4" />}
              label="自动规则"
              onClick={() => setActiveTab('rules')}
            />
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          {activeTab === 'platforms' && (
            <PlatformsTab
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              getFilteredPlatforms={getFilteredPlatforms}
              getCategoryIcon={getCategoryIcon}
              getCategoryName={getCategoryName}
              platformStatuses={platformStatuses}
              setShowPublishModal={setShowPublishModal}
            />
          )}

          {activeTab === 'publish' && (
            <PublishTab
              publishPlans={publishPlans}
              setShowPublishModal={setShowPublishModal}
              onExport={() => { }}
            />
          )}

          {activeTab === 'ai' && (
            <AITab
              onContentGenerated={(content: string, hashtags: string[]) => {
                setPublishForm({ ...publishForm, content, hashtags });
                setShowPublishModal(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'team' && (
            <CollaborationPanel />
          )}

          {activeTab === 'rules' && (
            <AutoPublishRules />
          )}
        </div>
      </div>

      {/* 发布弹窗 */}
      {showPublishModal && (
        <PublishModal
          publishForm={publishForm}
          setPublishForm={setPublishForm}
          mediaUrls={mediaUrls}
          setMediaUrls={setMediaUrls}
          publishing={publishing}
          handlePublish={handlePublish}
          onClose={() => setShowPublishModal(false)}
          resetPublishForm={resetPublishForm}
        />
      )}
    </div>
  );
}

// 标签页按钮组件
function TabButton({ active, icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-orange-600 text-white'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// 平台管理标签页
function PlatformsTab({ activeCategory, setActiveCategory, searchQuery, setSearchQuery, getFilteredPlatforms, getCategoryIcon, getCategoryName, platformStatuses, setShowPublishModal }: any) {
  return (
    <div>
      {/* 类别过滤和搜索 */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索平台..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {['all', 'ecommerce', 'social', 'content', 'live'].map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {getCategoryName(category)}
            </button>
          ))}
        </div>
      </div>

      {/* 平台列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            支持的平台 ({getFilteredPlatforms().length})
          </h2>
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>创建发布计划</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getFilteredPlatforms().map((platform: any) => {
            const status = platformStatuses[platform.id];
            return (
              <div
                key={platform.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg ${
                  status?.connected
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(platform.category)}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{platform.name}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{getCategoryName(platform.category)}</span>
                    </div>
                  </div>
                  {status?.connected && (
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{platform.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {platform.supportedContentTypes.join(', ')}
                  </span>
                  {status?.connected && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      已发布 {status.posts} 条
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 发布管理标签页
function PublishTab({ publishPlans, setShowPublishModal, onExport }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">发布计划</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">管理您的发布计划和任务</p>
        </div>
        <div className="flex items-center space-x-3">
          <ExportButton onExport={onExport} />
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" />
            <span>创建发布</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {publishPlans.map((plan: any) => (
          <div key={plan.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{plan.title}</h4>
                <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{plan.platform}</span>
                  <span>·</span>
                  <span>{plan.contentType}</span>
                  <span>·</span>
                  <span>{new Date(plan.scheduledTime).toLocaleString()}</span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                plan.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                plan.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {plan.status === 'scheduled' ? '待发布' : plan.status === 'published' ? '已发布' : '已完成'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI 创作标签页
function AITab({ onContentGenerated }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI 智能创作</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">使用 AI 自动生成高质量内容，支持多平台、多风格</p>
      </div>

      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">开始 AI 创作</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            输入主题或商品信息，AI 将自动为您生成吸引人的内容
          </p>
          <AIGenerateButton
            platform="taobao"
            contentType="product"
            onContentGenerated={onContentGenerated}
          />
        </div>
      </div>
    </div>
  );
}

// 发布弹窗
function PublishModal({ publishForm, setPublishForm, mediaUrls, setMediaUrls, publishing, handlePublish, onClose, resetPublishForm }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">创建发布计划</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 平台选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              选择平台
            </label>
            <select
              value={publishForm.platform}
              onChange={(e) => setPublishForm({ ...publishForm, platform: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {Object.entries(DOMESTIC_PLATFORMS).map(([id, platform]) => (
                <option key={id} value={id}>{platform.name} - {getCategoryName(platform.category)}</option>
              ))}
            </select>
          </div>

          {/* 内容类型 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              内容类型
            </label>
            <select
              value={publishForm.contentType}
              onChange={(e) => setPublishForm({ ...publishForm, contentType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="product">商品</option>
              <option value="post">动态</option>
              <option value="video">视频</option>
              <option value="article">文章</option>
            </select>
          </div>

          {/* AI 生成按钮 */}
          <div className="flex items-center space-x-3">
            <AIGenerateButton
              platform={publishForm.platform}
              contentType={publishForm.contentType}
              productInfo={publishForm.productInfo}
              onContentGenerated={(content, hashtags) => {
                setPublishForm({ ...publishForm, content, hashtags });
              }}
            />
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              标题（可选）
            </label>
            <input
              type="text"
              value={publishForm.title}
              onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
              placeholder="输入标题..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* 发布内容 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              发布内容
            </label>
            <textarea
              value={publishForm.content}
              onChange={(e) => setPublishForm({ ...publishForm, content: e.target.value })}
              rows={5}
              placeholder="输入发布内容..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* 媒体上传 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              媒体文件
            </label>
            <MediaUploaderEnhanced
              mediaUrls={mediaUrls}
              onMediaChange={setMediaUrls}
              maxCount={9}
            />
          </div>

          {/* 定时发布 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              定时发布（可选）
            </label>
            <input
              type="datetime-local"
              value={publishForm.scheduledTime}
              onChange={(e) => setPublishForm({ ...publishForm, scheduledTime: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              resetPublishForm();
              onClose();
            }}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 rounded-lg"
          >
            {publishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>创建中...</span>
              </>
            ) : (
              <span>创建发布计划</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
