import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import crypto from 'crypto';

/**
 * 缓存系统API
 * GET: 查询缓存
 * POST: 保存/更新缓存
 * DELETE: 删除缓存
 */

// GET - 查询缓存
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cache_key = searchParams.get('cache_key');
    const request_text = searchParams.get('request_text');

    if (!cache_key && !request_text) {
      return NextResponse.json(
        {
          success: false,
          error: '必须提供cache_key或request_text参数',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 生成缓存key
    const key = cache_key || generateCacheKey(request_text!);

    // 查询缓存
    const { data: cache, error } = await supabase
      .from('ai_cache')
      .select('*')
      .eq('cache_key', key)
      .eq('is_valid', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      throw new Error(`查询缓存失败: ${error.message}`);
    }

    if (!cache) {
      return NextResponse.json({
        success: true,
        cache_hit: false,
        message: '未找到缓存',
      });
    }

    // 更新缓存命中次数和最后访问时间
    await supabase
      .from('ai_cache')
      .update({
        cache_hit_count: (cache.cache_hit_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', cache.id);

    return NextResponse.json({
      success: true,
      cache_hit: true,
      cache: {
        cache_key: cache.cache_key,
        response_content: cache.response_content,
        model_name: cache.model_name,
        task_type: cache.task_type,
        input_tokens: cache.input_tokens,
        output_tokens: cache.output_tokens,
        cache_hit_count: (cache.cache_hit_count || 0) + 1,
        created_at: cache.created_at,
      },
    });
  } catch (error: any) {
    console.error('查询缓存错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查询缓存失败',
      },
      { status: 500 }
    );
  }
}

// POST - 保存/更新缓存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      request_text,
      response_content,
      model_provider_id,
      model_name,
      task_type,
      input_tokens,
      output_tokens,
      ttl_seconds = 3600,
    } = body;

    if (!request_text || !response_content || !model_name) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需参数: request_text, response_content, model_name',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 生成缓存key
    const cache_key = generateCacheKey(request_text);
    const cache_hash = crypto.createHash('sha256').update(request_text).digest('hex');
    const expires_at = new Date(Date.now() + ttl_seconds * 1000).toISOString();

    // 检查缓存是否已存在
    const { data: existingCache } = await supabase
      .from('ai_cache')
      .select('id')
      .eq('cache_key', cache_key)
      .maybeSingle();

    if (existingCache) {
      // 更新现有缓存
      const { error: updateError } = await supabase
        .from('ai_cache')
        .update({
          request_content: request_text,
          response_content: response_content,
          model_provider_id: model_provider_id,
          model_name: model_name,
          task_type: task_type,
          input_tokens: input_tokens,
          output_tokens: output_tokens,
          expires_at: expires_at,
          is_valid: true,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingCache.id);

      if (updateError) {
        throw new Error(`更新缓存失败: ${updateError.message}`);
      }

      return NextResponse.json({
        success: true,
        message: '缓存已更新',
        cache_key: cache_key,
      });
    } else {
      // 创建新缓存
      const { error: insertError } = await supabase.from('ai_cache').insert({
        cache_key: cache_key,
        request_hash: cache_hash,
        request_content: request_text,
        response_content: response_content,
        model_provider_id: model_provider_id,
        model_name: model_name,
        task_type: task_type,
        input_tokens: input_tokens,
        output_tokens: output_tokens,
        expires_at: expires_at,
      });

      if (insertError) {
        throw new Error(`创建缓存失败: ${insertError.message}`);
      }

      return NextResponse.json({
        success: true,
        message: '缓存已保存',
        cache_key: cache_key,
      });
    }
  } catch (error: any) {
    console.error('保存缓存错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '保存缓存失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除缓存
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cache_key = searchParams.get('cache_key');

    if (!cache_key) {
      return NextResponse.json(
        {
          success: false,
          error: '必须提供cache_key参数',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('ai_cache')
      .update({ is_valid: false })
      .eq('cache_key', cache_key);

    if (error) {
      throw new Error(`删除缓存失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '缓存已删除',
    });
  } catch (error: any) {
    console.error('删除缓存错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '删除缓存失败',
      },
      { status: 500 }
    );
  }
}

// 生成缓存key
function generateCacheKey(text: string): string {
  const hash = crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
  return `cache-${hash}`;
}
