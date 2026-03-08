import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET 获取品控记录列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const checkType = searchParams.get('checkType');
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('quality_control')
      .select(`
        *,
        products(sku, name, category)
      `)
      .order('check_date', { ascending: false })
      .limit(limit);

    // 过滤条件
    if (checkType && checkType !== 'all') {
      query = query.eq('check_type', checkType);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (startDate) {
      query = query.gte('check_date', startDate);
    }

    if (endDate) {
      query = query.lte('check_date', endDate);
    }

    const { data: qualityChecks, error } = await query;

    if (error) {
      throw error;
    }

    // 统计数据
    const { data: allChecks } = await supabase
      .from('quality_control')
      .select('*');

    const stats = {
      total: allChecks?.length || 0,
      incoming: allChecks?.filter((c: any) => c.check_type === 'incoming').length || 0,
      inProcess: allChecks?.filter((c: any) => c.check_type === 'in_process').length || 0,
      final: allChecks?.filter((c: any) => c.check_type === 'final').length || 0,
      outgoing: allChecks?.filter((c: any) => c.check_type === 'outgoing').length || 0,
      avgPassRate: allChecks && allChecks.length > 0
        ? (allChecks.reduce((sum: number, c: any) => sum + c.pass_rate, 0) / allChecks.length).toFixed(2)
        : '0.00',
      todayChecks: allChecks?.filter((c: any) => c.check_date === new Date().toISOString().split('T')[0]).length || 0
    };

    return NextResponse.json({
      success: true,
      qualityChecks: qualityChecks || [],
      stats
    });

  } catch (error: any) {
    console.error('获取品控记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST 创建品控检查记录
export async function POST(request: NextRequest) {
  try {
    const {
      productId,
      batchNumber,
      checkType,
      quantityChecked,
      quantityPassed,
      quantityFailed,
      inspectorName,
      issues,
      actionTaken
    } = await request.json();

    if (!productId || !checkType || !quantityChecked) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 生成检查编号
    const checkNumber = `QC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // 创建品控记录
    const { data: qualityCheck, error: insertError } = await supabase
      .from('quality_control')
      .insert({
        check_number: checkNumber,
        batch_number: batchNumber,
        product_id: productId,
        check_type: checkType,
        check_date: new Date().toISOString().split('T')[0],
        quantity_checked: quantityChecked,
        quantity_passed: quantityPassed || quantityChecked,
        quantity_failed: quantityFailed || 0,
        inspector_name: inspectorName,
        issues,
        action_taken: actionTaken
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 如果合格率低于95%，记录质量事件
    const passRate = (quantityPassed / quantityChecked) * 100;
    if (passRate < 95) {
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();

      await supabase
        .from('supply_chain_events')
        .insert({
          event_type: 'quality_issue',
          entity_type: 'product',
          entity_id: productId,
          description: `产品 ${product?.name || '未知'} 质量检查不合格率 ${(100 - passRate).toFixed(2)}%`,
          severity: passRate < 90 ? 'error' : 'warning',
          metadata: {
            checkNumber,
            passRate,
            issues
          }
        });
    }

    return NextResponse.json({
      success: true,
      qualityCheck,
      message: '品控记录创建成功'
    });

  } catch (error: any) {
    console.error('创建品控记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT 更新品控记录
export async function PUT(request: NextRequest) {
  try {
    const { id, quantityPassed, quantityFailed, issues, actionTaken } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: '记录ID不能为空' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 获取原始记录
    const { data: originalRecord } = await supabase
      .from('quality_control')
      .select('*')
      .eq('id', id)
      .single();

    if (!originalRecord) {
      return NextResponse.json(
        { success: false, error: '记录不存在' },
        { status: 404 }
      );
    }

    // 更新记录
    const { data: updatedRecord, error } = await supabase
      .from('quality_control')
      .update({
        quantity_passed: quantityPassed,
        quantity_failed: quantityFailed,
        issues,
        action_taken: actionTaken
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      qualityCheck: updatedRecord,
      message: '品控记录更新成功'
    });

  } catch (error: any) {
    console.error('更新品控记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
