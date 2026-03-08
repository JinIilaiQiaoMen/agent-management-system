import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId, useKnowledgeBase = true } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: '无效的请求参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = getSupabaseClient();
    let knowledgeContext = '';

    // 如果启用知识库，检索相关内容
    if (useKnowledgeBase && messages.length > 0) {
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
      if (lastUserMessage) {
        try {
          // 从知识库检索相关内容
          const searchQuery = lastUserMessage.content.substring(0, 200); // 使用前200字作为查询
          const { data: knowledgeDocs } = await supabase
            .from('knowledge_documents')
            .select('title, content')
            .eq('is_active', true)
            .textSearch('content', searchQuery)
            .limit(3);

          if (knowledgeDocs && knowledgeDocs.length > 0) {
            knowledgeContext = '\n\n参考知识库内容：\n' +
              knowledgeDocs.map((doc: any) => `- ${doc.title}: ${doc.content.substring(0, 300)}...`).join('\n');
          }
        } catch (kbError) {
          console.error('知识库检索失败:', kbError);
          // 继续执行，不中断对话
        }
      }
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 构建系统提示词
    const systemPrompt = `你是一位专业的外贸谈单助手，拥有丰富的客户沟通经验和产品知识。
你的任务是帮助用户处理各种外贸沟通场景，包括：
- 产品介绍和优势阐述
- 客户异议处理和谈判技巧
- 报价策略和合同条款
- 客户跟进和关系维护

回答要求：
1. 专业、友好、有说服力
2. 结合具体情境给出建议
3. 提供具体的话术和行动建议
4. 用中文回答
5. 保持简洁明了，避免冗长
${knowledgeContext ? '\n6. 可以参考提供的知识库内容，结合实际情况给出建议' : ''}`;

    // 添加系统提示词
    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // 保存或更新对话到数据库
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (lastUserMessage) {
      if (conversationId) {
        // 更新现有对话
        await supabase
          .from('conversations')
          .update({
            messages: messages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      } else {
        // 创建新对话
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({
            messages: messages,
            context: {
              type: 'chat_assistant',
              use_knowledge_base: useKnowledgeBase
            },
            status: 'active'
          })
          .select()
          .single();
      }
    }

    // 使用流式输出
    const stream = llmClient.stream(allMessages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.8,
      caching: 'enabled'
    });

    // 创建 Transform Stream
    const encoder = new TextEncoder();

    const transformStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const content = chunk.content.toString();
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('流式输出错误:', error);
          controller.error(error);
        }
      }
    });

    // 返回 SSE 响应
    return new Response(transformStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error: any) {
    console.error('谈单助手错误:', error);

    // 记录错误日志
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('monitoring_logs')
        .insert({
          module: 'chat_assistant',
          action: 'chat',
          status: 'error',
          message: error.message || '未知错误',
          error_details: {
            error: error.message,
            stack: error.stack
          }
        });
    } catch (logError) {
      console.error('记录日志失败:', logError);
    }

    return new Response(JSON.stringify({ error: error.message || '处理失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET - 获取对话历史列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('context->>type', 'chat_assistant')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      return new Response(JSON.stringify({ error: '获取对话历史失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ conversations: data || [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('获取对话历史失败:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
