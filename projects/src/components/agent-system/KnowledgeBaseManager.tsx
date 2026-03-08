'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Database, 
  FileText, 
  Upload,
  BookOpen,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  status: 'active' | 'inactive' | 'processing';
  createdAt: string;
}

interface Document {
  id: string;
  title: string;
  documentType: string;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

// 模拟数据
const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-1',
    name: '产品知识库',
    description: '包含所有产品相关文档和技术资料',
    documentCount: 24,
    status: 'active',
    createdAt: '2025-02-15',
  },
  {
    id: 'kb-2',
    name: '客户服务手册',
    description: '客服团队使用的知识库',
    documentCount: 12,
    status: 'active',
    createdAt: '2025-02-20',
  },
  {
    id: 'kb-3',
    name: '市场分析报告',
    description: '市场调研和分析报告集合',
    documentCount: 8,
    status: 'processing',
    createdAt: '2025-03-01',
  },
];

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: '产品功能说明书.pdf',
    documentType: 'pdf',
    knowledgeBaseId: 'kb-1',
    knowledgeBaseName: '产品知识库',
    status: 'completed',
    createdAt: '2025-02-15',
  },
  {
    id: 'doc-2',
    title: '用户手册.md',
    documentType: 'text',
    knowledgeBaseId: 'kb-1',
    knowledgeBaseName: '产品知识库',
    status: 'completed',
    createdAt: '2025-02-16',
  },
  {
    id: 'doc-3',
    title: 'Q&A话术库.docx',
    documentType: 'document',
    knowledgeBaseId: 'kb-2',
    knowledgeBaseName: '客户服务手册',
    status: 'completed',
    createdAt: '2025-02-21',
  },
];

export function KnowledgeBaseManager() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(mockKnowledgeBases);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('knowledge-bases');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // 过滤
  const filteredKBs = knowledgeBases.filter(kb =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索知识库或文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  上传文档
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>上传文档到知识库</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      拖拽文件到此处或点击选择
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持 PDF, Word, Markdown, TXT 等格式
                    </p>
                  </div>
                  <Button className="w-full">开始上传</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              新建知识库
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="knowledge-bases">
            <Database className="h-4 w-4 mr-2" />
            知识库
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            文档
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge-bases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKBs.map(kb => (
              <Card key={kb.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{kb.name}</CardTitle>
                        <Badge variant={kb.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                          {kb.status === 'active' ? '启用' : kb.status === 'processing' ? '处理中' : '禁用'}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {kb.description || '暂无描述'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{kb.documentCount} 个文档</span>
                    <span>{new Date(kb.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {doc.knowledgeBaseName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={doc.status === 'completed' ? 'default' : 'secondary'}>
                        {doc.status === 'completed' ? '已完成' : 
                         doc.status === 'processing' ? '处理中' : '失败'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default KnowledgeBaseManager;
