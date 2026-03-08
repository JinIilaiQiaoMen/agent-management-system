import { NextRequest, NextResponse } from "next/server";
import { taskManager } from "@/storage/database";

/**
 * GET /api/tasks - 获取所有任务
 */
export async function GET() {
  try {
    const tasks = await taskManager.getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to get tasks:", error);
    return NextResponse.json({ error: "获取任务列表失败" }, { status: 500 });
  }
}

/**
 * POST /api/tasks - 创建任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 如果没有分配智能体，尝试自动分配
    if (!body.assignedAgentId) {
      const availableAgents = await taskManager.getAvailableAgents();
      if (availableAgents.length > 0) {
        // 简单的智能分配逻辑：基于任务描述匹配智能体能力
        const taskDescription = body.description?.toLowerCase() || "";
        let bestMatch: any = null;
        let maxScore = 0;

        for (const agent of availableAgents) {
          const capabilities = (agent.capabilities as string[]) || [];
          let score = 0;

          // 匹配部门关键词
          if (taskDescription.includes("技术") || taskDescription.includes("开发") || taskDescription.includes("代码")) {
            if (agent.role?.toLowerCase().includes("cto") || agent.role?.toLowerCase().includes("技术")) score += 3;
            if (agent.department?.toLowerCase().includes("研发") || agent.department?.toLowerCase().includes("技术")) score += 2;
          }

          if (taskDescription.includes("产品") || taskDescription.includes("需求")) {
            if (agent.role?.toLowerCase().includes("cpo") || agent.role?.toLowerCase().includes("产品")) score += 3;
            if (agent.department?.toLowerCase().includes("产品")) score += 2;
          }

          if (taskDescription.includes("市场") || taskDescription.includes("推广")) {
            if (agent.role?.toLowerCase().includes("cmo") || agent.role?.toLowerCase().includes("市场")) score += 3;
            if (agent.department?.toLowerCase().includes("市场")) score += 2;
          }

          if (taskDescription.includes("运营") || taskDescription.includes("用户")) {
            if (agent.role?.toLowerCase().includes("coo") || agent.role?.toLowerCase().includes("运营")) score += 3;
            if (agent.department?.toLowerCase().includes("运营")) score += 2;
          }

          if (taskDescription.includes("财务") || taskDescription.includes("预算")) {
            if (agent.role?.toLowerCase().includes("cfo") || agent.role?.toLowerCase().includes("财务")) score += 3;
            if (agent.department?.toLowerCase().includes("财务")) score += 2;
          }

          // 匹配能力标签
          for (const capability of capabilities) {
            if (taskDescription.includes(capability.toLowerCase())) {
              score += 1;
            }
          }

          if (score > maxScore) {
            maxScore = score;
            bestMatch = agent;
          }
        }

        if (bestMatch && maxScore > 0) {
          body.assignedAgentId = bestMatch.id;
          body.status = "assigned";
        }
      }
    }

    const task = await taskManager.createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "创建任务失败" }, { status: 500 });
  }
}
