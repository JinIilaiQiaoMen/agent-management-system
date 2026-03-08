"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Minimize2,
  Maximize2,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Activity,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: "idle" | "running" | "waiting" | "error" | "completed";
  currentTask?: string;
  currentStep?: string;
  progress: number;
  startTime: string;
  logs: Array<{
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
  }>;
}

interface AgentMonitorPanelProps {
  taskId?: string;
  className?: string;
}

export default function AgentMonitorPanel({ taskId, className }: AgentMonitorPanelProps) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // 模拟数据（实际应该从 API 获取）
  const mockAgents: AgentStatus[] = [
    {
      id: "1",
      name: "李四",
      role: "董事长",
      status: "running",
      currentTask: "任务执行中",
      currentStep: "正在分析任务需求...",
      progress: 45,
      startTime: new Date(Date.now() - 300000).toISOString(),
      logs: [
        { timestamp: new Date(Date.now() - 300000).toISOString(), level: "info", message: "开始执行任务" },
        { timestamp: new Date(Date.now() - 200000).toISOString(), level: "info", message: "加载任务描述" },
        { timestamp: new Date(Date.now() - 100000).toISOString(), level: "info", message: "正在分析任务需求" },
      ],
    },
    {
      id: "2",
      name: "王五",
      role: "技术总监",
      status: "waiting",
      currentTask: "等待分配任务",
      currentStep: "等待中...",
      progress: 0,
      startTime: new Date(Date.now() - 10000).toISOString(),
      logs: [
        { timestamp: new Date(Date.now() - 10000).toISOString(), level: "info", message: "等待任务分配" },
      ],
    },
    {
      id: "3",
      name: "张三",
      role: "前端开发",
      status: "error",
      currentTask: "代码生成失败",
      currentStep: "错误处理中",
      progress: 30,
      startTime: new Date(Date.now() - 600000).toISOString(),
      logs: [
        { timestamp: new Date(Date.now() - 600000).toISOString(), level: "info", message: "开始生成代码" },
        { timestamp: new Date(Date.now() - 500000).toISOString(), level: "info", message: "生成组件结构" },
        { timestamp: new Date(Date.now() - 400000).toISOString(), level: "error", message: "代码生成失败: 参数错误" },
      ],
    },
  ];

  // 加载智能体状态
  useEffect(() => {
    loadAgentStatus();
  }, [taskId]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAgentStatus();
    }, 3000); // 每 3 秒刷新一次

    return () => clearInterval(interval);
  }, [autoRefresh, taskId]);

  const loadAgentStatus = async () => {
    try {
      const response = await fetch(`/api/agents/status${taskId ? `?taskId=${taskId}` : ""}`);
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      } else {
        // 如果 API 不可用，使用模拟数据
        setAgents(mockAgents);
      }
    } catch (error) {
      console.error("Failed to load agent status:", error);
      // 使用模拟数据
      setAgents(mockAgents);
    } finally {
      setLastRefresh(new Date());
    }
  };

  const toggleExpand = (agentId: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "idle":
        return <Pause className="h-4 w-4 text-gray-500" />;
      case "waiting":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Cpu className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500";
      case "idle":
        return "bg-gray-500";
      case "waiting":
        return "bg-amber-500";
      case "error":
        return "bg-red-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      idle: "空闲",
      running: "执行中",
      waiting: "等待中",
      error: "异常",
      completed: "已完成",
    };
    return labels[status] || status;
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    }
    return `${seconds}秒`;
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-500";
      case "warn":
        return "text-amber-500";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  const runningAgents = agents.filter((a) => a.status === "running").length;
  const errorAgents = agents.filter((a) => a.status === "error").length;

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none shadow-lg">
          <CardContent className="p-3 flex items-center gap-3">
            <Activity className="h-5 w-5 animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-medium">AI 任务监控</div>
              <div className="text-xs opacity-80">
                {runningAgents} 个执行中 · {errorAgents} 个异常
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 ${className}`}>
      <Card className="shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              AI 任务实时观测
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={loadAgentStatus}
                title="手动刷新"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setIsMinimized(true)}
                title="最小化"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                {runningAgents} 执行中
              </Badge>
              <Badge variant="outline" className="text-xs">
                {errorAgents} 异常
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                className="h-4 w-7"
              />
              <span>自动刷新</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] px-4 pb-4">
            {agents.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                <div className="text-center">
                  <Pause className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>暂无执行中的智能体</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="border rounded-lg overflow-hidden bg-card"
                  >
                    <div
                      className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleExpand(agent.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{agent.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {agent.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {getStatusIcon(agent.status)}
                            <span>{getStatusLabel(agent.status)}</span>
                            <span>·</span>
                            <span>{formatDuration(agent.startTime)}</span>
                          </div>
                        </div>
                        {isExpanded[agent.id] ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      {agent.currentTask && (
                        <div className="mt-2 text-sm">
                          <div className="text-muted-foreground text-xs">任务</div>
                          <div className="font-medium">{agent.currentTask}</div>
                        </div>
                      )}

                      {agent.currentStep && (
                        <div className="mt-1 text-sm">
                          <div className="text-muted-foreground text-xs">步骤</div>
                          <div className="text-blue-600 dark:text-blue-400">
                            {agent.currentStep}
                          </div>
                        </div>
                      )}

                      {agent.progress > 0 && agent.progress < 100 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>进度</span>
                            <span>{agent.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getStatusColor(agent.status)} transition-all duration-300`}
                              style={{ width: `${agent.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {isExpanded[agent.id] && agent.logs.length > 0 && (
                      <div className="border-t bg-muted/30 p-3">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          执行日志
                        </div>
                        <ScrollArea className="h-[150px]">
                          <div className="space-y-1 text-xs">
                            {agent.logs.slice().reverse().map((log, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 py-1 border-l-2 border-muted-foreground/20 pl-2"
                              >
                                <span className="text-muted-foreground shrink-0">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={getLogColor(log.level)}>
                                  [{log.level.toUpperCase()}] {log.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            最后更新: {lastRefresh.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
