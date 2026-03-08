import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { SearchClient } from "coze-coding-dev-sdk";
import { agentManager } from "@/storage/database";
import { conversationManager } from "@/storage/database";
import { knowledgeBaseManager } from "@/storage/database";
import { taskDeliverableManager } from "@/storage/database";

/**
 * POST /api/chat - 与智能体对话（流式输出）
 */
export async function POST(request: NextRequest) {
  let agent: any;
  let taskId: string | null = null;
  let agentId: string = "";
  let message: string = "";
  let conversationHistory: any[] = [];

  try {
    const body = await request.json();
    agentId = body.agentId;
    message = body.message;
    conversationHistory = body.conversationHistory || [];
    taskId = body.taskId || null;

    if (!agentId || !message) {
      return new Response(
        JSON.stringify({ error: "缺少必填字段: agentId 和 message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 获取智能体信息
    agent = await agentManager.getAgentById(agentId);
    if (!agent) {
      return new Response(
        JSON.stringify({ error: "智能体不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 获取任务信息（如果有）
    let taskContext = "";
    if (taskId) {
      try {
        const { taskManager } = await import("@/storage/database");
        const task = await taskManager.getTaskById(taskId);
        if (task) {
          taskContext = `\n【当前任务】\n任务标题：${task.title}\n任务描述：${task.description}\n任务优先级：${task.priority}\n任务状态：${task.status}\n`;
        }
      } catch (error) {
        console.error("Error getting task:", error);
        // 任务获取失败不影响对话继续
      }
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置LLM客户端
    const config = new Config();
    const llmClient = new LLMClient(config);
    const searchClient = new SearchClient(config, customHeaders);

    // 构建消息历史
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

    // 添加系统提示词
    let systemPrompt = "";

    // 基础角色信息
    systemPrompt += `你叫${agent.name}，是公司的${agent.role}。\n`;
    if (agent.department) {
      systemPrompt += `部门：${agent.department}。\n`;
    }
    if (agent.description) {
      systemPrompt += `职责：${agent.description}\n`;
    }

    // 添加任务上下文
    if (taskContext) {
      systemPrompt += taskContext;
    }

    // 如果智能体有自定义系统提示词
    if (agent.systemPrompt) {
      systemPrompt += `\n${agent.systemPrompt}`;
    }

    // 添加能力标签
    if (agent.capabilities && Array.isArray(agent.capabilities)) {
      const capabilities = agent.capabilities.join("、");
      systemPrompt += `\n你的核心能力包括：${capabilities}。`;
    }

    // 添加联网搜索能力
    systemPrompt += `\n\n【联网搜索能力】\n`;
    systemPrompt += `你拥有联网搜索的能力。当用户询问最新的信息、实时数据、或者超出你训练数据范围的内容时，你可以使用联网搜索。\n`;
    systemPrompt += `如果需要联网搜索，请在回复的开头使用特殊格式：[SEARCH: 搜索关键词]\n`;
    systemPrompt += `系统会自动为你执行搜索，并将搜索结果提供给你。\n`;

    // 添加重要指令，避免幻觉
    systemPrompt += `\n【重要指令】\n`;
    systemPrompt += `1. 回答时请基于你角色、职责和任务信息进行回答。\n`;
    systemPrompt += `2. 如果问题超出了你的职责范围或知识范围，请明确说明，不要猜测或编造信息。\n`;
    systemPrompt += `3. 对于任务相关问题，请围绕任务的具体内容和要求进行回答。\n`;
    systemPrompt += `4. 回答要专业、准确、有针对性，避免空泛的回答。\n`;
    systemPrompt += `5. 如果遇到错误或无法处理的情况，请明确说明具体的错误原因，而不是模糊地道歉。\n`;
    systemPrompt += `6. 使用联网搜索获取最新信息时，基于搜索结果给出准确的答案。\n`;

    messages.push({ role: "system", content: systemPrompt });

    // 添加知识库上下文（如果有）
    if (agent.knowledgeBaseId) {
      try {
        const knowledgeBase = await knowledgeBaseManager.getKnowledgeBaseById(
          agent.knowledgeBaseId
        );
        if (knowledgeBase && knowledgeBase.type === "individual") {
          messages.push({
            role: "system",
            content: `\n你拥有专属知识库，可以参考其中的专业知识来回答问题。`,
          });
        }
      } catch (error) {
        console.error("Error getting knowledge base:", error);
        // 知识库获取失败不影响对话继续
      }
    }

    // 添加通用知识库提示
    try {
      const commonKnowledgeBase = await knowledgeBaseManager.getCommonKnowledgeBase();
      if (commonKnowledgeBase && commonKnowledgeBase.documentCount > 0) {
        messages.push({
          role: "system",
          content: `\n你可以参考公司通用知识库中的信息。`,
        });
      }
    } catch (error) {
      console.error("Error getting common knowledge base:", error);
      // 通用知识库获取失败不影响对话继续
    }

    // 添加对话历史
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // 添加当前用户消息
    messages.push({ role: "user", content: message });

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 第一轮：获取初步回复
          const llmStream = llmClient.stream(messages, { temperature: 0.7 }, undefined, customHeaders);

          let fullResponse = "";
          let searchKeywords: string[] = [];

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const content = chunk.content.toString();
              fullResponse += content;

              // 检测是否需要搜索
              const searchMatch = fullResponse.match(/\[SEARCH:\s*(.*?)\]/);
              if (searchMatch && searchMatch[1]) {
                const keyword = searchMatch[1].trim();
                if (!searchKeywords.includes(keyword)) {
                  searchKeywords.push(keyword);
                }
              }

              // 发送SSE格式的数据
              controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }

          // 如果检测到需要搜索
          if (searchKeywords.length > 0) {
            // 执行搜索
            for (const keyword of searchKeywords) {
              try {
                controller.enqueue(`data: ${JSON.stringify({ type: "info", content: `\n\n🔍 正在搜索: ${keyword}...\n` })}\n\n`);

                const searchResponse = await searchClient.webSearch(keyword, 5, true);

                if (searchResponse.web_items && searchResponse.web_items.length > 0) {
                  let searchContext = `\n\n【搜索结果 - ${keyword}】\n`;
                  searchResponse.web_items.slice(0, 3).forEach((item, index) => {
                    searchContext += `${index + 1}. ${item.title}\n`;
                    searchContext += `   来源: ${item.site_name}\n`;
                    searchContext += `   摘要: ${item.snippet}\n`;
                    if (item.url) {
                      searchContext += `   链接: ${item.url}\n`;
                    }
                    searchContext += `\n`;
                  });
                  if (searchResponse.summary) {
                    searchContext += `【AI摘要】\n${searchResponse.summary}\n`;
                  }

                  controller.enqueue(`data: ${JSON.stringify({ content: searchContext })}\n\n`);

                  // 将搜索结果添加到消息历史中
                  messages.push({ role: "assistant", content: fullResponse });
                  messages.push({ role: "system", content: searchContext });
                  messages.push({ role: "user", content: `请基于以上搜索结果回答问题：${message}` });

                  // 重新生成回复
                  const newLlmStream = llmClient.stream(
                    messages.slice(-10), // 只保留最近10条消息
                    { temperature: 0.7 },
                    undefined,
                    customHeaders
                  );

                  fullResponse = "";
                  for await (const chunk of newLlmStream) {
                    if (chunk.content) {
                      const content = chunk.content.toString();
                      fullResponse += content;
                      controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                  }
                } else {
                  controller.enqueue(`data: ${JSON.stringify({ type: "info", content: `\n\n⚠️ 未找到相关搜索结果\n` })}\n\n`);
                }
              } catch (searchError) {
                console.error("Search error:", searchError);
                controller.enqueue(`data: ${JSON.stringify({ type: "error", content: `\n\n❌ 搜索失败: ${searchError instanceof Error ? searchError.message : '未知错误'}\n` })}\n\n`);
              }
            }
          }

          // 发送结束标记
          controller.enqueue("data: [DONE]\n\n");

          // 保存对话记录和任务成果
          try {
            await conversationManager.createConversation({
              agentId,
              taskId: taskId || null,
              userMessage: message,
              agentResponse: fullResponse,
              modelUsed: "doubao-seed-1-8-251228",
            });

            // 如果有任务ID，将对话保存为任务成果并进行智能分类
            if (taskId && agent) {
              const deliverable = await taskDeliverableManager.createTaskDeliverable({
                taskId,
                agentId,
                title: `对话记录 - ${new Date().toLocaleString()}`,
                type: "conversation",
                content: `用户：${message}\n\n${agent.name}：${fullResponse}`,
                status: "approved",
                version: 1,
              });

              // 智能分类并保存到知识库
              try {
                const classifyResponse = await fetch("http://localhost:5000/api/classify-deliverable", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: deliverable.title,
                    content: deliverable.content,
                    type: deliverable.type
                  }),
                });

                if (classifyResponse.ok) {
                  const classifyResult = await classifyResponse.json();

                  if (agent.knowledgeBaseId) {
                    await knowledgeBaseManager.updateDocumentCount(agent.knowledgeBaseId, 1);

                    await taskDeliverableManager.updateTaskDeliverable(deliverable.id, {
                      metadata: {
                        classification: classifyResult.data,
                        savedToKnowledgeBase: true,
                        knowledgeBaseId: agent.knowledgeBaseId,
                        savedAt: new Date().toISOString()
                      }
                    });
                  }
                }
              } catch (classifyError) {
                console.error("Classification error (non-blocking):", classifyError);
              }
            }
          } catch (saveError) {
            console.error("Error saving conversation or deliverable:", saveError);
            // 保存失败不影响对话体验
          }

        } catch (error) {
          console.error("Streaming error:", error);
          const errorMessage = error instanceof Error ? error.message : "生成回复时发生未知错误";
          controller.enqueue(`data: ${JSON.stringify({ type: "error", content: `\n\n❌ 错误: ${errorMessage}\n` })}\n\n`);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "服务器内部错误";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
