import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取所有API配置
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabase
      .from('api_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type && type !== 'all') {
      query = query.eq('api_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取API配置失败:', error);
      return NextResponse.json(
        { error: '获取API配置失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ configs: data || [] });
  } catch (error: any) {
    console.error('获取API配置失败:', error);
    return NextResponse.json(
      { error: error.message || '获取API配置失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新的API配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      api_url,
      api_key,
      api_type,
      method,
      headers
    } = body;

    if (!name || !api_url || !api_type) {
      return NextResponse.json(
        { error: '名称、API地址和类型为必填项' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('api_configurations')
      .insert({
        name,
        description: description || null,
        api_url,
        api_key: api_key || null,
        api_type,
        method: method || 'POST',
        headers: headers || {},
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('创建API配置失败:', error);
      return NextResponse.json(
        { error: error.message || '创建API配置失败' },
        { status: 500 }
      );
    }

    // 记录监控日志
    await supabase.from('monitoring_logs').insert({
      module: 'data_governance',
      action: 'create_api_config',
      status: 'success',
      message: `创建API配置: ${name}`
    });

    return NextResponse.json({ config: data }, { status: 201 });
  } catch (error: any) {
    console.error('创建API配置失败:', error);
    return NextResponse.json(
      { error: error.message || '创建API配置失败' },
      { status: 500 }
    );
  }
}
