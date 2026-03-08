"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Edit,
  Trash2,
  Play,
  MoreVertical,
  Eye,
  Power,
  PowerOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from '@/components/Toast';
import { ApiConfigForm } from '@/components/ApiConfigForm';

interface ApiConfig {
  id: string;
  name: string;
  type: string;
  url: string;
  method: string;
  authType: string;
  isActive: boolean;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    role: string;
  };
}

export default function ApiConfigsPage() {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 加载API配置列表
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterAgent) params.append('agentId', filterAgent);
      if (filterStatus !== 'all') params.append('isActive', filterStatus === 'active' ? 'true' : 'false');

      const response = await apiGet<{ configs: ApiConfig[] }>(`/api/agent-api-configs?${params.toString()}`);
      setConfigs(response.configs || []);
    } catch (error) {
      toast.error('加载API配置失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [filterAgent, filterStatus]);

  // 删除API配置
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除API配置 "${name}" 吗？`)) return;

    try {
      await apiDelete(`/api/agent-api-configs/${id}`);
      toast.success('API配置删除成功');
      loadConfigs();
    } catch (error) {
      toast.error('API配置删除失败');
      console.error(error);
    }
  };

  // 切换启用状态
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await apiPut(`/api/agent-api-configs/${id}`, { isActive: !isActive });
      toast.success('状态更新成功');
      loadConfigs();
    } catch (error) {
      toast.error('状态更新失败');
      console.error(error);
    }
  };

  // 测试API
  const handleTest = async (id: string) => {
    try {
      const response = await apiPost<{ success: boolean; data?: any; message?: string }>(
        `/api/agent-api-configs/${id}/test`,
        {
          testData: {},
        }
      );

      if (response.success) {
        toast.success('API测试成功');
      } else {
        toast.error('API测试失败');
      }
    } catch (error) {
      toast.error('API测试失败');
      console.error(error);
    }
  };

  // 过滤配置
  const filteredConfigs = configs.filter((config) => {
    if (searchQuery && !config.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API 配置管理</h1>
        <p className="text-muted-foreground">
          为智能体配置和管理外部 API 接口
        </p>
      </div>

      {/* 操作栏 */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            {/* 状态筛选 */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 添加按钮 */}
          <ApiConfigForm onSuccess={loadConfigs} />
        </div>
      </Card>

      {/* 配置列表 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>智能体</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>认证</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredConfigs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  暂无API配置
                </TableCell>
              </TableRow>
            ) : (
              filteredConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{config.agent.name}</div>
                      <div className="text-sm text-muted-foreground">{config.agent.role}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{config.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{config.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.authType === 'none' ? 'outline' : 'default'}>
                      {config.authType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={config.isActive ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(config.id, config.isActive)}
                    >
                      {config.isActive ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(config.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTest(config.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          测试API
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(config.id, config.isActive)}
                        >
                          {config.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              禁用
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              启用
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(config.id, config.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
