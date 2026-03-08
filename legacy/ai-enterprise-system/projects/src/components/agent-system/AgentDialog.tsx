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

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  agents: Agent[];
  onSaved: () => void;
}

export default function AgentDialog({
  open,
  onOpenChange,
  agent,
  agents,
  onSaved,
}: AgentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    department: string;
    parentId: string | null;
    description: string;
    systemPrompt: string;
    capabilities: string;
  }>({
    name: agent?.name || "",
    role: agent?.role || "",
    department: agent?.department || "",
    parentId: agent?.parentId || null,
    description: agent?.description || "",
    systemPrompt: agent?.systemPrompt || "",
    capabilities: (agent?.capabilities as string[])?.join(", ") || "",
  });

  // 当 agent 变化时重置表单
  useState(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        role: agent.role || "",
        department: agent.department || "",
        parentId: agent.parentId || "",
        description: agent.description || "",
        systemPrompt: agent.systemPrompt || "",
        capabilities: (agent.capabilities as string[])?.join(", ") || "",
      });
    }
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = agent ? `/api/agents/${agent.id}` : "/api/agents";
      const method = agent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          department: formData.department || null,
          parentId: formData.parentId || null,
          description: formData.description || null,
          systemPrompt: formData.systemPrompt || null,
          capabilities: formData.capabilities
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        onSaved();
        // 重置表单
        setFormData({
          name: "",
          role: "",
          department: "",
          parentId: "",
          description: "",
          systemPrompt: "",
          capabilities: "",
        });
      }
    } catch (error) {
      console.error("Failed to save agent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agent ? "编辑智能体" : "添加智能体"}</DialogTitle>
          <DialogDescription>
            创建或编辑公司智能体，配置角色和能力
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="智能体名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="如：CEO、产品经理、技术专家"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">部门</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="所属部门"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">上级智能体</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择上级（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无上级</SelectItem>
                  {agents
                    .filter((a) => a.id !== agent?.id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capabilities">能力标签</Label>
            <Input
              id="capabilities"
              value={formData.capabilities}
              onChange={(e) =>
                setFormData({ ...formData, capabilities: e.target.value })
              }
              placeholder="多个能力用逗号分隔，如：技术决策、团队管理、产品规划"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">职责描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="描述智能体的职责范围"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">系统提示词</Label>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) =>
                setFormData({ ...formData, systemPrompt: e.target.value })
              }
              placeholder="配置智能体的行为规则和输出格式"
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
