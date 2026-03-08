import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 路由规则管理API
 * GET: 获取所有路由规则
 * POST: 创建新的路由规则
 * PUT: 更新路由规则
 * DELETE: 删除路由规则
 */

// GET - 获取所有路由规则
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const task_type = searchParams.get('task_type');
    const is_active = searchParams.get('is_active');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('model_routing_rules')
      .select('*')
      .order('priority', { ascending: true });

    if (task_type) {
      query = query.eq('task_type', task_type);
    }

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: rules, error } = await query;

    if (error) {
      throw new Error(`获取路由规则失败: ${error.message}`);
    }

    // 获取所有模型提供商信息
    const { data: providers } = await supabase
      .from('model_providers')
      .select('*');

    // 关联模型提供商信息
    const rulesWithProviders = (rules || []).map((rule: any) => {
      const provider = (providers || []).find((p: any) => p.id === rule.model_provider_id);
      return {
        ...rule,
        model_provider: provider || null,
      };
    });

    return NextResponse.json({
      success: true,
      rules: rulesWithProviders,
    });
  } catch (error: any) {
    console.error('获取路由规则错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取路由规则失败',
      },
      { status: 500 }
    );
  }
}

// POST - 创建新的路由规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rule_name,
      rule_description,
      task_type,
      priority,
      conditions,
      model_provider_id,
      model_name,
      cache_enabled,
      cache_ttl_seconds,
      fallback_provider_id,
      fallback_model_name,
    } = body;

    if (!rule_name || !task_type || !model_provider_id || !model_name) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需参数: rule_name, task_type, model_provider_id, model_name',
        },
        { status: 400 }
      );
    }

    // 验证模型提供商是否存在
    const supabase = getSupabaseClient();
    const { data: provider } = await supabase
      .from('model_providers')
      .select('id')
      .eq('id', model_provider_id)
      .single();

    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: '指定的模型提供商不存在',
        },
        { status: 400 }
      );
    }

    const { data: rule, error } = await supabase
      .from('model_routing_rules')
      .insert({
        rule_name,
        rule_description,
        task_type,
        priority: priority || 100,
        conditions: conditions || {},
        model_provider_id,
        model_name,
        cache_enabled: cache_enabled !== undefined ? cache_enabled : true,
        cache_ttl_seconds: cache_ttl_seconds || 3600,
        fallback_provider_id,
        fallback_model_name,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建路由规则失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '路由规则创建成功',
      rule: {
        ...rule,
        model_provider: provider,
      },
    });
  } catch (error: any) {
    console.error('创建路由规则错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '创建路由规则失败',
      },
      { status: 500 }
    );
  }
}

// PUT - 更新路由规则
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

    // 如果更新了model_provider_id，验证是否存在
    if (updates.model_provider_id) {
      const { data: provider } = await supabase
        .from('model_providers')
        .select('id')
        .eq('id', updates.model_provider_id)
        .single();

      if (!provider) {
        return NextResponse.json(
          {
            success: false,
            error: '指定的模型提供商不存在',
          },
          { status: 400 }
        );
      }
    }

    const { data: rule, error } = await supabase
      .from('model_routing_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新路由规则失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '路由规则更新成功',
      rule,
    });
  } catch (error: any) {
    console.error('更新路由规则错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新路由规则失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除路由规则
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

    const { error } = await supabase
      .from('model_routing_rules')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除路由规则失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '路由规则删除成功',
    });
  } catch (error: any) {
    console.error('删除路由规则错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '删除路由规则失败',
      },
      { status: 500 }
    );
  }
}
