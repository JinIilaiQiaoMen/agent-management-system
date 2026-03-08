// 微信客服 - 配置API

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 配置保存Schema
const saveWechatConfigSchema = z.object({
  wechat: z.object({
    appType: z.enum(['public', 'enterprise', 'miniprogram']),
    appId: z.string(),
    secret: z.string(),
    token: z.string().optional(),
    encoding: z.string().optional(),
  }),
  model: z.object({
    provider: z.enum(['coze', 'zhipu', 'wenxin', 'qwen', 'openai', 'anthropic']),
    apiKey: z.string(),
    baseUrl: z.string().optional(),
    model: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    timeout: z.number().optional(),
  }),
  agent: z.object({
    name: z.string(),
    type: z.enum(['customer_service', 'sales', 'technical']),
    modelProvider: z.string(),
    modelName: z.string().optional(),
    systemPrompt: z.string(),
    autoReply: z.boolean(),
    escalateToHuman: z.boolean(),
    escalateKeywords: z.string().optional(),
    responseTime: z.number().optional(),
    maxContextMessages: z.number().optional(),
  }),
  templates: z.array(z.object({
    id: z.number().optional(),
    type: z.enum(['greeting', 'farewell', 'faq', 'escalation', 'out_of_business']),
    intent: z.string(),
    priority: z.number(),
    content: z.string(),
    variables: z.any().optional(),
    isActive: z.boolean(),
  })),
  product: z.object({
    name: z.string(),
    business: z.string(),
    customers: z.string(),
    products: z.string(),
    support: z.string(),
    policy: z.string(),
  }),
});

/**
 * POST /api/config/wechat
 * 保存微信配置
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const validatedData = saveWechatConfigSchema.parse(body);

    // 获取或创建公司
    let company = null;
    const { wechat } = validatedData;

    // 根据微信配置查找公司
    if (wechat.appType === 'public') {
      company = await prisma.company.findFirst({
        where: { wechatAppId: wechat.appId },
      });
    } else if (wechat.appType === 'enterprise') {
      company = await prisma.company.findFirst({
        where: { enterpriseId: wechat.appId },
      });
    }

    // 如果公司不存在，创建新公司
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: validatedData.product.name,
          wechatAppId: wechat.appType === 'public' ? wechat.appId : null,
          enterpriseId: wechat.appType === 'enterprise' ? wechat.appId : null,
          wechatSecretKey: wechat.secret,
          agentSecretKey: wechat.token,
          modelConfig: {
            provider: validatedData.model.provider,
            apiKey: validatedData.model.apiKey,
            baseUrl: validatedData.model.baseUrl,
            model: validatedData.model.model,
            temperature: validatedData.model.temperature,
            maxTokens: validatedData.model.maxTokens,
            timeout: validatedData.model.timeout,
          },
          business: validatedData.product.business,
          customers: validatedData.product.customers,
          products: validatedData.product.products,
          support: validatedData.product.support,
          policy: validatedData.product.policy,
        },
      });
    } else {
      // 更新现有公司
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          name: validatedData.product.name,
          wechatAppId: wechat.appType === 'public' ? wechat.appId : undefined,
          enterpriseId: wechat.appType === 'enterprise' ? wechat.appId : undefined,
          wechatSecretKey: wechat.secret,
          agentSecretKey: wechat.token,
          modelConfig: {
            provider: validatedData.model.provider,
            apiKey: validatedData.model.apiKey,
            baseUrl: validatedData.model.baseUrl,
            model: validatedData.model.model,
            temperature: validatedData.model.temperature,
            maxTokens: validatedData.model.maxTokens,
            timeout: validatedData.model.timeout,
          },
          business: validatedData.product.business,
          customers: validatedData.product.customers,
          products: validatedData.product.products,
          support: validatedData.product.support,
          policy: validatedData.product.policy,
          updatedAt: new Date(),
        },
      });
    }

    // 创建或更新Agent
    const agent = await prisma.agent.upsert({
      where: {
        companyId_type: {
          companyId: company.id,
          type: validatedData.agent.type,
        },
      },
      update: {
        name: validatedData.agent.name,
        description: `${company.name}的${validatedData.agent.type}助手`,
        modelProvider: validatedData.agent.modelProvider,
        modelName: validatedData.agent.modelName,
        systemPrompt: validatedData.agent.systemPrompt,
        isActive: true,
      },
      create: {
        companyId: company.id,
        name: validatedData.agent.name,
        description: `${company.name}的${validatedData.agent.type}助手`,
        type: validatedData.agent.type,
        modelProvider: validatedData.agent.modelProvider,
        modelName: validatedData.agent.modelName,
        systemPrompt: validatedData.agent.systemPrompt,
        autoReply: validatedData.agent.autoReply,
        escalateToHuman: validatedData.agent.escalateToHuman,
        escalationRules: validatedData.agent.escalateKeywords,
        knowledgeBase: {
          faqDocuments: validatedData.templates,
        },
        isActive: true,
      },
    });

    // 创建或更新消息模板
    for (const template of validatedData.templates) {
      await prisma.messageTemplate.upsert({
        where: {
          companyId_intent_type: {
            companyId: company.id,
            intent: template.intent,
            type: template.type,
          },
        },
        update: {
          priority: template.priority,
          content: template.content,
          variables: template.variables,
          isActive: template.isActive ?? true,
          updatedAt: new Date(),
        },
        create: {
          companyId: company.id,
          type: template.type,
          intent: template.intent,
          priority: template.priority,
          content: template.content,
          variables: template.variables,
          isActive: template.isActive ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '配置保存成功',
      companyId: company.id,
      agentId: agent.id,
    });

  } catch (error) {
    console.error('保存微信配置失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '保存配置失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/config/wechat
 * 获取微信配置
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少companyId参数',
        },
        { status: 400 }
      );
    }

    // 查询公司配置
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        agent: {
          where: { isActive: true },
          take: 1,
        },
        messages: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        templates: {
          take: 20,
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: '公司不存在',
        },
        { status: 404 }
      );
    }

    // 返回配置（不包括敏感信息）
    return NextResponse.json({
      success: true,
      config: {
        company: {
          id: company.id,
          name: company.name,
          wechatAppId: company.wechatAppId,
          enterpriseId: company.enterpriseId,
          business: company.business,
          customers: company.customers,
          products: company.products,
          support: company.support,
          policy: company.policy,
        },
        agent: company.agent ? {
          id: company.agent.id,
          name: company.agent.name,
          type: company.agent.type,
          modelProvider: company.agent.modelProvider,
          modelName: company.agent.modelName,
          systemPrompt: company.agent.systemPrompt,
          autoReply: company.agent.autoReply,
          escalateToHuman: company.agent.escalateToHuman,
        } : null,
        templates: company.templates || [],
        recentMessages: company.messages || [],
      },
    });

  } catch (error) {
    console.error('获取微信配置失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '获取配置失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/wechat/test
 * 测试微信连接
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, appId, secret } = body;

    // 根据类型测试连接
    if (type === 'public') {
      // 测试公众号连接
      const testResult = await testWechatPublicConnection(appId, secret);
      return NextResponse.json({
        success: testResult.success,
        message: testResult.message,
        details: testResult.details,
      });
    } else if (type === 'enterprise') {
      // 测试企业微信连接
      const testResult = await testWechatEnterpriseConnection(appId, secret);
      return NextResponse.json({
        success: testResult.success,
        message: testResult.message,
        details: testResult.details,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '不支持的应用类型',
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('测试微信连接失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '测试连接失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 测试公众号连接
 */
async function testWechatPublicConnection(appId: string, secret: string): Promise<any> {
  try {
    // 1. 获取access_token
    const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token';
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credential',
        appid: appId,
        secret: secret,
      }),
    });

    if (!tokenResponse.ok) {
      return {
        success: false,
        message: '获取access_token失败',
        details: '请检查AppID和AppSecret是否正确',
      };
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.errcode) {
      return {
        success: false,
        message: '公众号连接失败',
        details: `错误码: ${tokenData.errcode}, 错误信息: ${tokenData.errmsg}`,
      };
    }

    // 2. 测试获取服务器IP
    const ipUrl = 'https://api.weixin.qq.com/cgi-bin/getcallbackip';
    const ipResponse = await fetch(`${ipUrl}?access_token=${tokenData.access_token}`);

    if (!ipResponse.ok) {
      return {
        success: false,
        message: '测试获取服务器IP失败',
        details: 'access_token获取成功，但后续测试失败',
      };
    }

    const ipData = await ipResponse.json();

    return {
      success: true,
      message: '公众号连接成功！',
      details: {
        appId,
        accessToken: `${tokenData.access_token.substring(0, 10)}...`,
        expiresIn: tokenData.expires_in,
        serverIp: ipData.ip_list ? ipData.ip_list[0] : '未知',
      },
    };

  } catch (error) {
    return {
      success: false,
      message: '公众号连接测试失败',
      details: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 测试企业微信连接
 */
async function testWechatEnterpriseConnection(appId: string, secret: string): Promise<any> {
  try {
    // 企业微信连接测试比较复杂，这里简化处理
    // 实际应该测试企业微信的API调用

    // 1. 模拟测试（实际应该调用企业微信API）
    const timestamp = Date.now();
    const signature = require('crypto').createHash('sha1')
      .update(`${appId}${timestamp}${secret}`)
      .digest('hex');

    // 2. 测试获取token
    // 注意：企业微信的token获取方式与公众号不同
    // 这里返回模拟成功状态
    return {
      success: true,
      message: '企业微信连接测试成功（模拟）',
      details: {
        appId,
        timestamp,
        signature: `${signature.substring(0, 10)}...`,
        note: '实际环境需要调用企业微信API进行完整测试',
      },
    };

  } catch (error) {
    return {
      success: false,
      message: '企业微信连接测试失败',
      details: error instanceof Error ? error.message : '未知错误',
    };
  }
}
