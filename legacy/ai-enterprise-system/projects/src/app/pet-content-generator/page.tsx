'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PenTool, Sparkles, Download, Copy, CheckCircle, AlertCircle, Loader2, BarChart3, TrendingUp, ArrowLeft, Image, Video, Settings, Zap, Play, Square, RefreshCw, Send } from 'lucide-react';
import OneClickPublishModal from '@/components/pet-content/OneClickPublishModal';

export default function PetContentGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [multiVersions, setMultiVersions] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [generateMode, setGenerateMode] = useState<'single' | 'multi'>('single');
  const [showTranslation, setShowTranslation] = useState<{ [key: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'text' | 'comfyui'>('text');
  const [comfyuiResult, setComfyuiResult] = useState<any>(null);
  const [comfyuiStatus, setComfyuiStatus] = useState<{
    running: boolean;
    healthy: boolean;
    version: string;
    hasModels: boolean;
  } | null>(null);
  
  // 一键发布相关状态
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishContent, setPublishContent] = useState<string>('');
  const [publishMediaUrls, setPublishMediaUrls] = useState<string[]>([]);

  // 检查 ComfyUI 服务状态
  const checkComfyUIStatus = async () => {
    try {
      const response = await fetch('/api/comfyui/service');
      const status = await response.json();
      setComfyuiStatus(status);
    } catch (error) {
      console.error('检查服务状态失败:', error);
      setComfyuiStatus({
        running: false,
        healthy: false,
        version: 'unknown',
        hasModels: false
      });
    }
  };

  // 启动 ComfyUI 服务
  const startComfyUIService = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/comfyui/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ ' + result.message);
        await checkComfyUIStatus();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error: any) {
      alert('❌ 启动失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 生成图片
  const handleComfyUIGenerate = async () => {
    if (!comfyuiStatus?.running) {
      alert('请先启动 ComfyUI 服务');
      return;
    }

    if (!comfyuiStatus?.hasModels) {
      alert('请先下载模型文件：\n1. 访问 https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0\n2. 下载 sd_xl_base_1.0.safetensors\n3. 保存到 ComfyUI-Service/models/checkpoints/');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/comfyui/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `A professional product photography of ${formData.productName || 'pet product'} with ${formData.features.split('\n').filter((f: string) => f.trim()).join(', ')}. High quality, detailed, commercial photography style, 8k resolution.`,
          width: 1024,
          height: 1024
        })
      });

      const result = await response.json();

      if (result.success) {
        setComfyuiResult({
          type: 'product-photography',
          image: result.image,
          filename: result.filename,
          timestamp: new Date().toISOString()
        });
      } else {
        alert('❌ 生成失败: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ 生成失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'comfyui') {
      checkComfyUIStatus();
      const interval = setInterval(checkComfyUIStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // 快速填充示例数据
  const fillExampleData = () => {
    setFormData({
      productName: 'Interactive Dog Toy - 自动互动球',
      description: '这款智能互动球专为爱宠设计，具备自动弹跳和发声功能，能有效激发狗狗的猎奇本能。采用食品级安全材质，耐咬耐磨，适合各种体型的狗狗使用。内置重力感应系统，滚动时发出有趣的声音，让您的宠物爱不释手。',
      category: 'toys',
      targetPet: ['dog'],
      features: '自动弹跳\n发声功能\n食品级材质\n耐咬耐磨\n重力感应',
      platform: 'tiktok',
      language: 'en',
      audience: 'Dog owners who want to keep their pets active and entertained'
    });
  };

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: 'toys',
    targetPet: ['dog'],
    features: '',
    platform: 'tiktok',
    language: 'en',
    audience: ''
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pet-content/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: formData.productName,
          description: formData.description,
          platform: formData.platform,
          language: formData.language,
          audience: formData.audience,
          category: formData.category,
          targetPet: formData.targetPet[0],
          features: formData.features
        })
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedContent(result.data);
        setMultiVersions(null);
      } else {
        alert(`生成失败: ${result.details || result.error}`);
      }
    } catch (error: any) {
      console.error('生成失败:', error);
      alert(`生成失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pet-content/multi-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: formData.productName,
          description: formData.description,
          platform: formData.platform,
          language: formData.language,
          audience: formData.audience,
          versions: 3,
          category: formData.category,
          targetPet: formData.targetPet[0],
          features: formData.features
        })
      });

      const result = await response.json();

      if (result.success) {
        setMultiVersions(result.data);
        setGeneratedContent(null);
      } else {
        alert(`多版本生成失败: ${result.details || result.error}`);
      }
    } catch (error: any) {
      console.error('多版本生成失败:', error);
      alert(`多版本生成失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent?.content) {
      navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!generatedContent?.content) return;

    const content = generatedContent.content;
    const filename = `${formData.productName || 'product'}_${formData.platform}_${Date.now()}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCopyVersion = (content: string, translatedContent?: string) => {
    const textToCopy = translatedContent || content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVersion = (content: string, version: number, isTranslation: boolean = false) => {
    const textToDownload = isTranslation ? content : content;
    const langSuffix = isTranslation ? '_zh' : '_en';
    const filename = `${formData.productName || 'product'}_${formData.platform}_v${version}${langSuffix}_${Date.now()}.txt`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  宠物用品内容生成 Agent
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  零成本生成多平台多语种宠物用品内容
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

        {/* 标签页切换 */}
        <div className="mb-6">
          <div className="inline-flex rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="h-4 w-4" />
              <span>文案生成</span>
            </button>
            <button
              onClick={() => setActiveTab('comfyui')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'comfyui'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>AI 图像生成</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">一键启动</span>
            </button>
          </div>
        </div>

        {/* 文案生成界面 */}
        {activeTab === 'text' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 左侧：输入表单 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>产品信息</span>
                </h2>
                <button
                  onClick={fillExampleData}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  填充示例数据
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    产品名称
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="例如：Interactive Dog Toy"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    产品描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="详细描述产品的功能、材质、使用场景..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      产品类别
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="toys">玩具</option>
                      <option value="food">食品</option>
                      <option value="supplies">用品</option>
                      <option value="clothing">服饰</option>
                      <option value="medicine">医疗</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      目标宠物
                    </label>
                    <select
                      value={formData.targetPet[0]}
                      onChange={(e) => setFormData({ ...formData, targetPet: [e.target.value] })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="dog">狗</option>
                      <option value="cat">猫</option>
                      <option value="bird">鸟</option>
                      <option value="small">小宠</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    产品特性（每行一个）
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="自动弹跳&#10;发声功能&#10;食品级材质"
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      目标平台
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      输出语言
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="en">English (英语)</option>
                      <option value="zh">中文</option>
                      <option value="es">Español (西班牙语)</option>
                      <option value="fr">Français (法语)</option>
                      <option value="de">Deutsch (德语)</option>
                      <option value="ja">日本語 (日语)</option>
                      <option value="ko">한국어 (韩语)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    目标受众
                  </label>
                  <textarea
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    placeholder="例如：Dog owners who want to keep their pets active and entertained"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 resize-none"
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>生成文案</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleMultiGenerate}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-50 transition-all disabled:opacity-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5" />
                        <span>多版本生成（3个版本 + 评分）</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：生成结果 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>生成结果</span>
                </h2>
                {generatedContent && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setPublishContent(generatedContent.content || '');
                        setPublishMediaUrls([]);
                        setShowPublishModal(true);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-medium hover:shadow-lg transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>一键发布</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors dark:hover:bg-slate-800 dark:text-slate-400"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors dark:hover:bg-slate-800 dark:text-slate-400"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {generatedContent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {generatedContent.content}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">平台</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {generatedContent.platform}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">语言</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {generatedContent.language}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400">长度</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {generatedContent.content?.length || 0} 字
                      </p>
                    </div>
                  </div>
                </div>
              ) : multiVersions ? (
                <div className="space-y-4">
                  {multiVersions.versions.map((version: any, index: number) => (
                    <div key={index} className="border border-slate-200 rounded-xl overflow-hidden dark:border-slate-700">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            版本 {index + 1}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(version.score)} bg-opacity-10 dark:bg-opacity-20`}>
                            评分: {version.score}/100
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowTranslation({ ...showTranslation, [index]: !showTranslation[index] })}
                            className="text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-600"
                          >
                            {showTranslation[index] ? '原文' : '翻译'}
                          </button>
                          <button
                            onClick={() => handleCopyVersion(version.content, version.translatedContent)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 dark:hover:bg-slate-700 dark:text-slate-400"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadVersion(showTranslation[index] ? version.translatedContent : version.content, index + 1, showTranslation[index])}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 dark:hover:bg-slate-700 dark:text-slate-400"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                          {showTranslation[index] && version.translatedContent
                            ? version.translatedContent
                            : version.content}
                        </p>
                        {version.analysis && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              分析: {version.analysis}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">平均评分</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {multiVersions.averageScore}/100
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">推荐版本</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          #{multiVersions.bestVersion}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">平台</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                          {multiVersions.platform}
                        </p>
                      </div>
                    </div>
                    
                    {/* 多版本一键发布按钮 */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          const bestVersionIndex = multiVersions.bestVersion - 1;
                          const bestVersion = multiVersions.versions[bestVersionIndex];
                          setPublishContent(bestVersion?.content || '');
                          setPublishMediaUrls([]);
                          setShowPublishModal(true);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all"
                      >
                        <Send className="h-5 w-5" />
                        <span>一键发布推荐版本</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Sparkles className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    填写产品信息后点击生成按钮
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ComfyUI 图像生成界面 */}
        {activeTab === 'comfyui' && (
          <div className="space-y-6">
            {/* 服务状态卡片 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    {comfyuiStatus?.running ? (
                      <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      ComfyUI 服务状态
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {comfyuiStatus?.running
                        ? `运行中 - 版本 ${comfyuiStatus.version || '未知'}`
                        : '服务未启动'}
                    </p>
                  </div>
                </div>

                {!comfyuiStatus?.running ? (
                  <button
                    onClick={startComfyUIService}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                    <span>一键启动服务</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <RefreshCw
                      onClick={checkComfyUIStatus}
                      className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {comfyuiStatus?.hasModels ? '✅ 模型已就绪' : '⚠️ 需要下载模型'}
                    </span>
                  </div>
                )}
              </div>

              {/* 详细状态 */}
              {comfyuiStatus?.running && (
                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">服务地址</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">http://localhost:8188</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">版本</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{comfyuiStatus.version}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">模型状态</p>
                    <p className={`text-sm font-medium ${comfyuiStatus.hasModels ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {comfyuiStatus.hasModels ? '已就绪' : '未安装'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 模型下载提示 */}
            {comfyuiStatus?.running && !comfyuiStatus.hasModels && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                      需要下载模型文件
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                      ComfyUI 需要模型文件才能生成图片。请按照以下步骤操作：
                    </p>
                    <ol className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-decimal list-inside">
                      <li>访问 <a href="https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0" target="_blank" rel="noopener noreferrer" className="underline font-medium">Hugging Face</a></li>
                      <li>下载文件: <code className="bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded">sd_xl_base_1.0.safetensors</code></li>
                      <li>保存到: <code className="bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded">ComfyUI-Service/models/checkpoints/</code></li>
                    </ol>
                    <button
                      onClick={checkComfyUIStatus}
                      className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                    >
                      下载完成后点击刷新 →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 生成区域 */}
            {comfyuiStatus?.running && comfyuiStatus.hasModels && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span>生成产品图片</span>
                  </h3>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleComfyUIGenerate}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>生成产品宣传图</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 生成结果 */}
                {comfyuiResult?.image && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={comfyuiResult.image}
                        alt="Generated"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        文件名: {comfyuiResult.filename}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = comfyuiResult.image;
                            link.download = comfyuiResult.filename;
                            link.click();
                          }}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>下载图片</span>
                        </button>
                        <button
                          onClick={() => {
                            setPublishContent(formData.description || formData.productName);
                            setPublishMediaUrls([comfyuiResult.image]);
                            setShowPublishModal(true);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all"
                        >
                          <Send className="h-4 w-4" />
                          <span>一键发布</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 一键发布对话框 */}
      <OneClickPublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        content={publishContent}
        mediaUrls={publishMediaUrls}
        productName={formData.productName}
      />
    </div>
  );
}
