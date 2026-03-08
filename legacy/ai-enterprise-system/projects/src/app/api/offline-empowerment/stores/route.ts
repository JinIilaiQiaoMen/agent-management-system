import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取门店列表API
 * GET /api/offline-empowerment/stores
 */

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    const { data: stores, error } = await client
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`获取门店列表失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      stores: stores || []
    });

  } catch (error) {
    console.error('获取门店列表错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
