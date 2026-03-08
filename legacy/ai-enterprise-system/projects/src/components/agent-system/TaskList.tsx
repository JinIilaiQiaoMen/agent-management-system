"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  User,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Agent, AgentTask } from "@/lib/db";

interface TaskListProps {
  tasks: AgentTask[];
  agents: Agent[];
  onTaskSelect: (task: AgentTask) => void;
  onTaskUpdated: () => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: { label: "待分配", color: "secondary", icon: Clock },
  assigned: { label: "已分配", color: "default", icon: User },
  in_progress: { label: "进行中", color: "default", icon: Loader2 },
  completed: { label: "已完成", color: "success", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "高", color: "destructive" },
  medium: { label: "中", color: "default" },
  low: { label: "低", color: "secondary" },
};

export default function TaskList({
  tasks,
  agents,
  onTaskSelect,
  onTaskUpdated,
}: TaskListProps) {
  const [generatingAgents, setGeneratingAgents] = useState<string[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string[]>([]);

  const handleGenerateAgents = async (taskId: string) => {
    setGeneratingAgents((prev) => [...prev, taskId]);
    try {
      const response = await fetch(
        `/api/agent-tasks/${taskId}/generate-agents`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error("Failed to generate agents:", error);
    } finally {
      setGeneratingAgents((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    setUpdatingStatus((prev) => [...prev, taskId]);
    try {
      const response = await fetch(`/api/agent-tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return "未分配";
    const agent = agents.find((a) => a.id === agentId);
    return agent ? agent.name : "未知";
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无任务</p>
        <p className="text-sm">点击右上角按钮发布第一个任务</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const status = statusConfig[task.status] || statusConfig.pending;
        const priority = priorityConfig[task.priority] || priorityConfig.medium;
        const StatusIcon = status.icon;
        const isGenerating = generatingAgents.includes(task.id);
        const isUpdating = updatingStatus.includes(task.id);

        return (
          <Card
            key={task.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTaskSelect(task)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <Badge variant={priority.color as any}>
                    {priority.label}优先级
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {task.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <StatusIcon
                      className={`h-4 w-4 ${
                        task.status === "in_progress" ? "animate-spin" : ""
                      }`}
                    />
                    <span>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{getAgentName(task.assignedAgentId)}</span>
                  </div>
                  <span>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div
                className="flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {task.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateAgents(task.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        生成中
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-1" />
                        生成智能体
                      </>
                    )}
                  </Button>
                )}

                {task.status !== "pending" && task.status !== "completed" && (
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task.id, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">已分配</SelectItem>
                      <SelectItem value="in_progress">进行中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
