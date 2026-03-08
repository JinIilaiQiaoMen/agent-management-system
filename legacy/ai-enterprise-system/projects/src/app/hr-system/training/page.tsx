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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  MoreVertical,
  Video,
  MapPin,
  GraduationCap,
  ClipboardCheck,
  ArrowLeft,
} from 'lucide-react';

interface TrainingCourse {
  id: string;
  course_name: string;
  course_code: string;
  category: string;
  description: string;
  duration_hours: number;
  difficulty_level: string;
  is_mandatory: boolean;
  is_active: boolean;
  instructor_name: string;
}

interface TrainingSession {
  id: string;
  course_id: string;
  course_name: string;
  session_name: string;
  session_type: string;
  start_date: string;
  end_date: string;
  location: string | null;
  meeting_url: string | null;
  max_participants: number;
  current_participants: number;
  status: string;
  instructor_name: string;
}

interface TrainingEnrollment {
  id: string;
  session_id: string;
  session_name: string;
  employee_id: string;
  employee_name: string;
  employee_department: string;
  enrollment_status: string;
  enrollment_date: string;
  progress_percentage: number;
  start_date: string | null;
  completion_date: string | null;
}

interface TrainingRecord {
  id: string;
  employee_name: string;
  course_name: string;
  record_date: string;
  duration_hours: number;
  attendance_status: string;
  assessment_score: number | null;
}

const mockCourses: TrainingCourse[] = [
  {
    id: '1',
    course_name: '新员工入职培训',
    course_code: 'ORI-001',
    category: '入职培训',
    description: '公司文化、制度、流程介绍',
    duration_hours: 8.0,
    difficulty_level: 'beginner',
    is_mandatory: true,
    is_active: true,
    instructor_name: '人力资源部',
  },
  {
    id: '2',
    course_name: '消防安全培训',
    course_code: 'SAF-001',
    category: '安全培训',
    description: '消防安全知识、应急处理',
    duration_hours: 4.0,
    difficulty_level: 'beginner',
    is_mandatory: true,
    is_active: true,
    instructor_name: '安全部',
  },
  {
    id: '3',
    course_name: 'Excel高级应用',
    course_code: 'SKL-001',
    category: '技能提升',
    description: 'Excel高级功能和数据分析',
    duration_hours: 12.0,
    difficulty_level: 'intermediate',
    is_mandatory: false,
    is_active: true,
    instructor_name: '数据分析部',
  },
  {
    id: '4',
    course_name: '项目管理基础',
    course_code: 'MGT-001',
    category: '管理培训',
    description: '项目管理方法论和工具',
    duration_hours: 16.0,
    difficulty_level: 'intermediate',
    is_mandatory: false,
    is_active: true,
    instructor_name: '项目经理部',
  },
  {
    id: '5',
    course_name: '沟通技巧提升',
    course_code: 'COM-001',
    category: '软技能',
    description: '职场沟通和协作技巧',
    duration_hours: 8.0,
    difficulty_level: 'beginner',
    is_mandatory: false,
    is_active: true,
    instructor_name: '培训中心',
  },
];

const mockSessions: TrainingSession[] = [
  {
    id: '1',
    course_id: '1',
    course_name: '新员工入职培训',
    session_name: '2025年第一期新员工入职培训',
    session_type: 'offline',
    start_date: '2025-01-10',
    end_date: '2025-01-10',
    location: '培训室A',
    meeting_url: null,
    max_participants: 30,
    current_participants: 28,
    status: 'planned',
    instructor_name: '人力资源部',
  },
  {
    id: '2',
    course_id: '3',
    course_name: 'Excel高级应用',
    session_name: 'Excel高级应用-2025年1月',
    session_type: 'online',
    start_date: '2025-01-15',
    end_date: '2025-01-17',
    location: null,
    meeting_url: 'https://meeting.example.com/excel-training',
    max_participants: 50,
    current_participants: 45,
    status: 'planned',
    instructor_name: '数据分析部',
  },
  {
    id: '3',
    course_id: '2',
    course_name: '消防安全培训',
    session_name: '2024年第四季度消防安全培训',
    session_type: 'offline',
    start_date: '2024-12-20',
    end_date: '2024-12-20',
    location: '培训室B',
    meeting_url: null,
    max_participants: 40,
    current_participants: 40,
    status: 'completed',
    instructor_name: '安全部',
  },
];

const mockEnrollments: TrainingEnrollment[] = [
  {
    id: '1',
    session_id: '1',
    session_name: '2025年第一期新员工入职培训',
    employee_id: '1',
    employee_name: '张三',
    employee_department: '研发部',
    enrollment_status: 'approved',
    enrollment_date: '2025-01-03',
    progress_percentage: 0,
    start_date: null,
    completion_date: null,
  },
  {
    id: '2',
    session_id: '2',
    session_name: 'Excel高级应用-2025年1月',
    employee_id: '2',
    employee_name: '李四',
    employee_department: '销售部',
    enrollment_status: 'approved',
    enrollment_date: '2025-01-05',
    progress_percentage: 25,
    start_date: '2025-01-15',
    completion_date: null,
  },
  {
    id: '3',
    session_id: '3',
    session_name: '2024年第四季度消防安全培训',
    employee_id: '3',
    employee_name: '王五',
    employee_department: '客服部',
    enrollment_status: 'completed',
    enrollment_date: '2024-12-15',
    progress_percentage: 100,
    start_date: '2024-12-20',
    completion_date: '2024-12-20',
  },
];

const mockRecords: TrainingRecord[] = [
  {
    id: '1',
    employee_name: '王五',
    course_name: '消防安全培训',
    record_date: '2024-12-20',
    duration_hours: 4.0,
    attendance_status: 'present',
    assessment_score: 95,
  },
  {
    id: '2',
    employee_name: '赵六',
    course_name: 'Excel高级应用',
    record_date: '2025-01-05',
    duration_hours: 4.0,
    attendance_status: 'present',
    assessment_score: 88,
  },
];

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('courses');

  const getDifficultyBadge = (level: string) => {
    const levelConfig: Record<string, { label: string; variant: string }> = {
      beginner: { label: '初级', variant: 'default' },
      intermediate: { label: '中级', variant: 'secondary' },
      advanced: { label: '高级', variant: 'outline' },
    };
    const config = levelConfig[level] || { label: level, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string }> = {
      planned: { label: '计划中', variant: 'default' },
      ongoing: { label: '进行中', variant: 'secondary' },
      completed: { label: '已完成', variant: 'success' },
      canceled: { label: '已取消', variant: 'destructive' },
      pending: { label: '待审批', variant: 'secondary' },
      approved: { label: '已通过', variant: 'success' },
      rejected: { label: '已拒绝', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getSessionTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; variant: string; icon: any }> = {
      online: { label: '在线', variant: 'default', icon: Video },
      offline: { label: '线下', variant: 'secondary', icon: MapPin },
      hybrid: { label: '混合', variant: 'outline', icon: Users },
    };
    const config = typeConfig[type] || { label: type, variant: 'default', icon: Calendar };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getAttendanceStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string }> = {
      present: { label: '出席', variant: 'success' },
      absent: { label: '缺席', variant: 'destructive' },
      late: { label: '迟到', variant: 'default' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                员工培训管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                创建培训课程、管理培训期次、追踪学习进度
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Target className="h-4 w-4" />
              培训需求
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新建课程
            </Button>
          </div>
        </div>

        {/* 功能说明卡片 */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              培训管理系统
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">课程管理</div>
                  <div className="text-sm text-white/80">创建和管理培训课程</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">期次管理</div>
                  <div className="text-sm text-white/80">安排培训时间和地点</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">进度追踪</div>
                  <div className="text-sm text-white/80">实时追踪学习进度</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">效果评估</div>
                  <div className="text-sm text-white/80">培训效果评估分析</div>
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
                  课程总数
                </CardTitle>
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">25</div>
              <p className="text-xs text-slate-500 mt-1">个培训课程</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  本月培训
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">8</div>
              <p className="text-xs text-slate-500 mt-1">场培训活动</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  参与员工
                </CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">156</div>
              <p className="text-xs text-slate-500 mt-1">人次培训</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  完成率
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">87%</div>
              <p className="text-xs text-slate-500 mt-1">培训完成率</p>
            </CardContent>
          </Card>
        </div>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              培训课程
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="h-4 w-4" />
              培训期次
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="gap-2">
              <Users className="h-4 w-4" />
              报名管理
            </TabsTrigger>
            <TabsTrigger value="records" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              培训记录
            </TabsTrigger>
          </TabsList>

          {/* 培训课程 */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>培训课程</CardTitle>
                    <CardDescription>创建和管理培训课程内容</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="搜索课程..." className="max-w-xs" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部分类</SelectItem>
                        <SelectItem value="orientation">入职培训</SelectItem>
                        <SelectItem value="skills">技能提升</SelectItem>
                        <SelectItem value="management">管理培训</SelectItem>
                        <SelectItem value="safety">安全培训</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{course.category}</Badge>
                          {course.is_mandatory && (
                            <Badge variant="destructive">必修</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base mt-2">{course.course_name}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">课程代码</span>
                          <span className="font-mono text-xs">{course.course_code}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">课程时长</span>
                          <span className="font-medium">{course.duration_hours} 小时</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">难度级别</span>
                          {getDifficultyBadge(course.difficulty_level)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">讲师</span>
                          <span className="font-medium">{course.instructor_name}</span>
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

          {/* 培训期次 */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>培训期次</CardTitle>
                    <CardDescription>安排和管理培训活动</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    新建期次
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>期次名称</TableHead>
                      <TableHead>课程</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>开始日期</TableHead>
                      <TableHead>结束日期</TableHead>
                      <TableHead>地点/链接</TableHead>
                      <TableHead>参与人数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.session_name}</TableCell>
                        <TableCell>{session.course_name}</TableCell>
                        <TableCell>{getSessionTypeBadge(session.session_type)}</TableCell>
                        <TableCell>{session.start_date}</TableCell>
                        <TableCell>{session.end_date}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {session.location || session.meeting_url || '-'}
                        </TableCell>
                        <TableCell>
                          {session.current_participants}/{session.max_participants}
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
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

          {/* 报名管理 */}
          <TabsContent value="enrollments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>报名管理</CardTitle>
                    <CardDescription>管理员工报名和审批</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="pending">待审批</SelectItem>
                        <SelectItem value="approved">已通过</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
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
                      <TableHead>部门</TableHead>
                      <TableHead>培训期次</TableHead>
                      <TableHead>报名时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>学习进度</TableHead>
                      <TableHead>完成时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{enrollment.employee_name}</TableCell>
                        <TableCell>{enrollment.employee_department}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {enrollment.session_name}
                        </TableCell>
                        <TableCell>{enrollment.enrollment_date}</TableCell>
                        <TableCell>{getStatusBadge(enrollment.enrollment_status)}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="space-y-1">
                            <Progress value={enrollment.progress_percentage} className="h-2" />
                            <span className="text-xs text-slate-600">
                              {enrollment.progress_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.completion_date || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {enrollment.enrollment_status === 'pending' && (
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

          {/* 培训记录 */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>培训记录</CardTitle>
                    <CardDescription>查看培训出勤和考核记录</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="搜索员工..." className="max-w-xs" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="present">出席</SelectItem>
                        <SelectItem value="absent">缺席</SelectItem>
                        <SelectItem value="late">迟到</SelectItem>
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
                      <TableHead>培训课程</TableHead>
                      <TableHead>学习日期</TableHead>
                      <TableHead>学习时长</TableHead>
                      <TableHead>出勤状态</TableHead>
                      <TableHead>考核分数</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee_name}</TableCell>
                        <TableCell>{record.course_name}</TableCell>
                        <TableCell>{record.record_date}</TableCell>
                        <TableCell>{record.duration_hours} 小时</TableCell>
                        <TableCell>{getAttendanceStatusBadge(record.attendance_status)}</TableCell>
                        <TableCell>
                          {record.assessment_score !== null ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{record.assessment_score}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
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
