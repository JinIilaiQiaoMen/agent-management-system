"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DragDropUpload from "@/components/DragDropUpload";
import DocumentSearch from "@/components/DocumentSearch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Plus,
  Upload,
  Link,
  FileText,
  CheckCircle,
  Loader2,
  Trash2,
  File,
  Image,
  Video,
  Music,
  Eye,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from "lucide-react";
import type { Agent, InsertKnowledgeBase } from "@/storage/database";

export default function KnowledgeBasePanel({ agents }: { agents: Agent[] }) {
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InsertKnowledgeBase>({
    name: "",
    type: "common",
    agentId: null,
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  const loadKnowledgeBases = async () => {
    try {
      const response = await fetch("/api/knowledge-bases");
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBases(data);
      }
    } catch (error) {
      console.error("Failed to load knowledge bases:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/knowledge-bases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        loadKnowledgeBases();
        setDialogOpen(false);
        setFormData({
          name: "",
          type: "common",
          agentId: null,
          description: "",
          isActive: true,
        });
      } else {
        alert("创建知识库失败");
      }
    } catch (error) {
      console.error("Failed to create knowledge base:", error);
      alert("创建知识库失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDocument = async (
    knowledgeBaseId: string,
    type: "text" | "url",
    content: string
  ) => {
    try {
      const response = await fetch("/api/knowledge-bases/add-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeBaseId,
          type,
          content,
        }),
      });

      if (response.ok) {
        loadKnowledgeBases();
        return true;
      } else {
        alert("添加文档失败");
        return false;
      }
    } catch (error) {
      console.error("Failed to add document:", error);
      alert("添加文档失败");
      return false;
    }
  };

  const handleUploadFile = async (knowledgeBaseId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("knowledgeBaseId", knowledgeBaseId);

      const response = await fetch("/api/knowledge-bases/upload-file", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        loadKnowledgeBases();
        return true;
      } else {
        const error = await response.json();
        alert(error.error || "上传文件失败");
        return false;
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("上传文件失败");
      return false;
    }
  };

  const commonKnowledgeBases = knowledgeBases.filter((kb) => kb.type === "common");
  const individualKnowledgeBases = knowledgeBases.filter((kb) => kb.type === "individual");

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">知识库管理</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            管理通用知识库和智能体专属知识库
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          创建知识库
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="max-w-md">
        <DocumentSearch />
      </div>

      {/* 知识库列表 */}
      <Tabs defaultValue="common" className="w-full">
        <TabsList>
          <TabsTrigger value="common">
            <BookOpen className="h-4 w-4 mr-2" />
            通用知识库 ({commonKnowledgeBases.length})
          </TabsTrigger>
          <TabsTrigger value="individual">
            <FileText className="h-4 w-4 mr-2" />
            专属知识库 ({individualKnowledgeBases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common" className="space-y-4">
          <KnowledgeBaseList
            knowledgeBases={commonKnowledgeBases}
            onAddDocument={handleAddDocument}
            onUploadFile={handleUploadFile}
            onUpdate={loadKnowledgeBases}
          />
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <KnowledgeBaseList
            knowledgeBases={individualKnowledgeBases}
            agents={agents}
            onAddDocument={handleAddDocument}
            onUploadFile={handleUploadFile}
            onUpdate={loadKnowledgeBases}
          />
        </TabsContent>
      </Tabs>

      {/* 创建知识库对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建知识库</DialogTitle>
            <DialogDescription>
              创建新的知识库，用于存储和检索专业知识
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">知识库名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：公司技术文档库"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">知识库类型 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as "common" | "individual", agentId: null })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      通用知识库（所有智能体共享）
                    </div>
                  </SelectItem>
                  <SelectItem value="individual">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      专属知识库（关联特定智能体）
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "individual" && (
              <div className="space-y-2">
                <Label htmlFor="agentId">关联智能体</Label>
                <Select
                  value={formData.agentId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      agentId: value === "none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger id="agentId">
                    <SelectValue placeholder="选择智能体" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">请选择</SelectItem>
                    {agents
                      .filter((a) => a.isActive)
                      .map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} - {agent.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述该知识库的用途和内容"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface KnowledgeBaseListProps {
  knowledgeBases: any[];
  agents?: Agent[];
  onAddDocument: (kbId: string, type: "text" | "url", content: string) => Promise<boolean>;
  onUploadFile: (kbId: string, file: File) => Promise<boolean>;
  onUpdate: () => void;
}

function KnowledgeBaseList({ knowledgeBases, agents, onAddDocument, onUploadFile, onUpdate }: KnowledgeBaseListProps) {
  const [activeKbId, setActiveKbId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<"text" | "url" | "file">("text");
  const [documentContent, setDocumentContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 查看详情相关状态
  const [detailKbId, setDetailKbId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // 编辑知识库相关状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingKb, setEditingKb] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    type: "common",
    agentId: null,
    isActive: true,
  });

  const loadDocuments = async (kbId: string) => {
    setLoadingDocuments(true);
    try {
      const response = await fetch(`/api/knowledge-bases/${kbId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleViewDetails = (kbId: string) => {
    setDetailKbId(kbId);
    loadDocuments(kbId);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("确定要删除这个文档吗？")) return;

    setDeletingDocId(docId);
    try {
      const response = await fetch(`/api/knowledge-bases/documents/${docId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 重新加载文档列表
        loadDocuments(detailKbId!);
        // 更新知识库列表
        onUpdate();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("删除失败");
    } finally {
      setDeletingDocId(null);
    }
  };

  const getMatchScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score >= 50) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <Image className="h-4 w-4" />;
    if (fileType.includes("video")) return <Video className="h-4 w-4" />;
    if (fileType.includes("audio")) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleEditKnowledgeBase = (kb: any) => {
    setEditingKb(kb);
    setEditFormData({
      name: kb.name,
      description: kb.description || "",
      type: kb.type,
      agentId: kb.agentId || null,
      isActive: kb.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateKnowledgeBase = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/knowledge-bases/${editingKb.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          modifiedBy: "CEO", // 当前用户
        }),
      });

      if (response.ok) {
        onUpdate();
        setEditDialogOpen(false);
        setEditingKb(null);
        alert("更新成功！");
      } else {
        alert("更新失败");
      }
    } catch (error) {
      console.error("Failed to update knowledge base:", error);
      alert("更新失败");
    }
  };

  const handleFileUpload = async (kbId: string, file: File) => {
    setUploadingFile(true);
    try {
      const success = await onUploadFile(kbId, file);
      if (success) {
        alert("文件上传成功！");
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  if (knowledgeBases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <BookOpen className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          暂无知识库
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          点击"创建知识库"按钮开始创建
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {knowledgeBases.map((kb) => {
        const agent = agents?.find((a) => a.id === kb.agentId);
        const isActive = activeKbId === kb.id;

        return (
          <Card key={kb.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    {kb.name}
                  </h4>
                  {kb.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {kb.description}
                    </p>
                  )}
                </div>
                <Badge variant={kb.isActive ? "default" : "secondary"}>
                  {kb.isActive ? "启用" : "禁用"}
                </Badge>
              </div>

              {agent && (
                <div className="text-sm">
                  <span className="text-slate-600 dark:text-slate-400">关联智能体：</span>
                  <Badge variant="outline" className="ml-2">
                    {agent.name}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>文档数量: {kb.documentCount || 0}</span>
                <div className="flex items-center gap-2">
                  <span>创建于: {new Date(kb.createdAt).toLocaleDateString()}</span>
                  {kb.modifiedBy && (
                    <span>修改人: {kb.modifiedBy}</span>
                  )}
                </div>
              </div>

              {/* 添加文档区域 */}
              {isActive && (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex gap-2">
                    <Select
                      value={documentType}
                      onValueChange={(value) => setDocumentType(value as "text" | "url" | "file")}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            文本
                          </div>
                        </SelectItem>
                        <SelectItem value="url">
                          <div className="flex items-center gap-2">
                            <Link className="h-3 w-3" />
                            URL
                          </div>
                        </SelectItem>
                        <SelectItem value="file">
                          <div className="flex items-center gap-2">
                            <Upload className="h-3 w-3" />
                            上传文件
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {documentType === "file" ? (
                      <div className="flex-1">
                        <DragDropUpload
                          knowledgeBaseId={kb.id}
                          onUploadSuccess={() => {
                            onUpdate();
                            loadDocuments(kb.id);
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <Input
                          value={documentContent}
                          onChange={(e) => setDocumentContent(e.target.value)}
                          placeholder={documentType === "text" ? "输入文本内容" : "输入URL"}
                        />
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (documentContent.trim()) {
                              setIsAdding(true);
                              const success = await onAddDocument(kb.id, documentType as "text" | "url", documentContent);
                              if (success) {
                                setDocumentContent("");
                                onUpdate();
                              }
                              setIsAdding(false);
                            }
                          }}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(kb.id)}
                  className="flex-1 gap-2"
                >
                  <Eye className="h-4 w-4" />
                  查看详情
                </Button>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveKbId(isActive ? null : kb.id)}
                  className="flex-1"
                >
                  {isActive ? "收起" : "添加文档"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditKnowledgeBase(kb)}
                  title="编辑知识库"
                >
                  编辑
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
    {/* 编辑知识库对话框 */}
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑知识库</DialogTitle>
          <DialogDescription>
            修改知识库信息
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateKnowledgeBase} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">知识库名称</Label>
            <Input
              id="edit-name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder="例如：公司技术文档库"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">知识库类型</Label>
            <Select
              value={editFormData.type}
              onValueChange={(value) =>
                setEditFormData({ ...editFormData, type: value as "common" | "individual", agentId: null })
              }
            >
              <SelectTrigger id="edit-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    通用知识库（所有智能体共享）
                  </div>
                </SelectItem>
                <SelectItem value="individual">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    专属知识库（关联特定智能体）
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editFormData.type === "individual" && (
            <div className="space-y-2">
              <Label htmlFor="edit-agentId">关联智能体</Label>
              <Select
                value={editFormData.agentId || "none"}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    agentId: value === "none" ? null as any : value,
                  })
                }
              >
                <SelectTrigger id="edit-agentId">
                  <SelectValue placeholder="选择智能体" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">请选择</SelectItem>
                  {agents
                    ?.filter((a) => a.isActive)
                    .map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {agent.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-description">描述</Label>
            <Textarea
              id="edit-description"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              placeholder="描述该知识库的用途和内容"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-isActive"
              checked={editFormData.isActive}
              onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="edit-isActive" className="text-sm">
              启用知识库
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button type="submit">
              更新
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* 知识库详情对话框 */}
    <Dialog open={!!detailKbId} onOpenChange={(open) => !open && setDetailKbId(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            知识库文档列表
          </DialogTitle>
          <DialogDescription>
            查看知识库中的所有文档及其AI匹配度评分
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loadingDocuments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                暂无文档
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                该知识库中还没有添加任何文档
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* 文件名和类型 */}
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.fileType)}
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 flex-1">
                          {doc.fileName}
                        </h4>
                      </div>

                      {/* 文件信息 */}
                      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                        <span>类型: {doc.fileType.split('/')[1] || doc.fileType}</span>
                        <span>大小: {formatFileSize(doc.fileSize)}</span>
                        <span>上传于: {new Date(doc.uploadedAt).toLocaleString()}</span>
                        <span>上传者: {doc.uploadedBy}</span>
                      </div>

                      {/* AI 匹配度分析 */}
                      {doc.matchScore !== undefined && (
                        <div className="border-t pt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            {getMatchScoreIcon(doc.matchScore)}
                            <span className="text-sm font-medium">AI 匹配度分析:</span>
                            <Badge
                              variant={doc.matchScore >= 80 ? "default" : doc.matchScore >= 50 ? "secondary" : "destructive"}
                              className={getMatchScoreColor(doc.matchScore)}
                            >
                              {doc.matchScore}分
                            </Badge>
                          </div>

                          {doc.matchReason && (
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-medium">说明:</span> {doc.matchReason}
                            </p>
                          )}

                          {doc.recommendation && (
                            <p className="text-sm">
                              <span className="font-medium">建议:</span>{" "}
                              <span className={
                                doc.recommendation === "强烈推荐" ? "text-green-600 dark:text-green-400" :
                                doc.recommendation === "推荐" ? "text-blue-600 dark:text-blue-400" :
                                "text-yellow-600 dark:text-yellow-400"
                              }>
                                {doc.recommendation}
                              </span>
                            </p>
                          )}

                          {doc.analysis && (
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                              <span className="font-medium">分析详情:</span>
                              <p className="mt-1">{doc.analysis}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 删除按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={deletingDocId === doc.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      {deletingDocId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setDetailKbId(null)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
