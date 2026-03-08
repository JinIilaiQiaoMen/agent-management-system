import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * AI远程巡店API
 * GET /api/offline-empowerment/store-audit?store_id=xxx&language=en
 * POST /api/offline-empowerment/store-audit - 创建巡店记录
 */

// 巡店违规类型标签
const AUDIT_VIOLATIONS = {
  en: {
    employee_without_badge: 'Employee without badge',
    shelf_not_organized: 'Shelf not organized',
    floor_not_clean: 'Floor not clean',
    product_misplaced: 'Product misplaced',
    cashier_absent: 'Cashier station unattended',
    display_not_maintained: 'Display not maintained'
  },
  es: {
    employee_without_badge: 'Empleado sin credencial',
    shelf_not_organized: 'Estante no organizado',
    floor_not_clean: 'Piso no limpio',
    product_misplaced: 'Producto mal colocado',
    cashier_absent: 'Caja desatendida',
    display_not_maintained: 'Exhibidor no mantenido'
  },
  de: {
    employee_without_badge: 'Mitarbeiter ohne Ausweis',
    shelf_not_organized: 'Regal nicht organisiert',
    floor_not_clean: 'Boden nicht sauber',
    product_misplaced: 'Produkt falsch platziert',
    cashier_absent: 'Kasse unbeaufsichtigt',
    display_not_maintained: 'Display nicht gepflegt'
  },
  fr: {
    employee_without_badge: 'Employé sans badge',
    shelf_not_organized: 'Étagère non organisée',
    floor_not_clean: 'Sol non propre',
    product_misplaced: 'Produit mal placé',
    cashier_absent: 'Caisse non surveillée',
    display_not_maintained: 'Présentation non entretenue'
  }
};

// 生成模拟巡店数据
function generateSimulatedAuditData(storeId: string, language: string) {
  const violationLabels = AUDIT_VIOLATIONS[language as keyof typeof AUDIT_VIOLATIONS];

  // 模拟检测到的违规
  const violationTypes = [
    'employee_without_badge',
    'shelf_not_organized',
    'floor_not_clean',
    'product_misplaced',
    'cashier_absent'
  ];

  const detectedViolations: any[] = [];

  // 随机生成2-5个违规
  const violationCount = Math.floor(Math.random() * 4) + 2;

  for (let i = 0; i < violationCount; i++) {
    const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)];

    // 确保不重复
    if (!detectedViolations.find(v => v.violation_type === violationType)) {
      const severityOptions = ['low', 'medium', 'high', 'critical'];
      const severity = severityOptions[Math.floor(Math.random() * severityOptions.length)];

      detectedViolations.push({
        violation_type: violationType,
        violation_label: violationLabels[violationType as keyof typeof violationLabels] || violationType,
        violation_severity: severity,
        description: `${violationLabels[violationType as keyof typeof violationLabels]} detected during AI analysis`,
        location_in_store: ['entrance', 'shelf_a', 'shelf_b', 'cash_register', 'general_area'][Math.floor(Math.random() * 5)],
        detected_at: new Date().toISOString()
      });
    }
  }

  // 计算得分（违规越少、严重程度越低，得分越高）
  const severityWeights = { low: 5, medium: 10, high: 20, critical: 40 };
  const totalDeduction = detectedViolations.reduce(
    (sum, v) => sum + severityWeights[v.violation_severity as keyof typeof severityWeights],
    0
  );
  const score = Math.max(0, 100 - totalDeduction);

  // 计算评级
  let grade;
  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 85) grade = 'B+';
  else if (score >= 80) grade = 'B';
  else if (score >= 75) grade = 'C+';
  else if (score >= 70) grade = 'C';
  else grade = 'D';

  return {
    score: parseFloat(score.toFixed(2)),
    grade,
    total_violations: detectedViolations.length,
    violations: detectedViolations,
    frames_analyzed: Math.floor(Math.random() * 100) + 50
  };
}

// 生成巡店建议
function generateAuditRecommendations(violations: any[], language: string) {
  const recommendations = [];

  for (const violation of violations) {
    let priority = 'low';
    let action = '';

    if (violation.violation_severity === 'critical') {
      priority = 'critical';
      action = `立即整改：${violation.violation_label}`;
    } else if (violation.violation_severity === 'high') {
      priority = 'high';
      action = `24小时内整改：${violation.violation_label}`;
    } else if (violation.violation_severity === 'medium') {
      priority = 'medium';
      action = `一周内整改：${violation.violation_label}`;
    } else {
      priority = 'low';
      action = `优化建议：${violation.violation_label}`;
    }

    recommendations.push({
      priority,
      issue: violation.violation_label,
      action_required: action,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending'
    });
  }

  return recommendations;
}

// GET请求处理
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');
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

    // 获取历史巡店记录
    const { data: historicalAudits, error } = await client
      .from('store_audits')
      .select('*')
      .eq('store_id', storeId)
      .order('audit_date', { ascending: false })
      .limit(10);

    // 生成实时巡店数据（模拟AI分析）
    const simulatedData = generateSimulatedAuditData(storeId, language);

    // 生成建议
    const recommendations = generateAuditRecommendations(simulatedData.violations, language);

    // 计算趋势（最近7次巡店的平均分）
    const recentScores = historicalAudits
      ?.slice(0, 7)
      .map(a => a.overall_score)
      .filter(s => s !== null) as number[] || [];

    const averageScore = recentScores.length > 0
      ? parseFloat((recentScores.reduce((a, b) => a + b, 0) / recentScores.length).toFixed(2))
      : simulatedData.score;

    const trend = recentScores.length > 0
      ? (simulatedData.score - recentScores[0]) > 0 ? 'improving' : 'declining'
      : 'stable';

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.store_name,
        country: store.country,
        city: store.city
      },
      current_audit: {
        audit_date: new Date().toISOString().split('T')[0],
        audit_time: new Date().toISOString().split('T')[1].substring(0, 5),
        overall_score: simulatedData.score,
        grade: simulatedData.grade,
        total_violations: simulatedData.total_violations,
        frames_analyzed: simulatedData.frames_analyzed,
        violations: simulatedData.violations,
        recommendations: recommendations
      },
      performance_trend: {
        average_score: averageScore,
        trend: trend,
        historical_audits: historicalAudits?.slice(0, 5).map(a => ({
          date: a.audit_date,
          score: a.overall_score,
          grade: a.grade,
          violations_count: a.total_violations
        })) || []
      },
      gdpr_compliant: true,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI远程巡店API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// POST请求处理（创建巡店记录）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      store_id,
      audit_type,
      auditor_id,
      overall_score,
      grade,
      total_violations,
      violations,
      recommendations
    } = body;

    // 验证必要参数
    if (!store_id) {
      return NextResponse.json(
        { error: '缺少必要参数: store_id' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 创建巡店记录
    const { data: audit, error: auditError } = await client
      .from('store_audits')
      .insert({
        store_id,
        audit_date: new Date().toISOString().split('T')[0],
        audit_time: new Date().toISOString().split('T')[1].substring(0, 8),
        auditor_id: auditor_id || null,
        audit_type: audit_type || 'ai_remote',
        overall_score: overall_score || 0,
        grade: grade || 'D',
        total_violations: total_violations || 0,
        frames_analyzed: 100,
        gdpr_compliant: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (auditError) {
      throw new Error(`创建巡店记录失败: ${auditError.message}`);
    }

    // 如果有违规，插入违规记录
    if (violations && violations.length > 0) {
      for (const violation of violations) {
        await client.from('audit_violations').insert({
          audit_id: audit.id,
          violation_type: violation.violation_type,
          violation_severity: violation.violation_severity,
          description: violation.description,
          location_in_store: violation.location_in_store,
          status: 'open',
          created_at: new Date().toISOString()
        });
      }
    }

    // 如果有建议，插入建议记录
    if (recommendations && recommendations.length > 0) {
      for (const recommendation of recommendations) {
        await client.from('audit_recommendations').insert({
          audit_id: audit.id,
          priority: recommendation.priority,
          issue: recommendation.issue,
          action_required: recommendation.action_required,
          deadline: recommendation.deadline || null,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '巡店记录创建成功',
      audit: audit,
      violations_count: violations?.length || 0,
      recommendations_count: recommendations?.length || 0
    });

  } catch (error) {
    console.error('创建巡店记录错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
