import { NextRequest, NextResponse } from 'next/server';
import { petContentGenerator } from '@/lib/agents/pet-content-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productInfo, platform, language, audience, brandTone, videoType, market } = body;

    // 参数验证
    if (!productInfo || !platform || !language || !audience) {
      return NextResponse.json(
        { error: '缺少必要参数: productInfo, platform, language, audience' },
        { status: 400 }
      );
    }

    // 调用内容生成 Agent
    const result = await petContentGenerator.generateTikTokCaption({
      productInfo,
      platform,
      language,
      audience,
      brandTone,
      videoType,
      market
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('宠物内容生成失败:', error);
    return NextResponse.json(
      { error: '内容生成失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * 批量生成内容
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sku = searchParams.get('sku');

    if (!sku) {
      return NextResponse.json(
        { error: '缺少 SKU 参数' },
        { status: 400 }
      );
    }

    // TODO: 从数据库获取产品信息
    // const productInfo = await getProductInfo(sku);

    // 演示数据
    const productInfo = {
      sku,
      name: 'Interactive Dog Toy',
      description: 'Durable and engaging toy for dogs',
      category: 'toys',
      features: ['Durable', 'Interactive', 'Safe'],
      targetPet: ['dog']
    };

    // 批量生成多平台内容
    const requests = [
      {
        productInfo,
        platform: 'tiktok' as const,
        language: 'en',
        audience: 'Dog owners aged 25-45',
        brandTone: 'playful'
      },
      {
        productInfo,
        platform: 'instagram' as const,
        language: 'en',
        audience: 'Dog owners aged 25-45',
        brandTone: 'warm'
      },
      {
        productInfo,
        platform: 'youtube' as const,
        language: 'en',
        audience: 'Dog owners aged 25-45',
        videoType: 'review' as const
      }
    ];

    const results = await petContentGenerator.batchGenerate(requests);

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('批量内容生成失败:', error);
    return NextResponse.json(
      { error: '批量生成失败', details: error.message },
      { status: 500 }
    );
  }
}
