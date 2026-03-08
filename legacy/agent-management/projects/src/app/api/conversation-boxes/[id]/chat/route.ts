import { NextRequest } from "next/server";
import { conversationBoxManager, agentManager } from "@/storage/database";
import { LLMClient, Config, HeaderUtils, SearchClient, KnowledgeClient, DataSourceType } from "coze-coding-dev-sdk";

/**
 * POST /api/conversation-boxes/[id]/chat - 多智能体协作聊天（流式）
 * 用户发送消息后，盒子中的所有智能体会依次响应该消息
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boxId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: any) => {
        const event = JSON.stringify({ type, data, timestamp: Date.now() });
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      };

      try {
        // 发送开始事件
        sendEvent('start', { boxId, message: '开始多智能体协作聊天' });

        // 获取请求数据
        const body = await request.json();
        const { content, triggerAllAgents = true } = body;

        if (!content) {
          sendEvent('error', { message: 'content 不能为空' });
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // 获取对话盒子详情
        const boxDetail = await conversationBoxManager.getConversationBoxDetail(boxId);
        if (!boxDetail) {
          sendEvent('error', { message: '对话盒子不存在' });
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        sendEvent('box_info', { 
          title: boxDetail.title, 
          agentCount: boxDetail.agents?.length || 0 
        });

        // 获取对话上下文
        let context = await conversationBoxManager.getConversationContext(boxId, 10);
        
        // 保存用户消息
        const userMessage = await conversationBoxManager.sendMessageToBox({
          boxId,
          content,
          senderType: "user",
        });

        const userMessageId = (userMessage.id as string);

        sendEvent('message_sent', { 
          messageId: userMessageId, 
          content: userMessage.content 
        });

        // 提取请求头
        const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
        const config = new Config();
        const llmClient = new LLMClient(config);
        const searchClient = new SearchClient(config, customHeaders);
        const knowledgeClient = new KnowledgeClient(config);

        // 获取盒子中的智能体
        const agents = boxDetail.agents || [];
        
        if (agents.length === 0) {
          sendEvent('warning', { message: '盒子中没有智能体' });
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // 智能体依次响应
        const responses: any[] = [];

        for (let i = 0; i < agents.length; i++) {
          const agent = agents[i];
          const agentName = (agent.name as string) || "未知智能体";
          const agentRole = (agent.role as string) || "未知角色";
          
          sendEvent('agent_start', {
            agentId: agent.id,
            agentName,
            agentRole,
            index: i + 1,
            total: agents.length,
          });

          try {
            // 构建提示词
            const prompt = `你正在参与一个多智能体协作对话。

【你的角色】
姓名：${agent.name}
职位：${agent.role}
部门：${agent.department || '未设置'}
描述：${agent.description || '无'}

【对话上下文】
${context}

【当前消息】
用户：${content}

【其他参与者】
${agents.filter(a => a.id !== agent.id).map(a => `- ${a.name}（${a.role}）`).join('\n')}

请根据你的角色和专业能力，对当前消息做出回应。

要求：
1. 保持你的角色特点和风格
2. 从你的专业角度提供建议或见解
3. 可以参考其他智能体的意见（如果有）
4. 回复要简洁明了，突出重点
5. 如果需要更多信息，可以主动提问

请直接输出你的回复内容，不要包含任何元信息或标记。`;

            const messages = [
              { role: "system" as const, content: agent.systemPrompt || `你是${agent.name}，${agent.role}。` },
              { role: "user" as const, content: prompt }
            ];

            let responseContent = "";
            const llmStream = llmClient.stream(messages, { temperature: 0.7 }, undefined, customHeaders);
            
            for await (const chunk of llmStream) {
              if (chunk.content) {
                const content = chunk.content.toString();
                responseContent += content;
                
                sendEvent('agent_progress', {
                  agentId: agent.id,
                  agentName,
                  content,
                });
              }
            }

            // 保存智能体响应
            const response = await conversationBoxManager.addAgentResponse({
              // @ts-ignore
              messageId: userMessageId,
              // @ts-ignore
              agentId: agent.id,
              content: responseContent,
              isHidden: false,
            });

            const responseId: string = String(response.id);

            responses.push({
              agentId: agent.id,
              agentName,
              responseId,
              content: responseContent,
            });

            sendEvent('agent_complete', {
              agentId: agent.id,
              agentName,
              responseId,
            });

          } catch (error) {
            console.error(`Agent ${agentName} response failed:`, error);
            
            sendEvent('agent_error', {
              agentId: agent.id,
              agentName,
              error: error instanceof Error ? error.message : '未知错误',
            });

            // 保存错误响应
            await conversationBoxManager.addAgentResponse({
              // @ts-ignore
              messageId: userMessageId,
              // @ts-ignore
              agentId: agent.id,
              content: `[错误：${error instanceof Error ? error.message : '未知错误'}]`,
              isHidden: false,
            });
          }

          // 智能体之间可以互相看到之前的回复
          // 更新上下文（用于下一个智能体）
          if (i < agents.length - 1) {
            context += `【${agentName}】：${responses[responses.length - 1].content}\n\n`;
          }
        }

        // 发送完成事件
        sendEvent('complete', {
          messageId: userMessage.id,
          responseCount: responses.length,
          responses: responses.map(r => ({
            agentName: r.agentName,
            content: r.content.substring(0, 100) + "...", // 只显示前100字符
          })),
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();

      } catch (error: any) {
        console.error('Chat error:', error);
        
        sendEvent('error', {
          message: error.message || '聊天失败',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
