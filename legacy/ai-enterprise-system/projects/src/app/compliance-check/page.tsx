'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertTriangle, XCircle, ArrowLeft, Upload, FileText, Loader2, Lightbulb, Copy, Check, RefreshCw } from 'lucide-react';

export default function ComplianceCheckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);
  const [contentToCheck, setContentToCheck] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [copied, setCopied] = useState(false);

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'youtube', name: 'YouTube', icon: '▶️' },
    { id: 'amazon', name: 'Amazon', icon: '🛒' }
  ];

  const handleCheck = async () => {
    setLoading(true);
    setCheckResult(null);
    setShowSuggestion(false);
    try {
      const response = await fetch('/api/compliance-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: contentToCheck,
          platform: selectedPlatform
        })
      });

      const result = await response.json();

      if (result.success) {
        setCheckResult(result.data);
      } else {
        alert(`检查失败: ${result.details || result.error}`);
      }
    } catch (error: any) {
      alert(`检查失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestion = async () => {
    setGeneratingSuggestion(true);
    try {
      const response = await fetch('/api/compliance-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: contentToCheck,
          platform: selectedPlatform,
          generateSuggestion: true
        })
      });

      const result = await response.json();

      if (result.success) {
        setCheckResult(result.data);
        setShowSuggestion(true);
      } else {
        alert(`生成建议失败: ${result.details || result.error}`);
      }
    } catch (error: any) {
      alert(`生成建议失败: ${error.message}`);
    } finally {
      setGeneratingSuggestion(false);
    }
  };

  const handleCopySuggestion = () => {
    if (checkResult?.suggestedContent) {
      navigator.clipboard.writeText(checkResult.suggestedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  内容合规审核 Agent
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  自动检测内容合规性，规避平台规则、广告法、知识产权风险
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左侧：输入区域 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              内容输入
            </h2>

            <div className="space-y-4">
              {/* 平台选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  选择平台
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
                        selectedPlatform === platform.id
                          ? 'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-400 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 内容输入 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  待审核内容
                </label>
                <textarea
                  value={contentToCheck}
                  onChange={(e) => setContentToCheck(e.target.value)}
                  placeholder="输入或粘贴需要审核的内容..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 resize-none"
                />
              </div>

              {/* 提交按钮 */}
              <button
                onClick={handleCheck}
                disabled={loading || !contentToCheck}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>检查中...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>开始合规检查</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 右侧：检查结果 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              检查结果
            </h2>

            {!checkResult ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <Shield className="h-16 w-16 mb-4" />
                <p className="text-sm">等待提交内容进行检查</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 总体评分 */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">合规评分</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {checkResult.score}/100
                      </p>
                    </div>
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      checkResult.score >= 80 ? 'bg-emerald-100 text-emerald-600' :
                      checkResult.score >= 60 ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    } dark:bg-opacity-20`}>
                      <Shield className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                {/* 检查项列表 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    检查项
                  </h3>
                  <div className="space-y-2">
                    {checkResult.checkedItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.item}</span>
                        {item.status === 'pass' && (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        )}
                        {item.status === 'warning' && (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                        {item.status === 'fail' && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 问题列表 */}
                {checkResult.issues.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      发现的问题 ({checkResult.issues.length})
                    </h3>
                    <div className="space-y-3">
                      {checkResult.issues.map((issue: any, index: number) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            issue.type === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                            issue.type === 'warning' ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20' :
                            'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getIssueIcon(issue.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {issue.category}
                                </span>
                              </div>
                              <p className="text-sm text-slate-900 dark:text-white mb-2">
                                {issue.message}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                💡 {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 修改建议按钮 */}
                {checkResult && checkResult.issues.length > 0 && !showSuggestion && (
                  <div className="mt-6">
                    <button
                      onClick={handleGenerateSuggestion}
                      disabled={generatingSuggestion}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {generatingSuggestion ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>生成修改建议中...</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-5 w-5" />
                          <span>生成智能修改建议</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 修改建议内容 */}
                {showSuggestion && checkResult?.suggestedContent && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                        智能修改建议
                      </h3>
                      <button
                        onClick={handleCopySuggestion}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>复制建议</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 修改说明 */}
                    {checkResult.suggestedChanges && checkResult.suggestedChanges.length > 0 && (
                      <div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <h4 className="text-sm font-medium text-amber-900 dark:text-amber-400 mb-3">修改说明</h4>
                        <div className="space-y-2">
                          {checkResult.suggestedChanges.map((change: any, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-slate-900 dark:text-white">
                                  <span className="line-through text-red-600 dark:text-red-400 mr-2">{change.original}</span>
                                  <span className="text-emerald-600 dark:text-emerald-400">→ {change.modified}</span>
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{change.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 修改后的内容 */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-900 dark:text-emerald-400">优化后的内容</span>
                      </div>
                      <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                        {checkResult.suggestedContent}
                      </p>
                    </div>

                    {/* 使用建议 */}
                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">💡 使用建议</h4>
                      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <li>• 建议对比原文，确保修改后仍保持核心信息</li>
                        <li>• 可以根据实际情况进一步微调</li>
                        <li>• 修改后的内容建议再次检查确保完全合规</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
