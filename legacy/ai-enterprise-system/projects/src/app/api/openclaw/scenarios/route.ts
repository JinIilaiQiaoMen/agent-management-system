/**
 * OpenClaw 场景化 API
 * 提供常用的业务场景接口，方便 OpenClaw 调用
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 场景处理器函数类型
 */
type ScenarioHandler = (request: NextRequest, body: any) => Promise<NextResponse>;

/**
 * 场景 1: 新客户自动分析
 * 当有新客户时，自动分析客户信息并生成报告
 */
export async function POST_customer_analyze(request: NextRequest, body: any) {
  const { companyName, website, industry, country } = body;

  // 调用客户分析 API
  const analyzeResponse = await fetch('http://localhost:5000/api/customer-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName,
      website,
      industry,
      country,
      analysisType: 'full'
    })
  });

  const result = await analyzeResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'customer_analyze',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 2: 自动生成跟进邮件
 * 根据客户信息和跟进阶段，自动生成跟进邮件
 */
export async function POST_generate_followup_email(request: NextRequest, body: any) {
  const { customerName, companyName, stage, lastContact } = body;

  // 调用邮件生成 API
  const emailResponse = await fetch('http://localhost:5000/api/email-generator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientName: customerName,
      companyName,
      stage,
      lastContact,
      type: 'followup',
      language: 'zh-CN'
    })
  });

  const result = await emailResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'generate_followup_email',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 3: 线索自动评分
 * 自动评估线索质量和价值
 */
export async function POST_score_lead(request: NextRequest, body: any) {
  const { leadData } = body;

  // 调用线索评分 API
  const scoreResponse = await fetch('http://localhost:5000/api/lead-scoring', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData)
  });

  const result = await scoreResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'score_lead',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 4: 社媒内容自动发布
 * 生成并发布社媒内容
 */
export async function POST_publish_social_content(request: NextRequest, body: any) {
  const { platform, content, mediaUrls, hashtags, scheduledAt } = body;

  // 调用社媒发布 API
  const publishResponse = await fetch('http://localhost:5000/api/social-media/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform,
      content,
      mediaUrls,
      hashtags,
      scheduledAt
    })
  });

  const result = await publishResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'publish_social_content',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 5: 内容合规检查
 * 自动检查内容是否符合平台规则和广告法
 */
export async function POST_check_compliance(request: NextRequest, body: any) {
  const { content, platform } = body;

  // 调用合规检查 API
  const checkResponse = await fetch('http://localhost:5000/api/compliance/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      platform,
      contentType: 'social_media_post',
      language: 'zh-CN',
      generateSuggestion: true
    })
  });

  const result = await checkResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'check_compliance',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 6: 库存预警检查
 * 检查库存并生成预警
 */
export async function POST_inventory_alert(request: NextRequest, body: any) {
  const { productId, minStock } = body;

  // 调用库存检查 API
  const inventoryResponse = await fetch('http://localhost:5000/api/supply-chain/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'check',
      productId,
      minStock
    })
  });

  const result = await inventoryResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'inventory_alert',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 7: AI 对话助手
 * 智能对话，处理客户咨询
 */
export async function POST_chat_assistant(request: NextRequest, body: any) {
  const { messages, conversationId, useKnowledgeBase } = body;

  // 调用聊天助手 API (流式响应)
  const chatResponse = await fetch('http://localhost:5000/api/chat-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      conversationId,
      useKnowledgeBase
    })
  });

  // 处理 SSE 流式响应
  const reader = chatResponse.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    scenario: 'chat_assistant',
    data: {
      message: fullContent,
      messages: [...messages, { role: 'assistant', content: fullContent }]
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 8: 趋势预测
 * 预测销售趋势、库存需求等
 */
export async function POST_forecast_trend(request: NextRequest, body: any) {
  const { type, historicalData, period } = body;

  // 调用预测 API
  const forecastResponse = await fetch('http://localhost:5000/api/supply-chain/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      historicalData,
      period
    })
  });

  const result = await forecastResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'forecast_trend',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 9: 宠物内容生成
 * 为宠物产品生成营销内容
 */
export async function POST_generate_pet_content(request: NextRequest, body: any) {
  const { sku, platform, language, contentType } = body;

  // 调用宠物内容生成 API
  const contentResponse = await fetch('http://localhost:5000/api/pet-content/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sku,
      platform,
      language,
      contentType
    })
  });

  const result = await contentResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'generate_pet_content',
    data: result,
    timestamp: new Date().toISOString()
  });
}

/**
 * 场景 10: 质量检查
 * 检查产品质量并生成报告
 */
export async function POST_quality_check(request: NextRequest, body: any) {
  const { productId, batchNumber, inspectionData } = body;

  // 调用质量检查 API
  const qualityResponse = await fetch('http://localhost:5000/api/supply-chain/quality', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      batchNumber,
      inspectionData
    })
  });

  const result = await qualityResponse.json();

  return NextResponse.json({
    success: true,
    scenario: 'quality_check',
    data: result,
    timestamp: new Date().toISOString()
  });
}

// 导出所有场景处理器
export const scenarioHandlers: Record<string, ScenarioHandler> = {
  customer_analyze: POST_customer_analyze,
  generate_followup_email: POST_generate_followup_email,
  score_lead: POST_score_lead,
  publish_social_content: POST_publish_social_content,
  check_compliance: POST_check_compliance,
  inventory_alert: POST_inventory_alert,
  chat_assistant: POST_chat_assistant,
  forecast_trend: POST_forecast_trend,
  generate_pet_content: POST_generate_pet_content,
  quality_check: POST_quality_check
};

/**
 * 主路由 - 根据场景自动路由
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, ...data } = body;

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: '缺少 scenario 参数' },
        { status: 400 }
      );
    }

    const handler = scenarioHandlers[scenario];
    if (!handler) {
      return NextResponse.json(
        {
          success: false,
          error: `未知场景: ${scenario}. 支持的场景: ${Object.keys(scenarioHandlers).join(', ')}`
        },
        { status: 400 }
      );
    }

    return await handler(request, data);

  } catch (error: any) {
    console.error('OpenClaw 场景 API 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
