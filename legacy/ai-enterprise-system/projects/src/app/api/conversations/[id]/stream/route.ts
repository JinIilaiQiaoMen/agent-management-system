import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { agentConversations, agentTaskDeliverables } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * @route POST /api/conversations/[id]/stream
 * @description 流式对话（SSE）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, enableWebSearch = false } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: '缺少必要参数：message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取对话
    const [conversation] = await db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.id, id))
      .limit(1);

    if (!conversation) {
      return new Response(JSON.stringify({ error: '对话不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送用户消息确认
          const userMessageId = uuidv4();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'user_message', 
            data: { 
              id: userMessageId,
              role: 'user',
              content: message,
              timestamp: new Date().toISOString()
            } 
          })}\n\n`));

          // 调用LLM API进行流式响应
          try {
            const config = new Config();
            const llmClient = new LLMClient(config);
            
            const messages = [
              { role: 'user' as const, content: message }
            ];

            const llmStream = llmClient.stream(messages, {
              temperature: 0.7,
            });

            for await (const chunk of llmStream) {
              const content = typeof chunk.content === 'string' ? chunk.content : '';
              if (content) {
                fullResponse += content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', data: content })}\n\n`));
              }
            }
          } catch (llmError) {
            // 如果LLM调用失败，使用模拟响应
            console.error('LLM调用失败，使用模拟响应:', llmError);
            const aiResponse = `收到您的消息。由于AI服务暂时不可用，这是一个模拟响应。\n\n您的问题是：${message}`;
            const words = aiResponse.split('');

            for (let i = 0; i < words.length; i++) {
              fullResponse += words[i];
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', data: words[i] })}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 20));
            }
          }

          // 更新对话的响应
          await db
            .update(agentConversations)
            .set({
              agentResponse: fullResponse,
              modelUsed: 'doubao-seed-1-8-251228',
              metadata: {
                ...(conversation.metadata as Record<string, unknown> || {}),
                lastMessageAt: new Date().toISOString(),
                enableWebSearch,
              },
            })
            .where(eq(agentConversations.id, id));

          // 如果关联了任务，创建交付物记录
          if (conversation.taskId) {
            await db.insert(agentTaskDeliverables).values({
              id: uuidv4(),
              taskId: conversation.taskId,
              agentId: conversation.agentId,
              title: 'AI响应',
              type: 'message',
              content: JSON.stringify({
                conversationId: id,
                role: 'assistant',
                content: fullResponse.substring(0, 1000),
              }),
              status: 'completed',
              version: 1,
              metadata: null,
            });
          }

          // 发送完成事件
          const assistantMessageId = uuidv4();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done', 
            data: { 
              messageId: assistantMessageId,
              fullResponse: fullResponse
            } 
          })}\n\n`));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: error instanceof Error ? error.message : String(error) })}\n\n`));
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
  } catch (error) {
    console.error('流式对话失败:', error);
    return new Response(JSON.stringify({ error: '流式对话失败', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
