import { NextRequest, NextResponse } from "next/server";
import { agentManager } from "@/storage/database";
import { conversationManager } from "@/storage/database";

/**
 * GET /api/agents/status - 获取智能体实时状态
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    // 获取所有活跃的智能体
    const agents = await agentManager.getAgents({
      filters: { isActive: true }
    });

    // 为每个智能体构建状态信息
    const agentStatusList = await Promise.all(
      agents.map(async (agent) => {
        // 获取该智能体最近的对话记录（最近 5 条）
        let recentLogs: any[] = [];
        try {
          const conversations = await conversationManager.getConversations({
            filters: { agentId: agent.id },
            limit: 5,
            orderBy: "createdAt",
            order: "desc",
          });

          if (conversations && Array.isArray(conversations)) {
            recentLogs = conversations.map((conv) => {
              const logs = [];
              // 添加用户消息
              if (conv.userMessage) {
                logs.push({
                  timestamp: conv.createdAt?.toISOString() || new Date().toISOString(),
                  level: "info" as const,
                  message: `用户: ${conv.userMessage.substring(0, 100)}`,
                });
              }
              // 添加智能体回复
              if (conv.agentResponse) {
                logs.push({
                  timestamp: conv.createdAt?.toISOString() || new Date().toISOString(),
                  level: "info" as const,
                  message: `${agent.name}: ${conv.agentResponse.substring(0, 100)}`,
                });
              }
              return logs;
            }).flat();
          }
        } catch (error) {
          console.error("Error getting conversations:", error);
        }

        // 根据对话记录推断状态
        let status: "idle" | "running" | "waiting" | "error" | "completed" = "idle";
        let currentTask = "";
        let currentStep = "";
        let progress = 0;

        // 如果有任务 ID，尝试获取任务信息
        if (taskId) {
          try {
            const { taskManager } = await import("@/storage/database");
            const task = await taskManager.getTaskById(taskId);
            if (task && task.assignedAgentId === agent.id) {
              if (task.status === "in_progress") {
                status = "running";
                currentTask = task.title;
                currentStep = "执行任务中";
                progress = 50; // 模拟进度
              } else if (task.status === "completed") {
                status = "completed";
                currentTask = task.title;
                currentStep = "任务已完成";
                progress = 100;
              } else if (task.status === "pending") {
                status = "waiting";
                currentTask = task.title;
                currentStep = "等待开始";
                progress = 0;
              }
            }
          } catch (error) {
            console.error("Error getting task:", error);
          }
        }

        // 如果有最近的对话，标记为运行中
        if (recentLogs.length > 0 && status === "idle") {
          // 检查最近的对话时间，如果超过 5 分钟，不再标记为处理中
          const lastLogTime = new Date(recentLogs[recentLogs.length - 1].timestamp);
          const now = new Date();
          const timeDiff = (now.getTime() - lastLogTime.getTime()) / 1000; // 秒

          if (timeDiff < 300) { // 5 分钟内
            status = "running";
            currentTask = "对话中";
            currentStep = "处理用户消息";
            progress = 75;
          } else {
            status = "idle";
            currentTask = "等待中";
            currentStep = "";
            progress = 0;
          }
        }

        return {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          status,
          currentTask,
          currentStep,
          progress,
          startTime: recentLogs.length > 0
            ? recentLogs[recentLogs.length - 1].timestamp
            : new Date().toISOString(),
          logs: recentLogs.reverse(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      agents: agentStatusList,
    });
  } catch (error: any) {
    console.error("Failed to get agent status:", error);
    return NextResponse.json(
      {
        error: "获取智能体状态失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
