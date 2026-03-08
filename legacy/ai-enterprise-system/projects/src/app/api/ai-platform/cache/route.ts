import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats, clearCache } from '@/lib/ai-platform/cache';

/**
 * @deprecated 此模块已废弃，请使用 /api/ai-hub/cache
 * 获取缓存统计
 */
export async function GET() {
  try {
    const stats = getCacheStats();

    return NextResponse.json({ 
      success: true, 
      data: stats,
      deprecated: true,
      warning: '此 API 已废弃，请使用 /api/ai-hub/cache'
    }, {
      headers: {
        'Deprecation': 'true',
        'Link': '</api/ai-hub/cache>; rel="alternate"'
      }
    });
  } catch (error: any) {
    console.error('获取缓存统计失败:', error);
    return NextResponse.json(
      { error: '获取缓存统计失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * @deprecated 此模块已废弃，请使用 /api/ai-hub/cache
 * 清除所有缓存
 */
export async function DELETE() {
  try {
    await clearCache();

    return NextResponse.json({ 
      success: true, 
      message: '缓存已清除',
      deprecated: true,
      warning: '此 API 已废弃，请使用 /api/ai-hub/cache'
    }, {
      headers: {
        'Deprecation': 'true',
        'Link': '</api/ai-hub/cache>; rel="alternate"'
      }
    });
  } catch (error: any) {
    console.error('清除缓存失败:', error);
    return NextResponse.json(
      { error: '清除缓存失败', details: error.message },
      { status: 500 }
    );
  }
}
