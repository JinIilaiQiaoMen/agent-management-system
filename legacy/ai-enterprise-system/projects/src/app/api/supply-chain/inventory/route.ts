import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET 获取库存列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const alertLevel = searchParams.get('alertLevel');
    const category = searchParams.get('category');
    const warehouseId = searchParams.get('warehouseId') || 'main';
    const limit = parseInt(searchParams.get('limit') || '100');

    const supabase = getSupabaseClient();

    // 使用直接查询 inventory 表并 JOIN products
    let query = supabase
      .from('inventory')
      .select(`
        *,
        products(sku, name, category, min_stock_level, max_stock_level, reorder_point, safety_stock, unit_cost)
      `)
      .eq('warehouse_id', warehouseId)
      .order('quantity_on_hand', { ascending: true })
      .limit(limit);

    // 按预警级别过滤
    if (alertLevel && alertLevel !== 'all') {
      if (alertLevel === 'out_of_stock') {
        query = query.lte('quantity_available', 0);
      } else if (alertLevel === 'critical') {
        query = query.lte('quantity_available', (await getMinStockThreshold(supabase, category)));
      } else if (alertLevel === 'low_stock') {
        query = query.lte('quantity_available', (await getReorderPointThreshold(supabase, category)));
      } else if (alertLevel === 'overstock') {
        query = query.gte('quantity_available', (await getMaxStockThreshold(supabase, category)));
      }
    }

    // 按类别过滤
    if (category && category !== 'all') {
      query = query.eq('products.category', category);
    }

    const { data: inventoryRaw, error } = await query;

    if (error) {
      throw error;
    }

    // 处理数据，添加 alert_level
    const inventory = inventoryRaw?.map((item: any) => {
      const minStock = item.products?.min_stock_level || 0;
      const maxStock = item.products?.max_stock_level || 1000;
      const reorderPoint = item.products?.reorder_point || 100;
      const available = item.quantity_available || 0;

      let alertLevel = 'normal';
      if (available <= 0) {
        alertLevel = 'out_of_stock';
      } else if (available <= minStock) {
        alertLevel = 'critical';
      } else if (available <= reorderPoint) {
        alertLevel = 'low_stock';
      } else if (available >= maxStock) {
        alertLevel = 'overstock';
      }

      return {
        ...item,
        alert_level: alertLevel
      };
    }) || [];

    // 统计数据
    const stats = {
      total: inventory.length,
      outOfStock: inventory.filter((i: any) => i.alert_level === 'out_of_stock').length,
      critical: inventory.filter((i: any) => i.alert_level === 'critical').length,
      lowStock: inventory.filter((i: any) => i.alert_level === 'low_stock').length,
      normal: inventory.filter((i: any) => i.alert_level === 'normal').length,
      overstock: inventory.filter((i: any) => i.alert_level === 'overstock').length
    };

    return NextResponse.json({
      success: true,
      inventory: inventory || [],
      stats,
      total: inventory.length
    });

  } catch (error: any) {
    console.error('获取库存列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST 更新库存
export async function POST(request: NextRequest) {
  try {
    const { productId, warehouseId, quantityChange, operation, notes } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: '产品ID不能为空' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 获取当前库存
    const { data: currentInventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId || 'main')
      .single();

    if (!currentInventory) {
      return NextResponse.json(
        { success: false, error: '库存记录不存在' },
        { status: 404 }
      );
    }

    // 根据操作类型更新库存
    let newQuantity = currentInventory.quantity_on_hand;
    let newAllocated = currentInventory.quantity_allocated;

    switch (operation) {
      case 'adjust':
        newQuantity += quantityChange;
        break;
      case 'add':
        newQuantity += quantityChange;
        break;
      case 'subtract':
        newQuantity -= quantityChange;
        break;
      case 'allocate':
        newAllocated += quantityChange;
        break;
      case 'deallocate':
        newAllocated -= quantityChange;
        break;
      default:
        newQuantity += quantityChange;
    }

    if (newQuantity < 0) {
      return NextResponse.json(
        { success: false, error: '库存不能为负数' },
        { status: 400 }
      );
    }

    // 更新库存
    const { data: updatedInventory, error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity_on_hand: newQuantity,
        quantity_allocated: newAllocated,
        last_restocked_at: operation === 'add' ? new Date().toISOString() : currentInventory.last_restocked_at,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId || 'main')
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 检查库存预警
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    let eventType = null;
    let severity = 'info';

    if (updatedInventory.quantity_available <= 0) {
      eventType = 'out_of_stock';
      severity = 'critical';
    } else if (updatedInventory.quantity_available <= product.min_stock_level) {
      eventType = 'low_stock';
      severity = 'error';
    }

    if (eventType) {
      await supabase
        .from('supply_chain_events')
        .insert({
          event_type: eventType,
          entity_type: 'product',
          entity_id: productId,
          description: `产品 ${product.name} 库存预警：当前库存 ${updatedInventory.quantity_available}`,
          severity,
          metadata: {
            quantity: updatedInventory.quantity_available,
            minStock: product.min_stock_level,
            reorderPoint: product.reorder_point
          }
        });
    }

    return NextResponse.json({
      success: true,
      inventory: updatedInventory,
      message: '库存更新成功'
    });

  } catch (error: any) {
    console.error('更新库存失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE 删除库存记录
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const warehouseId = searchParams.get('warehouseId') || 'main';

    if (!productId) {
      return NextResponse.json(
        { success: false, error: '产品ID不能为空' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '库存记录删除成功'
    });

  } catch (error: any) {
    console.error('删除库存失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 辅助函数：获取最小库存阈值
async function getMinStockThreshold(supabase: any, category?: string | null): Promise<number> {
  if (category) {
    const { data } = await supabase
      .from('products')
      .select('min_stock_level')
      .eq('category', category)
      .limit(1);
    return data?.[0]?.min_stock_level || 0;
  }
  return 0;
}

// 辅助函数：获取补货点阈值
async function getReorderPointThreshold(supabase: any, category?: string | null): Promise<number> {
  if (category) {
    const { data } = await supabase
      .from('products')
      .select('reorder_point')
      .eq('category', category)
      .limit(1);
    return data?.[0]?.reorder_point || 100;
  }
  return 100;
}

// 辅助函数：获取最大库存阈值
async function getMaxStockThreshold(supabase: any, category?: string | null): Promise<number> {
  if (category) {
    const { data } = await supabase
      .from('products')
      .select('max_stock_level')
      .eq('category', category)
      .limit(1);
    return data?.[0]?.max_stock_level || 1000;
  }
  return 1000;
}
