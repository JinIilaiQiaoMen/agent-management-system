'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bot, 
  Brain, 
  Wrench, 
  Activity, 
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Agent {
  id: string;
  name: string;
  type: 'coordinator' | 'specialist' | 'worker';
  status: 'active' | 'inactive' | 'busy';
  capabilities: string[];
  description: string;
  avatarUrl?: string;
  tasksCompleted?: number;
  lastActiveAt?: string;
}

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onView?: (agent: Agent) => void;
}

const typeIcons = {
  coordinator: Brain,
  specialist: Bot,
  worker: Wrench,
};

const typeLabels = {
  coordinator: '协调者',
  specialist: '专家',
  worker: '执行者',
};

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  busy: 'bg-yellow-500',
};

const statusLabels = {
  active: '在线',
  inactive: '离线',
  busy: '忙碌',
};

export function AgentCard({ agent, onEdit, onDelete, onView }: AgentCardProps) {
  const TypeIcon = typeIcons[agent.type] || Bot;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={agent.avatarUrl} alt={agent.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <TypeIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg leading-tight">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {typeLabels[agent.type]}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                  <span className="text-xs text-muted-foreground">
                    {statusLabels[agent.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(agent)}>
                <Eye className="h-4 w-4 mr-2" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(agent)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(agent)}
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
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {agent.description || '暂无描述'}
        </p>
        
        {agent.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 4).map((capability, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {capability}
              </Badge>
            ))}
            {agent.capabilities.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{agent.capabilities.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>完成 {agent.tasksCompleted || 0} 个任务</span>
          </div>
          {agent.lastActiveAt && (
            <span className="text-xs">
              最后活跃: {new Date(agent.lastActiveAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default AgentCard;
