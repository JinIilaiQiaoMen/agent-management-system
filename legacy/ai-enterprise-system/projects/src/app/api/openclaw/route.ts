/**
 * OpenClaw 统一 API 网关
 * 提供统一的接口供 OpenClaw 调用各个模块
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 模块映射
const MODULE_ROUTES: Record<string, string> = {
  'customer-analysis': '/api/customer-analysis',
  'email-generator': '/api/email-generator',
  'lead-scoring': '/api/lead-scoring',
  'social-media': '/api/social-media',
  'supply-chain': '/api/supply-chain',
  'compliance-check': '/api/compliance-check',
  'ai-content': '/api/ai/generate-content',
  'chat-assistant': '/api/chat-assistant',
  'knowledge': '/api/knowledge-documents',
  'pet-content': '/api/pet-content',
  'offline-empowerment': '/api/offline-empowerment',
  'finance-audit': '/api/finance-audit',
  'domestic-platforms': '/api/domestic-platforms'
};

// 支持的动作
const SUPPORTED_ACTIONS: Record<string, string[]> = {
  'customer-analysis': ['analyze', 'chat', 'export', 'suggestions'],
  'email-generator': ['generate', 'analyze-intent'],
  'lead-scoring': ['score', 'get'],
  'social-media': ['publish', 'analyze', 'get-comments', 'get-history'],
  'supply-chain': ['forecast', 'inventory', 'quality', 'cost', 'collaboration'],
  'compliance-check': ['check'],
  'ai-content': ['generate'],
  'chat-assistant': ['chat'],
  'knowledge': ['search', 'add', 'delete', 'update'],
  'pet-content': ['generate', 'translate', 'multi-generate'],
  'offline-empowerment': ['forecast', 'inventory', 'scheduling', 'audit', 'heatmap'],
  'finance-audit': ['audit', 'expenses', 'reconciliation', 'standards'],
  'domestic-platforms': ['publish', 'analyze', 'batch-publish', 'collaboration']
};

/**
 * 主路由 - 处理所有 OpenClaw 请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, action, data, options = {} } = body;

    // 验证参数
    if (!module) {
      return NextResponse.json(
        { success: false, error: '缺少 module 参数' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缺少 action 参数' },
        { status: 400 }
      );
    }

    // 验证模块和动作
    if (!MODULE_ROUTES[module]) {
      return NextResponse.json(
        { success: false, error: `未知模块: ${module}. 支持的模块: ${Object.keys(MODULE_ROUTES).join(', ')}` },
        { status: 400 }
      );
    }

    const actions = SUPPORTED_ACTIONS[module];
    if (!actions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `模块 ${module} 不支持动作: ${action}. 支持的动作: ${actions.join(', ')}` },
        { status: 400 }
      );
    }

    // 记录请求日志
    console.log(`OpenClaw 请求: ${module}.${action}`, data);

    // 路由到对应的模块 API
    const result = await routeToModule(module, action, data, options);

    return NextResponse.json({
      success: true,
      module,
      action,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('OpenClaw API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET - 获取支持模块列表
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    modules: Object.keys(MODULE_ROUTES).map(module => ({
      name: module,
      actions: SUPPORTED_ACTIONS[module],
      route: MODULE_ROUTES[module]
    })),
    timestamp: new Date().toISOString()
  });
}

/**
 * 路由到具体模块
 */
async function routeToModule(module: string, action: string, data: any, options: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  switch (module) {
    case 'customer-analysis':
      return await handleCustomerAnalysis(action, data, options);
    case 'email-generator':
      return await handleEmailGenerator(action, data, options);
    case 'lead-scoring':
      return await handleLeadScoring(action, data, options);
    case 'social-media':
      return await handleSocialMedia(action, data, options);
    case 'supply-chain':
      return await handleSupplyChain(action, data, options);
    case 'compliance-check':
      return await handleComplianceCheck(action, data, options);
    case 'ai-content':
      return await handleAIContent(action, data, options);
    case 'chat-assistant':
      return await handleChatAssistant(action, data, options);
    case 'knowledge':
      return await handleKnowledge(action, data, options);
    case 'pet-content':
      return await handlePetContent(action, data, options);
    case 'offline-empowerment':
      return await handleOfflineEmpowerment(action, data, options);
    case 'finance-audit':
      return await handleFinanceAudit(action, data, options);
    case 'domestic-platforms':
      return await handleDomesticPlatforms(action, data, options);
    default:
      throw new Error(`未知模块: ${module}`);
  }
}

// ============== 客户分析模块 ==============
async function handleCustomerAnalysis(action: string, data: any, options: any) {
  if (action === 'analyze') {
    const response = await fetch('http://localhost:5000/api/customer-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
  throw new Error(`未实现动作: ${action}`);
}

// ============== 邮件生成模块 ==============
async function handleEmailGenerator(action: string, data: any, options: any) {
  const response = await fetch(`http://localhost:5000/api/email-generator${action === 'analyze-intent' ? '/analyze-intent' : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 线索评分模块 ==============
async function handleLeadScoring(action: string, data: any, options: any) {
  if (action === 'score') {
    const response = await fetch('http://localhost:5000/api/lead-scoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
  throw new Error(`未实现动作: ${action}`);
}

// ============== 社媒运营模块 ==============
async function handleSocialMedia(action: string, data: any, options: any) {
  const response = await fetch(`http://localhost:5000/api/social-media/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 供应链模块 ==============
async function handleSupplyChain(action: string, data: any, options: any) {
  const response = await fetch(`http://localhost:5000/api/supply-chain/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 合规检查模块 ==============
async function handleComplianceCheck(action: string, data: any, options: any) {
  const response = await fetch('http://localhost:5000/api/compliance/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== AI 内容生成模块 ==============
async function handleAIContent(action: string, data: any, options: any) {
  const response = await fetch('http://localhost:5000/api/ai/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 聊天助手模块 ==============
async function handleChatAssistant(action: string, data: any, options: any) {
  const response = await fetch('http://localhost:5000/api/chat-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 知识库模块 ==============
async function handleKnowledge(action: string, data: any, options: any) {
  if (action === 'search') {
    const response = await fetch(`http://localhost:5000/api/knowledge-documents?search=${encodeURIComponent(data.query)}`, {
      method: 'GET'
    });
    return await response.json();
  }
  throw new Error(`未实现动作: ${action}`);
}

// ============== 宠物内容模块 ==============
async function handlePetContent(action: string, data: any, options: any) {
  const response = await fetch(`http://localhost:5000/api/pet-content/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 离线赋能模块 ==============
async function handleOfflineEmpowerment(action: string, data: any, options: any) {
  const response = await fetch(`http://localhost:5000/api/offline-empowerment/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 财务审计模块 ==============
async function handleFinanceAudit(action: string, data: any, options: any) {
  const response = await fetch(`http://localhost:5000/api/finance-audit/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// ============== 国内平台模块 ==============
async function handleDomesticPlatforms(action: string, data: any, options: any) {
  const response = await fetch(`http://localhost:5000/api/domestic-platforms/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}
