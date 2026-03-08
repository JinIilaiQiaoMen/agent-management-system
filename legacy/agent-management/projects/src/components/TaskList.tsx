"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Circle,
  User,
  Calendar,
  Bot,
  Loader2,
  ChevronDown,
  Trash2,
  Play,
  Zap,
  X,
} from "lucide-react";
import TaskDetailDialog from "@/components/TaskDetailDialog";
import TaskExecution from "@/components/task-execution";
import type { Agent, Task } from "@/storage/database";
import { useState } from "react";

interface TaskListProps {
  tasks: Task[];
  agents: Agent[];
  onTaskSelect: (task: Task) => void;
  onTaskUpdated: () => void;
}

export default function TaskList({ tasks, agents, onTaskSelect, onTaskUpdated }: TaskListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [generatingAgentTaskId, setGeneratingAgentTaskId] = useState<string | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [autoExecutingTaskId, setAutoExecutingTaskId] = useState<string | null>(null);
  const [showTaskExecution, setShowTaskExecution] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "completed" | "error">("idle");

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    return true;
  });

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

  const getAssignedAgent = (agentId: string | null) => {
    return agents.find((a) => a.id === agentId);
  };

  const handleAssignTask = async (taskId: string, agentId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId }),
      });

      if (response.ok) {
        onTaskUpdated();
      } else {
        alert("分配失败");
      }
    } catch (error) {
      console.error("Failed to assign task:", error);
      alert("分配失败");
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/start`, {
        method: "POST",
      });

      if (response.ok) {
        onTaskUpdated();
      } else {
        alert("操作失败");
      }
    } catch (error) {
      console.error("Failed to start task:", error);
      alert("操作失败");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        onTaskUpdated();
      } else {
        alert("操作失败");
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
      alert("操作失败");
    }
  };

  const handleGenerateAgents = async (taskId: string) => {
    setGeneratingAgentTaskId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}/generate-agents`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "智能体生成成功！");
        onTaskUpdated();
      } else {
        const error = await response.json();
        alert(error.error || "生成智能体失败");
      }
    } catch (error) {
      console.error("Failed to generate agents:", error);
      alert("生成智能体失败");
    } finally {
      setGeneratingAgentTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    // 确认删除
    const confirmed = window.confirm(`确定要删除任务"${taskTitle}"吗？此操作不可恢复。`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "任务删除成功！");
        onTaskUpdated();
      } else {
        const error = await response.json();
        alert(error.error || "删除任务失败");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("删除任务失败");
    }
  };

  const handleAutoExecuteTask = async (taskId: string) => {
    // 确认执行
    const confirmed = window.confirm(
      "确定要一键自动执行此任务吗？\n\n" +
      "系统将自动：\n" +
      "1. 生成智能体团队\n" +
      "2. 分析任务并拆解\n" +
      "3. 智能体自主学习知识\n" +
      "4. 智能体协作完成任务\n" +
      "5. 汇总成果并交付\n\n" +
      "此过程可能需要 1-3 分钟。"
    );
    if (!confirmed) return;

    setAutoExecutingTaskId(taskId);
    setShowTaskExecution(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧：任务列表 */}
      <div className="lg:col-span-2 space-y-4">
        {/* 过滤器 */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">状态:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="pending">待分配</SelectItem>
                <SelectItem value="assigned">已分配</SelectItem>
                <SelectItem value="in_progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">优先级:</span>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 任务列表 */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Circle className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              暂无任务
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              点击右上角"发布任务"按钮开始创建
            </p>
          </div>
        ) : (
          <div className="space-y-3">
          {filteredTasks.map((task) => {
            const assignedAgent = getAssignedAgent(task.assignedAgentId);
            return (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h3>
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {assignedAgent ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {assignedAgent.name} - {assignedAgent.role}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-amber-600">未分配</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {task.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleGenerateAgents(task.id)}
                          disabled={generatingAgentTaskId === task.id}
                        >
                          {generatingAgentTaskId === task.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Bot className="h-4 w-4 mr-2" />
                              生成智能体
                            </>
                          )}
                        </Button>
                        <Select
                          onValueChange={(agentId) => handleAssignTask(task.id, agentId)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="分配给..." />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.filter((a) => a.isActive).map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name} - {agent.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {task.status === "assigned" && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                      >
                        开始任务
                      </Button>
                    )}

                    {task.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        完成任务
                      </Button>
                    )}

                    {/* 一键执行按钮 - 所有状态的任务都可以点击 */}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAutoExecuteTask(task.id)}
                      disabled={autoExecutingTaskId === task.id}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {autoExecutingTaskId === task.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          执行中...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          一键执行
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTaskForDetail(task)}
                    >
                      查看详情
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        )}

        {/* 任务详情弹窗 */}
        <TaskDetailDialog
          open={!!selectedTaskForDetail}
          onOpenChange={(open) => !open && setSelectedTaskForDetail(null)}
          task={selectedTaskForDetail}
          agents={agents}
          onTaskUpdated={onTaskUpdated}
        />
      </div>

      {/* 右侧：任务执行面板 */}
      {showTaskExecution && autoExecutingTaskId && (
        <div className="lg:col-span-1">
          <Card className="sticky top-6 h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">任务执行监控</CardTitle>
                  <CardDescription>实时查看任务执行进度</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (executionStatus === "running") {
                      const confirmed = window.confirm(
                        "任务正在执行中，关闭面板将中断任务执行。\n\n" +
                        "确定要关闭吗？"
                      );
                      if (!confirmed) return;
                    }
                    setShowTaskExecution(false);
                    setTimeout(() => {
                      setAutoExecutingTaskId(null);
                      setExecutionStatus("idle");
                    }, 300);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pr-2">
                <TaskExecution 
                  taskId={autoExecutingTaskId} 
                  onStatusChange={setExecutionStatus}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
