import { NextRequest, NextResponse } from 'next/server';
import { complianceAuditor } from '@/lib/agents/compliance-auditor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platform, contentType, language, productCategory } = body;

    // 参数验证
    if (!content || !platform || !contentType || !language) {
      return NextResponse.json(
        { error: '缺少必要参数: content, platform, contentType, language' },
        { status: 400 }
      );
    }

    // 调用合规审核 Agent
    const result = await complianceAuditor.checkCompliance({
      content,
      platform,
      contentType,
      language,
      productCategory
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('合规审核失败:', error);
    return NextResponse.json(
      { error: '合规审核失败', details: error.message },
      { status: 500 }
    );
  }
}
