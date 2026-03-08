import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth/jwt';

/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 */
export async function GET(request: NextRequest) {
  try {
    // 提取 token
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 验证 token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: '登录已过期，请重新登录' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // 从数据库获取最新用户信息
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, created_at, updated_at, last_login_at')
      .eq('id', payload.userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at
      }
    });

  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: error.message || '获取用户信息失败' },
      { status: 500 }
    );
  }
}
