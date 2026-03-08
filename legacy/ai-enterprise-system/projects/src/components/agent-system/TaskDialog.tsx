"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Agent } from "@/lib/db";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: Agent[];
  onCreated: () => void;
}

export default function TaskDialog({
  open,
  onOpenChange,
  agents,
  onCreated,
}: TaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: string;
    assignedAgentId: string | null;
  }>({
    title: "",
    description: "",
    priority: "medium",
    assignedAgentId: null,
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;

    setLoading(true);
    try {
      const response = await fetch("/api/agent-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assignedAgentId: formData.assignedAgentId || null,
          createdBy: "CEO",
        }),
      });

      if (response.ok) {
        onCreated();
        // 重置表单
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          assignedAgentId: "",
        });
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>发布任务</DialogTitle>
          <DialogDescription>
            创建新任务并分配给智能体团队
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">任务标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="简明扼要地描述任务"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">任务描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="详细描述任务内容、要求和预期成果"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">分配给（可选）</Label>
              <Select
                value={formData.assignedAgentId || "auto"}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedAgentId: value === "auto" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择智能体" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动分配</SelectItem>
                  {agents
                    .filter((a) => a.isActive)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.description}
          >
            {loading ? "发布中..." : "发布任务"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
