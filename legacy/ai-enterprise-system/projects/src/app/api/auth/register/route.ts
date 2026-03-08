import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword, isValidEmail, isStrongPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

/**
 * 用户注册 API
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 验证输入
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '邮箱、密码和姓名不能为空' },
        { status: 400 }
      );
    }

    // 验证 email 格式
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: '密码至少需要 6 个字符' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'user', // 默认为普通用户
        is_active: true
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) throw error;

    // 生成 JWT token
    const token = await generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    // 返回用户信息和 token
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.created_at
      },
      token
    });

    // 设置 cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 天
    });

    return response;

  } catch (error: any) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: error.message || '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
