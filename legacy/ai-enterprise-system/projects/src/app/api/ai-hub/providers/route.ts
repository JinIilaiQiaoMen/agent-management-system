import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 模型提供商管理API
 * GET: 获取所有模型提供商
 * POST: 创建新的模型提供商
 * PUT: 更新模型提供商
 * DELETE: 删除模型提供商
 */

// GET - 获取所有模型提供商
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const is_active = searchParams.get('is_active');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('model_providers')
      .select('*')
      .order('priority', { ascending: true });

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: providers, error } = await query;

    if (error) {
      throw new Error(`获取模型提供商失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      providers: providers || [],
    });
  } catch (error: any) {
    console.error('获取模型提供商错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取模型提供商失败',
      },
      { status: 500 }
    );
  }
}

// POST - 创建新的模型提供商
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider_name,
      provider_display_name,
      api_endpoint,
      auth_type,
      priority,
      rate_limit_per_minute,
      cost_per_1k_tokens,
      cost_per_1k_input_tokens,
      cost_per_1k_output_tokens,
      max_tokens,
      supports_streaming,
      supports_function_calling,
      supports_vision,
    } = body;

    if (!provider_name || !provider_display_name || !api_endpoint || !auth_type) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需参数: provider_name, provider_display_name, api_endpoint, auth_type',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: provider, error } = await supabase
      .from('model_providers')
      .insert({
        provider_name,
        provider_display_name,
        api_endpoint,
        auth_type,
        priority: priority || 100,
        rate_limit_per_minute,
        cost_per_1k_tokens,
        cost_per_1k_input_tokens,
        cost_per_1k_output_tokens,
        max_tokens,
        supports_streaming: supports_streaming || false,
        supports_function_calling: supports_function_calling || false,
        supports_vision: supports_vision || false,
        average_latency_ms: 0,
        success_rate: 0,
        health_status: 'unknown',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建模型提供商失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '模型提供商创建成功',
      provider,
    });
  } catch (error: any) {
    console.error('创建模型提供商错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '创建模型提供商失败',
      },
      { status: 500 }
    );
  }
}

// PUT - 更新模型提供商
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需参数: id',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: provider, error } = await supabase
      .from('model_providers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新模型提供商失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '模型提供商更新成功',
      provider,
    });
  } catch (error: any) {
    console.error('更新模型提供商错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新模型提供商失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除模型提供商
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需参数: id',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 检查是否有路由规则使用此提供商
    const { data: rules } = await supabase
      .from('model_routing_rules')
      .select('id')
      .eq('model_provider_id', id)
      .limit(1);

    if (rules && rules.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '该模型提供商正在被路由规则使用，无法删除',
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('model_providers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除模型提供商失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '模型提供商删除成功',
    });
  } catch (error: any) {
    console.error('删除模型提供商错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '删除模型提供商失败',
      },
      { status: 500 }
    );
  }
}
