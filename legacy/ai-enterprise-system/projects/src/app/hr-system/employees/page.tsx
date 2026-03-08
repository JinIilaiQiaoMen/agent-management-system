'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Download,
  Users,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  location: string;
}

export default function EmployeeListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // 模拟数据
  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '+86 138-0000-0001',
      department: '技术部',
      position: '高级工程师',
      status: 'active',
      joinDate: '2022-03-15',
      location: '北京'
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '+86 138-0000-0002',
      department: '市场部',
      position: '市场经理',
      status: 'active',
      joinDate: '2021-06-20',
      location: '上海'
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '+86 138-0000-0003',
      department: '技术部',
      position: '前端工程师',
      status: 'active',
      joinDate: '2023-01-10',
      location: '深圳'
    },
    {
      id: '4',
      name: '赵六',
      email: 'zhaoliu@example.com',
      phone: '+86 138-0000-0004',
      department: '人力资源',
      position: 'HR专员',
      status: 'on_leave',
      joinDate: '2022-08-05',
      location: '北京'
    },
    {
      id: '5',
      name: '孙七',
      email: 'sunqi@example.com',
      phone: '+86 138-0000-0005',
      department: '财务部',
      position: '会计',
      status: 'active',
      joinDate: '2021-11-15',
      location: '广州'
    }
  ];

  const departments = ['all', '技术部', '市场部', '人力资源', '财务部'];

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      on_leave: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[status] || colors.active;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: '在职',
      inactive: '离职',
      on_leave: '休假'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/hr-system"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    员工管理
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    查看和管理所有员工信息
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加员工
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                员工总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {mockEmployees.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                在职员工
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockEmployees.filter(e => e.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                休假中
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {mockEmployees.filter(e => e.status === 'on_leave').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                部门数量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(mockEmployees.map(e => e.department)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索员工姓名、邮箱或职位..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? '所有部门' : dept}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 员工列表 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-500">未找到匹配的员工</p>
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-lg font-semibold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {employee.position}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(employee.status)}>
                      {getStatusLabel(employee.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{employee.department}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a
                        href={`mailto:${employee.email}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {employee.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{employee.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{employee.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        入职时间：{employee.joinDate}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 说明 */}
        <Card className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="text-base">💡 功能说明</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>当前展示的是模拟数据，实际使用时将从数据库加载真实员工信息</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>支持按姓名、邮箱、职位搜索，以及按部门筛选</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>点击"添加员工"可以新增员工（需要后端支持）</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>完整的员工管理功能（编辑、删除、详情查看）正在开发中</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
