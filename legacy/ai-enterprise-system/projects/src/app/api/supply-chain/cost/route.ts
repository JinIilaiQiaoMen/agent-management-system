import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET 获取成本记录和分析
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const costType = searchParams.get('costType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || '30'; // 默认30天

    const supabase = getSupabaseClient();

    // 计算日期范围
    const end = new Date(endDate || new Date());
    const start = new Date(startDate || new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000));

    let query = supabase
      .from('cost_records')
      .select(`
        *,
        products(sku, name, category, unit_cost, selling_price)
      `)
      .gte('cost_date', start.toISOString().split('T')[0])
      .lte('cost_date', end.toISOString().split('T')[0])
      .order('cost_date', { ascending: false });

    // 过滤条件
    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (costType && costType !== 'all') {
      query = query.eq('cost_type', costType);
    }

    const { data: costRecords, error } = await query;

    if (error) {
      throw error;
    }

    // 按成本类型汇总
    const costSummary: any = {
      material: { total: 0, count: 0, items: [] },
      labor: { total: 0, count: 0, items: [] },
      overhead: { total: 0, count: 0, items: [] },
      shipping: { total: 0, count: 0, items: [] },
      other: { total: 0, count: 0, items: [] }
    };

    costRecords?.forEach((record: any) => {
      const type: string = record.cost_type;
      if (costSummary[type]) {
        costSummary[type].total += parseFloat(record.cost_amount);
        costSummary[type].count += 1;
        costSummary[type].items.push(record);
      }
    });

    const totalCost = Object.values(costSummary).reduce((sum: number, type: any) => sum + type.total, 0);

    // 按产品汇总成本（如果有产品信息）
    const productCostMap = new Map();
    costRecords?.forEach((record: any) => {
      if (record.products) {
        const productId = record.product_id;
        if (!productCostMap.has(productId)) {
          productCostMap.set(productId, {
            productId,
            productName: record.products.name,
            sku: record.products.sku,
            category: record.products.category,
            totalCost: 0,
            costBreakdown: {
              material: 0,
              labor: 0,
              overhead: 0,
              shipping: 0,
              other: 0
            },
            sellingPrice: record.products.selling_price,
            profitMargin: 0
          });
        }
        const product = productCostMap.get(productId);
        product.totalCost += parseFloat(record.cost_amount);
        product.costBreakdown[record.cost_type] += parseFloat(record.cost_amount);
      }
    });

    // 计算利润率
    Array.from(productCostMap.values()).forEach((product: any) => {
      if (product.sellingPrice > 0) {
        product.profitMargin = ((product.sellingPrice - product.totalCost) / product.sellingPrice * 100).toFixed(2);
      }
    });

    const productCosts = Array.from(productCostMap.values());

    return NextResponse.json({
      success: true,
      costRecords: costRecords || [],
      costSummary,
      totalCost,
      productCosts,
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        days: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      }
    });

  } catch (error: any) {
    console.error('获取成本记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST 创建成本记录
export async function POST(request: NextRequest) {
  try {
    const {
      productId,
      productionOrderId,
      costType,
      costDate,
      costCategory,
      costAmount,
      quantity,
      notes
    } = await request.json();

    if (!costType || !costDate || !costAmount) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 生成记录编号
    const recordNumber = `CR${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // 创建成本记录
    const { data: costRecord, error: insertError } = await supabase
      .from('cost_records')
      .insert({
        record_number: recordNumber,
        product_id: productId,
        production_order_id: productionOrderId,
        cost_type: costType,
        cost_date: costDate,
        cost_category: costCategory,
        cost_amount: costAmount,
        quantity: quantity || null,
        notes
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 记录事件（如果成本异常高）
    if (costAmount > 10000) {
      await supabase
        .from('supply_chain_events')
        .insert({
          event_type: 'cost_alert',
          entity_type: 'cost_record',
          entity_id: costRecord.id,
          description: `大额成本支出：${costType} - ${costAmount} 元`,
          severity: costAmount > 50000 ? 'error' : 'warning',
          metadata: {
            costType,
            costAmount,
            costCategory
          }
        });
    }

    return NextResponse.json({
      success: true,
      costRecord,
      message: '成本记录创建成功'
    });

  } catch (error: any) {
    console.error('创建成本记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
