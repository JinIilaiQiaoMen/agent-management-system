'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  User, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  assignedAgent?: {
    id: string;
    name: string;
  };
  dueDate?: string;
  createdAt: string;
  deliverablesCount?: number;
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onView?: (task: Task) => void;
  onStart?: (task: Task) => void;
}

const statusConfig = {
  pending: { label: '待分配', color: 'bg-gray-500', icon: Clock },
  assigned: { label: '已分配', color: 'bg-blue-500', icon: User },
  in_progress: { label: '进行中', color: 'bg-yellow-500', icon: Loader2 },
  completed: { label: '已完成', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'bg-red-500', icon: AlertCircle },
};

const priorityConfig = {
  low: { label: '低', color: 'bg-gray-100 text-gray-700' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-700' },
  high: { label: '高', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: '紧急', color: 'bg-red-100 text-red-700' },
};

export function TaskCard({ task, onEdit, onDelete, onView, onStart }: TaskCardProps) {
  const status = statusConfig[task.status] || statusConfig.pending;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const StatusIcon = status.icon;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${status.color} text-white text-xs`}>
                {status.label}
              </Badge>
              <Badge className={`${priority.color} text-xs`}>
                {priority.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-base leading-tight truncate">
              {task.title}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(task)}>
                <Eye className="h-4 w-4 mr-2" />
                查看详情
              </DropdownMenuItem>
              {task.status === 'pending' && (
                <DropdownMenuItem onClick={() => onStart?.(task)}>
                  <Play className="h-4 w-4 mr-2" />
                  开始任务
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {task.status === 'in_progress' && typeof task.progress === 'number' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>进度</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        )}

        {task.assignedAgent && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>负责人: {task.assignedAgent.name}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          {task.dueDate && (
            <span className={new Date(task.dueDate) < new Date() ? 'text-red-500' : ''}>
              截止: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.deliverablesCount !== undefined && task.deliverablesCount > 0 && (
            <span>{task.deliverablesCount} 个成果</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default TaskCard;
