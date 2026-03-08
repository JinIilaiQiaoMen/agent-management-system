import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

/**
 * 演示用的简单内容生成 API
 * 返回真实的 AI 生成内容，适合快速测试
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, description, platform, language, audience, targetPet, features } = body;

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

    // 根据平台构建不同的 Prompt
    const prompts = {
      tiktok: `你是一位专业的 TikTok 宠物用品营销文案专家。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}
目标受众：${audience || '爱宠人士'}

请生成一段 100-150 字的 TikTok 文案（必须使用${outputLanguage}输出），要求：
1. 开头前3秒必须抓住注意力
2. 内容必须围绕${targetPetName}展开
3. 包含 1-2 个有趣的宠物互动场景
4. 自然植入产品核心卖点（最多3个）
5. 语气活泼、亲切，像和朋友聊天
6. 包含 3-5 个热门话题标签（以 # 开头）
7. 结尾包含行动号召

请直接输出文案，不要其他说明：`,

      instagram: `你是一位专业的 Instagram 宠物用品内容创作者。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}
目标受众：${audience || '爱宠人士'}

请生成一段 150-200 字的 Instagram 文案（必须使用${outputLanguage}输出），要求：
1. 开头用情感化的描述建立共鸣
2. 内容必须围绕${targetPetName}展开
3. 展示宠物使用产品的真实场景
4. 强调产品如何提升宠物生活质量
5. 使用优雅、温暖的语调
6. 包含 5-10 个话题标签（混合热门标签和小众标签）
7. 鼓励用户分享自己的宠物故事

请直接输出文案，不要其他说明：`,

      youtube: `你是一位专业的 YouTube 宠物用品内容制作人。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}

请生成以下内容（必须使用${outputLanguage}输出）：

1. 视频标题（吸引点击，使用数字、疑问句等技巧）：
2. 视频描述（包含产品介绍、使用说明、行动号召）：
3. 5-8 个话题标签：

请按格式输出：`,

      amazon: `你是一位专业的亚马逊宠物用品 Listing 优化专家。

产品名称：${productName}
产品描述：${productDescription}
目标宠物：${targetPetName}

请生成以下内容（必须使用${outputLanguage}输出）：

1. 产品标题（200字符以内，包含核心关键词）：
2. 五点描述（每个要点突出一个核心卖点）：
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

请生成一段 300-500 字的产品描述（必须使用${outputLanguage}输出），要求：
1. 内容必须围绕${targetPetName}展开
2. 讲述一个与产品相关的温馨故事
3. 突出产品对宠物和主人的生活改变
4. 使用感性、真诚的语言
5. 包含产品规格、材质、使用说明

请直接输出描述，不要其他说明：`
    };

    const selectedPrompt = prompts[platform as keyof typeof prompts] || prompts.tiktok;

    // 调用 LLM 生成内容
    const config = new Config();
    const llmClient = new LLMClient(config);

    const result = await llmClient.invoke([
      { role: 'user', content: selectedPrompt }
    ], {
      model: 'doubao-seed-2-0-pro-260215', // 使用豆包 Seed 2.0 Pro 模型
      temperature: 0.8
    });

    // 提取内容
    let generatedContent = '';
    if (result && typeof result === 'object' && 'content' in result) {
      generatedContent = String(result.content);
    } else if (typeof result === 'string') {
      generatedContent = result;
    } else {
      generatedContent = JSON.stringify(result);
    }

    // 提取话题标签（如果存在）
    const hashtags = generatedContent.match(/#[\w\u4e00-\u9fa5]+/g) || [];

    return NextResponse.json({
      success: true,
      data: {
        type: 'caption',
        platform,
        language: language || 'en',
        content: generatedContent,
        metadata: {
          hashtags,
          productName,
          generatedAt: new Date().toISOString()
        },
        modelUsed: 'doubao-seed-2-0-pro-260215',
        cost: 0.001,
        cached: false
      }
    });

  } catch (error: any) {
    console.error('内容生成失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '内容生成失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}
