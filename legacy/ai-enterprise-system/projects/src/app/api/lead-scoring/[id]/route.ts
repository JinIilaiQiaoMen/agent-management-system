import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// GET - 获取单个线索的详细评分信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !customer) {
      return NextResponse.json(
        { error: '线索不存在' },
        { status: 404 }
      );
    }

    // 生成详细的评分分析
    const scoreAnalysis = await generateDetailedScoreAnalysis(customer);

    return NextResponse.json({
      lead: customer,
      analysis: scoreAnalysis
    });
  } catch (error: any) {
    console.error('获取线索评分失败:', error);
    return NextResponse.json(
      { error: error.message || '获取线索评分失败' },
      { status: 500 }
    );
  }
}

// PATCH - 更新线索状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, notes } = body;

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .update({
        status: status,
        priority: priority,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || '更新线索失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lead: data });
  } catch (error: any) {
    console.error('更新线索失败:', error);
    return NextResponse.json(
      { error: error.message || '更新线索失败' },
      { status: 500 }
    );
  }
}

// 生成详细的评分分析
async function generateDetailedScoreAnalysis(customer: any): Promise<any> {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(new Headers());
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const prompt = `请对以下销售线索进行详细的评分分析：

公司名称：${customer.company_name}
行业：${customer.industry || '未知'}
国家：${customer.country || '未知'}
网站：${customer.website || '无'}
邮箱：${customer.email || '无'}

请提供以下分析：
1. 行业相关性评分（0-100）及理由
2. 公司规模潜力评分（0-100）及理由
3. 市场吸引力评分（0-100）及理由
4. 网站质量评分（0-100）及理由
5. 综合评分（0-100）
6. 跟进建议
7. 风险提示

请以JSON格式返回，格式如下：
{
  "industryScore": 80,
  "industryReason": "理由...",
  "potentialScore": 75,
  "potentialReason": "理由...",
  "marketScore": 70,
  "marketReason": "理由...",
  "websiteScore": 85,
  "websiteReason": "理由...",
  "totalScore": 77.5,
  "followUpAdvice": "建议...",
  "riskAlerts": ["风险1", "风险2"]
}`;

    const response = await llmClient.invoke([
      { role: 'system', content: '你是一位专业的销售线索分析专家。请始终以JSON格式返回分析结果。' },
      { role: 'user', content: prompt }
    ], {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.3,
      caching: 'disabled'
    });

    // 尝试解析JSON
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('解析评分分析JSON失败:', parseError);
    }

    // 如果解析失败，返回基本分析
    return {
      industryScore: 70,
      industryReason: '基于行业信息评估',
      potentialScore: 70,
      potentialReason: '基于公司信息评估',
      marketScore: 70,
      marketReason: '基于市场信息评估',
      websiteScore: 70,
      websiteReason: '基于网站信息评估',
      totalScore: customer.score || 70,
      followUpAdvice: '建议通过邮件或电话联系客户',
      riskAlerts: ['建议验证公司真实性']
    };
  } catch (error) {
    console.error('生成评分分析失败:', error);
    return null;
  }
}
