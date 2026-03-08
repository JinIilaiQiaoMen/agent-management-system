"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import type { Agent, InsertTask } from "@/storage/database";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: Agent[];
  onCreated: () => void;
}

export default function TaskDialog({ open, onOpenChange, agents, onCreated }: TaskDialogProps) {
  const [formData, setFormData] = useState<InsertTask>({
    title: "",
    description: "",
    assignedAgentId: null,
    status: "pending",
    priority: "medium",
    createdBy: "CEO",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRequirements, setGeneratedRequirements] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 如果有生成的需求，将其添加到 metadata 中
      const metadata = generatedRequirements.length > 0
        ? { requirements: generatedRequirements }
        : undefined;

      const taskData = {
        ...formData,
        metadata,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        onCreated();
        onOpenChange(false);
        // 重置表单
        setFormData({
          title: "",
          description: "",
          assignedAgentId: null,
          status: "pending",
          priority: "medium",
          createdBy: "CEO",
        });
        setGeneratedRequirements([]);
      } else {
        alert("发布任务失败");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("发布任务失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableAgents = agents.filter((a) => a.isActive);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 关闭对话框时重置表单
      setFormData({
        title: "",
        description: "",
        assignedAgentId: null,
        status: "pending",
        priority: "medium",
        createdBy: "CEO",
      });
      setGeneratedRequirements([]);
    }
    onOpenChange(open);
  };

  const handleAutoGenerate = async () => {
    if (!formData.title.trim()) {
      alert("请先输入任务标题");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-task-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskTitle: formData.title,
          taskPriority: formData.priority,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // 自动填充任务描述
          setFormData({
            ...formData,
            description: result.data.taskDescription || result.data.taskDescription || "",
          });

          // 保存生成的需求
          setGeneratedRequirements(result.data.taskRequirements || []);
        }
      } else {
        alert("生成任务描述失败");
      }
    } catch (error) {
      console.error("Failed to generate task description:", error);
      alert("生成任务描述失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>发布新任务</DialogTitle>
          <DialogDescription>
            CEO发布工作任务，可指定分配给对应职能的智能体
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">任务标题 *</Label>
            <div className="flex gap-2">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="简明扼要地描述任务"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoGenerate}
                disabled={isGenerating || !formData.title.trim()}
                className="whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    自动生成描述
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">任务描述 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="详细描述任务内容、要求和期望成果"
              rows={5}
              required
            />
          </div>

          {generatedRequirements.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                生成的任务需求
              </Label>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {generatedRequirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-medium mt-0.5">{index + 1}.</span>
                    <span className="text-muted-foreground">{req}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                * 这些需求已包含在任务描述中，发布任务时将被保存到任务元数据
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      高优先级
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      中优先级
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      低优先级
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedAgentId">分配给智能体</Label>
              <Select
                value={formData.assignedAgentId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedAgentId: value === "none" ? null : value })
                }
              >
                <SelectTrigger id="assignedAgentId">
                  <SelectValue placeholder="留空待分配" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">留空待分配</SelectItem>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <span>{agent.name}</span>
                        <Badge variant="outline">{agent.role}</Badge>
                        {agent.department && (
                          <Badge variant="secondary" className="text-xs">
                            {agent.department}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  提示
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  如果留空"分配给智能体"字段，系统将根据任务内容自动匹配合适的智能体。
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "发布中..." : "发布任务"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
