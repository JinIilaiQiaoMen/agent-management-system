import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取所有系统集成配置
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('system_integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取系统集成配置失败:', error);
      return NextResponse.json(
        { error: '获取系统集成配置失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ integrations: data || [] });
  } catch (error: any) {
    console.error('获取系统集成配置失败:', error);
    return NextResponse.json(
      { error: error.message || '获取系统集成配置失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新的系统集成配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      system_type,
      endpoint,
      authentication_config,
      sync_interval
    } = body;

    if (!name || !system_type) {
      return NextResponse.json(
        { error: '名称和系统类型为必填项' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('system_integrations')
      .insert({
        name,
        system_type,
        endpoint: endpoint || null,
        authentication_config: authentication_config || {},
        sync_interval: sync_interval || 3600,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('创建系统集成配置失败:', error);
      return NextResponse.json(
        { error: error.message || '创建系统集成配置失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ integration: data }, { status: 201 });
  } catch (error: any) {
    console.error('创建系统集成配置失败:', error);
    return NextResponse.json(
      { error: error.message || '创建系统集成配置失败' },
      { status: 500 }
    );
  }
}
