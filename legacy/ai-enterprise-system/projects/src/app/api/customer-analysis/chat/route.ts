import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, companyName, website } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 获取当前用户（从 cookie 中的 JWT）
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    let userId = null;
    if (token) {
      try {
        // 简化的 token 验证 - 实际应该使用 jose 库验证
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.userId;
      } catch (e) {
        console.error('Token 解析失败:', e);
      }
    }

    const supabase = getSupabaseClient();
    let currentSessionId = sessionId;

    // 如果没有 sessionId，创建新的会话
    if (!currentSessionId) {
      // 保存或获取客户信息
      let customerId = null;

      if (companyName) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('company_name', companyName)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;

          // 更新网站信息
          if (website) {
            await supabase
              .from('customers')
              .update({ website })
              .eq('id', customerId);
          }
        } else {
          const { data: newCustomer } = await supabase
            .from('customers')
            .insert({
              company_name: companyName,
              website: website || null,
              source: 'customer_analysis',
              status: 'new',
              score: 0,
              user_id: userId
            })
            .select()
            .single();

          customerId = newCustomer?.id || null;
        }
      }

      // 创建新的聊天会话
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .insert({
          customer_id: customerId,
          company_name: companyName || '未命名',
          user_id: userId,
          status: 'active'
        })
        .select()
        .single();

      currentSessionId = sessionData?.id || crypto.randomUUID();
    }

    // 保存用户消息
    await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message,
        user_id: userId
      });

    // 获取会话历史
    const { data: messagesHistory } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // 构建 LLM 消息
    const systemPrompt = `你是一位专业的企业分析师，擅长对客户公司进行背景调查和风险评估。
你正在对以下公司进行深度分析：
公司名称：${companyName || '未知'}
公司网站：${website || '未提供'}

你的职责：
1. 根据用户的问题，提供关于该公司的详细分析
2. 分析公司的背景、规模、行业地位、财务状况、潜在风险等
3. 提供专业的合作建议和风险提示
4. 回答要专业、客观、准确，基于公开可获得的信息
5. 如果信息不足，诚实说明并建议进一步调查
6. 适当反问引导用户提供更多信息

保持专业、友好的对话风格，像一位资深顾问为客户提供建议。`;

    const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // 添加历史消息
    if (messagesHistory && messagesHistory.length > 0) {
      messagesHistory.forEach((msg: any) => {
        const role: 'user' | 'assistant' = msg.role === 'user' ? 'user' : 'assistant';
        llmMessages.push({
          role,
          content: msg.content
        });
      });
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          // 使用 LLM 流式生成
          const response = await llmClient.stream(llmMessages, {
            model: 'doubao-seed-2-0-pro-260215',
            temperature: 0.7,
            caching: 'disabled'
          });

          for await (const chunk of response) {
            if (chunk.content) {
              const content = chunk.content;
              fullResponse += content;

              // 发送 SSE 格式数据
              const data = JSON.stringify({ content, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // 发送完成信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true })}\n\n`));

          // 保存 AI 回复到数据库
          await supabase
            .from('chat_messages')
            .insert({
              session_id: currentSessionId,
              role: 'assistant',
              content: fullResponse,
              user_id: userId
            });

          controller.close();
        } catch (error: any) {
          console.error('流式生成失败:', error);
          controller.error(error);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('聊天 API 错误:', error);

    // 记录错误日志
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('monitoring_logs')
        .insert({
          module: 'customer_analysis',
          action: 'chat',
          status: 'error',
          message: error.message || '聊天失败',
          error_details: {
            error: error.message,
            stack: error.stack
          }
        });
    } catch (logError) {
      console.error('记录日志失败:', logError);
    }

    return NextResponse.json(
      { error: error.message || '聊天失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// GET 请求获取会话历史
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId 不能为空' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 获取会话消息历史
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      messages: messages || []
    });

  } catch (error: any) {
    console.error('获取会话历史失败:', error);
    return NextResponse.json(
      { error: error.message || '获取历史失败' },
      { status: 500 }
    );
  }
}
