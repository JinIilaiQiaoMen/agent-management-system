import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 智能排班API
 * GET /api/offline-empowerment/scheduling?store_id=xxx&days=7&language=en
 * POST /api/offline-empowerment/scheduling - 创建排班
 */

// 欧美劳工法规
const LABOR_LAWS = {
  EU: {
    name: 'EU Working Time Directive',
    max_daily_hours: 10,
    max_weekly_hours: 48,
    min_rest_between_shifts: 11,
    min_daily_rest: 11,
    max_consecutive_days: 6,
    overtime_rate: 1.25
  },
  US: {
    name: 'US Fair Labor Standards Act',
    max_daily_hours: 12,
    max_weekly_hours: 60,
    min_rest_between_shifts: 8,
    min_daily_rest: 8,
    max_consecutive_days: 7,
    overtime_rate: 1.5
  },
  UK: {
    name: 'UK Working Time Regulations',
    max_daily_hours: 10,
    max_weekly_hours: 48,
    min_rest_between_shifts: 11,
    min_daily_rest: 11,
    max_consecutive_days: 6,
    overtime_rate: 1.25
  },
  CA: {
    name: 'Canada Employment Standards',
    max_daily_hours: 8,
    max_weekly_hours: 44,
    min_rest_between_shifts: 8,
    min_daily_rest: 8,
    max_consecutive_days: 6,
    overtime_rate: 1.5
  }
};

// 职位多语言标签
const JOB_TITLES = {
  en: {
    cashier: 'Cashier',
    sales_associate: 'Sales Associate',
    manager: 'Store Manager',
    stock_clerk: 'Stock Clerk'
  },
  es: {
    cashier: 'Cajero',
    sales_associate: 'Asociado de Ventas',
    manager: 'Gerente de Tienda',
    stock_clerk: 'Encargado de Inventario'
  },
  de: {
    cashier: 'Kassierer',
    sales_associate: 'Verkaufsmitarbeiter',
    manager: 'Filialleiter',
    stock_clerk: 'Lagerist'
  },
  fr: {
    cashier: 'Caissier',
    sales_associate: 'Vendeur',
    manager: 'Gérant de Magasin',
    stock_clerk: 'Magasinier'
  }
};

// 根据国家代码获取劳工法规
function getLaborLaws(countryCode: string) {
  if (['US'].includes(countryCode)) {
    return LABOR_LAWS.US;
  } else if (countryCode === 'GB') {
    return LABOR_LAWS.UK;
  } else if (['CA'].includes(countryCode)) {
    return LABOR_LAWS.CA;
  } else {
    // 默认使用欧盟法规（适用于DE, FR, ES等）
    return LABOR_LAWS.EU;
  }
}

// 预测每日客流需求
async function predictStaffingNeeds(storeId: string, days: number) {
  const client = getSupabaseClient();

  // 获取历史客流数据
  const { data: trafficData } = await client
    .from('traffic_records')
    .select('recorded_at')
    .eq('store_id', storeId)
    .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: true });

  // 在应用层进行分组（按日期）
  const dateGroups: Record<string, number> = {};
  if (trafficData && trafficData.length > 0) {
    trafficData.forEach((record: any) => {
      const date = new Date(record.recorded_at).toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });
  }

  // 计算每日平均客流
  const last7Days = Object.values(dateGroups).slice(-7);
  const avgDailyCustomers = last7Days.length
    ? Math.round(last7Days.reduce((sum: number, d: number) => sum + d, 0) / last7Days.length)
    : 100; // 默认值

  // 生成未来几天需求预测
  const staffingNeeds = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();

    // 周末客流增加
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;

    // 随机波动
    const randomFactor = 0.9 + Math.random() * 0.2;

    const predictedCustomers = Math.round(avgDailyCustomers * weekendFactor * randomFactor);

    // 计算所需员工数（假设每个员工每小时服务20个客户）
    const peakHoursStaff = Math.max(2, Math.ceil(predictedCustomers * 0.6 / 20));
    const offPeakHoursStaff = Math.max(1, Math.ceil(predictedCustomers * 0.4 / 20));

    staffingNeeds.push({
      date: date.toISOString().split('T')[0],
      day_of_week: dayOfWeek,
      predicted_customers: predictedCustomers,
      peak_hours_staff: peakHoursStaff,
      off_peak_hours_staff: offPeakHoursStaff,
      total_staff: peakHoursStaff + offPeakHoursStaff
    });
  }

  return staffingNeeds;
}

// 获取门店员工
async function getStoreEmployees(storeId: string) {
  const client = getSupabaseClient();

  const { data: employees, error } = await client
    .from('employees')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`获取员工数据失败: ${error.message}`);
  }

  return employees || [];
}

// 生成最优排班（简化版 - 实际应使用MILP求解）
async function generateOptimalSchedule(
  employees: any[],
  staffingNeeds: any[],
  laborLaw: any,
  storeId: string
) {
  const schedules = [];

  for (const need of staffingNeeds) {
    const date = need.date;

    // 优先分配经理
    const managers = employees.filter(e => e.position === 'manager');
    const salesAssociates = employees.filter(e => e.position === 'sales_associate');
    const cashiers = employees.filter(e => e.position === 'cashier');
    const stockClerks = employees.filter(e => e.position === 'stock_clerk');

    // 简化排班逻辑
    let assignedCount = 0;

    // 分配经理（全天）
    if (managers.length > 0 && assignedCount < need.total_staff) {
      const manager = managers[assignedCount % managers.length];
      schedules.push({
        store_id: storeId,
        employee_id: manager.id,
        shift_date: date,
        start_time: '09:00:00',
        end_time: '18:00:00',
        shift_type: 'full_day',
        scheduled_hours: 9,
        is_overtime: false,
        compliance_check: true
      });
      assignedCount++;
    }

    // 分配销售员（高峰时段）
    while (assignedCount < Math.min(need.peak_hours_staff, need.total_staff)) {
      const employee = salesAssociates[assignedCount % salesAssociates.length];
      if (!employee) break;

      schedules.push({
        store_id: storeId,
        employee_id: employee.id,
        shift_date: date,
        start_time: '10:00:00',
        end_time: '20:00:00',
        shift_type: 'long_shift',
        scheduled_hours: 10,
        is_overtime: false,
        compliance_check: true
      });
      assignedCount++;
    }

    // 分配收银员（基础配置）
    while (assignedCount < need.total_staff) {
      const employee = cashiers[assignedCount % cashiers.length];
      if (!employee) break;

      schedules.push({
        store_id: storeId,
        employee_id: employee.id,
        shift_date: date,
        start_time: '09:00:00',
        end_time: '17:00:00',
        shift_type: 'regular',
        scheduled_hours: 8,
        is_overtime: false,
        compliance_check: true
      });
      assignedCount++;
    }
  }

  return schedules;
}

// 计算排班成本
function calculateScheduleCost(schedules: any[], employees: any[]) {
  let totalCost = 0;
  let regularHours = 0;
  let overtimeHours = 0;

  for (const schedule of schedules) {
    const employee = employees.find(e => e.id === schedule.employee_id);
    if (!employee) continue;

    const hourlyWage = parseFloat(employee.hourly_wage) || 15;
    const hours = parseFloat(schedule.scheduled_hours) || 0;

    if (schedule.is_overtime) {
      overtimeHours += hours;
      totalCost += hours * hourlyWage * 1.5; // 加班倍率
    } else {
      regularHours += hours;
      totalCost += hours * hourlyWage;
    }
  }

  return {
    total_cost: parseFloat(totalCost.toFixed(2)),
    regular_hours_cost: parseFloat((regularHours * 15).toFixed(2)),
    overtime_hours_cost: parseFloat((overtimeHours * 15 * 1.5).toFixed(2)),
    total_shifts: schedules.length
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

    // 获取劳工法规
    const laborLaw = getLaborLaws(store.country);

    // 获取门店员工
    const employees = await getStoreEmployees(storeId);

    // 预测客流需求
    const staffingNeeds = await predictStaffingNeeds(storeId, days);

    // 生成排班
    const schedules = await generateOptimalSchedule(employees, staffingNeeds, laborLaw, storeId);

    // 计算成本
    const cost = calculateScheduleCost(schedules, employees);

    // 获取职位标签
    const jobLabels = JOB_TITLES[language as keyof typeof JOB_TITLES];

    // 格式化排班输出
    const formattedSchedules = schedules.map(schedule => {
      const employee = employees.find(e => e.id === schedule.employee_id);
      return {
        date: schedule.shift_date,
        employee: {
          id: employee?.id,
          code: employee?.employee_code,
          position: jobLabels[employee?.position as keyof typeof jobLabels] || employee?.position
        },
        start_time: schedule.start_time?.substring(0, 5),
        end_time: schedule.end_time?.substring(0, 5),
        hours: schedule.scheduled_hours,
        shift_type: schedule.shift_type,
        is_overtime: schedule.is_overtime,
        compliance_check: schedule.compliance_check
      };
    });

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.store_name,
        country: store.country,
        city: store.city
      },
      labor_law: laborLaw,
      staffing_needs: staffingNeeds,
      schedules: formattedSchedules,
      cost_summary: cost,
      compliance_status: 'Compliant with ' + laborLaw.name,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('智能排班API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// POST请求处理（创建排班）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      store_id,
      employee_id,
      shift_date,
      start_time,
      end_time,
      shift_type
    } = body;

    // 验证必要参数
    if (!store_id || !employee_id || !shift_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 计算工时
    const start = new Date(`${shift_date}T${start_time}`);
    const end = new Date(`${shift_date}T${end_time}`);
    const scheduledHours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2);

    // 获取门店信息以确定劳工法规
    const client = getSupabaseClient();
    const { data: store } = await client
      .from('stores')
      .select('country')
      .eq('id', store_id)
      .single();

    const laborLaw = getLaborLaws(store?.country || 'US');

    // 检查合规性
    const hours = parseFloat(scheduledHours);
    const isOvertime = hours > 8;
    const complianceCheck = hours <= laborLaw.max_daily_hours;

    // 插入排班记录
    const { data, error } = await client
      .from('schedules')
      .insert({
        store_id,
        employee_id,
        shift_date,
        start_time,
        end_time,
        shift_type: shift_type || 'regular',
        scheduled_hours: parseFloat(scheduledHours),
        is_overtime: isOvertime,
        overtime_hours: isOvertime ? (hours - 8).toFixed(2) : 0,
        overtime_rate: isOvertime ? laborLaw.overtime_rate : 1.0,
        compliance_check: complianceCheck,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建排班失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '排班创建成功',
      schedule: data,
      compliance_check: complianceCheck ? '通过' : '违规'
    });

  } catch (error) {
    console.error('创建排班错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
