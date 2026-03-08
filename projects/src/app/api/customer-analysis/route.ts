import { NextRequest, NextResponse } from 'next/server';

/**
 * 客户分析API
 * 
 * 整合三个系统的能力：
 * - 内容爬取Agent: 采集客户数据
 * - AI智能化企业系统: 分析客户
 * - 智能体管理系统: 创建跟进任务
 */

interface CustomerAnalysisRequest {
  companyName: string;
  includeCompetitors?: boolean;
  includeNews?: boolean;
}

// 模拟客户数据
const mockCustomerData: Record<string, any> = {
  '阿里巴巴': {
    name: '阿里巴巴集团',
    industry: '电子商务',
    employees: '25万人',
    revenue: '超9000亿人民币',
    description: '全球领先的电子商务和云计算公司',
    risk: '低',
    recommendation: '重点跟进',
  },
  '腾讯': {
    name: '腾讯控股',
    industry: '互联网',
    employees: '10万人',
    revenue: '超5500亿人民币',
    description: '中国领先的互联网科技公司',
    risk: '低',
    recommendation: '重点跟进',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: CustomerAnalysisRequest = await request.json();
    const { companyName, includeCompetitors = false, includeNews = false } = body;

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: '请提供公司名称' },
        { status: 400 }
      );
    }

    // 模拟数据采集 (内容爬取Agent)
    const crawlData = {
      source: 'content-crawler',
      timestamp: new Date().toISOString(),
      url: `https://example.com/${encodeURIComponent(companyName)}`,
    };

    // 模拟AI分析 (AI企业系统)
    const customerInfo = mockCustomerData[companyName] || {
      name: companyName,
      industry: '未知',
      employees: '未知',
      revenue: '未知',
      description: '暂无数据',
      risk: '评估中',
      recommendation: '需要更多信息',
    };

    // 模拟任务创建 (智能体管理系统)
    const taskData = {
      taskId: `task-${Date.now()}`,
      type: 'customer-follow-up',
      assignedTo: 'sales-team',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // 返回整合结果
    return NextResponse.json({
      success: true,
      data: {
        company: customerInfo,
        crawl: crawlData,
        task: taskData,
        analysis: {
          summary: `已完成对${companyName}的分析`,
          confidence: 0.85,
          nextSteps: [
            '创建跟进任务',
            '准备谈单方案',
            '发送公司介绍邮件',
          ],
        },
      },
    });
  } catch (error) {
    console.error('Customer analysis error:', error);
    return NextResponse.json(
      { success: false, error: '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 获取客户列表
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.values(mockCustomerData),
  });
}
