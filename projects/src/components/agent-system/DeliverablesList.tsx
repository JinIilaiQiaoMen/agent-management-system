'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  MoreVertical,
  Calendar,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Deliverable {
  id: string;
  taskId: string;
  taskTitle: string;
  agentId: string;
  agentName: string;
  deliverableType: 'document' | 'report' | 'code' | 'image' | 'data' | 'other';
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  content?: string;
  fileUrl?: string;
}

const typeIcons = {
  document: File,
  report: FileText,
  code: FileCode,
  image: FileImage,
  data: FileSpreadsheet,
  other: File,
};

const typeLabels = {
  document: '文档',
  report: '报告',
  code: '代码',
  image: '图片',
  data: '数据',
  other: '其他',
};

export function DeliverablesList() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'completed' | 'pending'>('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 从 API 加载成果列表
  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/agent-system/deliverables');
        if (response.ok) {
          const data = await response.json();
          setDeliverables(data.deliverables || []);
        }
      } catch (error) {
        console.error('加载成果列表失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliverables();
  }, []);

  // 过滤
  const filteredDeliverables = deliverables.filter(del => {
    if (viewMode === 'completed') return del.status === 'completed';
    if (viewMode === 'pending') return del.status === 'pending';
    return true;
  });

  // 按类型分组
  const groupedDeliverables = filteredDeliverables.reduce((acc, del) => {
    const type = del.deliverableType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(del);
    return acc;
  }, {} as Record<string, Deliverable[]>);

  const handleView = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setIsDetailOpen(true);
  };

  const handleDownload = (deliverable: Deliverable) => {
    if (deliverable.fileUrl) {
      window.open(deliverable.fileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1">
              <TabsList>
                <TabsTrigger value="all">全部成果</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
                <TabsTrigger value="pending">待处理</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* 成果列表 */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">全部类型</TabsTrigger>
          {Object.keys(groupedDeliverables).map(type => (
            <TabsTrigger key={type} value={type}>
              {typeLabels[type as keyof typeof typeLabels]} ({groupedDeliverables[type].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeliverables.map(deliverable => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                onView={() => handleView(deliverable)}
                onDownload={() => handleDownload(deliverable)}
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(groupedDeliverables).map(([type, items]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(deliverable => (
                <DeliverableCard
                  key={deliverable.id}
                  deliverable={deliverable}
                  onView={() => handleView(deliverable)}
                  onDownload={() => handleDownload(deliverable)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* 详情弹窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDeliverable?.title}</DialogTitle>
          </DialogHeader>
          {selectedDeliverable && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{selectedDeliverable.agentName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedDeliverable.createdAt).toLocaleString()}</span>
                </div>
                <Badge variant={
                  selectedDeliverable.status === 'completed' ? 'default' :
                  selectedDeliverable.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {selectedDeliverable.status === 'completed' ? '已完成' :
                   selectedDeliverable.status === 'pending' ? '待处理' : '失败'}
                </Badge>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm">{selectedDeliverable.description || '暂无描述'}</p>
              </div>

              {selectedDeliverable.content && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">内容预览</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedDeliverable.content}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  关闭
                </Button>
                {selectedDeliverable.fileUrl && (
                  <Button onClick={() => handleDownload(selectedDeliverable)}>
                    <Download className="h-4 w-4 mr-2" />
                    下载文件
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 成果卡片组件
function DeliverableCard({ 
  deliverable, 
  onView, 
  onDownload 
}: { 
  deliverable: Deliverable;
  onView: () => void;
  onDownload: () => void;
}) {
  const TypeIcon = typeIcons[deliverable.deliverableType] || File;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TypeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base line-clamp-1">{deliverable.title}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {typeLabels[deliverable.deliverableType]}
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
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                查看详情
              </DropdownMenuItem>
              {deliverable.fileUrl && (
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </DropdownMenuItem>
              )}
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
          {deliverable.description || '暂无描述'}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{deliverable.agentName}</span>
          <span>{new Date(deliverable.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeliverablesList;
