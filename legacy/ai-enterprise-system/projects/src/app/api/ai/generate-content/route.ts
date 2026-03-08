import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

interface ContentGenerationRequest {
  platform: string;
  contentType: 'product' | 'post' | 'video' | 'article';
  productInfo?: {
    name?: string;
    price?: string;
    features?: string[];
    category?: string;
  };
  topic?: string;
  keywords?: string[];
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'humorous';
  language?: 'zh-CN' | 'en-US';
  maxLength?: number;
  includeHashtags?: boolean;
  hashtagCount?: number;
}

/**
 * AI 自动生成内容
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContentGenerationRequest;
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const {
      platform,
      contentType,
      productInfo,
      topic,
      keywords = [],
      tone = 'enthusiastic',
      language = 'zh-CN',
      maxLength = 500,
      includeHashtags = true,
      hashtagCount = 5
    } = body;

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(platform, contentType, tone, language, productInfo?.category || '');

    // 构建用户提示词
    const userPrompt = buildUserPrompt(contentType, productInfo, topic || '', keywords, maxLength, includeHashtags, hashtagCount);

    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-pro-260215', // 使用旗舰模型
      temperature: 0.9,
    });

    // 构建流式响应
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('AI 内容生成失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'AI 内容生成失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  platform: string,
  contentType: string,
  tone: string,
  language: string,
  productCategory: string = ''
): string {
  const platformNames: Record<string, string> = {
    taobao: '淘宝',
    jd: '京东',
    pinduoduo: '拼多多',
    douyin: '抖音',
    kuaishou: '快手',
    xiaohongshu: '小红书',
    weibo: '微博',
    bilibili: 'B站',
    wechat: '微信',
    toutiao: '今日头条',
    zhihu: '知乎',
    iqiyi: '爱奇艺',
    youku: '优酷',
    tencent_video: '腾讯视频'
  };

  const toneDescriptions: Record<string, string> = {
    professional: '专业、严谨、值得信赖',
    casual: '轻松、亲切、像朋友一样',
    enthusiastic: '热情、充满活力、有感染力',
    humorous: '幽默风趣、轻松愉快'
  };

  const languageDesc = language === 'zh-CN' ? '中文' : '英文';
  const platformName = platformNames[platform] || platform;

  return `你是一名专业的社交媒体内容创作专家，专门为 ${platformName} 平台生成高质量内容。

你的特点：
1. 语气风格：${toneDescriptions[tone]}
2. 语言：${languageDesc}
3. 内容类型：${contentType === 'product' ? '商品推广' : contentType === 'post' ? '社交媒体动态' : contentType === 'video' ? '短视频脚本' : '文章内容'}
4. 平台特性：深度了解 ${platformName} 平台的用户喜好和内容风格

内容要求：
- 标题吸引人，能抓住眼球
- 内容真实、有价值，不夸大其词
- 使用符合平台风格的表达方式
- 适当使用表情符号增强表达（特别是短视频和社交媒体）
- 确保内容原创，避免抄袭
- 语言简洁明了，避免冗长

输出格式：
如果包含话题标签，请用空格分隔多个标签，标签前加 # 号。`;
}

function buildUserPrompt(
  contentType: string,
  productInfo: any,
  topic: string,
  keywords: string[],
  maxLength: number,
  includeHashtags: boolean,
  hashtagCount: number
): string {
  let prompt = `请为我生成${contentType === 'product' ? '商品推广文案' : contentType === 'post' ? '社交媒体动态' : contentType === 'video' ? '短视频脚本' : '文章内容'}。\n\n`;

  if (contentType === 'product' && productInfo) {
    prompt += '【商品信息】\n';
    if (productInfo.name) prompt += `- 商品名称：${productInfo.name}\n`;
    if (productInfo.price) prompt += `- 价格：${productInfo.price} 元\n`;
    if (productInfo.features && productInfo.features.length > 0) {
      prompt += `- 产品特点：\n`;
      productInfo.features.forEach((f: string, i: number) => {
        prompt += `  ${i + 1}. ${f}\n`;
      });
    }
    if (productInfo.category) prompt += `- 所属分类：${productInfo.category}\n`;
    prompt += '\n';
  }

  if (topic) {
    prompt += `【主题/话题】\n${topic}\n\n`;
  }

  if (keywords && keywords.length > 0) {
    prompt += `【关键词】\n${keywords.join('、')}\n\n`;
  }

  prompt += `【要求】\n`;
  prompt += `- 字数限制：约 ${maxLength} 字\n`;
  prompt += `- 风格：请突出卖点和优势\n`;
  prompt += includeHashtags ? `- 包含 ${hashtagCount} 个相关话题标签\n` : '- 不需要话题标签\n';

  prompt += `\n请直接输出内容，不要包含任何说明文字。`;

  return prompt;
}
