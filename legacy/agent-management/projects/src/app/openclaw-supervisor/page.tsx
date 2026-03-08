"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Code2,
  TestTube2,
  Hammer,
  FileText,
  History,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Database,
  Users,
  Clock,
} from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from '@/components/Toast';

interface Command {
  type: string;
  params: Record<string, any>;
  success?: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  commands?: Command[];
  timestamp: Date;
}

interface ProjectStatus {
  agents: number;
  tasks: number;
  buildStatus: 'success' | 'failed' | 'building';
  lastBuildTime: string;
}

export default function OpenClawSupervisorPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>({
    agents: 0,
    tasks: 0,
    buildStatus: 'success',
    lastBuildTime: new Date().toISOString(),
  });

  // 模拟项目状态
  useEffect(() => {
    loadProjectStatus();
  }, []);

  const loadProjectStatus = async () => {
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/tasks'),
      ]);

      if (agentsRes.ok && tasksRes.ok) {
        const agents = await agentsRes.json();
        const tasks = await tasksRes.json();

        setProjectStatus({
          agents: agents.length || 0,
          tasks: tasks.length || 0,
          buildStatus: 'success',
          lastBuildTime: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('加载项目状态失败:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 解析用户输入，提取指令
      const commands = parseUserInput(input);

      if (commands.length > 0) {
        // 执行指令
        const response = await apiPost('/api/openclaw/execute', {
          commands,
          apiKey: 'demo-api-key', // 实际应该从配置中获取
        });

        const responseAny = response as any;

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateResponseContent(responseAny),
          commands: responseAny.results || [],
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // 更新项目状态
        if (responseAny.success) {
          await loadProjectStatus();
        }
      } else {
        // 普通对话，直接返回
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '我理解您的需求。请使用指令格式来执行操作，例如：\n\n' +
            '• `创建文件:src/app/new-page/page.tsx`\n' +
            '• `读取文件:src/app/page.tsx`\n' +
            '• `执行命令:pnpm run build`\n' +
            '• `查询:agents`',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast.error('执行失败');
      console.error(error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '执行失败，请检查输入是否正确。',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const parseUserInput = (input: string): any[] => {
    const commands: any[] = [];

    // 解析各种指令格式
    if (input.includes('创建文件:') || input.includes('create:')) {
      const match = input.match(/(?:创建文件:|create:)([^\s]+)/);
      if (match) {
        commands.push({
          type: 'CREATE_FILE',
          params: {
            path: match[1],
            content: '// 新文件内容',
          },
        });
      }
    }

    if (input.includes('读取文件:') || input.includes('read:')) {
      const match = input.match(/(?:读取文件:|read:)([^\s]+)/);
      if (match) {
        commands.push({
          type: 'READ_FILE',
          params: {
            path: match[1],
          },
        });
      }
    }

    if (input.includes('执行命令:') || input.includes('execute:')) {
      const match = input.match(/(?:执行命令:|execute:)(.+)/);
      if (match) {
        commands.push({
          type: 'EXECUTE',
          params: {
            command: match[1].trim(),
          },
        });
      }
    }

    if (input.includes('查询:') || input.includes('query:')) {
      const match = input.match(/(?:查询:|query:)([^\s]+)/);
      if (match) {
        commands.push({
          type: 'QUERY',
          params: {
            type: match[1],
          },
        });
      }
    }

    if (input.includes('测试:') || input.includes('test:')) {
      commands.push({
        type: 'EXECUTE',
        params: {
          command: 'pnpm test',
        },
      });
    }

    if (input.includes('构建:') || input.includes('build:')) {
      commands.push({
        type: 'EXECUTE',
        params: {
          command: 'pnpm run build',
        },
      });
    }

    return commands;
  };

  const generateResponseContent = (response: any): string => {
    const { summary, results } = response;

    let content = '';

    if (summary) {
      content += `执行完成：共 ${summary.total} 个指令，成功 ${summary.success} 个，失败 ${summary.failed} 个。\n\n`;
    }

    if (results && results.length > 0) {
      content += '执行详情：\n\n';
      results.forEach((result: any, index: number) => {
        const icon = result.success ? '✅' : '❌';
        content += `${index + 1}. ${icon} ${result.message || result.command.type}\n`;
        if (result.error) {
          content += `   错误: ${result.error}\n`;
        }
      });
    }

    return content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">OpenClaw 主管助手</h1>
              <p className="text-muted-foreground">
                通过对话管理您的项目开发
              </p>
            </div>
          </div>
        </div>

        {/* 项目状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">智能体数量</p>
                <p className="text-2xl font-bold">{projectStatus.agents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">任务数量</p>
                <p className="text-2xl font-bold">{projectStatus.tasks}</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">构建状态</p>
                <p className="text-2xl font-bold">
                  {projectStatus.buildStatus === 'success' ? '✓ 成功' : '× 失败'}
                </p>
              </div>
              <Hammer className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">最后构建</p>
                <p className="text-sm font-medium">
                  {new Date(projectStatus.lastBuildTime).toLocaleString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">快速操作</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setInput('执行命令:pnpm run build')}
              className="gap-2"
            >
              <Hammer className="h-4 w-4" />
              构建项目
            </Button>
            <Button
              variant="outline"
              onClick={() => setInput('执行命令:pnpm test')}
              className="gap-2"
            >
              <TestTube2 className="h-4 w-4" />
              运行测试
            </Button>
            <Button
              variant="outline"
              onClick={() => setInput('查询:agents')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              查询智能体
            </Button>
            <Button
              variant="outline"
              onClick={() => setInput('查询:tasks')}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              查询任务
            </Button>
            <Button
              variant="outline"
              onClick={() => setInput('读取文件:src/app/page.tsx')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              读取首页
            </Button>
          </div>
        </Card>

        {/* 对话区域 */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">对话</h2>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              OpenClaw 已就绪
            </Badge>
          </div>

          {/* 消息列表 */}
          <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>开始与 OpenClaw 对话，管理您的项目</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.commands && message.commands.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {message.commands.map((cmd, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 text-sm ${
                              message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                            }`}
                          >
                            {cmd.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{cmd.message || cmd.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-muted-foreground">正在执行...</p>
                </div>
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div className="flex gap-2">
            <Textarea
              placeholder="输入指令或描述您的需求..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={3}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              size="lg"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              发送
            </Button>
          </div>
        </Card>

        {/* 指令说明 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">指令说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                代码操作
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 创建文件:src/app/new-page/page.tsx</li>
                <li>• 读取文件:src/app/page.tsx</li>
                <li>• 编辑文件:src/app/page.tsx</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                命令执行
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 执行命令:pnpm run build</li>
                <li>• 测试:pnpm test</li>
                <li>• 构建:pnpm run build</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                数据查询
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 查询:agents</li>
                <li>• 查询:tasks</li>
                <li>• 查询:knowledge-bases</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <History className="h-4 w-4" />
                历史记录
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 查看所有对话历史</li>
                <li>• 回溯执行记录</li>
                <li>• 导出操作日志</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 添加 useEffect 导入
import { useEffect } from 'react';
