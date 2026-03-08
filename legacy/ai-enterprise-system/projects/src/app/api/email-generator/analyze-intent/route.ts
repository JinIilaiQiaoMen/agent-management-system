import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { emailContent } = await request.json();

    if (!emailContent) {
      return NextResponse.json(
        { error: '邮件内容不能为空' },
        { status: 400 }
      );
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的邮件分析专家，擅长分析商务邮件的意图和情感。
你的任务是分析收到的邮件内容，提取关键信息并给出回复建议。

输出格式（必须是JSON）：
{
  "intent": "邮件意图类型（inquiry询价/complaint投诉/order下单/followup跟进/other其他）",
  "sentiment": "情感倾向（positive正面/negative负面/neutral中性）",
  "urgency": "紧急程度（high紧急/medium一般/low不紧急）",
  "keyPoints": ["关键点1", "关键点2", ...],
  "questions": ["需要回答的问题1", "需要回答的问题2", ...],
  "suggestion": "回复建议（简短的指导）",
  "tone": "建议的回复语气（formal正式/friendly友好/direct直接）"
}

请只返回JSON，不要其他内容。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: emailContent }
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.3,
      caching: 'disabled'
    });

    // 解析JSON响应
    let analysis;
    try {
      // 尝试提取JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析分析结果');
      }
    } catch (parseError) {
      // 如果解析失败，返回默认分析
      analysis = {
        intent: 'other',
        sentiment: 'neutral',
        urgency: 'medium',
        keyPoints: ['无法自动识别关键点'],
        questions: [],
        suggestion: '建议仔细阅读邮件内容后回复',
        tone: 'formal'
      };
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('邮件意图分析失败:', error);
    return NextResponse.json(
      { error: error.message || '分析失败' },
      { status: 500 }
    );
  }
}
