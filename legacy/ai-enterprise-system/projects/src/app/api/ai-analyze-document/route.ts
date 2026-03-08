import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// AI 智能识别文档
export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: '文档内容不能为空' },
        { status: 400 }
      );
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的文档分析专家，擅长分析外贸相关的文档内容。
你的任务是分析提供的文档内容，提取关键信息并返回结构化数据。

请分析以下内容并提取：
1. 标题（title）：文档的核心主题，简短准确
2. 分类（category）：从以下选项中选择最合适的 - product（产品信息）、pricing（价格政策）、process（业务流程）、faq（常见问题）
3. 标签（tags）：3-5个关键词标签，用逗号分隔
4. 摘要（summary）：50-100字的文档摘要

输出格式（纯JSON，不要有其他内容）：
{
  "title": "文档标题",
  "category": "分类",
  "tags": ["标签1", "标签2", "标签3"],
  "summary": "文档摘要"
}

要求：
- 标题要简洁准确，不超过30字
- 分类要根据文档内容准确判断
- 标签要能代表文档核心内容
- 摘要要突出重点`;

    const userPrompt = `请分析以下文档内容：

文件名：${fileName || '未命名文件'}

文档内容：
${content.substring(0, 3000)}

请返回JSON格式的分析结果。`;

    // 调用 LLM 进行分析
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.5,
      caching: 'disabled'
    });

    let analysisResult;
    try {
      // 提取JSON（可能包含其他文本）
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(response.content);
      }
    } catch (parseError) {
      // 如果解析失败，返回默认值
      console.error('解析AI响应失败:', parseError);
      analysisResult = {
        title: fileName?.replace(/\.[^/.]+$/, '') || '未命名文档',
        category: 'product',
        tags: ['文档', '知识'],
        summary: content.substring(0, 100)
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult
    });

  } catch (error: any) {
    console.error('AI分析失败:', error);

    // 记录错误日志
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('monitoring_logs')
        .insert({
          module: 'knowledge_base',
          action: 'ai_analysis',
          status: 'error',
          message: error.message || 'AI分析失败',
          error_details: {
            error: error.message,
            stack: error.stack
          }
        });
    } catch (logError) {
      console.error('记录日志失败:', logError);
    }

    return NextResponse.json(
      { error: error.message || 'AI分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
