"use client"

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Users, 
  Bot, 
  User, 
  MoreVertical, 
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  department?: string;
  description?: string;
}

interface Message {
  id: string;
  boxId: string;
  content: string;
  senderType: "user" | "agent";
  senderAgentId?: string;
  createdAt: string;
  responses: Array<{
    id: string;
    agentId: string;
    agent: Agent;
    content: string;
    createdAt: string;
  }>;
}

interface ConversationBox {
  id: string;
  title: string;
  description?: string;
  agents: Array<Agent & { role: string; joinedAt: string }>;
  messages: Message[];
  createdAt: string;
}

interface ConversationBoxChatProps {
  boxId?: string;
}

interface ErrorInfo {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  details?: any;
}

export default function ConversationBoxChat({ boxId: initialBoxId }: ConversationBoxChatProps) {
  const [boxId, setBoxId] = useState(initialBoxId || "");
  const [box, setBox] = useState<ConversationBox | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [agentResponses, setAgentResponses] = useState<Record<string, string>>({});
  const [agentStatus, setAgentStatus] = useState<Record<string, "idle" | "thinking" | "done" | "error">>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBoxTitle, setNewBoxTitle] = useState("");
  const [newBoxDescription, setNewBoxDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [boxes, setBoxes] = useState<ConversationBox[]>([]);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [box?.messages, agentResponses]);

  // 加载对话盒子列表
  useEffect(() => {
    loadBoxes();
  }, []);

  // 加载智能体列表
  useEffect(() => {
    loadAgents();
  }, []);

  // 如果指定了 boxId，加载盒子详情
  useEffect(() => {
    if (boxId) {
      loadBoxDetail(boxId);
    }
  }, [boxId]);

  const loadBoxes = async () => {
    try {
      const response = await fetch("/api/conversation-boxes");
      const result = await response.json();
      if (result.success) {
        setBoxes(result.data);
      }
    } catch (error) {
      console.error("Failed to load boxes:", error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const result = await response.json();
      if (Array.isArray(result)) {
        setAvailableAgents(result);
      } else if (result.data) {
        setAvailableAgents(result.data);
      }
    } catch (error) {
      console.error("Failed to load agents:", error);
    }
  };

  const loadBoxDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/conversation-boxes/${id}`);
      const result = await response.json();
      if (result.success) {
        setBox(result.data);
        // 初始化智能体状态
        const initialStatus: Record<string, "idle" | "thinking" | "done" | "error"> = {};
        const initialResponses: Record<string, string> = {};
        result.data.agents.forEach((agent: Agent) => {
          initialStatus[agent.id] = "idle";
          initialResponses[agent.id] = "";
        });
        setAgentStatus(initialStatus);
        setAgentResponses(initialResponses);
      }
    } catch (error) {
      console.error("Failed to load box detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const createBox = async () => {
    if (!newBoxTitle || selectedAgents.length === 0) {
      return;
    }

    try {
      const response = await fetch("/api/conversation-boxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBoxTitle,
          description: newBoxDescription,
          createdBy: "用户",
          agentIds: selectedAgents,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setBoxId(result.data.id);
        setNewBoxTitle("");
        setNewBoxDescription("");
        setSelectedAgents([]);
        setShowCreateDialog(false);
        loadBoxes();
      }
    } catch (error) {
      console.error("Failed to create box:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !boxId) {
      return;
    }

    setChatLoading(true);
    setAgentResponses({});
    setProgress(0);
    
    // 重置所有智能体状态
    const resetStatus: Record<string, "idle" | "thinking" | "done" | "error"> = {};
    box?.agents.forEach((agent) => {
      resetStatus[agent.id] = "idle";
    });
    setAgentStatus(resetStatus);

    try {
      const response = await fetch(`/api/conversation-boxes/${boxId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let tempResponses: Record<string, string> = {};
      let tempStatus: Record<string, "idle" | "thinking" | "done" | "error"> = {};
      let totalAgents = box?.agents.length || 0;
      let completedAgents = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            
            if (dataStr === "[DONE]") {
              setChatLoading(false);
              setProgress(100);
              break;
            }

            try {
              const event = JSON.parse(dataStr);

              switch (event.type) {
                case "agent_start":
                  tempStatus[event.data.agentId] = "thinking";
                  tempResponses[event.data.agentId] = "";
                  setAgentStatus({ ...tempStatus });
                  setAgentResponses({ ...tempResponses });
                  break;

                case "agent_progress":
                  if (event.data.content) {
                    tempResponses[event.data.agentId] += event.data.content;
                    setAgentResponses({ ...tempResponses });
                  }
                  // 更新进度
                  if (tempStatus[event.data.agentId] === "thinking") {
                    const thinkingCount = Object.values(tempStatus).filter(s => s === "thinking").length;
                    const progressPercent = (completedAgents / totalAgents) * 100;
                    setProgress(progressPercent);
                  }
                  break;

                case "agent_complete":
                  tempStatus[event.data.agentId] = "done";
                  completedAgents++;
                  setAgentStatus({ ...tempStatus });
                  // 更新进度
                  const progressPercent = (completedAgents / totalAgents) * 100;
                  setProgress(progressPercent);
                  break;

                case "agent_error":
                  tempStatus[event.data.agentId] = "error";
                  setAgentStatus({ ...tempStatus });
                  // 添加错误到错误列表
                  const newError: ErrorInfo = {
                    id: `error-${Date.now()}-${event.data.agentId}`,
                    type: "agent_error",
                    message: event.data.message || "智能体执行失败",
                    timestamp: Date.now(),
                    details: event.data.details,
                  };
                  setErrors((prev) => [...prev, newError]);
                  break;

                case "complete":
                  // 重新加载盒子详情以获取完整消息
                  await loadBoxDetail(boxId!);
                  setChatLoading(false);
                  setProgress(100);
                  break;

                case "error":
                  setChatLoading(false);
                  // 添加全局错误
                  const globalError: ErrorInfo = {
                    id: `error-${Date.now()}`,
                    type: "execution_error",
                    message: event.data.message || "执行失败",
                    timestamp: Date.now(),
                    details: event.data.details,
                  };
                  setErrors((prev) => [...prev, globalError]);
                  break;
              }
            } catch (e) {
              console.error("Failed to parse event:", e);
            }
          }
        }
      }

      setMessage("");
      
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatLoading(false);
      // 添加网络错误
      const networkError: ErrorInfo = {
        id: `error-${Date.now()}`,
        type: "network_error",
        message: error instanceof Error ? error.message : "发送消息失败",
        timestamp: Date.now(),
        details: error,
      };
      setErrors((prev) => [...prev, networkError]);
    }
  };

  const removeError = (errorId: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  const deleteBox = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("确定要删除这个对话盒子吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/conversation-boxes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (boxId === id) {
          setBoxId("");
          setBox(null);
        }
        loadBoxes();
      }
    } catch (error) {
      console.error("Failed to delete box:", error);
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId);
      } else {
        return [...prev, agentId];
      }
    });
  };

  const getAgentAvatar = (agent: Agent) => {
    return agent.name.substring(0, 2);
  };

  const getAgentColor = (agent: Agent) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-orange-500", "bg-pink-500", "bg-cyan-500"
    ];
    const index = agent.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex h-full gap-6">
      {/* 左侧：对话盒子列表 */}
      <Card className="w-80 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">对话盒子</CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  新建
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建对话盒子</DialogTitle>
                  <DialogDescription>
                    创建一个多智能体协作对话盒子
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>标题</Label>
                    <Input
                      value={newBoxTitle}
                      onChange={(e) => setNewBoxTitle(e.target.value)}
                      placeholder="例如：产品规划讨论"
                    />
                  </div>
                  <div>
                    <Label>描述</Label>
                    <Textarea
                      value={newBoxDescription}
                      onChange={(e) => setNewBoxDescription(e.target.value)}
                      placeholder="描述这个对话的目的..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>选择智能体（至少1个）</Label>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {availableAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleAgentSelection(agent.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAgents.includes(agent.id)}
                            onChange={() => toggleAgentSelection(agent.id)}
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`text-white ${getAgentColor(agent)}`}>
                              {getAgentAvatar(agent)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={createBox} 
                    disabled={!newBoxTitle || selectedAgents.length === 0}
                    className="w-full"
                  >
                    创建
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {boxes.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-muted/50 ${
                    boxId === b.id ? "bg-muted border-primary" : ""
                  }`}
                  onClick={() => setBoxId(b.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{b.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Users className="w-3 h-3 inline mr-1" />
                        {b.agents?.length || 0} 个智能体
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => deleteBox(b.id, e)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 右侧：聊天区域 */}
      <Card className="flex-1 h-full flex flex-col">
        {box ? (
          <>
            {/* 盒子头部 */}
            <CardHeader className="pb-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <CardTitle className="text-lg">{box.title}</CardTitle>
                    {box.description && (
                      <CardDescription className="mt-1">{box.description}</CardDescription>
                    )}
                  </div>
                  {errors.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {errors.length} 个问题
                    </Badge>
                  )}
                </div>
                
                {/* 进度条 */}
                {chatLoading && (
                  <div className="space-y-1 mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>智能体响应进度</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {box.agents.map((agent) => (
                  <Badge key={agent.id} variant="secondary" className="flex items-center gap-1">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className={`text-white text-xs ${getAgentColor(agent)}`}>
                        {getAgentAvatar(agent)}
                      </AvatarFallback>
                    </Avatar>
                    {agent.name}
                    {agentStatus[agent.id] === "thinking" && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {agentStatus[agent.id] === "done" && (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    )}
                    {agentStatus[agent.id] === "error" && (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            {/* 消息区域 */}
            <CardContent className="flex-1 overflow-hidden">
              <div className="flex gap-4 h-full">
                <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {box.messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>开始一个多智能体对话吧</p>
                    </div>
                  )}

                  {box.messages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      {/* 用户消息 */}
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1">你</div>
                          <div className="bg-muted p-3 rounded-lg text-sm">
                            {msg.content}
                          </div>
                        </div>
                      </div>

                      {/* 智能体响应 */}
                      {msg.responses.map((response) => (
                        <div key={response.id} className="flex gap-3 ml-8">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`text-white ${getAgentColor(response.agent)}`}>
                              {getAgentAvatar(response.agent)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{response.agent.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {response.agent.role}
                              </Badge>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-lg text-sm">
                              <div className="whitespace-pre-wrap">{response.content}</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 实时响应（正在生成中） */}
                      {Object.keys(agentResponses).map((agentId) => {
                        const agent = box.agents.find(a => a.id === agentId);
                        if (!agent) return null;
                        
                        return (
                          <div key={`temp-${agentId}`} className="flex gap-3 ml-8">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={`text-white ${getAgentColor(agent)}`}>
                                {getAgentAvatar(agent)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{agent.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {agent.role}
                                </Badge>
                                {agentStatus[agentId] === "thinking" && (
                                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                                )}
                              </div>
                              <div className="bg-primary/10 p-3 rounded-lg text-sm">
                                <div className="whitespace-pre-wrap">
                                  {agentResponses[agentId]}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              </div>
              
              {/* 右侧错误面板 */}
              {errors.length > 0 && (
                <div className="w-80 border-l">
                  <Card className="h-full rounded-none border-0 border-l">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          错误提醒
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllErrors}
                          className="text-xs h-6"
                        >
                          清空
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100%-60px)] pr-2">
                        <div className="space-y-2">
                          {errors.map((error) => (
                            <Alert
                              key={error.id}
                              variant="destructive"
                              className="relative py-2"
                            >
                              <button
                                onClick={() => removeError(error.id)}
                                className="absolute top-1 right-1 p-1 hover:bg-white/10 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <AlertTitle className="flex items-center gap-2 text-xs font-medium mb-1">
                                <XCircle className="w-3 h-3" />
                                错误
                              </AlertTitle>
                              <AlertDescription className="text-[10px]">
                                {error.message}
                              </AlertDescription>
                              {error.details && (
                                <details className="mt-1">
                                  <summary className="text-[10px] cursor-pointer hover:underline">
                                    详情
                                  </summary>
                                  <pre className="mt-1 text-[9px] bg-black/10 p-1 rounded overflow-x-auto">
                                    {typeof error.details === 'string' 
                                      ? error.details 
                                      : JSON.stringify(error.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                              <div className="mt-1 text-[9px] text-muted-foreground">
                                {new Date(error.timestamp).toLocaleTimeString()}
                              </div>
                            </Alert>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            </CardContent>

            {/* 输入区域 */}
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入消息，所有智能体都会参与讨论..."
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!message.trim() || chatLoading}
                  className="self-end"
                >
                  {chatLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">选择或创建一个对话盒子</p>
              <p className="text-sm mt-2">与多个智能体协作对话</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
