import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取所有数据模型
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('data_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取数据模型失败:', error);
      return NextResponse.json(
        { error: '获取数据模型失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ models: data || [] });
  } catch (error: any) {
    console.error('获取数据模型失败:', error);
    return NextResponse.json(
      { error: error.message || '获取数据模型失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新的数据模型
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      schema,
      version
    } = body;

    if (!name || !schema) {
      return NextResponse.json(
        { error: '名称和Schema为必填项' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('data_models')
      .insert({
        name,
        description: description || null,
        schema,
        version: version || '1.0.0',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('创建数据模型失败:', error);
      return NextResponse.json(
        { error: error.message || '创建数据模型失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ model: data }, { status: 201 });
  } catch (error: any) {
    console.error('创建数据模型失败:', error);
    return NextResponse.json(
      { error: error.message || '创建数据模型失败' },
      { status: 500 }
    );
  }
}
