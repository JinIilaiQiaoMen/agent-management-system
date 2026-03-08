"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  User,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { Agent } from "@/lib/db";

interface AgentTreeNode extends Agent {
  children?: AgentTreeNode[];
}

interface AgentTreeProps {
  agents: Agent[];
  onAgentSelect: (agent: Agent) => void;
  onAgentEdit: (agent: Agent) => void;
  onAgentDeleted: () => void;
}

export default function AgentTree({
  agents,
  onAgentSelect,
  onAgentEdit,
  onAgentDeleted,
}: AgentTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  // 构建树形结构
  const buildTree = (agents: Agent[]): AgentTreeNode[] => {
    const agentMap = new Map<string, AgentTreeNode>();
    const roots: AgentTreeNode[] = [];

    // 创建映射
    agents.forEach((agent) => {
      agentMap.set(agent.id, { ...agent, children: [] });
    });

    // 构建树
    agents.forEach((agent) => {
      const node = agentMap.get(agent.id)!;
      if (agent.parentId && agentMap.has(agent.parentId)) {
        agentMap.get(agent.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDelete = async () => {
    if (!agentToDelete) return;

    try {
      const response = await fetch(`/api/agents/${agentToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onAgentDeleted();
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
    } finally {
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const TreeNode = ({
    node,
    level = 0,
  }: {
    node: AgentTreeNode;
    level?: number;
  }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div className="select-none">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group ${
            level > 0 ? "ml-6" : ""
          }`}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div
            className="flex-1 flex items-center gap-3"
            onClick={() => onAgentSelect(node)}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                node.isActive
                  ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}
            >
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{node.name}</span>
                <Badge variant="outline" className="text-xs">
                  {node.role}
                </Badge>
                {!node.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    未激活
                  </Badge>
                )}
              </div>
              {node.department && (
                <p className="text-xs text-slate-500">{node.department}</p>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAgentEdit(node)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setAgentToDelete(node);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 子节点 */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(agents);

  if (tree.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无智能体</p>
        <p className="text-sm">点击上方按钮添加第一个智能体</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {tree.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除智能体 "{agentToDelete?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
