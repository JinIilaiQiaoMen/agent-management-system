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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical,
  RefreshCw,
  CalendarDays,
  Target,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SchedulingRule {
  id: string;
  rule_name: string;
  rule_type: string;
  min_daily_hours: number;
  max_daily_hours: number;
  min_weekly_hours: number;
  max_weekly_hours: number;
  min_rest_hours: number;
  max_consecutive_work_days: number;
  requires_weekend_coverage: boolean;
  requires_holiday_coverage: boolean;
  is_active: boolean;
  priority: number;
}

interface ScheduleTemplate {
  id: string;
  template_name: string;
  template_type: string;
  description: string;
  cycle_length: number;
  start_date: string;
  end_date: string | null;
  is_published: boolean;
  is_active: boolean;
}

interface ScheduleAssignment {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_position: string;
  shift_name: string;
  assignment_date: string;
  start_time: string;
  end_time: string;
  work_hours: number;
  status: string;
}

interface ScheduleConflict {
  id: string;
  conflict_type: string;
  employee_name: string;
  conflict_date: string;
  conflict_description: string;
  severity: string;
  is_resolved: boolean;
}

const mockRules: SchedulingRule[] = [
  {
    id: '1',
    rule_name: '标准工作制',
    rule_type: 'fixed_shift',
    min_daily_hours: 8.0,
    max_daily_hours: 8.0,
    min_weekly_hours: 40.0,
    max_weekly_hours: 40.0,
    min_rest_hours: 11.0,
    max_consecutive_work_days: 5,
    requires_weekend_coverage: false,
    requires_holiday_coverage: false,
    is_active: true,
    priority: 1,
  },
  {
    id: '2',
    rule_name: '弹性工作制',
    rule_type: 'flexible_shift',
    min_daily_hours: 6.0,
    max_daily_hours: 10.0,
    min_weekly_hours: 30.0,
    max_weekly_hours: 50.0,
    min_rest_hours: 9.0,
    max_consecutive_work_days: 6,
    requires_weekend_coverage: false,
    requires_holiday_coverage: false,
    is_active: true,
    priority: 2,
  },
  {
    id: '3',
    rule_name: '轮班制',
    rule_type: 'rotation',
    min_daily_hours: 8.0,
    max_daily_hours: 12.0,
    min_weekly_hours: 40.0,
    max_weekly_hours: 48.0,
    min_rest_hours: 8.0,
    max_consecutive_work_days: 6,
    requires_weekend_coverage: true,
    requires_holiday_coverage: true,
    is_active: true,
    priority: 3,
  },
];

const mockTemplates: ScheduleTemplate[] = [
  {
    id: '1',
    template_name: '周一至周五标准排班',
    template_type: 'weekly',
    description: '标准的周一到周五排班模板，每天8小时',
    cycle_length: 5,
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    is_published: true,
    is_active: true,
  },
  {
    id: '2',
    template_name: '三班倒轮班模板',
    template_type: 'weekly',
    description: '三班倒7天循环，早班、中班、夜班轮换',
    cycle_length: 7,
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    is_published: true,
    is_active: true,
  },
  {
    id: '3',
    template_name: '客服部门弹性排班',
    template_type: 'custom',
    description: '客服部门特殊需求，支持弹性工时',
    cycle_length: 14,
    start_date: '2025-01-01',
    end_date: null,
    is_published: false,
    is_active: true,
  },
];

const mockAssignments: ScheduleAssignment[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: '张三',
    employee_position: '前端开发工程师',
    shift_name: '早班',
    assignment_date: '2025-01-06',
    start_time: '09:00',
    end_time: '18:00',
    work_hours: 8.0,
    status: 'scheduled',
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: '李四',
    employee_position: '后端开发工程师',
    shift_name: '早班',
    assignment_date: '2025-01-06',
    start_time: '09:00',
    end_time: '18:00',
    work_hours: 8.0,
    status: 'scheduled',
  },
  {
    id: '3',
    employee_id: '3',
    employee_name: '王五',
    employee_position: '客服专员',
    shift_name: '中班',
    assignment_date: '2025-01-06',
    start_time: '14:00',
    end_time: '22:00',
    work_hours: 8.0,
    status: 'completed',
  },
];

const mockConflicts: ScheduleConflict[] = [
  {
    id: '1',
    conflict_type: 'insufficient_staff',
    employee_name: '客服部门',
    conflict_date: '2025-01-07',
    conflict_description: '中班人员不足，需要至少3人，当前只有2人',
    severity: 'high',
    is_resolved: false,
  },
  {
    id: '2',
    conflict_type: 'rule_violation',
    employee_name: '张三',
    conflict_date: '2025-01-08',
    conflict_description: '连续工作超过5天',
    severity: 'medium',
    is_resolved: false,
  },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [generating, setGenerating] = useState(false);

  const handleGenerateSchedule = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 3000);
  };

  const getRuleTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; variant: string }> = {
      fixed_shift: { label: '固定班次', variant: 'default' },
      flexible_shift: { label: '弹性班次', variant: 'secondary' },
      rotation: { label: '轮班制', variant: 'outline' },
    };
    const config = typeConfig[type] || { label: type, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string; icon: any }> = {
      scheduled: { label: '已排班', variant: 'default', icon: CalendarDays },
      completed: { label: '已完成', variant: 'success', icon: CheckCircle2 },
      absent: { label: '缺勤', variant: 'destructive', icon: XCircle },
      canceled: { label: '已取消', variant: 'secondary', icon: XCircle },
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

  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<string, { label: string; variant: string }> = {
      low: { label: '低', variant: 'secondary' },
      medium: { label: '中', variant: 'default' },
      high: { label: '高', variant: 'destructive' },
    };
    const config = severityConfig[severity] || { label: severity, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              智能排班管理
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              AI 驱动的智能排班算法，优化人员配置和工作效率
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              导入排班
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              导出排班
            </Button>
            <Button className="gap-2" onClick={handleGenerateSchedule}>
              <Sparkles className="h-4 w-4" />
              {generating ? '生成中...' : 'AI 智能排班'}
            </Button>
          </div>
        </div>

        {/* 功能说明卡片 */}
        <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI 智能排班算法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">效率优先</div>
                  <div className="text-sm text-white/80">最大化工作覆盖率</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">员工偏好</div>
                  <div className="text-sm text-white/80">考虑个人偏好需求</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">规则约束</div>
                  <div className="text-sm text-white/80">符合法律法规要求</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">智能优化</div>
                  <div className="text-sm text-white/80">自动解决排班冲突</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  今日排班
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">45</div>
              <p className="text-xs text-slate-500 mt-1">人在岗</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  冲突数量
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">2</div>
              <p className="text-xs text-slate-500 mt-1">待解决</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  覆盖率
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">92%</div>
              <p className="text-xs text-slate-500 mt-1">时间覆盖</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  本月工时
                </CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">6,240</div>
              <p className="text-xs text-slate-500 mt-1">小时</p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              排班日历
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              排班模板
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Settings className="h-4 w-4" />
              排班规则
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              冲突管理
            </TabsTrigger>
          </TabsList>

          {/* 排班日历 */}
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>排班日历</CardTitle>
                    <CardDescription>查看和管理每日排班安排</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '选择日期'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部部门</SelectItem>
                        <SelectItem value="dev">研发部</SelectItem>
                        <SelectItem value="sales">销售部</SelectItem>
                        <SelectItem value="service">客服部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>职位</TableHead>
                      <TableHead>班次</TableHead>
                      <TableHead>开始时间</TableHead>
                      <TableHead>结束时间</TableHead>
                      <TableHead>工作时长</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.employee_name}</TableCell>
                        <TableCell>{assignment.employee_position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.shift_name}</Badge>
                        </TableCell>
                        <TableCell>{assignment.start_time}</TableCell>
                        <TableCell>{assignment.end_time}</TableCell>
                        <TableCell>{assignment.work_hours}小时</TableCell>
                        <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

          {/* 排班模板 */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>排班模板</CardTitle>
                    <CardDescription>创建和管理可复用的排班模板</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    新建模板
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.template_name}</CardTitle>
                          {template.is_published && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              已发布
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">模板类型</span>
                          <Badge variant="outline">{template.template_type}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">循环周期</span>
                          <span className="font-medium">{template.cycle_length} 天</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">开始日期</span>
                          <span className="font-medium">{template.start_date}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            查看
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 排班规则 */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>排班规则</CardTitle>
                    <CardDescription>配置排班策略和约束条件</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    新建规则
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>规则名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>每日工时</TableHead>
                      <TableHead>每周工时</TableHead>
                      <TableHead>最小休息</TableHead>
                      <TableHead>连续工作</TableHead>
                      <TableHead>优先级</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.rule_name}</TableCell>
                        <TableCell>{getRuleTypeBadge(rule.rule_type)}</TableCell>
                        <TableCell>
                          {rule.min_daily_hours} - {rule.max_daily_hours}h
                        </TableCell>
                        <TableCell>
                          {rule.min_weekly_hours} - {rule.max_weekly_hours}h
                        </TableCell>
                        <TableCell>{rule.min_rest_hours}h</TableCell>
                        <TableCell>{rule.max_consecutive_work_days}天</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? 'outline' : 'secondary'}>
                            {rule.is_active ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

          {/* 冲突管理 */}
          <TabsContent value="conflicts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>排班冲突</CardTitle>
                    <CardDescription>查看和解决排班冲突问题</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="严重程度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="unresolved">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="unresolved">未解决</SelectItem>
                        <SelectItem value="resolved">已解决</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>冲突类型</TableHead>
                      <TableHead>员工</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>严重程度</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockConflicts.map((conflict) => (
                      <TableRow key={conflict.id}>
                        <TableCell>
                          <Badge variant="outline">{conflict.conflict_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{conflict.employee_name}</TableCell>
                        <TableCell>{conflict.conflict_date}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {conflict.conflict_description}
                        </TableCell>
                        <TableCell>{getSeverityBadge(conflict.severity)}</TableCell>
                        <TableCell>
                          <Badge variant={conflict.is_resolved ? 'outline' : 'destructive'}>
                            {conflict.is_resolved ? '已解决' : '未解决'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!conflict.is_resolved && (
                              <Button variant="ghost" size="sm">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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
        </Tabs>
      </div>
    </div>
  );
}
