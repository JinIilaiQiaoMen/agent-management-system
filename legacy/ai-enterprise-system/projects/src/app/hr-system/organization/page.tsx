'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Plus,
  Building2,
  Briefcase,
  Users,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
  employeeCount: number;
  children?: Department[];
}

interface Position {
  id: string;
  name: string;
  code: string;
  department: string;
  level: string;
  headcount: number;
  currentCount: number;
}

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'department' | 'position'>('department');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  // 模拟部门数据
  const mockDepartments: Department[] = [
    {
      id: '1',
      name: '总公司',
      code: 'HQ',
      manager: '张三',
      employeeCount: 156,
      children: [
        {
          id: '2',
          name: '技术部',
          code: 'TECH',
          manager: '李四',
          employeeCount: 45,
          children: [
            { id: '21', name: '前端组', code: 'FE', manager: '王五', employeeCount: 15 },
            { id: '22', name: '后端组', code: 'BE', manager: '赵六', employeeCount: 20 },
            { id: '23', name: '测试组', code: 'QA', manager: '孙七', employeeCount: 10 }
          ]
        },
        {
          id: '3',
          name: '市场部',
          code: 'MKT',
          manager: '周八',
          employeeCount: 30,
          children: [
            { id: '31', name: '销售组', code: 'SALES', manager: '吴九', employeeCount: 20 },
            { id: '32', name: '市场推广组', code: 'PROMO', manager: '郑十', employeeCount: 10 }
          ]
        },
        {
          id: '4',
          name: '人力资源部',
          code: 'HR',
          manager: '刘一',
          employeeCount: 12
        },
        {
          id: '5',
          name: '财务部',
          code: 'FIN',
          manager: '陈二',
          employeeCount: 8
        }
      ]
    }
  ];

  // 模拟岗位数据
  const mockPositions: Position[] = [
    { id: '1', name: '高级工程师', code: 'SE-SENIOR', department: '技术部', level: 'L4', headcount: 10, currentCount: 8 },
    { id: '2', name: '中级工程师', code: 'SE-MID', department: '技术部', level: 'L3', headcount: 20, currentCount: 18 },
    { id: '3', name: '初级工程师', code: 'SE-JUNIOR', department: '技术部', level: 'L2', headcount: 15, currentCount: 15 },
    { id: '4', name: '销售经理', code: 'SM', department: '市场部', level: 'L3', headcount: 5, currentCount: 4 },
    { id: '5', name: '销售专员', code: 'SS', department: '市场部', level: 'L2', headcount: 15, currentCount: 14 },
    { id: '6', name: 'HR专员', code: 'HR', department: '人力资源部', level: 'L2', headcount: 5, currentCount: 5 },
    { id: '7', name: '会计', code: 'ACC', department: '财务部', level: 'L2', headcount: 4, currentCount: 4 },
    { id: '8', name: '财务经理', code: 'FM', department: '财务部', level: 'L3', headcount: 2, currentCount: 2 }
  ];

  const toggleExpand = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const renderDepartmentTree = (dept: Department, depth = 0) => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expandedDepts.has(dept.id);

    return (
      <div key={dept.id} style={{ marginLeft: depth * 20 }}>
        <Card className={`mb-2 ${depth === 0 ? 'bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(dept.id)}
                    className="flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                )}
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {dept.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {dept.code}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    负责人：{dept.manager}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {dept.employeeCount}人
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {hasChildren && isExpanded && (
          <div>
            {dept.children!.map(child => renderDepartmentTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    组织架构管理
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    部门、岗位、汇报关系配置
                  </p>
                </div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'department' ? '添加部门' : '添加岗位'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tab 切换 */}
        <div className="mb-6 flex space-x-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('department')}
            className={`pb-4 px-2 text-sm font-medium transition-colors ${
              activeTab === 'department'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Building2 className="inline h-4 w-4 mr-2" />
            部门管理
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`pb-4 px-2 text-sm font-medium transition-colors ${
              activeTab === 'position'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Briefcase className="inline h-4 w-4 mr-2" />
            岗位管理
          </button>
        </div>

        {/* 部门管理 */}
        {activeTab === 'department' && (
          <>
            {/* 搜索 */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="搜索部门名称或负责人..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 部门树 */}
            <div className="space-y-2">
              {mockDepartments.map(dept => renderDepartmentTree(dept))}
            </div>
          </>
        )}

        {/* 岗位管理 */}
        {activeTab === 'position' && (
          <>
            {/* 搜索 */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="搜索岗位名称..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 岗位列表 */}
            <div className="grid gap-4">
              {mockPositions.map(position => (
                <Card key={position.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {position.name}
                            </h3>
                            <Badge variant="outline">{position.code}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>{position.department}</span>
                            <span>•</span>
                            <span>{position.level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">编制人数</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {position.currentCount}/{position.headcount}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* 说明 */}
        <Card className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="text-base">💡 功能说明</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>部门管理</strong>：支持多层级部门结构，设置部门负责人，查看部门人数</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>岗位管理</strong>：维护岗位名称、职级、编制，支持岗位分类</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>汇报关系</strong>：配置员工直属上级，形成组织架构树</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>当前展示的是模拟数据，实际使用时将从数据库加载真实组织架构</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
