"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  FolderOpen,
  Plus,
  FileText,
  Database,
  Loader2,
} from "lucide-react";
import type { Agent } from "@/lib/db";

interface KnowledgeBase {
  id: string;
  name: string;
  type: "common" | "individual";
  agentId: string | null;
  description: string | null;
  documentCount: number;
  isActive: boolean;
  createdAt: string;
}

interface KnowledgeBasePanelProps {
  agents: Agent[];
}

export default function KnowledgeBasePanel({ agents }: KnowledgeBasePanelProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "common" as "common" | "individual",
    agentId: "",
    description: "",
  });

  const loadKnowledgeBases = async () => {
    try {
      const response = await fetch("/api/agent-knowledge-bases");
      if (response.ok) {
        const result = await response.json();
        setKnowledgeBases(result.data || result || []);
      }
    } catch (error) {
      console.error("Failed to load knowledge bases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  const handleCreate = async () => {
    if (!formData.name) return;

    setCreating(true);
    try {
      const response = await fetch("/api/agent-knowledge-bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          agentId: formData.type === "individual" ? formData.agentId : null,
          description: formData.description || null,
        }),
      });

      if (response.ok) {
        loadKnowledgeBases();
        setCreateDialogOpen(false);
        setFormData({
          name: "",
          type: "common",
          agentId: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Failed to create knowledge base:", error);
    } finally {
      setCreating(false);
    }
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return null;
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || "未知";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            共 {knowledgeBases.length} 个知识库
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建知识库
        </Button>
      </div>

      {knowledgeBases.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无知识库</p>
          <p className="text-sm">点击上方按钮创建第一个知识库</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeBases.map((kb) => (
            <Card key={kb.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      kb.type === "common"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    }`}
                  >
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{kb.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {kb.type === "common" ? "通用" : "专属"}
                    </Badge>
                  </div>
                </div>
              </div>

              {kb.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {kb.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{kb.documentCount} 文档</span>
                </div>
                {kb.type === "individual" && kb.agentId && (
                  <span>关联: {getAgentName(kb.agentId)}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 创建知识库对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建知识库</DialogTitle>
            <DialogDescription>
              创建新的知识库，用于存储智能体的专业知识
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="知识库名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "common" | "individual") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">通用知识库</SelectItem>
                  <SelectItem value="individual">专属知识库</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "individual" && (
              <div className="space-y-2">
                <Label htmlFor="agent">关联智能体</Label>
                <Select
                  value={formData.agentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, agentId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择智能体" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents
                      .filter((a) => a.isActive)
                      .map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="知识库描述"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || creating}>
              {creating ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
