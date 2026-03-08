import { NextRequest, NextResponse } from 'next/server';

/**
 * 线索评分API
 */

interface Lead {
  id: string;
  company: string;
  contact: string;
  phone?: string;
  email?: string;
  source?: string;
}

interface ScoreResult {
  leadId: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  factors: string[];
  recommendation: string;
}

// AI评分模拟
function scoreLead(lead: Lead): ScoreResult {
  let score = 50;
  const factors: string[] = [];

  // 公司规模加分
  if (lead.company.includes('集团') || lead.company.includes('股份')) {
    score += 15;
    factors.push('大型企业');
  }

  // 来源加分
  if (lead.source === '展会') {
    score += 10;
    factors.push('高质量来源-展会');
  } else if (lead.source === '推荐') {
    score += 20;
    factors.push('高质量来源-推荐');
  }

  // 联系方式完整度
  if (lead.email && lead.phone) {
    score += 10;
    factors.push('联系方式完整');
  }

  // 评分等级
  let grade: 'A' | 'B' | 'C' | 'D';
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else grade = 'D';

  // 建议
  let recommendation: string;
  if (grade === 'A') {
    recommendation = '优先跟进，24小时内联系';
  } else if (grade === 'B') {
    recommendation = '重点跟进，3天内联系';
  } else if (grade === 'C') {
    recommendation = '普通跟进，每周联系';
  } else {
    recommendation = '暂不跟进，加入线索库';
  }

  return {
    leadId: lead.id,
    score: Math.min(score, 100),
    grade,
    factors,
    recommendation,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leads: Lead[] = body.leads || [];

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供线索列表' },
        { status: 400 }
      );
    }

    const results = leads.map(lead => scoreLead(lead));

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      data: {
        total: results.length,
        results,
        summary: {
          gradeA: results.filter(r => r.grade === 'A').length,
          gradeB: results.filter(r => r.grade === 'B').length,
          gradeC: results.filter(r => r.grade === 'C').length,
          gradeD: results.filter(r => r.grade === 'D').length,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '评分失败' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 返回示例数据
  const sampleLeads: Lead[] = [
    { id: '1', company: '阿里巴巴集团', contact: '张三', source: '推荐' },
    { id: '2', company: '腾讯科技', contact: '李四', source: '展会' },
    { id: '3', company: '某贸易公司', contact: '王五' },
  ];

  return NextResponse.json({
    success: true,
    data: {
      leads: sampleLeads,
      results: sampleLeads.map(lead => scoreLead(lead)),
    },
  });
}
