"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  User,
  Bot,
  Loader2,
  FileText,
  Trash2,
  RefreshCw,
  Download,
  Save,
  BookOpen,
  Clock,
  Plus,
  Copy,
  Quote,
  Search,
  Globe,
} from "lucide-react";
import type { Agent, Task } from "@/storage/database";

interface ChatPanelProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent | null) => void;
  selectedTask: Task | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPanel({
  agents,
  selectedAgent,
  onAgentSelect,
  selectedTask,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 保存对话相关状态
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveToKnowledgeBase, setSaveToKnowledgeBase] = useState(false);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [referenceDialogOpen, setReferenceDialogOpen] = useState(false);

  // 联网搜索相关状态
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  // 复制功能
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // 可以添加一个临时的提示
  };

  // 引用功能 - 将引用的内容添加到输入框
  const handleQuoteMessage = (content: string, role: string) => {
    const quotedContent = `\n> 引用 ${role === 'user' ? '用户' : '智能体'}内容:\n${content}\n`;
    setInput(input + quotedContent);
  };

  // 联网搜索功能
  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/web-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, count: 5, needSummary: true }),
      });

      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.data.webItems);
      } else {
        alert("搜索失败");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("搜索失败");
    } finally {
      setIsSearching(false);
    }
  };

  // 将搜索结果添加到输入框
  const handleAddSearchResult = (result: any) => {
    const searchContent = `\n\n[搜索结果]\n标题: ${result.title}\n来源: ${result.siteName}\n链接: ${result.url}\n摘要: ${result.snippet}\n`;
    setInput(input + searchContent);
    setShowSearchPanel(false);
  };

  // 添加自定义滚动条样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }
      .dark .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const availableAgents = agents.filter((a) => a.isActive);

  useEffect(() => {
    if (selectedAgent) {
      setInput("");
      setCurrentResponse("");
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (selectedTask) {
      // 当选择任务时，将任务描述作为初始消息
      setMessages([
        {
          id: `task-${selectedTask.id}`,
          role: "user",
          content: `任务: ${selectedTask.title}\n\n${selectedTask.description}`,
          timestamp: new Date(selectedTask.createdAt),
        },
      ]);
    } else if (messages.length === 0 && selectedAgent && selectedAgent.systemPrompt) {
      // 显示系统提示词
      setMessages([
        {
          id: "system",
          role: "assistant",
          content: `我是${selectedAgent.name}，${selectedAgent.role}。\n\n${selectedAgent.systemPrompt}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [selectedTask, selectedAgent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedAgent || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentResponse("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: userMessage.content,
          taskId: selectedTask?.id || null,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  setCurrentResponse(fullResponse);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      // 添加完整的助手消息
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: fullResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentResponse("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "抱歉，我遇到了一些问题，请稍后再试。",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentResponse("");
  };

  // 加载知识库列表
  const loadKnowledgeBases = async () => {
    try {
      const response = await fetch("/api/knowledge-bases");
      const data = await response.json();
      if (data.success) {
        setKnowledgeBases(data.data);
      }
    } catch (error) {
      console.error("加载知识库失败:", error);
    }
  };

  // 保存对话
  const handleSaveConversation = async () => {
    if (!saveTitle.trim() || !selectedAgent) return;

    // 格式化对话内容
    const content = messages.map((m) => {
      const role = m.role === "user" ? "用户" : "智能体";
      const time = m.timestamp.toLocaleString("zh-CN");
      return `[${time}] ${role}:\n${m.content}\n`;
    }).join("\n" + "─".repeat(50) + "\n");

    try {
      const response = await fetch("/api/conversation-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: saveTitle,
          agentId: selectedAgent.id,
          taskId: selectedTask?.id || null,
          content,
          savedBy: "CEO", // 当前用户
          knowledgeBaseId: saveToKnowledgeBase ? selectedKnowledgeBaseId : null,
          metadata: {
            messageCount: messages.length,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("对话保存成功！");
        setSaveDialogOpen(false);
        setSaveTitle("");
        setSaveToKnowledgeBase(false);
        setSelectedKnowledgeBaseId(null);
      } else {
        alert("保存失败: " + data.error);
      }
    } catch (error) {
      console.error("保存对话失败:", error);
      alert("保存失败，请稍后再试");
    }
  };

  // 下载对话
  const handleDownloadConversation = () => {
    if (messages.length === 0) return;

    const content = messages.map((m) => {
      const role = m.role === "user" ? "用户" : "智能体";
      const time = m.timestamp.toLocaleString("zh-CN");
      return `[${time}] ${role}:\n${m.content}\n`;
    }).join("\n" + "─".repeat(50) + "\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `对话_${selectedAgent?.name}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 加载已保存的对话会话
  const loadSavedSessions = async () => {
    try {
      const agentIdParam = selectedAgent ? `?agentId=${selectedAgent.id}` : "";
      const response = await fetch(`/api/conversation-sessions${agentIdParam}`);
      const data = await response.json();
      if (data.success) {
        setSavedSessions(data.data);
      }
    } catch (error) {
      console.error("加载对话会话失败:", error);
    }
  };

  // 引用对话
  const handleReferenceConversation = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/conversation-sessions`);
      const data = await response.json();
      const session = data.data.find((s: any) => s.id === sessionId);
      
      if (session) {
        // 将引用的对话内容添加到输入框
        setInput(`【引用对话: ${session.title}】\n\n${session.content}\n\n请根据以上对话内容回答:`);
        setReferenceDialogOpen(false);
      }
    } catch (error) {
      console.error("引用对话失败:", error);
    }
  };

  // 打开保存对话框
  const openSaveDialog = () => {
    loadKnowledgeBases();
    setSaveTitle(`与${selectedAgent?.name}的对话 - ${new Date().toLocaleDateString()}`);
    setSaveDialogOpen(true);
  };

  // 打开引用对话框
  const openReferenceDialog = () => {
    loadSavedSessions();
    setReferenceDialogOpen(true);
  };

  // 当打开保存对话框时，加载知识库
  useEffect(() => {
    if (saveDialogOpen) {
      loadKnowledgeBases();
    }
  }, [saveDialogOpen]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 智能体选择 */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bot className="h-4 w-4" />
            选择智能体
          </h3>
          <Select
            value={selectedAgent?.id || "none"}
            onValueChange={(value) => {
              const agent = agents.find((a) => a.id === value);
              onAgentSelect(agent || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择智能体" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">请选择</SelectItem>
              {availableAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <span>{agent.name}</span>
                    <Badge variant="outline">{agent.role}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedAgent && (
            <div className="mt-4 space-y-2">
              {selectedAgent.department && (
                <div className="text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    部门:
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {selectedAgent.department}
                  </Badge>
                </div>
              )}
              {selectedAgent.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedAgent.description}
                </p>
              )}
              {selectedAgent.capabilities != null &&
                Array.isArray(selectedAgent.capabilities) &&
                selectedAgent.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.capabilities.map((cap, index) => (
                      <Badge key={typeof cap === 'string' ? cap : index} variant="outline" className="text-xs">
                        {typeof cap === 'string' ? cap : JSON.stringify(cap)}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          )}
        </Card>

        {selectedTask && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              关联任务
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  标题:
                </span>
                <p className="font-medium">{selectedTask.title}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                {selectedTask.description}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 聊天区域 */}
      <div className="lg:col-span-3">
        <Card className="h-[600px] flex flex-col">
          {/* 消息列表 - 改进滚动功能 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {!selectedAgent ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Bot className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    选择智能体开始对话
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    从左侧选择一个智能体，然后开始对话
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                    <MessageIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    开始与{selectedAgent.name}对话
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    输入您的问题，智能体会根据其专业知识为您提供回答
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 group relative ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {message.role === "assistant" && selectedAgent && (
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          {selectedAgent.name} - {selectedAgent.role}
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content as any}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === "user"
                            ? "text-blue-200"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      {/* 消息操作按钮 - 鼠标悬停时显示 */}
                      <div className={`absolute ${message.role === 'user' ? '-left-20' : '-right-20'} top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyMessage(message.content)}
                          title="复制"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleQuoteMessage(message.content, message.role)}
                          title="引用"
                        >
                          <Quote className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* 当前流式响应 */}
              {currentResponse && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="max-w-[80%] rounded-lg p-3 bg-slate-100 dark:bg-slate-800">
                    {selectedAgent && (
                      <div className="text-xs text-blue-600 font-medium mb-1">
                        {selectedAgent.name} - {selectedAgent.role}
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">
                      {currentResponse as any}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      正在输入...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 对话操作工具栏 */}
          {messages.length > 0 && (
            <div className="border-t px-4 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={openSaveDialog}>
                      <Save className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>保存对话</DialogTitle>
                      <DialogDescription>
                        将当前对话保存到系统，方便后续查看和引用
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">标题</label>
                        <Input
                          value={saveTitle}
                          onChange={(e) => setSaveTitle(e.target.value)}
                          placeholder="输入对话标题"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="saveToKnowledgeBase"
                          checked={saveToKnowledgeBase}
                          onChange={(e) => setSaveToKnowledgeBase(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="saveToKnowledgeBase" className="text-sm">
                          存放到知识库
                        </label>
                      </div>
                      {saveToKnowledgeBase && (
                        <div>
                          <label className="text-sm font-medium">选择知识库</label>
                          <Select
                            value={selectedKnowledgeBaseId || ""}
                            onValueChange={setSelectedKnowledgeBaseId}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="选择知识库" />
                            </SelectTrigger>
                            <SelectContent>
                              {knowledgeBases.map((kb) => (
                                <SelectItem key={kb.id} value={kb.id}>
                                  {kb.name} ({kb.type === "common" ? "通用" : "独立"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleSaveConversation}>
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="sm" onClick={handleDownloadConversation}>
                  <Download className="h-4 w-4 mr-1" />
                  下载
                </Button>

                <Dialog open={referenceDialogOpen} onOpenChange={setReferenceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={openReferenceDialog}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      引用
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[600px]">
                    <DialogHeader>
                      <DialogTitle>引用对话</DialogTitle>
                      <DialogDescription>
                        选择已保存的对话，将其内容添加到当前对话中
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
                      {savedSessions.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                          暂无已保存的对话
                        </div>
                      ) : (
                        savedSessions.map((session) => (
                          <Card key={session.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{session.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(session.createdAt).toLocaleString("zh-CN")}
                                </div>
                                {session.knowledgeBaseId && (
                                  <Badge variant="outline" className="text-xs mt-2">
                                    已存入知识库
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReferenceConversation(session.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* 输入区域 */}
          <div className="border-t p-4">
            {/* 联网搜索面板 */}
            {showSearchPanel && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">联网搜索</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setShowSearchPanel(false)}
                  >
                    ×
                  </Button>
                </div>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleWebSearch();
                      }
                    }}
                    placeholder="输入搜索关键词..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleWebSearch}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="text-xs text-slate-500">搜索结果（点击添加到输入框）</div>
                    {searchResults.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-white dark:bg-slate-800 rounded border hover:border-blue-500 cursor-pointer transition-colors"
                        onClick={() => handleAddSearchResult(item)}
                      >
                        <div className="text-sm font-medium text-blue-600 hover:underline">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {item.siteName} • {item.publishTime || "未知时间"}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                          {item.snippet}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSearchPanel(!showSearchPanel)}
                title="联网搜索"
              >
                <Globe className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  !selectedAgent
                    ? "请先选择智能体"
                    : `向${selectedAgent.name}提问...`
                }
                disabled={!selectedAgent || isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || !selectedAgent || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                发送
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearChat}
                  disabled={isLoading}
                  title="清空对话"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
