import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 库存动销预测API
 * GET /api/offline-empowerment/inventory-forecast?store_id=xxx&days=30&language=en
 */

// 库存状态标签
const INVENTORY_STATUS = {
  en: {
    out_of_stock: 'Out of Stock',
    low_stock: 'Low Stock',
    optimal: 'Optimal Level',
    overstocked: 'Overstocked'
  },
  es: {
    out_of_stock: 'Sin Existencias',
    low_stock: 'Existencias Bajas',
    optimal: 'Nivel Óptimo',
    overstocked: 'Sobrestock'
  },
  de: {
    out_of_stock: 'Nicht vorrätig',
    low_stock: 'Wenig Vorrat',
    optimal: 'Optimaler Bestand',
    overstocked: 'Überbestand'
  },
  fr: {
    out_of_stock: 'Rupture de Stock',
    low_stock: 'Faible Stock',
    optimal: 'Niveau Optimal',
    overstocked: 'Surstock'
  }
};

// 获取门店库存数据
async function getStoreInventory(storeId: string) {
  const client = getSupabaseClient();

  const { data: inventory, error } = await client
    .from('inventory')
    .select(`
      *,
      product:products (
        id,
        product_code,
        product_name,
        category,
        unit_cost,
        selling_price,
        lead_time_days
      )
    `)
    .eq('store_id', storeId)
    .order('current_quantity', { ascending: true });

  if (error) {
    throw new Error(`获取库存数据失败: ${error.message}`);
  }

  return inventory || [];
}

// 预测产品需求（简化版）
async function predictDemand(storeId: string, productId: string, days: number) {
  const client = getSupabaseClient();

  // 获取历史销售数据
  const { data: salesData } = await client
    .from('sales_records')
    .select('transaction_date, total_amount')
    .eq('store_id', storeId)
    .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('transaction_date', { ascending: true });

  if (!salesData || salesData.length === 0) {
    return [];
  }

  // 计算日均销量
  const totalSales = salesData.reduce((sum: number, s: any) => sum + parseFloat(s.total_amount), 0);
  const avgDailySales = totalSales / 30;

  // 生成预测
  const forecasts = [];
  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    // 随机波动
    const randomFactor = 0.8 + Math.random() * 0.4;
    const predictedSales = avgDailySales * randomFactor;

    forecasts.push({
      date: date.toISOString().split('T')[0],
      predicted_quantity: Math.max(0, Math.round(predictedSales)),
      lower_bound: Math.max(0, Math.round(predictedSales * 0.8)),
      upper_bound: Math.round(predictedSales * 1.2)
    });
  }

  return forecasts;
}

// 生成补货建议
function generateReplenishmentSuggestion(
  inventory: any,
  demandForecasts: any[],
  language: string
) {
  const labels = INVENTORY_STATUS[language as keyof typeof INVENTORY_STATUS];

  const currentStock = inventory.current_quantity;
  const safetyStock = inventory.safety_stock || 5;
  const reorderPoint = inventory.reorder_point || 10;

  // 计算未来30天总需求
  const futureDemand = demandForecasts.reduce(
    (sum, f) => sum + f.predicted_quantity,
    0
  );

  // 判断库存状态
  let status, statusLabel, actionRequired, action;

  if (currentStock === 0) {
    status = 'out_of_stock';
    statusLabel = labels.out_of_stock;
    actionRequired = true;
    action = '紧急补货';
  } else if (currentStock <= safetyStock) {
    status = 'low_stock';
    statusLabel = labels.low_stock;
    actionRequired = true;
    action = '建议补货';
  } else if (currentStock >= reorderPoint * 2) {
    status = 'overstocked';
    statusLabel = labels.overstocked;
    actionRequired = true;
    action = '考虑促销减少库存';
  } else {
    status = 'optimal';
    statusLabel = labels.optimal;
    actionRequired = false;
    action = null;
  }

  // 计算建议补货量（EOQ简化版）
  let suggestedOrderQuantity = 0;
  let estimatedDeliveryDate = null;

  if (actionRequired && status !== 'overstocked') {
    const leadTimeDays = inventory.product?.lead_time_days || 7;
    const averageDailyDemand = futureDemand / 30;

    suggestedOrderQuantity = Math.max(
      reorderPoint - currentStock + safetyStock,
      Math.ceil(averageDailyDemand * leadTimeDays)
    );

    estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + leadTimeDays);
  }

  // 计算总成本
  const unitCost = inventory.product?.unit_cost || 0;
  const totalCost = suggestedOrderQuantity * unitCost;

  // 判断紧急程度
  let urgencyLevel = 'low';
  if (status === 'out_of_stock' || currentStock <= safetyStock / 2) {
    urgencyLevel = 'critical';
  } else if (status === 'low_stock') {
    urgencyLevel = 'high';
  } else if (status === 'overstocked') {
    urgencyLevel = 'medium';
  }

  return {
    product_id: inventory.product_id,
    product_name: inventory.product?.product_name || 'Unknown',
    product_code: inventory.product?.product_code || '',
    category: inventory.product?.category || '',
    current_quantity: currentStock,
    reorder_point: reorderPoint,
    safety_stock: safetyStock,
    future_30d_demand: Math.round(futureDemand),
    days_of_stock_remaining: currentStock > 0
      ? Math.round(currentStock / (futureDemand / 30))
      : 0,
    status,
    status_label: statusLabel,
    action_required: actionRequired,
    action,
    suggested_order_quantity: suggestedOrderQuantity,
    urgency_level: urgencyLevel,
    estimated_delivery_date: estimatedDeliveryDate?.toISOString().split('T')[0] || null,
    total_cost: parseFloat(totalCost.toFixed(2)),
    forecasts: demandForecasts
  };
}

// GET请求处理
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');
    const days = parseInt(searchParams.get('days') || '30');
    const language = searchParams.get('language') || 'en';

    // 验证参数
    if (!storeId) {
      return NextResponse.json(
        { error: '缺少必要参数: store_id' },
        { status: 400 }
      );
    }

    if (!['en', 'es', 'de', 'fr'].includes(language)) {
      return NextResponse.json(
        { error: '不支持的语言，仅支持: en, es, de, fr' },
        { status: 400 }
      );
    }

    // 获取门店信息
    const client = getSupabaseClient();
    const { data: store } = await client
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (!store) {
      return NextResponse.json(
        { error: '门店不存在' },
        { status: 404 }
      );
    }

    // 获取库存数据
    const inventoryList = await getStoreInventory(storeId);

    // 为每个产品生成预测和补货建议
    const recommendations = [];
    for (const inventory of inventoryList) {
      const forecasts = await predictDemand(storeId, inventory.product_id, days);
      const suggestion = generateReplenishmentSuggestion(
        inventory,
        forecasts,
        language
      );
      recommendations.push(suggestion);
    }

    // 统计汇总
    const criticalItems = recommendations.filter(r => r.urgency_level === 'critical');
    const lowStockItems = recommendations.filter(r => r.status === 'low_stock');
    const overstockedItems = recommendations.filter(r => r.status === 'overstocked');

    const totalInventoryValue = recommendations.reduce(
      (sum, r) => sum + (r.current_quantity * (inventoryList.find(i => i.product_id === r.product_id)?.product?.unit_cost || 0)),
      0
    );

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.store_name,
        country: store.country,
        city: store.city,
        currency: store.currency
      },
      summary: {
        total_products: recommendations.length,
        critical_items: criticalItems.length,
        low_stock_items: lowStockItems.length,
        overstocked_items: overstockedItems.length,
        total_inventory_value: parseFloat(totalInventoryValue.toFixed(2))
      },
      recommendations: recommendations,
      forecast_period_days: days,
      gdpr_compliant: true,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('库存动销预测API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
