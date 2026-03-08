'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  Download,
  Trash2,
  Copy,
  CheckCircle,
  Building2,
  Globe,
  Loader2,
  RefreshCw,
  FileText,
  Lightbulb
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  question: string;
  icon: string;
  category: string;
}

export default function CustomerAnalysisPage() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 获取推荐问题
  const fetchSuggestions = async (company: string) => {
    try {
      const response = await fetch(
        `/api/customer-analysis/suggestions?companyName=${encodeURIComponent(company)}`
      );
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('获取推荐问题失败:', err);
    }
  };

  // 开始新的分析会话
  const handleStartAnalysis = async () => {
    if (!companyName) {
      setError('请输入公司名称');
      return;
    }

    setLoading(true);
    setError('');
    setMessages([]);
    setSessionId(null);
    setInputMessage('');

    try {
      // 发送初始欢迎消息
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `您好！我是企业背调分析助手。我将为您深度分析 **${companyName}** 的企业背景、市场地位、潜在风险等信息。

${website ? `我将参考其官网：${website} 进行分析。` : ''}

您可以从下方的推荐问题开始，或者直接输入您想了解的内容。`,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);

      // 获取推荐问题
      await fetchSuggestions(companyName);

      // 创建新的会话（不发送消息，只初始化）
      const response = await fetch('/api/customer-analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '初始化会话',
          sessionId: null,
          companyName,
          website
        })
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        if (reader) {
          // 读取流响应但不显示，只是初始化会话
          await reader.read();
        }
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const handleSendMessage = async (messageText: string = inputMessage) => {
    if (!messageText.trim() || loading) return;

    if (!sessionId && !companyName) {
      setError('请先输入公司名称并开始分析');
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/customer-analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          companyName,
          website
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '发送失败');
      }

      // 创建 AI 消息占位符
      const aiMessageId = crypto.randomUUID();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);

      // 读取流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.done) {
                  // 获取会话ID（从响应头或第一个数据中）
                  if (!sessionId) {
                    setSessionId(crypto.randomUUID());
                  }
                  break;
                }

                if (data.content) {
                  fullContent += data.content;

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

    } catch (err: any) {
      setError(err.message);

      // 移除最后的AI消息（如果出错）
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // 点击推荐问题
  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setLoadingQuestion(suggestion.id);
    await handleSendMessage(suggestion.question);
    setLoadingQuestion(null);
  };

  // 导出报告
  const handleExport = async (format: string) => {
    if (!sessionId) {
      setError('请先开始分析');
      return;
    }

    try {
      const response = await fetch('/api/customer-analysis/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, format })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '导出失败');
      }

      // 创建下载链接
      const blob = new Blob([data.content], { type: data.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      setError(err.message);
    }
  };

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    setSessionId(null);
    setInputMessage('');
    setError('');
    setSuggestions([]);
  };

  // 复制消息
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // 可以添加提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    客户背调系统
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI 对话式分析
                  </p>
                </div>
              </div>
            </div>

            {messages.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExport('markdown')}
                  className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">导出</span>
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex items-center space-x-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">清空</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {/* 初始输入表单 */}
          {messages.length === 0 && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                开始分析
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    公司名称 *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="输入公司名称，例如：Apple Inc."
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleStartAnalysis()}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    公司网站（可选）
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="输入公司官网，例如：https://apple.com"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleStartAnalysis()}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartAnalysis}
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>正在初始化...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>开始分析</span>
                  </span>
                )}
              </button>

              {error && (
                <div className="mt-4 flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* 推荐问题 */}
          {messages.length > 0 && suggestions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  推荐问题
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions.slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={loading}
                    className="flex items-start space-x-2 rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <span className="flex-1">{suggestion.question}</span>
                    {loadingQuestion === suggestion.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 消息列表 */}
          {messages.length > 0 && (
            <div className="mb-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* 头像 */}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* 消息内容 */}
                    <div className="flex flex-col">
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {message.content.split('\n').map((line, index) => (
                            <p key={index} className="mb-2 last:mb-0">
                              {line || '\u00A0'}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {message.timestamp.toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="text-xs text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
                          title="复制"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* 输入框 */}
          {messages.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="输入您的问题..."
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                  disabled={loading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputMessage.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="发送"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-3 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
