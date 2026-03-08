"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Circle,
  MessageSquare,
  FileText,
  ChevronRight,
  ChevronDown,
  Copy,
  Download,
  Send,
  Loader2,
} from "lucide-react";
import type { Task, Agent, Conversation, TaskDeliverable } from "@/storage/database";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  agents: Agent[];
  onTaskUpdated: () => void;
}

export default function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  agents,
  onTaskUpdated,
}: TaskDetailDialogProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deliverables, setDeliverables] = useState<TaskDeliverable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [expandedConversations, setExpandedConversations] = useState<Record<string, boolean>>({});

  const assignedAgent = agents.find((a) => a.id === task?.assignedAgentId);

  // 加载对话记录和任务成果
  useEffect(() => {
    if (task) {
      loadTaskData();
    }
  }, [task]);

  const loadTaskData = async () => {
    if (!task) return;

    setIsLoading(true);
    try {
      // 加载对话记录
      if (task.assignedAgentId) {
        const convResponse = await fetch(`/api/conversations?agentId=${task.assignedAgentId}&taskId=${task.id}`);
        if (convResponse.ok) {
          const convData = await convResponse.json();
          setConversations(Array.isArray(convData) ? convData : (convData?.data || []));
        }
      }

      // 加载任务成果
      const deliverableResponse = await fetch(`/api/tasks/${task.id}/deliverables`);
      if (deliverableResponse.ok) {
        const deliverableData = await deliverableResponse.json();
        setDeliverables(Array.isArray(deliverableData) ? deliverableData : (deliverableData?.data || []));
      }
    } catch (error) {
      console.error("Failed to load task data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!task) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        onTaskUpdated();
      } else {
        alert("修改优先级失败");
      }
    } catch (error) {
      console.error("Failed to update priority:", error);
      alert("修改优先级失败");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onTaskUpdated();
      } else {
        alert("修改状态失败");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("修改状态失败");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!task || !assignedAgent || !chatMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: assignedAgent.id,
          message: chatMessage,
          taskId: task.id,
          conversationHistory: [],
        }),
      });

      if (response.ok) {
        // 重新加载对话记录
        await loadTaskData();
        setChatMessage("");
      } else {
        alert("发送消息失败");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("发送消息失败");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const toggleConversationExpand = (id: string) => {
    setExpandedConversations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已复制到剪贴板");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Circle className="h-3 w-3 fill-slate-400" />
            待分配
          </Badge>
        );
      case "assigned":
        return (
          <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600">
            <Clock className="h-3 w-3" />
            已分配
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Clock className="h-3 w-3 animate-pulse" />
            进行中
          </Badge>
        );
      case "completed":
        return (
          <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3" />
            已完成
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            高
          </Badge>
        );
      case "medium":
        return (
          <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Clock className="h-3 w-3" />
            中
          </Badge>
        );
      case "low":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            低
          </Badge>
        );
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{task.title}</DialogTitle>
              <DialogDescription>
                任务详情和智能体对话记录
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">优先级:</span>
                <Select
                  value={task.priority}
                  onValueChange={handlePriorityChange}
                  disabled={isSending}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高优先级</SelectItem>
                    <SelectItem value="medium">中优先级</SelectItem>
                    <SelectItem value="low">低优先级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">状态:</span>
                <Select
                  value={task.status}
                  onValueChange={handleStatusChange}
                  disabled={isSending}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待分配</SelectItem>
                    <SelectItem value="assigned">已分配</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">任务详情</TabsTrigger>
            <TabsTrigger value="conversation">
              智能体对话
              {conversations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {conversations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="deliverables">
              任务成果
              {deliverables.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {deliverables.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* 任务详情 */}
          <TabsContent value="details" className="mt-0">
            <ScrollArea className="h-[500px] p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">任务描述</h3>
                  <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {task.description}
                  </div>
                </div>

                {!!(task.metadata as any) && Object.keys(task.metadata as any).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">任务需求</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      {Array.isArray((task.metadata as any).requirements) && (
                        <ul className="list-decimal list-inside space-y-1 text-sm">
                          {(task.metadata as any).requirements.map((req: string, idx: number) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">分配智能体</h3>
                    {assignedAgent ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{assignedAgent.name}</Badge>
                        <Badge variant="secondary">{assignedAgent.role}</Badge>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">未分配</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">创建时间</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(task.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 智能体对话 */}
          <TabsContent value="conversation" className="mt-0">
            <div className="flex flex-col h-[500px]">
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !Array.isArray(conversations) || conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      暂无对话记录
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(conversations) && conversations.map((conv: any) => (
                      <div
                        key={conv.id}
                        className="border rounded-lg overflow-hidden bg-card"
                      >
                        <div
                          className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleConversationExpand(conv.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                {assignedAgent?.name?.[0] || "A"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">
                                  {assignedAgent?.name || "智能体"}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {conv.userMessage}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {conv.createdAt
                                  ? new Date(conv.createdAt).toLocaleString()
                                  : ""}
                              </div>
                            </div>
                            {expandedConversations[conv.id] ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {expandedConversations[conv.id] && (
                          <div className="border-t bg-muted/30 p-4 space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600 shrink-0 text-xs">
                                  U
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-muted-foreground mb-1">用户</div>
                                  <div className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                                    {conv.userMessage}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(conv.userMessage)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="flex items-start gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0 text-xs">
                                  {assignedAgent?.name?.[0] || "A"}
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {assignedAgent?.name || "智能体"}
                                  </div>
                                  <div className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                    {conv.agentResponse}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(conv.agentResponse)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* 发送消息区域 */}
              {assignedAgent && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="输入消息与智能体对话..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSendingMessage}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || !chatMessage.trim()}
                      size="sm"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 任务成果 */}
          <TabsContent value="deliverables" className="mt-0">
            <ScrollArea className="h-[500px] p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !Array.isArray(deliverables) || deliverables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    暂无任务成果
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliverables.map((del: any) => (
                    <div
                      key={del.id}
                      className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{del.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {del.type}
                            </Badge>
                            {getStatusBadge(del.status)}
                            <Badge variant="secondary" className="text-xs">
                              v{del.version}
                            </Badge>
                          </div>
                        </div>
                        {del.content && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(del.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {del.content && (
                        <div className="mt-2 text-sm bg-muted p-3 rounded-lg max-h-40 overflow-auto">
                          <pre className="whitespace-pre-wrap text-xs">{del.content.substring(0, 500)}{del.content.length > 500 ? "..." : ""}</pre>
                        </div>
                      )}

                      {del.metadata?.classification && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          分类: {del.metadata.classification.categoryLabel}
                          {del.metadata.classification.keywords && (
                            <span className="ml-2">
                              关键词: {del.metadata.classification.keywords.join(", ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
