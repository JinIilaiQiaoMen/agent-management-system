import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取文档列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('knowledge_documents')
      .select('*')
      .eq('is_active', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ documents: data || [] });
  } catch (error: any) {
    console.error('获取文档列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// 添加文档
export async function POST(request: NextRequest) {
  try {
    const { title, content, category, tags, sourceType, sourceUrl } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 保存到数据库
    const { data, error } = await supabase
      .from('knowledge_documents')
      .insert({
        title,
        content,
        category: category || 'product',
        tags: tags || [],
        source_type: sourceType || 'text',
        source_url: sourceUrl || null,
        doc_id: null, // 后续可以通过 Knowledge SDK 获取
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ document: data });
  } catch (error: any) {
    console.error('添加文档失败:', error);
    return NextResponse.json(
      { error: error.message || '添加失败' },
      { status: 500 }
    );
  }
}
