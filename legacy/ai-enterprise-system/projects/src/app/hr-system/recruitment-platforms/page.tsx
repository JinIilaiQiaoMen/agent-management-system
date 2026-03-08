'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Settings,
  RefreshCw,
  FileText,
  Activity,
  Upload,
  Download,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

interface Platform {
  id: string;
  platform_name: string;
  platform_code: string;
  api_endpoint: string;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at: string | null;
  sync_frequency: string;
  config: {
    supports_push: boolean;
    supports_pull: boolean;
    resume_pull_enabled: boolean;
  };
}

interface JobPosting {
  id: string;
  recruitment_need_id: string;
  platform_id: string;
  platform_job_id: string;
  platform_job_url: string;
  status: string;
  published_at: string | null;
  view_count: number;
  apply_count: number;
  interview_count: number;
  hire_count: number;
  last_sync_at: string | null;
}

interface SyncLog {
  id: string;
  platform_id: string;
  sync_type: string;
  sync_direction: string;
  record_count: number;
  success_count: number;
  failed_count: number;
  status: string;
  started_at: string;
  completed_at: string | null;
}

const mockPlatforms: Platform[] = [
  {
    id: '1',
    platform_name: 'BOSS直聘',
    platform_code: 'boss',
    api_endpoint: 'https://api.zhipin.com/v1',
    is_active: true,
    sync_enabled: true,
    last_sync_at: '2025-01-06T10:30:00',
    sync_frequency: 'daily',
    config: {
      supports_push: true,
      supports_pull: true,
      resume_pull_enabled: true,
    },
  },
  {
    id: '2',
    platform_name: '智联招聘',
    platform_code: 'zhaopin',
    api_endpoint: 'https://api.zhaopin.com/v1',
    is_active: true,
    sync_enabled: true,
    last_sync_at: '2025-01-06T09:15:00',
    sync_frequency: 'daily',
    config: {
      supports_push: true,
      supports_pull: true,
      resume_pull_enabled: true,
    },
  },
  {
    id: '3',
    platform_name: '前程无忧',
    platform_code: '51job',
    api_endpoint: 'https://api.51job.com/v1',
    is_active: false,
    sync_enabled: false,
    last_sync_at: '2025-01-05T18:00:00',
    sync_frequency: 'weekly',
    config: {
      supports_push: true,
      supports_pull: false,
      resume_pull_enabled: false,
    },
  },
  {
    id: '4',
    platform_name: '猎聘网',
    platform_code: 'liepin',
    api_endpoint: 'https://api.liepin.com/v1',
    is_active: false,
    sync_enabled: false,
    last_sync_at: null,
    sync_frequency: 'weekly',
    config: {
      supports_push: true,
      supports_pull: true,
      resume_pull_enabled: true,
    },
  },
  {
    id: '5',
    platform_name: '拉勾网',
    platform_code: 'lagou',
    api_endpoint: 'https://api.lagou.com/v1',
    is_active: false,
    sync_enabled: false,
    last_sync_at: null,
    sync_frequency: 'weekly',
    config: {
      supports_push: true,
      supports_pull: false,
      resume_pull_enabled: false,
    },
  },
];

const mockJobPostings: JobPosting[] = [
  {
    id: '1',
    recruitment_need_id: '1',
    platform_id: '1',
    platform_job_id: 'JOB202501001',
    platform_job_url: 'https://www.zhipin.com/job/JOB202501001',
    status: 'published',
    published_at: '2025-01-02T09:00:00',
    view_count: 1256,
    apply_count: 89,
    interview_count: 23,
    hire_count: 3,
    last_sync_at: '2025-01-06T10:30:00',
  },
  {
    id: '2',
    recruitment_need_id: '1',
    platform_id: '2',
    platform_job_id: 'JOB_ZP001',
    platform_job_url: 'https://www.zhaopin.com/job/JOB_ZP001',
    status: 'published',
    published_at: '2025-01-02T10:00:00',
    view_count: 890,
    apply_count: 65,
    interview_count: 18,
    hire_count: 2,
    last_sync_at: '2025-01-06T09:15:00',
  },
  {
    id: '3',
    recruitment_need_id: '2',
    platform_id: '1',
    platform_job_id: 'JOB202501002',
    platform_job_url: 'https://www.zhipin.com/job/JOB202501002',
    status: 'draft',
    published_at: null,
    view_count: 0,
    apply_count: 0,
    interview_count: 0,
    hire_count: 0,
    last_sync_at: null,
  },
];

const mockSyncLogs: SyncLog[] = [
  {
    id: '1',
    platform_id: '1',
    sync_type: 'job_post',
    sync_direction: 'push',
    record_count: 5,
    success_count: 5,
    failed_count: 0,
    status: 'completed',
    started_at: '2025-01-06T10:30:00',
    completed_at: '2025-01-06T10:32:00',
  },
  {
    id: '2',
    platform_id: '2',
    sync_type: 'resume_sync',
    sync_direction: 'pull',
    record_count: 150,
    success_count: 148,
    failed_count: 2,
    status: 'completed',
    started_at: '2025-01-06T09:15:00',
    completed_at: '2025-01-06T09:18:00',
  },
  {
    id: '3',
    platform_id: '1',
    sync_type: 'status_update',
    sync_direction: 'pull',
    record_count: 15,
    success_count: 15,
    failed_count: 0,
    status: 'completed',
    started_at: '2025-01-05T18:00:00',
    completed_at: '2025-01-05T18:02:00',
  },
];

export default function RecruitmentPlatformsPage() {
  const [activeTab, setActiveTab] = useState('platforms');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = (platformId: string) => {
    setSyncing(platformId);
    setTimeout(() => {
      setSyncing(null);
    }, 2000);
  };

  const handleToggleActive = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      published: { label: '已发布', variant: 'outline' },
      draft: { label: '草稿', variant: 'secondary' },
      closed: { label: '已关闭', variant: 'default' },
      paused: { label: '已暂停', variant: 'default' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSyncStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string; icon: any }> = {
      running: { label: '同步中', variant: 'default', icon: RefreshCw },
      completed: { label: '已完成', variant: 'outline', icon: CheckCircle2 },
      failed: { label: '失败', variant: 'destructive', icon: XCircle },
    };
    const config = statusConfig[status] || { label: status, variant: 'default', icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/hr-system"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                招聘平台集成
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                集成多个招聘平台，实现职位自动发布和简历同步
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Globe className="h-4 w-4" />
            添加新平台
          </Button>
        </div>

        {/* 功能说明卡片 */}
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              核心功能
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">职位一键发布</div>
                  <div className="text-sm text-white/80">同时发布到多个平台</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">简历自动同步</div>
                  <div className="text-sm text-white/80">实时拉取最新简历</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">智能数据同步</div>
                  <div className="text-sm text-white/80">自动同步申请状态</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">数据统计分析</div>
                  <div className="text-sm text-white/80">追踪招聘效果</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platforms" className="gap-2">
              <Globe className="h-4 w-4" />
              平台管理
            </TabsTrigger>
            <TabsTrigger value="postings" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              职位发布
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Activity className="h-4 w-4" />
              同步日志
            </TabsTrigger>
          </TabsList>

          {/* 平台管理 */}
          <TabsContent value="platforms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>已集成平台</CardTitle>
                <CardDescription>管理已连接的招聘平台及其配置</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>平台名称</TableHead>
                      <TableHead>平台代码</TableHead>
                      <TableHead>API端点</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>同步设置</TableHead>
                      <TableHead>最后同步</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPlatforms.map((platform) => (
                      <TableRow key={platform.id}>
                        <TableCell className="font-medium">{platform.platform_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{platform.platform_code}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {platform.api_endpoint}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={platform.is_active}
                            onCheckedChange={() => handleToggleActive(platform)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={platform.sync_enabled}
                              disabled={!platform.is_active}
                            />
                            <Badge variant="outline" className="text-xs">
                              {platform.sync_frequency}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {platform.last_sync_at ? (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(platform.last_sync_at).toLocaleDateString()}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-sm">未同步</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSync(platform.id)}
                              disabled={!platform.is_active}
                            >
                              {syncing === platform.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 职位发布 */}
          <TabsContent value="postings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>平台职位发布</CardTitle>
                <CardDescription>追踪和管理在各平台发布的职位状态</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部平台</SelectItem>
                      {mockPlatforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.platform_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="published">已发布</SelectItem>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="closed">已关闭</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="搜索职位..." className="max-w-xs" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>平台</TableHead>
                      <TableHead>职位ID</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>发布时间</TableHead>
                      <TableHead>浏览量</TableHead>
                      <TableHead>申请数</TableHead>
                      <TableHead>面试数</TableHead>
                      <TableHead>录用数</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockJobPostings.map((posting) => {
                      const platform = mockPlatforms.find((p) => p.id === posting.platform_id);
                      return (
                        <TableRow key={posting.id}>
                          <TableCell>
                            <Badge variant="outline">{platform?.platform_name}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {posting.platform_job_id}
                          </TableCell>
                          <TableCell>{getStatusBadge(posting.status)}</TableCell>
                          <TableCell>
                            {posting.published_at ? (
                              new Date(posting.published_at).toLocaleDateString()
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{posting.view_count}</TableCell>
                          <TableCell>{posting.apply_count}</TableCell>
                          <TableCell>{posting.interview_count}</TableCell>
                          <TableCell>{posting.hire_count}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={posting.platform_job_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  查看职位
                                </a>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 同步日志 */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>同步日志</CardTitle>
                <CardDescription>查看各平台的数据同步记录</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>平台</TableHead>
                      <TableHead>同步类型</TableHead>
                      <TableHead>方向</TableHead>
                      <TableHead>处理记录</TableHead>
                      <TableHead>成功/失败</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>开始时间</TableHead>
                      <TableHead>耗时</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSyncLogs.map((log) => {
                      const platform = mockPlatforms.find((p) => p.id === log.platform_id);
                      const duration = log.completed_at
                        ? Math.round(
                            (new Date(log.completed_at).getTime() -
                              new Date(log.started_at).getTime()) /
                              1000
                          )
                        : null;
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant="outline">{platform?.platform_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.sync_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              {log.sync_direction === 'push' ? (
                                <Upload className="h-3 w-3" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              {log.sync_direction === 'push' ? '推送' : '拉取'}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.record_count}</TableCell>
                          <TableCell>
                            <span className="text-green-600">{log.success_count}</span>
                            {log.failed_count > 0 && (
                              <span className="text-red-600 ml-1">/ {log.failed_count}</span>
                            )}
                          </TableCell>
                          <TableCell>{getSyncStatusBadge(log.status)}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(log.started_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {duration !== null ? (
                              <Badge variant="outline">{duration}s</Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
