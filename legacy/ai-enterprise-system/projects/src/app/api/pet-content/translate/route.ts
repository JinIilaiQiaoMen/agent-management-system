import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * 翻译内容
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, targetLanguage = 'zh' } = body;

    if (!content) {
      return NextResponse.json(
        { error: '缺少 content 参数' },
        { status: 400 }
      );
    }

    // 构建翻译 Prompt
    const translatePrompt = `请将以下内容翻译成${targetLanguage === 'zh' ? '中文' : 'English'}。

要求：
1. 保持原文的语气和风格
2. 保持表情符号和话题标签
3. 确保翻译自然流畅
4. 保留所有格式（换行、段落等）

原文：
${content}

请直接输出翻译后的内容，不要其他说明：`;

    // 调用 LLM 进行翻译
    const config = new Config();
    const llmClient = new LLMClient(config);

    const result = await llmClient.invoke([
      { role: 'user', content: translatePrompt }
    ], {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.3 // 翻译使用较低温度，确保准确性
    });

    // 提取翻译内容
    let translatedContent = '';
    if (result && typeof result === 'object' && 'content' in result) {
      translatedContent = String(result.content);
    } else if (typeof result === 'string') {
      translatedContent = result;
    } else {
      translatedContent = JSON.stringify(result);
    }

    return NextResponse.json({
      success: true,
      data: {
        original: content,
        translated: translatedContent,
        targetLanguage,
        modelUsed: 'doubao-seed-2-0-pro-260215'
      }
    });

  } catch (error: any) {
    console.error('翻译失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '翻译失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}
