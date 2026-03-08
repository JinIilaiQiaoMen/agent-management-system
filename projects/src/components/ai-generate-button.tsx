'use client';

import { useState } from 'react';
import { Wand2, Sparkles, Loader2, Copy, RefreshCw, X } from 'lucide-react';

interface AIGenerateButtonProps {
  platform: string;
  contentType: 'product' | 'post' | 'video' | 'article';
  productInfo?: {
    name?: string;
    price?: string;
    features?: string[];
    category?: string;
  };
  topic?: string;
  keywords?: string[];
  onContentGenerated: (content: string, hashtags: string[]) => void;
}

export function AIGenerateButton({
  platform,
  contentType,
  productInfo,
  topic,
  keywords,
  onContentGenerated
}: AIGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'casual' | 'enthusiastic' | 'humorous'>('enthusiastic');
  const [selectedLanguage, setSelectedLanguage] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(5);
  const [customTopic, setCustomTopic] = useState(topic || '');
  const [customKeywords, setCustomKeywords] = useState(keywords?.join(', ') || '');

  const handleGenerate = async () => {
    if (!customTopic.trim() && (!productInfo || !productInfo.name)) {
      alert('请输入主题或提供商品信息');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          contentType,
          productInfo,
          topic: customTopic,
          keywords: customKeywords.split(',').map(k => k.trim()).filter(k => k),
          tone: selectedTone,
          language: selectedLanguage,
          maxLength: 500,
          includeHashtags,
          hashtagCount
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setGeneratedContent(fullContent);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      // 解析生成的内容和标签
      const hashtags: string[] = [];
      let contentWithoutHashtags = fullContent;

      if (includeHashtags) {
        const hashtagMatches = fullContent.match(/#[^\s#]+/g);
        if (hashtagMatches) {
          hashtagMatches.forEach(tag => {
            hashtags.push(tag);
            contentWithoutHashtags = contentWithoutHashtags.replace(tag, '');
          });
        }
      }

      onContentGenerated(contentWithoutHashtags.trim(), hashtags);
      setShowDialog(false);
    } catch (error) {
      console.error('AI 生成失败:', error);
      alert('AI 生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleUseContent = () => {
    const hashtags: string[] = [];
    let contentWithoutHashtags = generatedContent;

    if (includeHashtags) {
      const hashtagMatches = generatedContent.match(/#[^\s#]+/g);
      if (hashtagMatches) {
        hashtagMatches.forEach(tag => {
          hashtags.push(tag);
          contentWithoutHashtags = contentWithoutHashtags.replace(tag, '');
        });
      }
    }

    onContentGenerated(contentWithoutHashtags.trim(), hashtags);
    setShowDialog(false);
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
      >
        <Wand2 className="h-4 w-4" />
        <span>AI 生成内容</span>
      </button>

      {/* AI 生成对话框 */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* 标题 */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    AI 内容生成
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    使用 AI 自动生成高质量内容
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* 配置区域 */}
            <div className="p-6 space-y-6">
              {/* 输入信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    主题/话题
                  </label>
                  <textarea
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="描述你想要生成的内容主题..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    关键词（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                    placeholder="例如：宠物, 健康, 优质"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* 生成选项 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    语气风格
                  </label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="professional">专业严谨</option>
                    <option value="casual">轻松亲切</option>
                    <option value="enthusiastic">热情活力</option>
                    <option value="humorous">幽默风趣</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    语言
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="zh-CN">中文</option>
                    <option value="en-US">英文</option>
                  </select>
                </div>
              </div>

              {/* 标签选项 */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">包含话题标签</span>
                </label>

                {includeHashtags && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-700 dark:text-slate-300">数量：</span>
                    <select
                      value={hashtagCount}
                      onChange={(e) => setHashtagCount(Number(e.target.value))}
                      className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    >
                      <option value={3}>3 个</option>
                      <option value={5}>5 个</option>
                      <option value={8}>8 个</option>
                      <option value={10}>10 个</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 生成内容预览 */}
            {generatedContent && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    生成内容预览
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <Copy className="h-3 w-3" />
                      <span>复制</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                取消
              </button>
              {generatedContent ? (
                <>
                  <button
                    onClick={() => setGeneratedContent('')}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>重新生成</span>
                  </button>
                  <button
                    onClick={handleUseContent}
                    className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg"
                  >
                    使用内容
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>开始生成</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
