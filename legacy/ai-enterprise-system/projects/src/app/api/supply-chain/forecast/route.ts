import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET 获取爆品预测列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // 预测周期（天）
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = getSupabaseClient();

    // 获取最近的销售数据
    const { data: salesData } = await supabase
      .from('sales_order_items')
      .select(`
        product_id,
        products!inner(sku, name, category, unit_cost, selling_price),
        quantity,
        sales_orders(order_date)
      `)
      .gte('sales_orders.order_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('sales_orders(order_date)', { ascending: false })
      .limit(100);

    // 按产品聚合销售数据
    const productSales = new Map<string, any>();

    salesData?.forEach((item: any) => {
      const productId = item.product_id;
      const productName = item.products.name;
      const sku = item.products.sku;
      const category = item.products.category;
      const unitCost = item.products.unit_cost;
      const sellingPrice = item.products.selling_price;

      if (!productSales.has(productId)) {
        productSales.set(productId, {
          productId,
          productName,
          sku,
          category,
          unitCost,
          sellingPrice,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
          salesHistory: []
        });
      }

      const product = productSales.get(productId);
      product.totalQuantity += item.quantity;
      product.totalRevenue += item.quantity * sellingPrice;
      product.orderCount += 1;
      product.salesHistory.push({
        date: item.sales_orders.order_date,
        quantity: item.quantity
      });
    });

    // 获取库存数据
    const { data: inventoryData } = await supabase
      .from('inventory_alerts')
      .select('*')
      .limit(100);

    // 合并库存数据
    const inventoryMap = new Map();
    inventoryData?.forEach((inv: any) => {
      inventoryMap.set(inv.product_id, inv);
    });

    // 获取已有的预测数据
    const { data: existingForecasts } = await supabase
      .from('demand_forecasts')
      .select('*')
      .gte('forecast_date', new Date().toISOString().split('T')[0])
      .order('forecast_date', { ascending: false });

    // 生成预测列表
    const forecasts = Array.from(productSales.values()).map((product) => {
      const inventory = inventoryMap.get(product.productId);
      const existingForecast = existingForecasts?.find((f: any) => f.product_id === product.productId);

      // 计算趋势
      const salesTrend = product.salesHistory.length >= 2
        ? (product.salesHistory[0].quantity - product.salesHistory[product.salesHistory.length - 1].quantity) / product.salesHistory.length
        : 0;

      // 计算爆品分数（综合多个因素）
      const trendScore = salesTrend > 0 ? Math.min(salesTrend * 10, 50) : 0;
      const volumeScore = Math.min(product.totalQuantity / 20, 30);
      const profitScore = ((product.sellingPrice - product.unitCost) / product.sellingPrice) * 20;
      const stockScore = inventory && inventory.quantity_available < inventory.reorder_point ? 20 : 0;

      const hotProductScore = trendScore + volumeScore + profitScore + stockScore;

      return {
        productId: product.productId,
        productName: product.productName,
        sku: product.sku,
        category: product.category,
        currentStock: inventory?.quantity_available || 0,
        reorderPoint: inventory?.reorder_point || 0,
        totalSales90Days: product.totalQuantity,
        totalRevenue90Days: product.totalRevenue,
        orderCount90Days: product.orderCount,
        salesTrend: salesTrend.toFixed(2),
        predictedDemand30Days: existingForecast?.predicted_quantity || Math.round(product.totalQuantity / 3),
        predictedDemand90Days: Math.round(product.totalQuantity * 1.2),
        hotProductScore: Math.round(hotProductScore),
        confidenceLevel: existingForecast?.confidence_level || 'medium',
        riskLevel: inventory?.alert_level || 'normal',
        recommendation: generateRecommendation(hotProductScore, inventory?.alert_level)
      };
    });

    // 按爆品分数排序
    forecasts.sort((a, b) => b.hotProductScore - a.hotProductScore);

    return NextResponse.json({
      success: true,
      forecasts: forecasts.slice(0, limit),
      total: forecasts.length,
      period: `${period}天`,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('获取爆品预测失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST 生成新的预测
export async function POST(request: NextRequest) {
  try {
    const { productId, period = 30 } = await request.json();

    const supabase = getSupabaseClient();

    // 获取产品信息
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!product) {
      return NextResponse.json(
        { success: false, error: '产品不存在' },
        { status: 404 }
      );
    }

    // 获取历史销售数据
    const { data: salesHistory } = await supabase
      .from('sales_order_items')
      .select(`
        quantity,
        sales_orders(order_date)
      `)
      .eq('product_id', productId)
      .gte('sales_orders.order_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('sales_orders(order_date)', { ascending: true });

    // 构建分析数据
    const salesData = salesHistory?.map((item: any) => ({
      date: item.sales_orders.order_date,
      quantity: item.quantity
    })) || [];

    // 使用 AI 进行预测分析
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的供应链分析师，擅长需求预测和爆品识别。
你的任务是基于历史销售数据，预测未来需求并分析产品的爆品潜力。

分析维度：
1. 销售趋势分析（增长/下降/稳定）
2. 季节性因素识别
3. 市场需求预测
4. 爆品潜力评估
5. 库存建议

输出格式要求（纯JSON）：
{
  "trend": "increasing|decreasing|stable",
  "trendDescription": "趋势描述",
  "predictedQuantity": 预测数量（整数）,
  "confidenceLevel": "high|medium|low",
  "confidenceScore": 置信度分数（0-100）,
  "factors": ["影响因素1", "影响因素2"],
  "riskAssessment": "风险评估",
  "recommendation": "库存建议",
  "marketOutlook": "市场展望"
}`;

    const userPrompt = `请分析以下产品的销售数据并预测未来 ${period} 天的需求：

产品信息：
- SKU: ${product.sku}
- 名称: ${product.name}
- 类别: ${product.category}
- 单价: ${product.selling_price} 元
- 成本: ${product.unit_cost} 元
- 交货周期: ${product.lead_time_days} 天

历史销售数据（最近6个月）：
${JSON.stringify(salesData.slice(-30), null, 2)}

请基于以上数据进行详细分析。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.5,
      caching: 'disabled'
    });

    // 解析 AI 响应
    let aiAnalysis;
    try {
      // 提取 JSON 部分
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      aiAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : response.content);
    } catch (e) {
      aiAnalysis = {
        trend: 'stable',
        trendDescription: '分析中',
        predictedQuantity: 100,
        confidenceLevel: 'medium',
        confidenceScore: 70,
        factors: ['历史数据'],
        riskAssessment: '中等',
        recommendation: '保持当前库存水平',
        marketOutlook: '稳定'
      };
    }

    // 计算预测区间
    const startDate = new Date();
    const endDate = new Date(Date.now() + period * 24 * 60 * 60 * 1000);

    // 保存预测结果
    const { data: forecastData, error: forecastError } = await supabase
      .from('demand_forecasts')
      .insert({
        product_id: productId,
        forecast_date: new Date().toISOString().split('T')[0],
        forecast_period_start: startDate.toISOString().split('T')[0],
        forecast_period_end: endDate.toISOString().split('T')[0],
        predicted_quantity: aiAnalysis.predictedQuantity,
        confidence_level: aiAnalysis.confidenceLevel,
        forecast_method: 'ai',
        metadata: {
          aiAnalysis,
          historicalSalesCount: salesHistory?.length || 0
        }
      })
      .select()
      .single();

    if (forecastError) {
      console.error('保存预测失败:', forecastError);
    }

    // 记录事件
    await supabase
      .from('supply_chain_events')
      .insert({
        event_type: 'forecast_updated',
        entity_type: 'product',
        entity_id: productId,
        description: `生成产品 ${product.name} 的需求预测：${aiAnalysis.predictedQuantity} 件`,
        severity: aiAnalysis.confidenceLevel === 'low' ? 'warning' : 'info',
        metadata: {
          prediction: aiAnalysis,
          period
        }
      });

    return NextResponse.json({
      success: true,
      forecast: {
        productId,
        productName: product.name,
        sku: product.sku,
        period: `${period}天`,
        ...aiAnalysis,
        forecastId: forecastData?.id,
        forecastDate: forecastData?.created_at
      }
    });

  } catch (error: any) {
    console.error('生成预测失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 辅助函数：生成建议
function generateRecommendation(score: number, alertLevel: string): string {
  if (score >= 70) {
    return '强烈建议：增加库存，准备迎接需求增长';
  } else if (score >= 50) {
    return '建议：保持适当库存水平，关注市场变化';
  } else if (alertLevel === 'critical' || alertLevel === 'out_of_stock') {
    return '紧急：立即补货，库存不足';
  } else if (alertLevel === 'low_stock') {
    return '注意：库存偏低，建议补货';
  } else {
    return '正常：当前库存充足';
  }
}
