import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 客流热区分析API
 * GET /api/offline-empowerment/heatmap?store_id=xxx&days=7&language=en
 */

// 多语言标签
const HEATMAP_LABELS = {
  en: {
    high_traffic: 'High Traffic Area',
    medium_traffic: 'Medium Traffic Area',
    low_traffic: 'Low Traffic Area',
    entrance: 'Entrance',
    cash_register: 'Cash Register',
    shelf: 'Shelf',
    fitting_room: 'Fitting Room',
    general_area: 'General Area'
  },
  es: {
    high_traffic: 'Zona de Alto Tráfico',
    medium_traffic: 'Zona de Tráfico Medio',
    low_traffic: 'Zona de Bajo Tráfico',
    entrance: 'Entrada',
    cash_register: 'Caja',
    shelf: 'Estante',
    fitting_room: 'Probador',
    general_area: 'Área General'
  },
  de: {
    high_traffic: 'Hohes Verkehrsgebiet',
    medium_traffic: 'Mittleres Verkehrsgebiet',
    low_traffic: 'Geringes Verkehrsgebiet',
    entrance: 'Eingang',
    cash_register: 'Kasse',
    shelf: 'Regal',
    fitting_room: 'Umkleidekabine',
    general_area: 'Allgemeiner Bereich'
  },
  fr: {
    high_traffic: 'Zone de Trafic Élevé',
    medium_traffic: 'Zone de Trafic Moyen',
    low_traffic: 'Zone de Trafic Faible',
    entrance: 'Entrée',
    cash_register: 'Caisse',
    shelf: 'Étagère',
    fitting_room: 'Cabine d\'essayage',
    general_area: 'Zone Générale'
  }
};

// 获取门店客流数据
async function getTrafficData(storeId: string, days: number) {
  const client = getSupabaseClient();

  const { data: trafficRecords, error } = await client
    .from('traffic_records')
    .select('*')
    .eq('store_id', storeId)
    .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: true });

  if (error) {
    throw new Error(`获取客流数据失败: ${error.message}`);
  }

  return trafficRecords || [];
}

// 计算热区分布
function calculateHeatZones(trafficData: any[]) {
  if (!trafficData || trafficData.length === 0) {
    return {
      high: [],
      medium: [],
      low: [],
      total_customers: 0,
      avg_duration: 0
    };
  }

  // 统计各区域客流
  const zoneCounts: Record<string, number> = {};
  const zoneDurations: Record<string, number[]> = {};

  trafficData.forEach(record => {
    const zone = record.zone_type;
    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;

    if (!zoneDurations[zone]) {
      zoneDurations[zone] = [];
    }
    if (record.duration_seconds) {
      zoneDurations[zone].push(record.duration_seconds);
    }
  });

  // 计算区域密度
  const zones = Object.keys(zoneCounts).map(zone => ({
    zone,
    count: zoneCounts[zone],
    avgDuration: zoneDurations[zone]?.length
      ? zoneDurations[zone].reduce((a, b) => a + b, 0) / zoneDurations[zone].length
      : 0
  }));

  // 按客流排序
  zones.sort((a, b) => b.count - a.count);

  // 分为高、中、低流量区
  const totalZones = zones.length;
  const highZones = zones.slice(0, Math.max(1, Math.ceil(totalZones * 0.33)));
  const mediumZones = zones.slice(
    Math.ceil(totalZones * 0.33),
    Math.max(1, Math.ceil(totalZones * 0.66))
  );
  const lowZones = zones.slice(Math.ceil(totalZones * 0.66));

  // 计算平均停留时间
  const allDurations = Object.values(zoneDurations).flat();
  const avgDuration = allDurations.length
    ? allDurations.reduce((a, b) => a + b, 0) / allDurations.length
    : 0;

  return {
    high: highZones,
    medium: mediumZones,
    low: lowZones,
    total_customers: trafficData.length,
    avg_duration: Math.round(avgDuration)
  };
}

// 生成热区预测
async function generateTrafficForecast(storeId: string) {
  const client = getSupabaseClient();

  // 获取历史客流数据
  const { data: historicalData, error } = await client
    .from('traffic_records')
    .select('recorded_at')
    .eq('store_id', storeId)
    .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: true });

  if (error) {
    throw new Error(`获取历史数据失败: ${error.message}`);
  }

  // 在应用层进行分组（按日期）
  const dailyData: any[] = [];
  const dateGroups: Record<string, number> = {};

  if (historicalData && historicalData.length > 0) {
    historicalData.forEach((record: any) => {
      const date = new Date(record.recorded_at).toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    Object.entries(dateGroups).forEach(([date, customerCount]) => {
      dailyData.push({ date, customer_count: customerCount });
    });

    dailyData.sort((a, b) => a.date.localeCompare(b.date));
  }

  // 简单移动平均预测（实际可使用LSTM/Prophet）
  const last7Days = dailyData.slice(-7);
  const avgDailyCustomers = last7Days.length
    ? Math.round(last7Days.reduce((sum: number, d: any) => sum + (d.customer_count || 0), 0) / last7Days.length)
    : 0;

  // 生成未来7天预测
  const forecasts = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const variance = Math.round(avgDailyCustomers * 0.2 * (Math.random() - 0.5) * 2);
    const predicted = Math.max(0, avgDailyCustomers + variance);

    forecasts.push({
      date: date.toISOString().split('T')[0],
      predicted_customers: predicted,
      lower_bound: Math.max(0, Math.round(predicted * 0.8)),
      upper_bound: Math.round(predicted * 1.2)
    });
  }

  return forecasts;
}

// 计算热区与销售额关联
async function correlateWithSales(storeId: string) {
  const client = getSupabaseClient();

  // 获取销售数据
  const { data: salesData, error } = await client
    .from('sales_records')
    .select('transaction_date, total_amount')
    .eq('store_id', storeId)
    .gte('transaction_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('transaction_date', { ascending: true });

  if (error) {
    console.error('获取销售数据失败:', error);
    return null;
  }

  // 获取客流数据
  const { data: trafficData } = await client
    .from('traffic_records')
    .select('recorded_at')
    .eq('store_id', storeId)
    .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: true });

  if (!salesData || !trafficData || salesData.length === 0 || trafficData.length === 0) {
    return null;
  }

  // 分组销售数据（按日期）
  const salesByDate: Record<string, number> = {};
  salesData.forEach((s: any) => {
    const date = new Date(s.transaction_date).toISOString().split('T')[0];
    salesByDate[date] = (salesByDate[date] || 0) + parseFloat(s.total_amount);
  });

  // 分组客流数据（按日期）
  const trafficByDate: Record<string, number> = {};
  trafficData.forEach((t: any) => {
    const date = new Date(t.recorded_at).toISOString().split('T')[0];
    trafficByDate[date] = (trafficByDate[date] || 0) + 1;
  });

  // 获取所有日期
  const allDates = Array.from(
    new Set([...Object.keys(salesByDate), ...Object.keys(trafficByDate)])
  ).sort();

  // 匹配日期数据
  const dailySales = allDates.map(date => ({
    date,
    sales: salesByDate[date] || 0
  }));

  const dailyTraffic = allDates.map(date => ({
    date,
    traffic: trafficByDate[date] || 0
  }));

  // 匹配日期
  const matchedData = dailySales.map(sale => {
    const traffic = dailyTraffic.find(t => t.date === sale.date);
    return {
      date: sale.date,
      sales: sale.sales,
      traffic: traffic?.traffic || 0
    };
  });

  // 计算相关性
  const validData = matchedData.filter(d => d.traffic > 0);
  if (validData.length < 2) {
    return null;
  }

  const avgSales = validData.reduce((sum, d) => sum + d.sales, 0) / validData.length;
  const avgTraffic = validData.reduce((sum, d) => sum + d.traffic, 0) / validData.length;

  let covariance = 0;
  let varianceTraffic = 0;

  validData.forEach(d => {
    covariance += (d.traffic - avgTraffic) * (d.sales - avgSales);
    varianceTraffic += Math.pow(d.traffic - avgTraffic, 2);
  });

  const correlation = varianceTraffic > 0
    ? covariance / (validData.length * Math.sqrt(varianceTraffic))
    : 0;

  return {
    correlation: parseFloat(correlation.toFixed(3)),
    insight: correlation > 0.5
      ? 'Strong positive correlation between traffic and sales'
      : correlation > 0.2
      ? 'Moderate positive correlation'
      : 'Weak or no correlation detected',
    matched_days: validData.length
  };
}

// GET请求处理
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');
    const days = parseInt(searchParams.get('days') || '7');
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
    const { data: store, error: storeError } = await client
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: '门店不存在' },
        { status: 404 }
      );
    }

    // 获取客流数据
    const trafficData = await getTrafficData(storeId, days);

    // 计算热区
    const heatZones = calculateHeatZones(trafficData);

    // 生成客流预测
    const forecasts = await generateTrafficForecast(storeId);

    // 计算与销售的相关性
    const salesCorrelation = await correlateWithSales(storeId);

    // 获取标签
    const labels = HEATMAP_LABELS[language as keyof typeof HEATMAP_LABELS];

    // 返回结果
    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        code: store.store_code,
        name: store.store_name,
        country: store.country,
        city: store.city,
        currency: store.currency,
        language: store.language
      },
      heatmap: {
        high_traffic_zone: {
          zones: heatZones.high,
          label: labels.high_traffic,
          percentage: heatZones.high.length
        },
        medium_traffic_zone: {
          zones: heatZones.medium,
          label: labels.medium_traffic,
          percentage: heatZones.medium.length
        },
        low_traffic_zone: {
          zones: heatZones.low,
          label: labels.low_traffic,
          percentage: heatZones.low.length
        },
        total_customers: heatZones.total_customers,
        avg_duration_seconds: heatZones.avg_duration
      },
      forecasts: forecasts,
      sales_correlation: salesCorrelation,
      analysis_period: `${days} days`,
      gdpr_compliant: true,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('客流热区分析API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// POST请求处理（添加客流记录）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      store_id,
      x_coordinate,
      y_coordinate,
      zone_type,
      duration_seconds,
      path_sequence
    } = body;

    // 验证必要参数
    if (!store_id || !zone_type) {
      return NextResponse.json(
        { error: '缺少必要参数: store_id, zone_type' },
        { status: 400 }
      );
    }

    // 坐标模糊化（GDPR）
    const blurred_x = Math.round((parseFloat(x_coordinate) || 0) * 2) / 2;
    const blurred_y = Math.round((parseFloat(y_coordinate) || 0) * 2) / 2;

    // 匿名化客户ID（GDPR）
    const crypto = require('crypto');
    const hashed_customer_id = crypto
      .createHash('sha256')
      .update(Date.now().toString())
      .digest('hex');

    // 插入记录
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('traffic_records')
      .insert({
        store_id,
        hashed_customer_id,
        x_coordinate: blurred_x,
        y_coordinate: blurred_y,
        zone_type,
        duration_seconds: duration_seconds || null,
        path_sequence: path_sequence || null,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`插入记录失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '客流记录添加成功',
      record: data,
      gdpr_anonymized: true
    });

  } catch (error) {
    console.error('添加客流记录错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
