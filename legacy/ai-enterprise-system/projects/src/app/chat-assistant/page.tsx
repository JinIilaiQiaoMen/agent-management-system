'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  User,
  Bot,
  Sparkles,
  Trash2,
  Book,
  History,
  Settings,
  Database,
  Check
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export default function ChatAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // 加载对话历史
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/chat-assistant?limit=10');
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('加载对话历史失败:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId,
          useKnowledgeBase
        })
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

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
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setStreamingContent('');
      }
    } catch (error: any) {
      console.error('发送消息失败:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent('');
    setConversationId(null);
  };

  const loadConversation = async (conv: Conversation) => {
    setMessages(conv.messages);
    setConversationId(conv.id);
    setShowHistory(false);
    scrollToBottom();
  };

  const handleHistoryClick = () => {
    setShowHistory(!showHistory);
    if (!showHistory && conversations.length === 0) {
      loadHistory();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    谈单辅助系统
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI 实时对话助手
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/knowledge-base"
                className="hidden md:flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Book className="h-4 w-4" />
                <span>知识库</span>
              </Link>
              <button
                onClick={handleHistoryClick}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <History className="h-4 w-4" />
                <span className="hidden md:inline">历史记录</span>
              </button>
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden md:inline">清空对话</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 对话历史侧边栏 */}
        {showHistory && (
          <div className="w-80 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">对话历史</h3>
            </div>
            <div className="p-4 space-y-2">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  暂无对话历史
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {new Date(conv.updated_at).toLocaleString('zh-CN')}
                    </div>
                    <div className="text-sm text-slate-900 dark:text-white truncate">
                      {conv.messages[0]?.content || '空对话'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {conv.messages.length} 条消息
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {messages.length === 0 && !loading && (
                <div className="flex h-full items-center justify-center py-20">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                      开始新的对话
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      我可以帮您处理客户沟通、产品介绍、报价建议等
                    </p>
                    <div className="mt-6 space-y-2">
                      <button
                        onClick={() => setInput('如何向客户介绍我们的产品优势？')}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:bg-purple-900/20"
                      >
                        如何向客户介绍我们的产品优势？
                      </button>
                      <button
                        onClick={() => setInput('客户压价太厉害，应该如何回应？')}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:bg-purple-900/20"
                      >
                        客户压价太厉害，应该如何回应？
                      </button>
                      <button
                        onClick={() => setInput('如何跟进一个沉默已久的客户？')}
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-purple-400 dark:hover:bg-purple-900/20"
                      >
                        如何跟进一个沉默已久的客户？
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                          : 'bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={`mt-2 text-xs ${
                          message.role === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(loading || streamingContent) && (
                <div className="flex justify-start">
                  <div className="flex space-x-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:bg-slate-800 dark:border-slate-700">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          正在思考...
                        </span>
                      </div>
                      {streamingContent && (
                        <div className="mt-2 text-sm text-slate-900 dark:text-white whitespace-pre-wrap">
                          {streamingContent}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="container mx-auto px-6 py-4">
              {/* Knowledge Base Toggle */}
              <div className="mb-3 flex items-center space-x-2">
                <button
                  onClick={() => setUseKnowledgeBase(!useKnowledgeBase)}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    useKnowledgeBase
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {useKnowledgeBase ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  <span>使用知识库</span>
                </button>
                {useKnowledgeBase && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    AI 将参考知识库内容进行回答
                  </span>
                )}
              </div>

              <div className="flex space-x-4">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题，我会帮您处理..."
                  className="flex-1 min-h-[60px] max-h-[200px] resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="flex h-[60px] w-[60px] items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                按 Enter 发送，Shift + Enter 换行
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
