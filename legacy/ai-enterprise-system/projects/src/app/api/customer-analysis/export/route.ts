import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, format = 'pdf' } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId 不能为空' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 获取会话信息
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('*, customers(*)')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    // 获取会话的所有消息
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    // 获取客户分析数据
    const { data: analysisData } = await supabase
      .from('customer_analysis')
      .select('*')
      .eq('customer_id', session.customer_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 生成报告内容
    const companyName = session.company_name || '未知公司';
    const website = session.customers?.website || '未提供';
    const createdAt = new Date(session.created_at).toLocaleString('zh-CN');

    let reportContent = '';

    if (format === 'markdown') {
      // Markdown 格式报告
      reportContent = `# 企业背调分析报告

## 基本信息

- **公司名称**: ${companyName}
- **公司网站**: ${website}
- **分析时间**: ${createdAt}
- **报告编号**: ${sessionId}

---

## 分析记录

`;

      messages?.forEach((msg: any, index: number) => {
        const role = msg.role === 'user' ? '👤 用户提问' : '🤖 AI 分析';
        reportContent += `### ${role}

${msg.content}

---

`;
      });

      if (analysisData?.analysis_result) {
        reportContent += `## 详细分析数据

\`\`\`json
${JSON.stringify(analysisData.analysis_result, null, 2)}
\`\`\`
`;
      }

      reportContent += `
---

*报告由 AI 智能分析系统生成，仅供参考，建议结合其他信息来源进行综合判断。*
`;

      return NextResponse.json({
        content: reportContent,
        filename: `${companyName}_背调报告_${Date.now()}.md`,
        type: 'text/markdown'
      });

    } else if (format === 'json') {
      // JSON 格式报告
      const report = {
        metadata: {
          companyName,
          website,
          createdAt,
          sessionId,
          generatedAt: new Date().toISOString()
        },
        session: {
          id: session.id,
          status: session.status,
          createdAt: session.created_at
        },
        messages: messages || [],
        analysisData: analysisData || null
      };

      return NextResponse.json({
        content: JSON.stringify(report, null, 2),
        filename: `${companyName}_背调报告_${Date.now()}.json`,
        type: 'application/json'
      });

    } else if (format === 'text') {
      // 纯文本格式报告
      reportContent = `
=================================================================
                     企业背调分析报告
=================================================================

【基本信息】
公司名称：${companyName}
公司网站：${website}
分析时间：${createdAt}
报告编号：${sessionId}

=================================================================
【分析对话记录】
=================================================================

`;

      messages?.forEach((msg: any, index: number) => {
        const role = msg.role === 'user' ? '【用户提问】' : '【AI 分析】';
        reportContent += `${role}\n${msg.content}\n\n`;
      });

      reportContent += `
=================================================================
*报告生成时间：${new Date().toLocaleString('zh-CN')}*
*本报告由 AI 智能分析系统生成，仅供参考*
=================================================================
`;

      return NextResponse.json({
        content: reportContent,
        filename: `${companyName}_背调报告_${Date.now()}.txt`,
        type: 'text/plain'
      });

    } else {
      return NextResponse.json(
        { error: '不支持的导出格式' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('导出报告失败:', error);

    // 记录错误日志
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('monitoring_logs')
        .insert({
          module: 'customer_analysis',
          action: 'export',
          status: 'error',
          message: error.message || '导出失败',
          error_details: {
            error: error.message,
            stack: error.stack
          }
        });
    } catch (logError) {
      console.error('记录日志失败:', logError);
    }

    return NextResponse.json(
      { error: error.message || '导出失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取支持的导出格式
export async function GET() {
  return NextResponse.json({
    formats: [
      {
        id: 'markdown',
        name: 'Markdown 文档',
        extension: '.md',
        description: '支持格式化文本，适合文档编辑'
      },
      {
        id: 'json',
        name: 'JSON 数据',
        extension: '.json',
        description: '结构化数据，适合程序处理'
      },
      {
        id: 'text',
        name: '纯文本',
        extension: '.txt',
        description: '简单文本格式，通用性强'
      }
    ]
  });
}
