import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/billing/subscriptions
 * 获取当前订阅
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 查找当前活跃订阅
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['TRIAL', 'ACTIVE', 'PAST_DUE'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: '暂无活跃订阅',
      });
    }

    // 计算剩余天数
    const daysRemaining = Math.ceil(
      (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        daysRemaining,
      },
    });

  } catch (error) {
    console.error('获取订阅失败:', error);
    return NextResponse.json(
      { error: '获取订阅失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/billing/subscriptions
 * 统一处理订阅操作（升级/降级）
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, action } = body;

    const validPlans = ['BASIC', 'PROFESSIONAL', 'ULTIMATE'] as const;
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json({ error: '无效的套餐' }, { status: 400 });
    }

    if (!action || !['upgrade', 'downgrade'].includes(action)) {
      return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
    }

    // 查找当前订阅
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['TRIAL', 'ACTIVE'],
        },
      },
    });

    if (!currentSubscription) {
      return NextResponse.json({ error: '未找到当前订阅' }, { status: 400 });
    }

    // 计算价格
    const planPrices: Record<string, number> = {
      BASIC: 9999,
      PROFESSIONAL: 29999,
      ULTIMATE: 99999,
    };

    const newPrice = planPrices[plan];
    const currentPrice = planPrices[currentSubscription.plan];

    // 升级逻辑
    if (action === 'upgrade') {
      if (newPrice <= currentPrice) {
        return NextResponse.json({ error: '不能降级到此套餐，请使用降级操作' }, { status: 400 });
      }

      // 升级订阅
      const updatedSubscription = await prisma.subscription.update({
        where: {
          id: currentSubscription.id,
        },
        data: {
          plan: plan as any,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        subscription: updatedSubscription,
        message: '订阅已升级',
      });
    }

    // 降级逻辑
    if (action === 'downgrade') {
      if (newPrice >= currentPrice) {
        return NextResponse.json({ error: '不能升级到此套餐，请使用升级操作' }, { status: 400 });
      }

      // 计算当前周期结束日期
      const currentEndDate = currentSubscription.endDate;

      // 创建新的订阅（下月生效）
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          companyId: session.user.companyId,
          plan: plan as any,
          status: 'ACTIVE',
          startDate: currentEndDate,
          endDate: new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // 取消当前订阅（下月生效）
      await prisma.subscription.update({
        where: {
          id: currentSubscription.id,
        },
        data: {
          cancelAt: currentEndDate,
          status: 'PAST_DUE',
        },
      });

      return NextResponse.json({
        success: true,
        subscription: newSubscription,
        message: '订阅已降级，下月生效',
        effectiveDate: currentEndDate,
      });
    }

  } catch (error) {
    console.error('处理订阅操作失败:', error);
    return NextResponse.json(
      { error: '处理订阅操作失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/billing/subscriptions
 * 取消订阅
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 查找当前订阅
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['TRIAL', 'ACTIVE'],
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: '未找到当前订阅' }, { status: 400 });
    }

    // 取消订阅
    const canceledSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: 'CANCELED',
        cancelAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: canceledSubscription,
      message: '订阅已取消',
      dataRetentionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

  } catch (error) {
    console.error('取消订阅失败:', error);
    return NextResponse.json(
      { error: '取消订阅失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
