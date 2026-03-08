import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia",
});

/**
 * POST /api/billing/checkout
 * 创建支付会话
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions, req, res);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, method } = body;

    // 查看当前订阅
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    // 确定价格
    const planPrices = {
      BASIC: 9999, // 分
      PROFESSIONAL: 29999,
      ULTIMATE: 99999,
    };

    const amount = planPrices[plan] || 9999;

    // 创建发票
    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        subscriptionId: currentSubscription?.id,
        amount: amount,
        currency: 'CNY',
        status: 'PENDING',
      },
    });

    let checkoutUrl: string = '';

    if (method === 'wechat') {
      // 微信支付
      checkoutUrl = await createWechatPayment(invoice.id, amount, session.user.email);
    } else if (method === 'alipay') {
      // 支付宝支付
      checkoutUrl = await createAlipayPayment(invoice.id, amount, session.user.email);
    } else if (method === 'stripe') {
      // Stripe国际支付
      checkoutUrl = await createStripePayment(invoice.id, amount, session.user.email, plan);
    } else if (method === 'bank_transfer') {
      // 对公转账
      checkoutUrl = `/billing/invoice/${invoice.id}`;
    }

    // 更新发票
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'DRAFT' },
    });

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      checkoutUrl,
    });

  } catch (error) {
    console.error('创建支付会话失败:', error);
    return NextResponse.json(
      { error: '创建支付会话失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 创建微信支付
 */
async function createWechatPayment(invoiceId: string, amount: number, userEmail: string) {
  // 模拟微信支付
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const sign = crypto.createHash('sha256')
    .update([process.env.WECHAT_APP_ID!, timestamp, nonce, amount.toString(), userEmail].join('&'))
    .digest('hex');

  // 实际应该调用微信支付API
  const wechatPayUrl = `https://api.mch.weixin.qq.com/pay/unifiedorder`;

  // 返回支付URL（模拟）
  return `${wechatPayUrl}?appid=${process.env.WECHAT_APP_ID}&timestamp=${timestamp}&nonce=${nonce}&sign=${sign}`;
}

/**
 * 创建支付宝支付
 */
async function createAlipayPayment(invoiceId: string, amount: number, userEmail: string) {
  // 模拟支付宝支付
  const timestamp = Date.now();
  const appId = process.env.ALIPAY_APP_ID!;
  const method = 'alipay.trade.page.pay';
  const bizContent = JSON.stringify({
    out_trade_no: invoiceId,
    product_code: 'ZAEP_SUBSCRIPTION',
    total_amount: (amount / 100).toFixed(2),
    subject: 'ZAEP订阅费用',
    body: 'ZAEP智能企业AI中台订阅',
  });
  const sign = crypto.createHmac('sha256', process.env.ALIPAY_PRIVATE_KEY!)
    .update([method, appId, timestamp, bizContent].join('&'))
    .digest('hex');

  // 实际应该调用支付宝API
  const alipayUrl = `https://openapi.alipay.com/gateway.do?method=${method}&app_id=${appId}&timestamp=${timestamp}&biz_content=${encodeURIComponent(bizContent)}&sign=${sign}`;

  return alipayUrl;
}

/**
 * 创建Stripe支付
 */
async function createStripePayment(invoiceId: string, amount: number, userEmail: string, plan: string) {
  const lineItems = [{
    price_data: {
      currency: 'cny',
      product_data: {
        name: `ZAEP ${plan} 订阅`,
      },
    },
    quantity: 1,
  }];

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing/cancel?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      invoiceId: invoiceId,
      userId: userEmail,
      plan,
    },
  });

  // 保存Stripe会话ID到发票
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      stripeId: session.id,
    },
  });

  return session.url!;
}

/**
 * GET /api/billing/plans
 * 获取所有套餐
 */
export async function GET(request: NextRequest) {
  try {
    const plans = {
      BASIC: {
        id: 'BASIC',
        name: '基础版',
        price: 9999,
        monthly: '¥9,999/月',
        yearly: '¥95,988/年',
        features: [
          '基础三省六部系统',
          '5个并发用户',
          '10万次API调用/月',
          '基础监控和审计',
          '邮件支持',
          '数据保留30天',
        ],
      },
      PROFESSIONAL: {
        id: 'PROFESSIONAL',
        name: '专业版',
        price: 29999,
        monthly: '¥29,999/月',
        yearly: '¥269,991/年',
        features: [
          '完整三省六部系统',
          '20个并发用户',
          '100万次API调用/月',
          '高级监控和审计',
          '实时告警',
          '专属客户经理',
          '数据保留90天',
          '自定义六部',
        ],
      },
      ULTIMATE: {
        id: 'ULTIMATE',
        name: '企业版',
        price: 99999,
        monthly: '¥99,999/月',
        yearly: '¥839,916/年',
        features: [
          '完整三省六部系统',
          '无限并发用户',
          '无限API调用',
          '高级监控和审计',
          '实时告警',
          '专属技术顾问',
          '数据永久保留',
          '私有化部署支持',
          '定制化开发',
        ],
      },
    };

    return NextResponse.json({
      success: true,
      plans,
    });

  } catch (error) {
    console.error('获取套餐失败:', error);
    return NextResponse.json(
      { error: '获取套餐失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
