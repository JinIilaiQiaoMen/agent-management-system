'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Globe,
  Loader2,
  MoreVertical,
  Trash2,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    enableWebSearch?: boolean;
    sources?: string[];
    model?: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  messages: Message[];
  status: 'active' | 'archived';
}

interface ConversationPanelProps {
  conversation?: Conversation;
  onSendMessage?: (message: string, enableWebSearch: boolean) => void;
  onClearConversation?: () => void;
  enableWebSearch?: boolean;
}

export function ConversationPanel({ 
  conversation, 
  onSendMessage,
  onClearConversation,
  enableWebSearch: initialWebSearch = false 
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(initialWebSearch);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 当 conversation 变化时更新消息
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !conversation) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // 调用真实的流式 API
      const response = await fetch(`/api/conversations/${conversation.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, enableWebSearch }),
      });

      if (!response.ok) throw new Error('发送消息失败');

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        metadata: { enableWebSearch, model: 'doubao-seed' },
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (reader) {
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
                assistantContent += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantContent;
                  return newMessages;
                });
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }

    onSendMessage?.(messageToSend, enableWebSearch);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (!conversation) {
    return (
      <Card className="flex flex-col h-[600px] items-center justify-center">
        <Bot className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">请选择一个对话</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* 头部 */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{conversation.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                与 {conversation.agentName} 的对话
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClearConversation}>
                <Trash2 className="h-4 w-4 mr-2" />
                清空对话
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {message.role === 'assistant' && message.metadata && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {message.metadata.enableWebSearch && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          联网搜索
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <CardContent className="pt-3 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant={enableWebSearch ? 'default' : 'outline'}
            size="icon"
            onClick={() => setEnableWebSearch(!enableWebSearch)}
            title={enableWebSearch ? '关闭联网搜索' : '开启联网搜索'}
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Input
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {enableWebSearch && (
          <p className="text-xs text-muted-foreground mt-2">
            已开启联网搜索，AI将获取最新信息
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default ConversationPanel;
