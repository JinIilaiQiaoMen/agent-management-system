"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Sparkles,
  Check,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { Agent, InsertAgent } from "@/storage/database";
import { POSITIONS, POSITIONS_BY_LEVEL, LEVEL_NAMES } from "@/constants/positions";

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
  agents: Agent[];
  onSaved: () => void;
}

interface GeneratedContent {
  description?: string;
  systemPrompt?: string;
  capabilities?: string[];
}

export default function AgentDialog({
  open,
  onOpenChange,
  agent,
  agents,
  onSaved,
}: AgentDialogProps) {
  const [formData, setFormData] = useState<InsertAgent>({
    name: "",
    role: "",
    department: "",
    parentId: null,
    description: "",
    systemPrompt: "",
    capabilities: [],
    knowledgeBaseId: null,
    isActive: true,
  });

  const [newCapability, setNewCapability] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});
  const [selectedTemplateLevel, setSelectedTemplateLevel] = useState<string>("");

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        role: agent.role,
        department: agent.department || "",
        parentId: agent.parentId || null,
        description: agent.description || "",
        systemPrompt: agent.systemPrompt || "",
        capabilities: (agent.capabilities as string[]) || [],
        knowledgeBaseId: agent.knowledgeBaseId || null,
        isActive: agent.isActive,
      });

      // 检查是否匹配预定义岗位
      const matchingPosition = POSITIONS.find(
        (p) => p.name === agent.role && p.department === agent.department
      );
      if (matchingPosition) {
        setSelectedPosition(matchingPosition.id);
      }
    } else {
      setFormData({
        name: "",
        role: "",
        department: "",
        parentId: null,
        description: "",
        systemPrompt: "",
        capabilities: [],
        knowledgeBaseId: null,
        isActive: true,
      });
      setSelectedPosition("");
      setGeneratedContent({});
    }
  }, [agent, open]);

  const handlePositionChange = (positionId: string) => {
    const position = POSITIONS.find((p) => p.id === positionId);
    if (position) {
      setSelectedPosition(positionId);
      setFormData({
        ...formData,
        role: position.name,
        department: position.department || "",
        description: position.description || "",
      });

      // 自动填充部门到可用选项中
      if (position.department) {
        setFormData((prev) => ({ ...prev, department: position.department || "" }));
      }
    }
  };

  const generateContent = async () => {
    if (!formData.name || !formData.role) {
      alert("请先填写智能体名称和角色");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-agent-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          department: formData.department,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data);
      } else {
        alert("生成内容失败");
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("生成内容失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyGeneratedContent = (field: keyof GeneratedContent) => {
    if (field === "capabilities" && generatedContent.capabilities) {
      setFormData({
        ...formData,
        capabilities: generatedContent.capabilities || [],
      });
    } else if (field === "description" && generatedContent.description) {
      setFormData({
        ...formData,
        description: generatedContent.description,
      });
    } else if (field === "systemPrompt" && generatedContent.systemPrompt) {
      setFormData({
        ...formData,
        systemPrompt: generatedContent.systemPrompt,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = agent ? `/api/agents/${agent.id}` : "/api/agents";
      const method = agent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSaved();
        onOpenChange(false);
      } else {
        alert("保存失败");
      }
    } catch (error) {
      console.error("Failed to save agent:", error);
      alert("保存失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCapability = () => {
    const caps = Array.isArray(formData.capabilities) ? formData.capabilities : [];
    if (newCapability.trim() && !caps.includes(newCapability.trim())) {
      setFormData({
        ...formData,
        capabilities: [...caps, newCapability.trim()],
      });
      setNewCapability("");
    }
  };

  const removeCapability = (capability: string) => {
    const caps = Array.isArray(formData.capabilities) ? formData.capabilities : [];
    setFormData({
      ...formData,
      capabilities: caps.filter((c) => c !== capability),
    });
  };

  const availableParents = agents.filter((a) => a.id !== agent?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agent ? "编辑智能体" : "添加智能体"}</DialogTitle>
          <DialogDescription>
            {agent ? "修改智能体的信息配置" : "创建新的智能体并配置其能力"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基础信息 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              基础信息
            </h3>

            {/* 岗位选择 */}
            <div className="space-y-2">
              <Label htmlFor="position">选择岗位（可选）</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={selectedTemplateLevel}
                  onValueChange={setSelectedTemplateLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择岗位层级" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POSITIONS_BY_LEVEL).map(([key, positions]) => (
                      <SelectItem key={key} value={key}>
                        {LEVEL_NAMES[key as keyof typeof LEVEL_NAMES]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedPosition || ""}
                  onValueChange={handlePositionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择具体岗位" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTemplateLevel && POSITIONS_BY_LEVEL[selectedTemplateLevel as keyof typeof POSITIONS_BY_LEVEL]?.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        <div className="flex items-center gap-2">
                          <span>{position.name}</span>
                          {position.department && (
                            <Badge variant="outline" className="text-xs">
                              {position.department}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">智能体名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：张三"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">角色 *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="例如：CTO、产品经理"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">部门</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="例如：研发中心、产品中心"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">上级智能体</Label>
                <Select
                  value={(formData.parentId || "none") as string}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value === "none" ? null : value })
                  }
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="选择上级智能体" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无（顶层）</SelectItem>
                    {availableParents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} - {a.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* AI生成区域 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  AI 智能生成
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateContent}
                disabled={isGenerating || !formData.name || !formData.role}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isGenerating ? "生成中..." : "生成内容"}
              </Button>
            </div>

            {Object.keys(generatedContent).length > 0 && (
              <div className="space-y-3">
                {generatedContent.description && (
                  <div className="space-y-2">
                    <Label className="text-xs">生成的描述</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-md text-sm border border-slate-200 dark:border-slate-700">
                        {generatedContent.description}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyGeneratedContent("description")}
                        className="gap-1 h-auto self-start"
                      >
                        <Check className="h-4 w-4" />
                        应用
                      </Button>
                    </div>
                  </div>
                )}

                {generatedContent.systemPrompt && (
                  <div className="space-y-2">
                    <Label className="text-xs">生成的系统提示词</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-md text-sm border border-slate-200 dark:border-slate-700">
                        {generatedContent.systemPrompt}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyGeneratedContent("systemPrompt")}
                        className="gap-1 h-auto self-start"
                      >
                        <Check className="h-4 w-4" />
                        应用
                      </Button>
                    </div>
                  </div>
                )}

                {generatedContent.capabilities && generatedContent.capabilities.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">生成的能力标签</Label>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 flex flex-wrap gap-1 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                        {generatedContent.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyGeneratedContent("capabilities")}
                        className="gap-1 h-auto self-start"
                      >
                        <Check className="h-4 w-4" />
                        应用
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 详细配置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                详细配置
              </h3>
              {formData.name && formData.role && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="gap-1 text-blue-600 dark:text-blue-400"
                >
                  <Sparkles className="h-3 w-3" />
                  AI生成
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="description">描述</Label>
                {generatedContent.description && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyGeneratedContent("description")}
                    className="h-6 px-2 gap-1 text-xs"
                  >
                    <Sparkles className="h-3 w-3" />
                    使用生成内容
                  </Button>
                )}
              </div>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述该智能体的职责和定位"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="systemPrompt">系统提示词</Label>
                {generatedContent.systemPrompt && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyGeneratedContent("systemPrompt")}
                    className="h-6 px-2 gap-1 text-xs"
                  >
                    <Sparkles className="h-3 w-3" />
                    使用生成内容
                  </Button>
                )}
              </div>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt || ""}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="设置智能体的角色和行为模式"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>能力标签</Label>
                {generatedContent.capabilities && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyGeneratedContent("capabilities")}
                    className="h-6 px-2 gap-1 text-xs"
                  >
                    <Sparkles className="h-3 w-3" />
                    使用生成内容
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="输入能力后按回车或点击添加"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCapability();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCapability}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(formData.capabilities) &&
                  formData.capabilities.map((capability: string) => (
                    <Badge key={capability} variant="secondary" className="gap-1">
                      {capability}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeCapability(capability)}
                      />
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                启用该智能体
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
