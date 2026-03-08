"use client"

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Play, Loader2, CheckCircle, XCircle, AlertCircle, Clock, User, FileText, Database, AlertTriangle, X } from "lucide-react";

interface TaskExecutionProps {
  taskId: string;
  onStatusChange?: (status: "idle" | "running" | "completed" | "error") => void;
}

interface ExecutionEvent {
  type: string;
  data: any;
  timestamp: number;
}

interface ErrorInfo {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  details?: any;
}

export default function TaskExecution({ taskId, onStatusChange }: TaskExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const eventRef = useRef<HTMLDivElement>(null);
  const [taskInfo, setTaskInfo] = useState<any>(null);
  const [agentsInfo, setAgentsInfo] = useState<any>(null);
  const [analysis, setAnalysis] = useState("");
  const [summary, setSummary] = useState("");
  const [agentResults, setAgentResults] = useState<Map<string, { progress: string; complete: boolean }>>(new Map());
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [progress, setProgress] = useState(0);
  const [collaborations, setCollaborations] = useState<Array<{ speaker: string; content: string; timestamp: number }>>([]);

  // 监听状态变化，通知父组件
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  const scrollToBottom = () => {
    if (eventRef.current) {
      eventRef.current.scrollTop = eventRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [events]);

  const startExecution = async () => {
    setIsExecuting(true);
    setStatus("running");
    setEvents([]);
    setCurrentStep(0);
    setAnalysis("");
    setSummary("");
    setAgentResults(new Map());

    try {
      const response = await fetch(`/api/tasks/${taskId}/auto-execute-stream`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start execution");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            
            if (dataStr === "[DONE]") {
              setIsExecuting(false);
              break;
            }

            try {
              const event: ExecutionEvent = JSON.parse(dataStr);
              setEvents((prev) => [...prev, event]);
              
              handleEvent(event);
            } catch (e) {
              console.error("Failed to parse event:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Execution error:", error);
      setStatus("error");
      setIsExecuting(false);
      setEvents((prev) => [
        ...prev,
        {
          type: "error",
          data: { message: error instanceof Error ? error.message : "Unknown error" },
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleEvent = (event: ExecutionEvent) => {
    switch (event.type) {
      case "start":
        break;
      case "task_info":
        setTaskInfo(event.data);
        break;
      case "status_update":
        if (event.data.status === "completed") {
          setStatus("completed");
          setProgress(100);
        }
        break;
      case "agents_info":
        setAgentsInfo(event.data);
        break;
      case "step":
        setCurrentStep(event.data.step);
        // 根据步骤更新进度
        const stepProgress = (event.data.step / 5) * 100;
        setProgress(stepProgress);
        break;
      case "step_complete":
        if (event.data.step === 5) {
          setStatus("completed");
          setProgress(100);
        }
        break;
      case "analysis_progress":
        setAnalysis((prev) => prev + event.data.content);
        break;
      case "agent_start":
        setAgentResults((prev) => {
          const newMap = new Map(prev);
          newMap.set(event.data.agentName, { progress: "", complete: false });
          return newMap;
        });
        break;
      case "agent_progress":
        setAgentResults((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(event.data.agentName) || { progress: "", complete: false };
          newMap.set(event.data.agentName, {
            progress: current.progress + event.data.content,
            complete: false,
          });
          return newMap;
        });
        break;
      case "agent_complete":
        setAgentResults((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(event.data.agentName) || { progress: "", complete: false };
          newMap.set(event.data.agentName, { ...current, complete: true });
          return newMap;
        });
        break;
      case "summary_progress":
        setSummary((prev) => prev + event.data.content);
        break;
      case "complete":
        setStatus("completed");
        setIsExecuting(false);
        setProgress(100);
        break;
      case "error":
        setStatus("error");
        setIsExecuting(false);
        // 添加错误到错误列表
        const newError: ErrorInfo = {
          id: `error-${Date.now()}`,
          type: event.data.errorType || "execution_error",
          message: event.data.message || "Unknown error",
          timestamp: Date.now(),
          details: event.data.details,
        };
        setErrors((prev) => [...prev, newError]);
        break;
      case "warning":
        // 添加警告到错误列表
        const warning: ErrorInfo = {
          id: `warning-${Date.now()}`,
          type: "warning",
          message: event.data.message || "Warning",
          timestamp: Date.now(),
          details: event.data.details,
        };
        setErrors((prev) => [...prev, warning]);
        break;
      case "collaboration":
        // 添加协作对话记录
        setCollaborations((prev) => [
          ...prev,
          {
            speaker: event.data.speaker,
            content: event.data.content,
            timestamp: Date.now(),
          },
        ]);
        break;
      case "coordination":
        // 添加协调记录
        setCollaborations((prev) => [
          ...prev,
          {
            speaker: event.data.speaker || "负责人",
            content: event.data.message || "协调中...",
            timestamp: Date.now(),
          },
        ]);
        break;
      case "execution":
        // 执行通知
        console.log("Execution:", event.data);
        break;
    }
  };

  const removeError = (errorId: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  const renderStatusIcon = () => {
    switch (status) {
      case "idle":
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const renderStepStatus = (step: number) => {
    if (step < currentStep) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (step === currentStep && status === "running") {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    } else {
      return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <CardTitle className="text-2xl">任务自动执行</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {status === "idle" && "点击开始按钮启动自动执行"}
                    {status === "running" && "正在执行中..."}
                    {status === "completed" && "执行完成"}
                    {status === "error" && "执行失败"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {renderStatusIcon()}
                  {status === "idle" && (
                    <Button onClick={startExecution} disabled={isExecuting} size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      开始执行
                    </Button>
                  )}
                  {errors.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-base py-2 px-3">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {errors.length} 个问题
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {status !== "idle" && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-muted-foreground font-medium">执行进度</span>
                    <span className="font-semibold text-lg">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium">
                      {currentStep === 0 && "准备中..."}
                      {currentStep === 1 && "生成智能体团队"}
                      {currentStep === 2 && "任务规划"}
                      {currentStep === 3 && "并行执行"}
                      {currentStep === 4 && "协调反馈"}
                      {currentStep === 5 && "最终执行"}
                      {currentStep > 5 && "结果汇总"}
                    </span>
                    <span className="font-medium">
                      {status === "running" && "执行中..."}
                      {status === "completed" && "已完成"}
                      {status === "error" && "执行失败"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Two-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Execution Steps */}
          {status !== "idle" && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">执行步骤</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: 1, name: "任务规划" },
                    { step: 2, name: "并行执行" },
                    { step: 3, name: "协调反馈" },
                    { step: 4, name: "最终执行" },
                    { step: 5, name: "结果汇总" },
                  ].map(({ step, name }) => (
                    <div key={step} className="flex items-center gap-3 py-2">
                      {renderStepStatus(step)}
                      <span className="font-medium text-base">{name}</span>
                      {step < currentStep && <Badge variant="outline" className="ml-2">已完成</Badge>}
                    </div>
                  ))}

                {agentsInfo && (
                  <div className="mt-6 p-5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5" />
                      <span className="font-semibold text-lg">负责人</span>
                    </div>
                    <p className="ml-7 text-base">{agentsInfo.leader}</p>

                    <div className="flex items-center gap-2 mt-5 mb-3">
                      <User className="w-5 h-5" />
                      <span className="font-semibold text-lg">专业智能体</span>
                      <Badge variant="secondary" className="ml-2">{agentsInfo.count}</Badge>
                    </div>
                    <p className="ml-7 text-base">{agentsInfo.specialists.join("、")}</p>
                  </div>
                )}
              </div>
              </CardContent>
            </Card>
          )}

          {/* Execution Details */}
          {status !== "idle" && (
            <Tabs defaultValue="collaboration" className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-12">
                <TabsTrigger value="collaboration" className="text-base">协作对话</TabsTrigger>
                <TabsTrigger value="analysis" className="text-base">任务规划</TabsTrigger>
                <TabsTrigger value="agents" className="text-base">智能体执行</TabsTrigger>
                <TabsTrigger value="summary" className="text-base">成果汇总</TabsTrigger>
                <TabsTrigger value="events" className="text-base">事件日志</TabsTrigger>
              </TabsList>

              <TabsContent value="collaboration" className="mt-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">多轮对话协作</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-5">
                        {collaborations.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground text-lg">
                            等待协作对话开始...
                          </div>
                        ) : (
                          collaborations.map((msg, index) => (
                            <div key={index} className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-base py-2 px-3">
                                  {msg.speaker}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-medium">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="p-4 bg-muted/50 rounded-lg text-base whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="mt-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">任务规划</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {analysis ? (
                        <div className="text-base whitespace-pre-wrap leading-relaxed">{analysis}</div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground text-lg">
                          等待任务规划结果...
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agents" className="mt-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">智能体执行</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-6">
                        {agentResults.size === 0 ? (
                          <div className="text-center py-12 text-muted-foreground text-lg">
                            等待智能体执行...
                          </div>
                        ) : (
                          Array.from(agentResults.entries()).map(([agentName, result]) => (
                            <div key={agentName} className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Badge variant={result.complete ? "default" : "secondary"} className="text-base py-2 px-3">
                                  {agentName}
                                </Badge>
                                {result.complete ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                )}
                              </div>
                              <div className="p-4 bg-muted/50 rounded-lg text-base whitespace-pre-wrap leading-relaxed">
                                {result.progress || "等待执行..."}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">成果汇总</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {summary ? (
                        <div className="text-base whitespace-pre-wrap leading-relaxed">{summary}</div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground text-lg">
                          等待成果汇总...
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="mt-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">事件日志</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div ref={eventRef} className="space-y-3">
                        {events.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground text-lg">
                            等待事件...
                          </div>
                        ) : (
                          events.map((event, index) => (
                            <div key={index} className="p-3 bg-muted/30 rounded-lg text-sm font-mono">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {event.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Right Column - Error Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  错误提醒
                </CardTitle>
                {errors.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllErrors}
                    className="text-xs"
                  >
                    清空全部
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {errors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                  <p className="text-sm">暂无错误</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-2">
                  <div className="space-y-3">
                    {errors.map((error) => (
                      <Alert
                        key={error.id}
                        variant={error.type === "warning" ? "default" : "destructive"}
                        className="relative"
                      >
                        <button
                          onClick={() => removeError(error.id)}
                          className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <AlertTitle className="flex items-center gap-2 text-sm font-medium">
                          {error.type === "warning" ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {error.type === "warning" ? "警告" : "错误"}
                        </AlertTitle>
                        <AlertDescription className="mt-2 text-xs">
                          {error.message}
                        </AlertDescription>
                        {error.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer hover:underline">
                              查看详情
                            </summary>
                            <pre className="mt-2 text-xs bg-black/10 p-2 rounded overflow-x-auto">
                              {JSON.stringify(error.details, null, 2)}
                            </pre>
                          </details>
                        )}
                        <div className="mt-2 text-[10px] text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
