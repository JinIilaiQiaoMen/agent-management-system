import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { scenario, customerName, companyName, productName, language } = await request.json();

    if (!customerName || !companyName) {
      return NextResponse.json(
        { error: '客户名称和公司名称不能为空' },
        { status: 400 }
      );
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 场景提示词
    const scenarioPrompts: Record<string, string> = {
      intro: '首次联系：向潜在客户介绍自己和公司，引起对方兴趣',
      followup: '跟进邮件：跟进之前的沟通，推进合作进展',
      quote: '报价邮件：发送产品报价，强调价值优势',
      product: '产品介绍：详细介绍产品特点和优势',
      thank: '感谢邮件：感谢客户的合作或支持'
    };

    // 语言提示词
    const languagePrompts: Record<string, string> = {
      en: '用英语书写',
      zh: '用中文书写',
      es: '用西班牙语书写',
      fr: '用法语书写',
      de: '用德语书写'
    };

    const systemPrompt = `你是一位专业的外贸邮件写作专家，擅长撰写各种场景的开发信和商务邮件。
你的任务是根据提供的信息，生成专业、有说服力的邮件内容。

邮件要求：
1. 专业、礼貌、简洁
2. 有明确的主题
3. 内容结构清晰
4. 包含适当的行动号召
5. 根据客户信息个性化定制
6. 使用提供的语言

输出格式：
Subject: [邮件主题]

[邮件正文]`;

    const userPrompt = `请生成一封${scenarioPrompts[scenario] || scenario}邮件。

客户信息：
- 客户姓名：${customerName}
- 公司名称：${companyName}
${productName ? `- 产品名称：${productName}` : ''}

要求：
- ${languagePrompts[language] || languagePrompts.en}
- 语气专业友好
- 内容简洁有力
- 包含适当的行动号召`;

    // 调用 LLM 生成邮件
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.7,
      caching: 'disabled'
    });

    const content = response.content;

    // 解析邮件内容
    let subject = '';
    let body = content;

    if (content.includes('Subject:')) {
      const parts = content.split('\n\n');
      subject = parts[0].replace('Subject:', '').trim();
      body = parts.slice(1).join('\n\n').trim();
    }

    // 保存邮件到数据库
    const supabase = getSupabaseClient();

    const { error: emailError } = await supabase
      .from('emails')
      .insert({
        to_email: `${customerName.toLowerCase().replace(/\s/g, '.')}@example.com`,
        to_name: customerName,
        subject: subject || 'Business Cooperation',
        body: body,
        type: scenario,
        language: language,
        status: 'draft',
        ai_generated: true,
        ai_prompt: userPrompt,
        variables: {
          customerName,
          companyName,
          productName
        }
      });

    if (emailError) {
      console.error('保存邮件失败:', emailError);
    }

    return NextResponse.json({
      subject: subject || 'Business Cooperation',
      body: body
    });

  } catch (error: any) {
    console.error('邮件生成失败:', error);

    // 记录错误日志
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('monitoring_logs')
        .insert({
          module: 'email_generator',
          action: 'generate_email',
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

    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
