import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET 获取产销协同概览
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = parseInt(searchParams.get('period') || '30'); // 默认30天

    const supabase = getSupabaseClient();

    // 计算日期范围
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    // 1. 获取销售数据
    const { data: salesOrders } = await supabase
      .from('sales_orders')
      .select(`
        *,
        sales_order_items(
          product_id,
          quantity,
          unit_price
        )
      `)
      .gte('order_date', startDate)
      .lte('order_date', endDate)
      .order('order_date', { ascending: false });

    // 2. 获取采购数据
    const { data: purchaseOrders } = await supabase
      .from('purchase_orders')
      .select('*')
      .gte('order_date', startDate)
      .lte('order_date', endDate)
      .order('order_date', { ascending: false });

    // 3. 获取生产数据
    const { data: productionOrders } = await supabase
      .from('production_orders')
      .select('*')
      .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // 4. 获取库存数据
    const { data: inventory } = await supabase
      .from('inventory_alerts')
      .select('*');

    // 5. 获取预测数据
    const { data: forecasts } = await supabase
      .from('demand_forecasts')
      .select('*')
      .gte('forecast_date', startDate)
      .order('forecast_date', { ascending: false });

    // 计算关键指标
    const salesSummary = {
      totalOrders: salesOrders?.length || 0,
      totalRevenue: salesOrders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0) || 0,
      confirmedOrders: salesOrders?.filter((o: any) => o.status === 'confirmed').length || 0,
      processingOrders: salesOrders?.filter((o: any) => o.status === 'processing').length || 0,
      shippedOrders: salesOrders?.filter((o: any) => o.status === 'shipped').length || 0
    };

    const purchaseSummary = {
      totalOrders: purchaseOrders?.length || 0,
      totalAmount: purchaseOrders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0) || 0,
      pendingOrders: purchaseOrders?.filter((o: any) => o.status === 'pending').length || 0,
      confirmedOrders: purchaseOrders?.filter((o: any) => o.status === 'confirmed').length || 0,
      receivedOrders: purchaseOrders?.filter((o: any) => o.status === 'received').length || 0
    };

    const productionSummary = {
      totalOrders: productionOrders?.length || 0,
      inProgressOrders: productionOrders?.filter((o: any) => o.status === 'in_progress').length || 0,
      completedOrders: productionOrders?.filter((o: any) => o.status === 'completed').length || 0,
      plannedOrders: productionOrders?.filter((o: any) => o.status === 'planned').length || 0,
      totalQuantity: productionOrders?.reduce((sum: number, order: any) => sum + order.quantity_completed, 0) || 0
    };

    const inventorySummary = {
      totalProducts: inventory?.length || 0,
      totalValue: inventory?.reduce((sum: number, item: any) => sum + parseFloat(item.total_value), 0) || 0,
      outOfStock: inventory?.filter((i: any) => i.alert_level === 'out_of_stock').length || 0,
      critical: inventory?.filter((i: any) => i.alert_level === 'critical').length || 0,
      lowStock: inventory?.filter((i: any) => i.alert_level === 'low_stock').length || 0,
      overstock: inventory?.filter((i: any) => i.alert_level === 'overstock').length || 0
    };

    // 生成协同建议
    const recommendations: string[] = [];

    if (inventorySummary.critical > 0) {
      recommendations.push(`⚠️ 库存预警：${inventorySummary.critical} 个产品库存危急，建议立即补货`);
    }

    if (salesSummary.confirmedOrders > 0 && inventorySummary.lowStock > 0) {
      recommendations.push(`📦 销售订单增加：${salesSummary.confirmedOrders} 个已确认订单，需确保库存充足`);
    }

    if (productionSummary.inProgressOrders > 5) {
      recommendations.push(`🏭 生产排产：${productionSummary.inProgressOrders} 个订单正在生产中，关注生产进度`);
    }

    if (purchaseSummary.pendingOrders > 3) {
      recommendations.push(`🛒 采购待处理：${purchaseSummary.pendingOrders} 个采购订单待确认，请及时处理`);
    }

    // 产销匹配分析
    const supplyDemandMatch = analyzeSupplyDemand(inventory || [], forecasts || [], salesOrders || []);

    return NextResponse.json({
      success: true,
      summary: {
        sales: salesSummary,
        purchase: purchaseSummary,
        production: productionSummary,
        inventory: inventorySummary
      },
      supplyDemandMatch,
      recommendations,
      period: {
        days: period,
        start: startDate,
        end: endDate
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('获取产销协同数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST 创建生产订单（从销售订单自动触发）
export async function POST(request: NextRequest) {
  try {
    const { salesOrderId, autoCreate } = await request.json();

    const supabase = getSupabaseClient();

    // 如果提供了销售订单ID，自动创建生产订单
    if (salesOrderId && autoCreate) {
      // 获取销售订单详情
      const { data: salesOrder } = await supabase
        .from('sales_orders')
        .select(`
          *,
          sales_order_items(
            product_id,
            sku,
            product_name,
            quantity
          )
        `)
        .eq('id', salesOrderId)
        .single();

      if (!salesOrder) {
        return NextResponse.json(
          { success: false, error: '销售订单不存在' },
          { status: 404 }
        );
      }

      // 检查库存是否充足
      const productionOrders = [];

      for (const item of salesOrder.sales_order_items) {
        // 获取当前库存
        const { data: inventory } = await supabase
          .from('inventory')
          .select('quantity_available, products(sku, name, lead_time_days)')
          .eq('product_id', item.product_id)
          .single();

        if (!inventory || inventory.quantity_available < item.quantity) {
          // 库存不足，创建生产订单
          const shortage = item.quantity - (inventory?.quantity_available || 0);
          const orderNumber = `PO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

          const { data: productionOrder } = await supabase
            .from('production_orders')
            .insert({
              order_number: orderNumber,
              product_id: item.product_id,
              quantity_ordered: shortage,
              quantity_completed: 0,
              status: 'planned',
              priority: 2,
              notes: `自动创建：满足销售订单 ${salesOrder.order_number}`
            })
            .select()
            .single();

          productionOrders.push(productionOrder);

          // 记录事件
          await supabase
            .from('supply_chain_events')
            .insert({
              event_type: 'production_started',
              entity_type: 'production_order',
              entity_id: productionOrder.id,
              description: `库存不足，自动创建生产订单 ${orderNumber}，数量 ${shortage}`,
              severity: 'info',
              metadata: {
                salesOrderId,
                salesOrderNumber: salesOrder.order_number,
                productId: item.product_id,
                shortage
              }
            });
        }
      }

      return NextResponse.json({
        success: true,
        productionOrders,
        message: `成功创建 ${productionOrders.length} 个生产订单`
      });
    }

    return NextResponse.json({
      success: true,
      message: '请求已处理'
    });

  } catch (error: any) {
    console.error('创建生产订单失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 辅助函数：分析供需匹配
function analyzeSupplyDemand(inventory: any[], forecasts: any[], salesOrders: any[]) {
  const matchAnalysis = {
    balanced: 0,
    oversupply: 0,
    undersupply: 0,
    critical: 0,
    details: [] as any[]
  };

  inventory?.forEach((item: any) => {
    // 获取该产品的预测需求
    const productForecast = forecasts?.find((f: any) => f.product_id === item.product_id);

    // 获取该产品最近30天的销售
    const recentSales = salesOrders
      ?.filter((order: any) =>
        order.sales_order_items?.some((item: any) => item.product_id === item.product_id)
      )
      .reduce((total: number, order: any) => {
        const orderItem = order.sales_order_items.find((i: any) => i.product_id === item.product_id);
        return total + (orderItem?.quantity || 0);
      }, 0) || 0;

    const predictedDemand = productForecast?.predicted_quantity || recentSales;

    let status = 'balanced';
    let message = '供需平衡';

    if (item.alert_level === 'out_of_stock') {
      status = 'critical';
      message = '严重缺货，立即补货';
      matchAnalysis.critical++;
    } else if (item.alert_level === 'critical' || item.quantity_available < predictedDemand) {
      status = 'undersupply';
      message = '供应不足，建议补货';
      matchAnalysis.undersupply++;
    } else if (item.alert_level === 'overstock' || item.quantity_available > predictedDemand * 2) {
      status = 'oversupply';
      message = '库存过剩，考虑促销';
      matchAnalysis.oversupply++;
    } else {
      matchAnalysis.balanced++;
    }

    matchAnalysis.details.push({
      productId: item.product_id,
      productName: item.product_name,
      sku: item.sku,
      currentStock: item.quantity_available,
      predictedDemand,
      status,
      message
    });
  });

  return matchAnalysis;
}
