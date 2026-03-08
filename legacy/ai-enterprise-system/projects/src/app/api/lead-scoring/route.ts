import { NextRequest, NextResponse } from 'next/server';
import { db, leads } from '@/lib/db';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 线索抓取和评分 API
 * 从数据库读取线索数据，使用 AI 进行评分
 */

// 线索抓取和评分API
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    const { sources, keywords, industry } = await request.json();

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端用于评分
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 从数据库读取线索
    const dbLeads = await db.select().from(leads);
    
    // 过滤关键词和行业
    let filteredLeads = dbLeads;
    if (keywords) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.companyName?.toLowerCase().includes(keywords.toLowerCase())
      );
    }
    if (industry) {
      filteredLeads = filteredLeads.filter(lead => lead.industry === industry);
    }

    // 评分处理
    const scoredLeads = [];
    for (const lead of filteredLeads) {
      // 使用 AI 进行评分
      const scorePrompt = `请根据以下公司信息进行线索评分（0-100分）：

公司名称：${lead.companyName}
行业：${lead.industry || '未知'}
国家：${lead.country || '未知'}

请只返回一个0-100之间的数字评分。`;

      try {
        const response = await llmClient.invoke([
          { role: 'user', content: scorePrompt }
        ], { temperature: 0.3 });

        const scoreMatch = response.content?.match(/\d+/);
        const score = scoreMatch ? parseInt(scoreMatch[0]) : 50;

        scoredLeads.push({
          ...lead,
          score: Math.min(100, Math.max(0, score))
        });
      } catch {
        scoredLeads.push({
          ...lead,
          score: 50
        });
      }
    }

    return NextResponse.json({
      success: true,
      leads: scoredLeads,
      total: scoredLeads.length,
      message: scoredLeads.length === 0 ? '数据库中没有匹配的线索数据，请先导入线索' : undefined
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 从公司名称提取联系人
function extractContactFromCompany(companyName: string): string {
  // 简单的联系人提取逻辑
  return `contact@${companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
}

/**
 * 获取线索列表
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: '数据库未连接，请配置 DATABASE_URL 环境变量' 
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const minScore = searchParams.get('minScore');

    let query = db.select().from(leads);
    
    // 执行查询
    const result = await query;

    // 过滤
    let filtered = result;
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }
    if (minScore) {
      filtered = filtered.filter(l => (l.score || 0) >= parseInt(minScore));
    }

    return NextResponse.json({
      success: true,
      leads: filtered,
      total: filtered.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
