import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * POST /api/billing/stripe/webhook
 * Stripe Webhook处理
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook签名验证失败:', err);
      return NextResponse.json({ error: 'Webhook签名验证失败' }, { status: 400 });
    }

    console.log('Stripe Webhook事件:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as any);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as any);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as any);
        break;

      default:
        console.log('未处理的事件:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe Webhook处理失败:', error);
    return NextResponse.json(
      { error: 'Webhook处理失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理支付会话完成
 */
async function handleCheckoutCompleted(session: any) {
  const { invoiceId, metadata } = session;
  const { userId, plan, invoiceId: dbInvoiceId } = metadata;

  console.log('支付会话完成:', { invoiceId, userId, plan, dbInvoiceId });

  // 更新发票为处理中
  await prisma.invoice.update({
    where: { id: dbInvoiceId },
    data: {
      status: 'PENDING',
    },
  });
}

/**
 * 处理发票支付成功
 */
async function handleInvoicePaid(invoice: any) {
  const { customer, id: stripeInvoiceId, amount_paid } = invoice;
  const customerDetails = await stripe.customers.retrieve(customer);

  // 查找或创建用户
  const user = await prisma.user.findFirst({
    where: {
      email: customerDetails.email,
    },
  });

  if (!user) {
    console.error('未找到用户:', customerDetails.email);
    return;
  }

  // 查找发票
  const dbInvoice = await prisma.invoice.findFirst({
    where: {
      stripeId: stripeInvoiceId,
    },
  });

  if (!dbInvoice) {
    console.error('未找到发票:', stripeInvoiceId);
    return;
  }

  // 创建支付记录
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      invoiceId: dbInvoice.id,
      amount: amount_paid / 100, // 转换为分
      currency: invoice.currency,
      method: 'STRIPE',
      status: 'SUCCEEDED',
      stripeId: invoice.payment_intent,
      transactionId: stripeInvoiceId,
      metadata: {
        stripeInvoiceId,
        customer,
      },
    },
  });

  // 更新发票状态
  await prisma.invoice.update({
    where: { id: dbInvoice.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  // 更新订阅
  if (dbInvoice.subscriptionId) {
    const plan = dbInvoice.metadata?.plan as string;

    await prisma.subscription.update({
      where: { id: dbInvoice.subscriptionId },
      data: {
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      },
    });
  }

  console.log('发票支付成功:', { invoiceId: dbInvoice.id, paymentId: payment.id });
}

/**
 * 处理发票支付失败
 */
async function handleInvoicePaymentFailed(invoice: any) {
  const { customer, id: stripeInvoiceId } = invoice;
  const customerDetails = await stripe.customers.retrieve(customer);

  // 查找用户
  const user = await prisma.user.findFirst({
    where: {
      email: customerDetails.email,
    },
  });

  if (!user) {
    return;
  }

  // 查找发票
  const dbInvoice = await prisma.invoice.findFirst({
    where: {
      stripeId: stripeInvoiceId,
    },
  });

  if (!dbInvoice) {
    return;
  }

  // 创建失败的支付记录
  await prisma.payment.create({
    data: {
      userId: user.id,
      invoiceId: dbInvoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      method: 'STRIPE',
      status: 'FAILED',
      stripeId: invoice.payment_intent,
      transactionId: stripeInvoiceId,
      description: invoice.last_payment_error?.message,
      metadata: {
        stripeInvoiceId,
        customer,
        error: invoice.last_payment_error,
      },
    },
  });

  // 更新发票状态
  await prisma.invoice.update({
    where: { id: dbInvoice.id },
    data: {
      status: 'DRAFT',
    },
  });

  console.log('发票支付失败:', { invoiceId: dbInvoice.id });
}

/**
 * 处理订阅删除
 */
async function handleSubscriptionDeleted(subscription: any) {
  const { customer } = subscription;
  const customerDetails = await stripe.customers.retrieve(customer);

  // 查找用户
  const user = await prisma.user.findFirst({
    where: {
      email: customerDetails.email,
    },
  });

  if (!user) {
    return;
  }

  // 取消用户的订阅
  await prisma.subscription.updateMany({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    data: {
      status: 'CANCELED',
      cancelAt: new Date(),
    },
  });

  console.log('订阅已取消:', { userId: user.id });
}

/**
 * 处理发票支付成功（备用）
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  // 与 invoice.paid 处理相同
  await handleInvoicePaid(invoice);
}
