"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronRight,
  ChevronDown,
  User,
  Building,
  Briefcase,
  Trash2,
  Edit,
  Bot,
  BookOpen,
} from "lucide-react";
import type { Agent } from "@/storage/database";

interface AgentTreeProps {
  agents: Agent[];
  onAgentSelect: (agent: Agent | null) => void;
  onAgentEdit: (agent: Agent) => void;
  onAgentDeleted: () => void;
}

interface AgentNodeProps {
  agent: Agent & { children?: (Agent & { children?: Agent[] })[] };
  level: number;
  onSelect: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  allAgents: Agent[];
}

function AgentNode({ agent, level, onSelect, onEdit, onDelete, allAgents }: AgentNodeProps) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = agent.children && agent.children.length > 0;

  const getIconByRole = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes("ceo") || roleLower.includes("董事长") || roleLower.includes("董事")) {
      return <Building className="h-4 w-4 text-purple-600" />;
    }
    if (roleLower.includes("cto") || roleLower.includes("技术")) {
      return <Bot className="h-4 w-4 text-blue-600" />;
    }
    if (roleLower.includes("coo") || roleLower.includes("运营")) {
      return <Briefcase className="h-4 w-4 text-orange-600" />;
    }
    if (roleLower.includes("cfo") || roleLower.includes("财务")) {
      return <User className="h-4 w-4 text-green-600" />;
    }
    return <User className="h-4 w-4 text-slate-600" />;
  };

  const getDepartmentColor = (department?: string | null) => {
    if (!department) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    const deptLower = department.toLowerCase();
    if (deptLower.includes("决策") || deptLower.includes("股东") || deptLower.includes("董事")) {
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    }
    if (deptLower.includes("高管")) {
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    }
    if (deptLower.includes("研发") || deptLower.includes("技术")) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    }
    if (deptLower.includes("产品")) {
      return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300";
    }
    if (deptLower.includes("市场")) {
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    }
    if (deptLower.includes("销售")) {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    }
    if (deptLower.includes("运营")) {
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    }
    if (deptLower.includes("财务")) {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    }
    if (deptLower.includes("人力资源") || deptLower.includes("hr")) {
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300";
    }
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <div className="space-y-2">
      <Card
        className={`p-4 transition-all hover:shadow-md ${
          !agent.isActive ? "opacity-50" : ""
        }`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              {getIconByRole(agent.role)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {agent.name}
                </span>
                <Badge className={getDepartmentColor(agent.department)}>
                  {agent.role}
                </Badge>
                {agent.knowledgeBaseId && (
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    知识库
                  </Badge>
                )}
              </div>
              {agent.department && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {agent.department}
                </p>
              )}
              {agent.description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {agent.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(agent)}
              className="gap-1"
            >
              查看详情
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(agent)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(agent)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {expanded && hasChildren && (
        <div className="space-y-2">
          {agent.children!.map((child) => (
            <AgentNode
              key={child.id}
              agent={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              allAgents={allAgents}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentTree({ agents, onAgentSelect, onAgentEdit, onAgentDeleted }: AgentTreeProps) {
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null);

  // 构建树形结构
  const buildTree = (parentId: string | null = null): (Agent & { children?: Agent[] })[] => {
    const children = agents
      .filter((agent) => agent.parentId === parentId)
      .map((agent) => ({
        ...agent,
        children: buildTree(agent.id),
      }));

    return children;
  };

  const tree = buildTree(null);

  const handleDelete = async (agent: Agent) => {
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onAgentDeleted();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("删除失败");
    }
    setDeleteAgent(null);
  };

  return (
    <>
      {tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <User className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            还没有智能体
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            点击右上角"添加智能体"按钮开始创建
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tree.map((agent) => (
            <AgentNode
              key={agent.id}
              agent={agent}
              level={0}
              onSelect={onAgentSelect}
              onEdit={onAgentEdit}
              onDelete={(a) => setDeleteAgent(a)}
              allAgents={agents}
            />
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteAgent} onOpenChange={() => setDeleteAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除智能体"{deleteAgent?.name}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAgent && handleDelete(deleteAgent)}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
