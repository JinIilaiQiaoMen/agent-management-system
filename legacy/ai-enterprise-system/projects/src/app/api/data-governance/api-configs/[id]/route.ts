import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PATCH - 更新API配置
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('api_configurations')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新API配置失败:', error);
      return NextResponse.json(
        { error: error.message || '更新API配置失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ config: data });
  } catch (error: any) {
    console.error('更新API配置失败:', error);
    return NextResponse.json(
      { error: error.message || '更新API配置失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除API配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('api_configurations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除API配置失败:', error);
      return NextResponse.json(
        { error: error.message || '删除API配置失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除API配置失败:', error);
    return NextResponse.json(
      { error: error.message || '删除API配置失败' },
      { status: 500 }
    );
  }
}
