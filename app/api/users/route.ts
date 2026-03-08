import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

/**
 * GET /api/users
 * 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions, req, res);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查权限
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const companyId = searchParams.get('companyId');

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    // 查询用户
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phone: true,
        role: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // 最多返回50条
    });

    // 统计总数
    const total = await prisma.user.count({ where });

    return NextResponse.json({
      success: true,
      users,
      total,
    });

  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * 创建用户
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions, req, res);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 只有超级管理员可以创建用户
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();

    // 验证输入
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      phone: z.string().optional(),
      password: z.string().min(6),
      role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']),
      companyId: z.string().optional(),
    });

    const validatedData = schema.parse(body);

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: '邮箱已被使用' }, { status: 400 });
    }

    // 哈希密码
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        password: hashedPassword,
        role: validatedData.role,
        companyId: validatedData.companyId,
        emailVerified: new Date(), // 简化处理，直接验证
      },
    });

    // 创建默认订阅
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'BASIC',
        status: 'TRIAL',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('创建用户失败:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入验证失败', issues: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '创建用户失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
