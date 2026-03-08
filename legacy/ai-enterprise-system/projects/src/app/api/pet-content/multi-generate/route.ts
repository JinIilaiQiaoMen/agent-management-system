import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { contentScorer, ContentScore } from '@/lib/agents/content-scorer';

interface MultiGenerationRequest {
  productName: string;
  description?: string;
  platform: string;
  language: string;
  audience: string;
  versions: number; // 生成几个版本
  category?: string;
  targetPet?: string; // 目标宠物类型：dog, cat, bird, small
  features?: string; // 产品特性
}

interface GeneratedVersion {
  version: number;
  content: string;
  translatedContent: string; // 中文翻译
  score: ContentScore;
  metadata: {
    hashtags: string[];
    productName: string;
    generatedAt: string;
  };
}

/**
 * 生成多个版本的内容并评分
 */
export async function POST(request: NextRequest) {
  try {
    const body: MultiGenerationRequest = await request.json();
    const { productName, description, platform, language, audience, versions = 3, category, targetPet, features } = body;

    if (!productName || !platform) {
      return NextResponse.json(
        { error: '缺少必要参数: productName, platform' },
        { status: 400 }
      );
    }

    // 宠物类型映射
    const petTypeMap: { [key: string]: string } = {
      dog: '狗狗',
      cat: '猫咪',
      bird: '鸟儿',
      small: '小宠'
    };

    const targetPetName = petTypeMap[targetPet || 'dog'] || '宠物';

    // 语言映射
    const languageMap: { [key: string]: string } = {
      en: '英文',
      es: '西班牙语',
      fr: '法语',
      de: '德语',
      zh: '中文'
    };

    const outputLanguage = languageMap[language] || language;

    // 如果用户没有提供描述，基于产品信息生成一个
    let productDescription = description;
    if (!productDescription || productDescription.trim() === '') {
      productDescription = `这是一款专为${targetPetName}设计的${productName}，具有优质材料和安全设计的特点。`;
    }

    // 如果有产品特性，添加到描述中
    if (features && features.trim() !== '') {
      productDescription += `\n\n产品特性：\n${features.split('\n').map((f: string, i: number) => `${i + 1}. ${f.trim()}`).join('\n')}`;
    }

    // 根据平台构建不同的 Prompt 模板
    const prompts = {
      tiktok: `你是一位专业的 TikTok 宠物用品营销文案专家。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}
目标受众：${audience}

请生成一段 TikTok 文案，要求：
1. 必须使用${outputLanguage}输出
2. 开头必须抓住注意力（使用悬念、疑问或惊喜）
3. 内容必须围绕${targetPetName}展开，使用正确的宠物称呼
4. 包含真实的宠物使用场景
5. 自然植入产品核心卖点（必须具体，不要说"这个产品很棒"）
6. 使用具体的使用体验描述（例如："用了3天"、"第一次使用"等）
7. 避免使用"test product"、"sample"等模糊词汇
8. 语气活泼、亲切，像和朋友聊天
9. 包含 3-5 个精准的话题标签
10. 结尾包含有力的行动号召

请直接输出文案，不要其他说明：`,

      instagram: `你是一位专业的 Instagram 宠物用品内容创作者。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}
目标受众：${audience}

请生成一段 Instagram 文案，要求：
1. 必须使用${outputLanguage}输出
2. 内容必须围绕${targetPetName}展开
3. 开头用情感化的描述建立共鸣
4. 展示宠物使用产品的真实场景
5. 强调产品如何提升宠物生活质量
6. 使用具体的时间、细节描述（例如："连续使用一周"、"每天使用2小时"）
7. 避免使用"test product"、"sample"等模糊词汇
8. 使用优雅、温暖的语调
9. 包含 5-10 个话题标签（混合热门标签和小众标签）

请直接输出文案，不要其他说明：`,

      youtube: `你是一位专业的 YouTube 宠物用品内容制作人。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}

请生成以下内容（必须使用${outputLanguage}输出）：

1. 视频标题（吸引点击，使用数字、疑问句等技巧）：
2. 视频描述（包含产品介绍、使用说明、行动号召，描述具体使用时长和效果）：
3. 5-8 个话题标签：

请按格式输出：`,

      amazon: `你是一位专业的亚马逊宠物用品 Listing 优化专家。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}

请生成以下内容（必须使用${outputLanguage}输出）：

1. 产品标题（200字符以内，包含核心关键词）：
2. 五点描述（每个要点突出一个核心卖点，使用具体数据或时间）：
   - 
   - 
   - 
   - 
   - 
3. 产品描述（详细、有说服力，包含使用场景）：
4. 后台关键词（250字节以内）：

请按格式输出：`,

      website: `你是一位专业的 D2C 宠物用品品牌文案专家。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}

请生成一段产品描述，要求（必须使用${outputLanguage}输出）：
1. 内容必须围绕${targetPetName}展开
2. 讲述一个与产品相关的真实故事
3. 突出产品对宠物和主人的生活改变
4. 使用具体的时间、场景描述
5. 包含产品规格、材质、使用说明

请直接输出描述，不要其他说明：`
    };

    const selectedPrompt = prompts[platform as keyof typeof prompts] || prompts.tiktok;

    // 初始化 LLM 客户端
    const config = new Config();
    const llmClient = new LLMClient(config);

    // 生成多个版本
    const generatedVersions: GeneratedVersion[] = [];

    for (let i = 0; i < versions; i++) {
      try {
        // 调用 LLM 生成内容（英文）
        const result = await llmClient.invoke([
          { role: 'user', content: selectedPrompt }
        ], {
          model: 'doubao-seed-2-0-pro-260215',
          temperature: 0.8 + (i * 0.1), // 每个版本温度略有不同，产生差异化
        });

        // 提取英文内容
        let generatedContent = '';
        if (result && typeof result === 'object' && 'content' in result) {
          generatedContent = String(result.content);
        } else if (typeof result === 'string') {
          generatedContent = result;
        } else {
          generatedContent = JSON.stringify(result);
        }

        // 翻译成中文
        let translatedContent = '';
        try {
          const translatePrompt = `请将以下内容翻译成中文，保持原文的语气、表情符号和话题标签，确保翻译自然流畅。

原文：
${generatedContent}

请直接输出翻译后的内容：`;

          const translateResult = await llmClient.invoke([
            { role: 'user', content: translatePrompt }
          ], {
            model: 'doubao-seed-2-0-pro-260215',
            temperature: 0.3
          });

          if (translateResult && typeof translateResult === 'object' && 'content' in translateResult) {
            translatedContent = String(translateResult.content);
          } else if (typeof translateResult === 'string') {
            translatedContent = translateResult;
          }
        } catch (translateError) {
          console.error('翻译失败:', translateError);
          translatedContent = '翻译失败，请查看英文原文';
        }

        // 提取话题标签
        const hashtags = generatedContent.match(/#[\w\u4e00-\u9fa5]+/g) || [];

        // 评分
        const score = contentScorer.scoreContent(
          generatedContent,
          platform,
          productName,
          description
        );

        generatedVersions.push({
          version: i + 1,
          content: generatedContent,
          translatedContent,
          score,
          metadata: {
            hashtags,
            productName,
            generatedAt: new Date().toISOString()
          }
        });

        // 等待一小段时间避免请求过快
        if (i < versions - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`生成版本 ${i + 1} 失败:`, error);
        // 继续生成下一个版本
      }
    }

    // 按总分排序
    generatedVersions.sort((a, b) => b.score.overall - a.score.overall);

    return NextResponse.json({
      success: true,
      data: {
        versions: generatedVersions,
        summary: {
          totalVersions: generatedVersions.length,
          bestVersion: generatedVersions[0].version,
          averageScore: Math.round(
            generatedVersions.reduce((sum, v) => sum + v.score.overall, 0) / generatedVersions.length
          ),
          modelUsed: 'doubao-seed-2-0-pro-260215',
          platform,
          language
        }
      }
    });

  } catch (error: any) {
    console.error('多版本生成失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '多版本生成失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}
