'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { TaskCard, Task } from './TaskCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskManagerProps {
  agentId?: string;
  onCreateTask?: () => void;
  onEditTask?: (task: Task) => void;
  onViewTask?: (task: Task) => void;
}

// 模拟数据
const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成市场调研报告',
    description: '针对目标市场进行深入调研，形成完整的分析报告',
    status: 'in_progress',
    priority: 'high',
    progress: 65,
    assignedAgent: { id: 'agent-1', name: '分析专家' },
    dueDate: '2025-03-10',
    createdAt: '2025-03-01',
    deliverablesCount: 2,
  },
  {
    id: '2',
    title: '优化产品描述文案',
    description: '根据用户反馈优化产品页面的文案内容',
    status: 'pending',
    priority: 'medium',
    createdAt: '2025-03-02',
  },
  {
    id: '3',
    title: '客户反馈整理',
    description: '整理本月所有客户反馈，形成汇总报告',
    status: 'completed',
    priority: 'low',
    assignedAgent: { id: 'agent-2', name: '客服助手' },
    createdAt: '2025-02-28',
    deliverablesCount: 1,
  },
  {
    id: '4',
    title: '竞品分析',
    description: '分析主要竞争对手的产品特点和营销策略',
    status: 'assigned',
    priority: 'high',
    assignedAgent: { id: 'agent-3', name: '市场分析师' },
    dueDate: '2025-03-08',
    createdAt: '2025-03-01',
  },
];

export function TaskManager({ agentId, onCreateTask, onEditTask, onViewTask }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">全部任务</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <List className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待处理</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">进行中</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工具栏 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待分配</SelectItem>
                <SelectItem value="assigned">已分配</SelectItem>
                <SelectItem value="in_progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无任务数据</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onView={onViewTask}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewTask?.(task)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{task.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {task.description || '暂无描述'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.assignedAgent && (
                      <span className="text-sm text-muted-foreground">
                        {task.assignedAgent.name}
                      </span>
                    )}
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {task.status === 'pending' ? '待分配' :
                       task.status === 'assigned' ? '已分配' :
                       task.status === 'in_progress' ? '进行中' :
                       task.status === 'completed' ? '已完成' : '已取消'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TaskManager;
