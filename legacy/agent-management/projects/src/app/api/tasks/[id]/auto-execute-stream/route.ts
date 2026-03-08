import { NextRequest } from "next/server";
import { taskManager, agentManager, knowledgeBaseManager } from "@/storage/database";
import { LLMClient, Config, HeaderUtils, SearchClient, KnowledgeClient, DataSourceType } from "coze-coding-dev-sdk";
import {
  createAgentCollabFramework,
  CoordinatorAgent,
  ExecutorAgent,
  AgentRole,
  AgentTask,
  MessageType,
} from "@/lib/agent-collab";

/**
 * POST /api/tasks/[id]/auto-execute-stream - 流式自动执行任务
 * 使用 AgentCollab 框架和 SSE 实时推送执行进度
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: any) => {
        const event = JSON.stringify({ type, data, timestamp: Date.now() });
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      };

      try {
        // 发送开始事件
        sendEvent('start', { taskId, message: '开始使用AgentCollab框架执行任务' });

        // 获取任务信息
        const task = await taskManager.getTaskById(taskId);
        if (!task) {
          sendEvent('error', { message: '任务不存在' });
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        sendEvent('task_info', { title: task.title, description: task.description });

        // 更新任务状态
        await taskManager.updateTask(taskId, {
          status: "in_progress",
        });
        sendEvent('status_update', { status: 'in_progress', message: '任务状态已更新为执行中' });

        // 提取请求头
        const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
        const config = new Config();
        const llmClient = new LLMClient(config);
        const searchClient = new SearchClient(config, customHeaders);
        const knowledgeClient = new KnowledgeClient(config);

        // 获取智能体
        let agents = await agentManager.getAgents({
          filters: { isActive: true }
        });

        if (agents.length === 0) {
          sendEvent('info', { message: '没有智能体，开始生成团队' });

          const teamGenResponse = await fetch(
            new URL(`/api/tasks/${taskId}/generate-agents`, request.url),
            { method: "POST" }
          );

          if (!teamGenResponse.ok) {
            throw new Error('生成智能体团队失败');
          }

          const assignedTask = await taskManager.getTaskById(taskId);
          if (!assignedTask?.assignedAgentId) {
            throw new Error('未分配负责人智能体');
          }

          agents = await agentManager.getAgents({
            filters: { isActive: true }
          });

          sendEvent('team_generated', { count: agents.length });
        }

        const leaderAgent = agents.find(a => a.id === task.assignedAgentId) || agents[0];
        const specialistAgents = agents.filter(a => a.id !== leaderAgent.id);

        sendEvent('agents_info', {
          leader: leaderAgent.name,
          specialists: specialistAgents.map(a => a.name),
          count: specialistAgents.length
        });

        // ==================== AgentCollab 框架初始化 ====================
        sendEvent('framework_init', { message: '初始化AgentCollab框架...' });

        // 创建框架实例
        const framework = createAgentCollabFramework();
        const { coordinator, messageBus, memory } = framework;

        // 创建协调者Agent（负责人）
        const coordinatorAgent = new CoordinatorAgent(
          leaderAgent.id,
          leaderAgent.name,
          llmClient,
          customHeaders
        );
        coordinatorAgent.description = leaderAgent.description || "任务负责人";
        coordinator.registerAgent(coordinatorAgent);

        // 创建专业智能体（执行者）
        for (const specialist of specialistAgents) {
          const executorAgent = new ExecutorAgent(
            specialist.id,
            specialist.name,
            AgentRole.SPECIALIST,
            llmClient,
            customHeaders
          );
          executorAgent.description = specialist.description || specialist.role;
          coordinator.registerAgent(executorAgent);
        }

        sendEvent('framework_ready', {
          totalAgents: coordinator.getAllAgents().length,
          coordinatorName: coordinatorAgent.name,
          executorNames: specialistAgents.map(a => a.name)
        });

        // ==================== 创建任务 ====================
        const agentTask: AgentTask = {
          id: taskId,
          description: task.description,
          type: (task.metadata as any)?.type || "general",
          priority: task.priority as "low" | "medium" | "high",
          context: {
            title: task.title,
            taskId: task.id,
            createdAt: task.createdAt.getTime(),
          },
          status: "processing",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // ==================== 流式执行任务 ====================
        sendEvent('execution_start', { message: '开始流式执行任务...' });

        for await (const event of coordinator.executeTaskStream(agentTask, (e) => {
          sendEvent('framework_event', e);
        })) {
          // 框架事件映射到前端事件
          switch (event.type) {
            case 'step_start':
              sendEvent('step', {
                step: event.step,
                name: event.name,
                message: event.message
              });
              break;

            case 'step_complete':
              sendEvent('step_complete', {
                step: event.step,
                name: event.name,
                message: event.message
              });
              break;

            case 'plan_progress':
              sendEvent('analysis_progress', {
                agentName: coordinatorAgent.name,
                content: event.content
              });
              break;

            case 'agent_start':
              sendEvent('agent_start', {
                agentId: event.agentId,
                agentName: event.agentName || coordinator.getAgent(event.agentId)?.name,
                message: event.message
              });
              break;

            case 'agent_progress':
              sendEvent('agent_progress', {
                agentId: event.agentId,
                content: event.content
              });
              break;

            case 'agent_complete':
              sendEvent('agent_complete', {
                agentId: event.agentId,
                message: event.message
              });
              break;

            case 'coordination_progress':
              sendEvent('collaboration', {
                speaker: coordinatorAgent.name,
                content: event.content
              });
              break;

            case 'summary_progress':
              sendEvent('summary_progress', {
                content: event.content
              });
              break;

            case 'task_complete':
              sendEvent('complete', {
                message: '任务执行完成'
              });
              break;

            case 'error':
              sendEvent('error', {
                message: event.message
              });
              break;
          }
        }

        // ==================== 完成处理 ====================
        // 获取框架统计信息
        const stats = coordinator.getStats();
        sendEvent('framework_stats', stats);

        // 更新任务状态
        await taskManager.updateTask(taskId, {
          status: "completed",
          completedAt: new Date(),
        });

        sendEvent('status_update', { status: 'completed', message: '任务已完成' });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error("Task execution error:", error);
        sendEvent('error', {
          message: error instanceof Error ? error.message : "任务执行失败",
          details: error
        });
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// 辅助函数：提取搜索关键词
function extractSearchKeywords(text: string): string[] {
  const keywords: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.includes('需要') || line.includes('关键') || line.includes('重要')) {
      const words = line.match(/[\u4e00-\u9fa5]{2,}/g) || [];
      keywords.push(...words.slice(0, 3));
    }
  }

  return [...new Set(keywords)].slice(0, 5);
}
