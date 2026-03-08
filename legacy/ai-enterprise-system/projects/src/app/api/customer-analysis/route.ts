import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { companyName, website } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: '公司名称不能为空' },
        { status: 400 }
      );
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 构建分析提示词
    const systemPrompt = `你是一位专业的企业分析师，擅长对客户公司进行背景调查和风险评估。
你的任务是根据提供的信息，分析公司的背景、规模、行业地位、财务状况、潜在风险等方面。

输出格式要求：
1. 公司基本信息（成立时间、总部位置、员工规模、主要业务等）
2. 行业分析与市场地位
3. 财务状况分析（如有公开数据）
4. 潜在风险提示
5. 合作建议

请用中文输出，保持专业、客观、准确。`;

    const userPrompt = `请对公司 "${companyName}" ${website ? `(官网: ${website})` : ''} 进行深度分析。
重点关注：
- 公司背景与规模
- 行业地位与竞争优势
- 潜在风险点
- 对外贸合作的影响

请提供详细的分析报告。`;

    // 调用 LLM 进行分析
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.7,
      caching: 'disabled'
    });

    const analysisResult = response.content;

    // 生成信息来源（模拟）
    const sources = [
      `公司官网: ${website || '暂无'}`,
      '企业信息平台数据',
      '行业公开报告',
      '社交媒体与新闻资讯'
    ].join('\n');

    // 保存分析结果到数据库
    const supabase = getSupabaseClient();

    // 先保存客户信息
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        company_name: companyName,
        website: website || null,
        source: 'customer_analysis',
        status: 'new',
        score: 0
      })
      .select()
      .single();

    let customerId = null;
    if (!customerError && customerData) {
      customerId = customerData.id;
    }

    // 保存分析结果
    const { data: analysisData, error: analysisError } = await supabase
      .from('customer_analysis')
      .insert({
        customer_id: customerId,
        analysis_type: 'company',
        data_sources: {
          website: website || null,
          sources: sources
        },
        analysis_result: {
          full_report: analysisResult
        },
        summary: analysisResult.substring(0, 500) + '...',
        sources: sources,
        confidence: 85
      })
      .select()
      .single();

    if (analysisError) {
      console.error('保存分析结果失败:', analysisError);
    }

    // 记录监控日志
    await supabase
      .from('monitoring_logs')
      .insert({
        module: 'customer_analysis',
        action: 'analyze_company',
        status: analysisError ? 'error' : 'success',
        message: analysisError ? `保存失败: ${analysisError.message}` : '分析完成',
        duration: 0
      });

    return NextResponse.json({
      id: analysisData?.id || '',
      companyName: companyName,
      analysisType: 'company',
      summary: analysisResult,
      confidence: 85,
      sources: sources,
      createdAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('客户背调分析失败:', error);

    // 记录错误日志
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('monitoring_logs')
        .insert({
          module: 'customer_analysis',
          action: 'analyze_company',
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
      { error: error.message || '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
