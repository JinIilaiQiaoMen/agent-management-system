"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MessageSquare,
  FileText,
  Users,
  Briefcase,
  Building2,
} from "lucide-react";
import AgentTree from "@/components/agent-system/AgentTree";
import AgentDialog from "@/components/agent-system/AgentDialog";
import TaskDialog from "@/components/agent-system/TaskDialog";
import TaskList from "@/components/agent-system/TaskList";
import ChatPanel from "@/components/agent-system/ChatPanel";
import KnowledgeBasePanel from "@/components/agent-system/KnowledgeBasePanel";
import type { Agent, AgentTask } from "@/lib/db";

export default function AgentSystemPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("agents");
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);

  const loadAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const result = await response.json();
        setAgents(result.data || result || []);
      }
    } catch (error) {
      console.error("Failed to load agents:", error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/agent-tasks");
      if (response.ok) {
        const result = await response.json();
        setTasks(result.data || result || []);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  useEffect(() => {
    loadAgents();
    loadTasks();
  }, []);

  const handleAgentSaved = () => {
    loadAgents();
    setAgentDialogOpen(false);
    setEditingAgent(null);
  };

  const handleTaskCreated = () => {
    loadTasks();
    setTaskDialogOpen(false);
  };

  const handleAgentDeleted = () => {
    loadAgents();
    if (selectedAgent) {
      setSelectedAgent(null);
    }
  };

  const handleTaskSelected = (task: AgentTask) => {
    setSelectedTask(task);
    if (task.assignedAgentId) {
      const agent = agents.find((a) => a.id === task.assignedAgentId);
      if (agent) {
        setSelectedAgent(agent);
        setActiveTab("chat");
      }
    }
  };

  const activeAgentsCount = agents.filter((a) => a.isActive).length;
  const pendingTasksCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  智能体管理系统
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI智能体协作与任务管理平台
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  智能体: {activeAgentsCount}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  待分配: {pendingTasksCount}
                </Badge>
              </div>
              <Button onClick={() => setTaskDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                发布任务
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="agents" className="gap-2">
              <Users className="h-4 w-4" />
              智能体架构
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <Briefcase className="h-4 w-4" />
              任务管理
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              智能体对话
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <FileText className="h-4 w-4" />
              知识库
            </TabsTrigger>
            <TabsTrigger value="api-configs" className="gap-2">
              <Plus className="h-4 w-4" />
              API配置
            </TabsTrigger>
          </TabsList>

          {/* 智能体架构 */}
          <TabsContent value="agents" className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">公司智能体架构</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    管理公司各层级智能体，支持增删改查操作
                  </p>
                </div>
                <Button onClick={() => setAgentDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  添加智能体
                </Button>
              </div>
              <AgentTree
                agents={agents}
                onAgentSelect={setSelectedAgent}
                onAgentEdit={(agent) => {
                  setEditingAgent(agent);
                  setAgentDialogOpen(true);
                }}
                onAgentDeleted={handleAgentDeleted}
              />
            </Card>
          </TabsContent>

          {/* 任务管理 */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">任务管理</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    发布任务并分配给对应职能的智能体
                  </p>
                </div>
              </div>
              <TaskList
                tasks={tasks}
                agents={agents}
                onTaskSelect={handleTaskSelected}
                onTaskUpdated={loadTasks}
              />
            </Card>
          </TabsContent>

          {/* 智能体对话 */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">智能体对话</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    与智能体进行对话交流，获取专业建议
                  </p>
                </div>
              </div>
              <ChatPanel
                agents={agents}
                selectedAgent={selectedAgent}
                onAgentSelect={setSelectedAgent}
                selectedTask={selectedTask}
              />
            </Card>
          </TabsContent>

          {/* 知识库 */}
          <TabsContent value="knowledge" className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">知识库管理</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    管理通用知识库和智能体专属知识库
                  </p>
                </div>
              </div>
              <KnowledgeBasePanel agents={agents} />
            </Card>
          </TabsContent>

          {/* API配置 */}
          <TabsContent value="api-configs" className="space-y-4">
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">API配置管理</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  为智能体配置外部API接口，支持REST、GraphQL等协议
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => window.location.href = '/api-configs'} className="gap-2">
                  <Plus className="h-4 w-4" />
                  打开API配置管理
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AgentDialog
        open={agentDialogOpen}
        onOpenChange={setAgentDialogOpen}
        agent={editingAgent}
        agents={agents}
        onSaved={handleAgentSaved}
      />

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        agents={agents}
        onCreated={handleTaskCreated}
      />
    </div>
  );
}
