// 微信客服 - 自动回复服务

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// 消息接收验证Schema
const receiveMessageSchema = z.object({
  toUserName: z.string(),
  fromUserName: z.string(),
  createTime: z.number(),
  msgType: z.enum(['text', 'image', 'voice', 'video', 'location', 'link']),
  content: z.string(),
  msgId: z.string(),
  mediaId: z.string().optional(),
  picUrl: z.string().optional(),
  recognition: z.string().optional(),
  format: z.string().optional(),
  location: z.any().optional(),
  link: z.any().optional(),
});

interface WechatMessage {
  toUserName: string;
  fromUserName: string;
  createTime: number;
  msgType: 'text' | 'image' | 'voice' | 'video' | 'location' | 'link';
  content: string;
  msgId: string;
  mediaId?: string;
  picUrl?: string;
  recognition?: string;
  format?: string;
  location?: any;
  link?: any;
}

/**
 * POST /api/wechat/webhook
 * 接收微信webhook消息
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析微信webhook
    const body: WechatMessage = await request.json();

    console.log('收到微信消息:', {
      fromUser: body.fromUserName,
      type: body.msgType,
      content: body.content,
      time: new Date(body.createTime * 1000).toISOString(),
    });

    // 2. 创建消息记录
    const message = await prisma.message.create({
      sessionId: `wechat_${body.fromUserName}_${body.msgId}`,
      source: 'wechat',
      message: {
        type: body.msgType,
        content: body.content,
        mediaId: body.mediaId,
        picUrl: body.picUrl,
        location: body.location,
        link: body.link,
        wechat: {
          toUserName: body.toUserName,
          fromUserName: body.fromUserName,
          createTime: body.createTime,
          msgId: body.msgId,
          recognition: body.recognition,
          format: body.format,
        },
      },
      status: 'PENDING',
      createdAt: new Date(body.createTime * 1000),
    });

    console.log('消息已保存:', message.id);

    // 3. 异步处理消息（不阻塞微信webhook）
    processMessageAsync(message.id);

    // 4. 立即返回success（微信要求5秒内返回）
    return NextResponse.json({
      success: true,
      messageId: message.id,
      message: '消息已接收，正在处理',
    });

  } catch (error) {
    console.error('微信webhook处理失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'webhook处理失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 异步处理消息
 */
async function processMessageAsync(messageId: string) {
  try {
    console.log('开始处理消息:', messageId);

    // 1. 获取消息
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      console.error('消息不存在:', messageId);
      return;
    }

    // 2. 更新状态为处理中
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: 'PROCESSING',
        statusMessage: '正在分析消息...',
      },
    });

    // 3. 调用中书省进行意图识别和参数提取
    const analysisResult = await analyzeMessage(message);

    // 4. 根据意图类型处理
    if (analysisResult.intent === 'new_conversation' || analysisResult.intent === 'general_qa') {
      // 新对话或通用问答，直接回复
      await generateAndSendReply(messageId, message, analysisResult);
    } else {
      // 其他意图，需要更复杂的处理
      await handleComplexIntent(messageId, message, analysisResult);
    }

    // 5. 更新状态为已完成
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: 'COMPLETED',
        statusMessage: '消息处理完成',
        processedAt: new Date(),
      },
    });

    console.log('消息处理完成:', messageId);

  } catch (error) {
    console.error('处理消息失败:', error);

    // 更新状态为失败
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: 'FAILED',
        statusMessage: error instanceof Error ? error.message : '处理失败',
        processedAt: new Date(),
      },
    });
  }
}

/**
 * 分析消息
 */
async function analyzeMessage(message: any): Promise<any> {
  const content = message.message.content || '';
  const msgType = message.message.type;

  // 根据消息类型进行分析
  let intent = 'general_qa';
  let confidence = 0.9;
  let category = 'customer_service';

  if (msgType === 'text') {
    // 文本消息，进行意图识别
    if (content.includes('退款') || content.includes('退货')) {
      intent = 'refund';
      confidence = 0.95;
      category = 'customer_service';
    } else if (content.includes('价格') || content.includes('多少钱')) {
      intent = 'price_inquiry';
      confidence = 0.95;
      category = 'sales';
    } else if (content.includes('产品') || content.includes('功能')) {
      intent = 'product_inquiry';
      confidence = 0.90;
      category = 'sales';
    } else if (content.includes('订单') || content.includes('发货')) {
      intent = 'order_inquiry';
      confidence = 0.95;
      category = 'customer_service';
    } else if (content.includes('技术') || content.includes('bug') || content.includes('问题')) {
      intent = 'technical_support';
      confidence = 0.85;
      category = 'technical_support';
    } else if (content.includes('公司') || content.includes('关于')) {
      intent = 'company_info';
      confidence = 0.90;
      category = 'general';
    } else if (content.includes('联系') || content.includes('客服') || content.includes('人工')) {
      intent = 'escalate_to_human';
      confidence = 0.98;
      category = 'escalation';
    }
  } else if (msgType === 'image') {
    intent = 'image_inquiry';
    confidence = 0.85;
    category = 'customer_service';
  } else if (msgType === 'voice') {
    intent = 'voice_inquiry';
    confidence = 0.85;
    category = 'customer_service';
  } else if (msgType === 'video') {
    intent = 'video_inquiry';
    confidence = 0.85;
    category = 'customer_service';
  } else if (msgType === 'location') {
    intent = 'location_inquiry';
    confidence = 0.90;
    category = 'customer_service';
  } else if (msgType === 'link') {
    intent = 'link_inquiry';
    confidence = 0.90;
    category = 'sales';
  }

  return {
    intent,
    confidence,
    category,
    msgType,
  };
}

/**
 * 生成并发送回复
 */
async function generateAndSendReply(
  messageId: string,
  message: any,
  analysisResult: any
): Promise<void> {
  try {
    console.log('生成回复:', messageId, analysisResult.intent);

    // 1. 获取或创建对话会话
    let sessionId = message.sessionId;
    if (!sessionId) {
      sessionId = `wechat_${message.message.wechat.fromUserName}_${Date.now()}`;

      await prisma.conversation.create({
        data: {
          sessionId,
          source: 'wechat',
          isActive: true,
        },
      });
    }

    // 2. 更新消息的会话关联
    await prisma.message.update({
      where: { id: messageId },
      data: {
        sessionId,
        intent: analysisResult.intent,
        confidence: analysisResult.confidence,
        category: analysisResult.category,
        priority: getPriority(analysisResult.intent),
      },
    });

    // 3. 获取公司配置
    const company = await prisma.company.findFirst({
      where: {
        id: message.companyId || undefined,
        OR: [
          { wechatAppId: message.message.wechat.toUserName },
          { enterpriseId: message.message.wechat.toUserName },
        ],
      },
      include: {
        agent: true,
      },
    });

    if (!company) {
      throw new Error('未找到公司配置');
    }

    // 4. 获取客服Agent配置
    const agent = company.agent || await prisma.agent.findFirst({
      where: {
        companyId: company.id,
        type: 'customer_service',
        isActive: true,
      },
    });

    if (!agent) {
      throw new Error('未找到客服Agent');
    }

    // 5. 使用公司大模型生成回复
    const reply = await generateReplyWithCompanyModel(
      message,
      analysisResult,
      agent,
      sessionId
    );

    // 6. 保存回复
    await prisma.reply.create({
      data: {
        messageId,
        content: reply.content,
        type: 'AUTO_REPLY',
        modelProvider: reply.modelProvider,
        modelName: reply.modelName,
        promptTokens: reply.promptTokens,
        completionTokens: reply.completionTokens,
        latencyMs: reply.latencyMs,
      },
    });

    // 7. 发送回复到微信
    await sendWechatReply(message, reply.content);

    // 8. 记录审计日志
    await prisma.auditLog.create({
      data: {
        messageId,
        level: 'info',
        category: 'content',
        message: `生成回复: ${reply.content.substring(0, 100)}...`,
        metadata: {
          intent: analysisResult.intent,
          modelProvider: reply.modelProvider,
          modelName: reply.modelName,
          tokens: reply.promptTokens + reply.completionTokens,
        },
      },
    });

    console.log('回复已发送:', messageId);

  } catch (error) {
    console.error('生成回复失败:', error);

    // 记录错误日志
    await prisma.auditLog.create({
      data: {
        messageId,
        level: 'error',
        category: 'model',
        message: error instanceof Error ? error.message : '生成回复失败',
        metadata: {
          intent: analysisResult?.intent,
          error: error instanceof Error ? error.stack : String(error),
        },
      },
    });

    throw error;
  }
}

/**
 * 使用公司大模型生成回复
 */
async function generateReplyWithCompanyModel(
  message: any,
  analysisResult: any,
  agent: any,
  sessionId: string
): Promise<{
  content: string;
  modelProvider: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}> {
  const startTime = Date.now();

  // 1. 获取最近的对话历史
  const recentMessages = await prisma.message.findMany({
    where: {
      sessionId,
      createdAt: {
        gte: new Date(Date.now() - 10 * 60 * 1000), // 最近10分钟
      },
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 2. 构建对话上下文
  const context = recentMessages.map(m => ({
    role: m.message.type === 'text' && m.message.content ? 'user' : 'system',
    content: m.message.content || `[${m.message.type}消息]`,
  }));

  // 3. 构建系统提示词
  const systemPrompt = buildSystemPrompt(agent, analysisResult, message);

  // 4. 添加用户消息
  context.push({
    role: 'user',
    content: message.message.content,
  });

  // 5. 获取公司大模型配置
  const modelConfig = agent.modelConfig || {};

  // 6. 调用公司大模型API
  const response = await callCompanyLLM(modelConfig, systemPrompt, context);

  const latency = Date.now() - startTime;

  // 7. 统计token使用
  const promptTokens = estimateTokens(systemPrompt + JSON.stringify(context));
  const completionTokens = estimateTokens(response.content);

  return {
    content: response.content,
    modelProvider: response.modelProvider,
    modelName: response.modelName,
    promptTokens,
    completionTokens,
    latencyMs: latency,
  };
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(agent: any, analysisResult: any, message: any): string {
  const { company } = agent || {};
  const { name: companyName, business, customers, products } = company || {};

  // 根据意图构建不同的提示词
  let prompt = '';

  switch (analysisResult.intent) {
    case 'refund':
      prompt = `你是${companyName}的专业客服助手。

公司退款政策：
${getRefundPolicy(business, customers)}

回答要求：
1. 清楚说明退款政策
2. 提供退款流程指引
3. 保持友好和专业
4. 不要承诺无法保证的事情`;
      break;

    case 'price_inquiry':
      prompt = `你是${companyName}的销售助手。

${getProductsInfo(products)}

回答要求：
1. 准确提供价格信息
2. 说明价格包含的内容
3. 推荐性价比高的选项
4. 保持销售风格`;
      break;

    case 'product_inquiry':
      prompt = `你是${companyName}的产品顾问。

${getProductsInfo(products)}

回答要求：
1. 详细介绍产品特点和优势
2. 根据用户需求推荐合适的产品
3. 回答产品相关问题`;
      break;

    case 'order_inquiry':
      prompt = `你是${companyName}的订单查询助手。

回答要求：
1. 帮助查询订单状态
2. 说明订单进度
3. 提供发货信息
4. 保持客服风格`;
      break;

    case 'technical_support':
      prompt = `你是${companyName}的技术支持工程师。

技术支持范围：
${getTechnicalSupportInfo(business, products)}

回答要求：
1. 准确诊断技术问题
2. 提供解决方案
3. 如无法解决，及时升级到人工
4. 保持专业风格`;
      break;

    case 'company_info':
      prompt = `你是${companyName}的企业介绍助手。

公司信息：
${getCompanyInfo(business)}

回答要求：
1. 准确提供公司信息
2. 介绍公司业务和产品
3. 保持专业和友好`;
      break;

    case 'escalate_to_human':
      prompt = `你是${companyName}的客服助手，负责在需要时升级到人工客服。

升级规则：
${getEscalationRules(business)}

回答要求：
1. 评估是否需要人工处理
2. 如果需要，提供转人工指引
3. 保留完整的对话记录`;
      break;

    default:
      prompt = `你是${companyName}的专业客服助手。

公司业务：${business}
主营产品：${products?.map(p => p.name).join('、') || '未提供'}
服务客户：${customers || '未提供'}

回答要求：
1. 专业、友好、及时
2. 准确理解用户需求
3. 提供有帮助的回答
4. 保持品牌调性一致
5. 不确定时主动提问`;
  }

  return prompt;
}

/**
 * 获取退款政策
 */
function getRefundPolicy(business: string, customers: string): string {
  return `
业务类型：${business}

退款政策：
1. 7天无理由退款
2. 产品质量问题：15天内可退款
3. 服务问题：根据具体情况处理
4. 特殊商品：不支持退款

退款流程：
1. 联系客服申请退款
2. 提供订单信息
3. 客服审核（1-2个工作日）
4. 审核通过后，3-5个工作日退款到原账户
`;
}

/**
 * 获取产品信息
 */
function getProductsInfo(products: any): string {
  if (!products) {
    return '暂无产品信息';
  }

  const productsArray = Array.isArray(products) ? products : JSON.parse(products || '[]');
  return productsArray.map((p: any) => {
    return `- ${p.name}: ${p.description || '暂无描述'} (${p.price || '暂无价格'})`;
  }).join('\n');
}

/**
 * 获取公司信息
 */
function getCompanyInfo(business: string): string {
  return `
公司介绍：${business}

业务范围：
- 客户服务
- 产品销售
- 技术支持
- 售后服务

服务承诺：
- 7x24小时在线客服
- 30分钟内响应
- 专业团队服务
`;
}

/**
 * 获取技术支持信息
 */
function getTechnicalSupportInfo(business: string, products: any): string {
  return `
技术支持范围：
- 产品使用指导
- 常见问题解答
- 故障排查和解决
- 技术咨询

支持方式：
- 在线客服：7x24小时
- 电话支持：工作时间
- 邮件支持：24小时内回复
- 工单系统：复杂问题提交工单
`;
}

/**
 * 获取升级规则
 */
function getEscalationRules(business: string): string {
  return `
升级到人工客服的情况：
1. 退款申请
2. 投诉处理
3. 复杂技术问题
4. 产品定制需求
5. VIP客户
6. 企业客户

升级方式：
1. 转接到人工客服
2. 预约回电时间
3. 提交工单
4. 联系客服电话
`;
}

/**
 * 获取优先级
 */
function getPriority(intent: string): number {
  const priorities: Record<string, number> = {
    'refund': 9,
    'escalate_to_human': 9,
    'technical_support': 8,
    'order_inquiry': 7,
    'price_inquiry': 6,
    'product_inquiry': 5,
    'company_info': 4,
    'general_qa': 3,
    'new_conversation': 2,
  };

  return priorities[intent] || 3;
}

/**
 * 调用公司大模型API
 */
async function callCompanyLLM(
  modelConfig: any,
  systemPrompt: string,
  messages: any[]
): Promise<any> {
  const { provider, apiKey, baseUrl, model, temperature } = modelConfig || {};

  // 根据不同的模型提供商调用
  switch (provider) {
    case 'coze':
      return callCozeModel(apiKey, systemPrompt, messages, model, temperature, baseUrl);
    case 'zhipu':
      return callZhipuModel(apiKey, systemPrompt, messages, model, temperature, baseUrl);
    case 'wenxin':
      return callWenxinModel(apiKey, systemPrompt, messages, model, temperature, baseUrl);
    case 'qwen':
      return callQwenModel(apiKey, systemPrompt, messages, model, temperature, baseUrl);
    case 'openai':
      return callOpenAIModel(apiKey, systemPrompt, messages, model, temperature);
    case 'anthropic':
      return callAnthropicModel(apiKey, systemPrompt, messages, model, temperature);
    default:
      return callCozeModel(apiKey, systemPrompt, messages, model, temperature, baseUrl);
  }
}

/**
 * 调用Coze模型
 */
async function callCozeModel(
  apiKey: string,
  systemPrompt: string,
  messages: any[],
  model: string,
  temperature: number = 0.7,
  baseUrl: string = 'https://api.coze.cn'
): Promise<any> {
  const response = await fetch(`${baseUrl}/open_api/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'coze-model',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Coze API调用失败');
  }

  return await response.json();
}

/**
 * 调用智谱模型
 */
async function callZhipuModel(
  apiKey: string,
  systemPrompt: string,
  messages: any[],
  model: string,
  temperature: number = 0.7,
  baseUrl: string = 'https://open.bigmodel.cn/api/paas/v4'
): Promise<any> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'chatglm-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature,
      top_p: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '智谱API调用失败');
  }

  return await response.json();
}

/**
 * 调用OpenAI模型
 */
async function callOpenAIModel(
  apiKey: string,
  systemPrompt: string,
  messages: any[],
  model: string,
  temperature: number = 0.7,
  baseUrl: string = 'https://api.openai.com/v1'
): Promise<any> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'OpenAI API调用失败');
  }

  return await response.json();
}

/**
 * 处理复杂意图
 */
async function handleComplexIntent(
  messageId: string,
  message: any,
  analysisResult: any
): Promise<void> {
  // 对于复杂意图，可能需要：
  // 1. 查询数据库
  // 2. 调用多个API
  // 3. 多轮对话
  // 4. 升级到人工

  switch (analysisResult.intent) {
    case 'order_inquiry':
      // 查询订单
      await handleOrderInquiry(messageId, message);
      break;

    case 'technical_support':
      // 处理技术支持
      await handleTechnicalSupport(messageId, message);
      break;

    case 'escalate_to_human':
      // 升级到人工
      await escalateToHuman(messageId, message);
      break;

    default:
      // 默认处理
      await generateAndSendReply(messageId, message, analysisResult);
  }
}

/**
 * 处理订单查询
 */
async function handleOrderInquiry(messageId: string, message: any): Promise<void> {
  // 提取订单号
  const orderNo = extractOrderNumber(message.message.content);

  if (orderNo) {
    // 查询订单信息
    const orderInfo = await queryOrderInfo(orderNo);

    if (orderInfo) {
      // 使用订单信息生成回复
      await generateAndSendReply(messageId, message, {
        intent: 'order_inquiry',
        confidence: 0.9,
        category: 'customer_service',
      });
    }
  }
}

/**
 * 处理技术支持
 */
async function handleTechnicalSupport(messageId: string, message: any): Promise<void> {
  // 记录技术支持请求
  await prisma.auditLog.create({
    data: {
      messageId,
      level: 'info',
      category: 'technical_support',
      message: '技术支持请求',
      metadata: {
        content: message.message.content,
      type: message.message.type,
      mediaId: message.message.mediaId,
      location: message.message.location,
      link: message.message.link,
      recognition: message.message.recognition,
      format: message.message.format,
      createdAt: message.message.createTime,
      serverTime: message.message.serverTime,
      company: message.companyId,
      agent: message.agentId,
    },
    },
  });

  // 如果是图片/视频，可能需要人工处理
  if (['image', 'video'].includes(message.message.type)) {
    // 提示用户需要人工处理
    await prisma.reply.create({
      data: {
        messageId,
        content: '收到您的图片/视频消息，需要技术支持工程师查看，请稍等...',
        type: 'SYSTEM_REPLY',
      },
    });
  }
}

/**
 * 升级到人工
 */
async function escalateToHuman(messageId: string, message: any): Promise<void> {
  // 标记消息需要人工处理
  await prisma.message.update({
    where: { id: messageId },
    data: {
      priority: 10,
      status: 'PROCESSING',
      statusMessage: '已升级到人工客服，请稍候...',
    },
  });

  // 通知人工客服
  // 这里可以集成到公司的客服系统
  // 例如：发送邮件、短信、企微消息等
  console.log('升级到人工客服:', messageId);
}

/**
 * 提取订单号
 */
function extractOrderNumber(content: string): string | null {
  const orderNoRegex = /(订单|单号|NO\.?)[:：\s]*([A-Za-z0-9]{8,20})/;
  const match = content.match(orderNoRegex);

  if (match) {
    return match[2];
  }

  return null;
}

/**
 * 查询订单信息
 */
async function queryOrderInfo(orderNo: string): Promise<any> {
  // 这里应该连接到公司的订单系统
  // 可以通过API或数据库查询
  // 这里返回模拟数据
  return {
    orderNo,
    status: '已发货',
    product: '示例产品',
    amount: 199.00,
    shipDate: '2026-03-08',
    trackingNo: 'SF1234567890',
  };
}

/**
 * 发送微信回复
 */
async function sendWechatReply(message: any, replyContent: string): Promise<void> {
  // 这里应该调用微信API发送回复
  // 需要微信的access_token
  // 支持多种回复类型：文本、图片、语音、视频、链接等

  const config = await prisma.company.findFirst({
    where: {
      id: message.companyId,
    },
    select: {
      wechatAppId: true,
      wechatSecret: true,
      agentSecretKey: true,
      modelConfig: true,
    },
  });

  if (!config) {
    throw new Error('未找到微信配置');
  }

  const { wechatAppId, wechatSecret } = config;
  const fromUserName = message.message.wechat.toUserName;
  const toUserName = message.message.wechat.fromUserName;

  // 1. 获取access_token
  const accessToken = await getWechatAccessToken(wechatAppId, wechatSecret);

  if (!accessToken) {
    throw new Error('无法获取微信access_token');
  }

  // 2. 根据消息类型发送回复
  const msgType = message.message.type;

  if (msgType === 'text') {
    // 发送文本消息
    await sendWechatTextMessage(accessToken, fromUserName, toUserName, replyContent);
  } else if (msgType === 'image') {
    // 发送图片消息
    await sendWechatImageMessage(accessToken, fromUserName, toUserName, replyContent);
  } else if (msgType === 'voice') {
    // 发送语音消息
    await sendWechatVoiceMessage(accessToken, fromUserName, toUserName, replyContent);
  } else if (msgType === 'video') {
    // 发送视频消息
    await sendWechatVideoMessage(accessToken, fromUserName, toUserName, replyContent);
  } else if (msgType === 'link') {
    // 发送链接消息
    await sendWechatLinkMessage(accessToken, fromUserName, toUserName, replyContent);
  } else {
    // 默认发送文本
    await sendWechatTextMessage(accessToken, fromUserName, toUserName, replyContent);
  }
}

/**
 * 获取微信access_token
 */
async function getWechatAccessToken(appId: string, secret: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sha1(`${appId}${timestamp}${secret}`);

  const response = await fetch('https://api.weixin.qq.com/cgi-bin/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credential',
      appid: appId,
      secret: secret,
      timestamp,
      signature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errmsg || '获取微信access_token失败');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * 发送微信文本消息
 */
async function sendWechatTextMessage(
  accessToken: string,
  fromUserName: string,
  toUserName: string,
  content: string
): Promise<void> {
  const response = await fetch('https://api.weixin.qq.com/cgi-bin/message/custom/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
      touser: toUserName,
      msgtype: 'text',
      text: {
        content,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errmsg || '发送微信消息失败');
  }
}

/**
 * SHA1加密
 */
function sha1(string: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha1').update(string).digest('hex');
}

/**
 * 估算token数量
 */
function estimateTokens(text: string): number {
  // 简单估算：中文约1.5 tokens/字符，英文约0.25 tokens/单词
  // 这里使用简化的估算
  return Math.ceil(text.length * 0.6);
}

/**
 * 处理普通回复
 */
async function handleSimpleReply(messageId: string, message: any): Promise<void> {
  // 直接生成回复
  await generateAndSendReply(messageId, message, {
    intent: 'general_qa',
    confidence: 0.8,
    category: 'customer_service',
  });
}

/**
 * 预设回复模板
 */
const REPLY_TEMPLATES = {
  greeting: [
    '您好！我是智能客服助手，很高兴为您服务！有什么可以帮助您的吗？',
    '您好！请问有什么我可以帮助您的？',
    '你好！我是您的专属客服助手，请问有什么可以帮您的吗？',
  ],
  farewell: [
    '感谢您的咨询，祝您生活愉快！',
    '如有其他问题，欢迎随时联系我们',
    '感谢您的咨询，祝您工作顺利！',
  ],
  unknown: [
    '抱歉，我没有完全理解您的问题，可以再详细说明一下吗？',
    '这个问题比较复杂，我可以为您转接到人工客服吗？',
    '请提供更多详细信息，以便我更好地帮助您',
  ],
};
