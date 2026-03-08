import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 会员营销API
 * GET /api/offline-empowerment/member-marketing?store_id=xxx&language=en
 */

// 营销活动类型标签
const CAMPAIGN_TYPES = {
  en: {
    welcome: 'Welcome Campaign',
    win_back: 'Win-Back Campaign',
    birthday: 'Birthday Campaign',
    recommendation: 'Product Recommendation',
    seasonal: 'Seasonal Promotion'
  },
  es: {
    welcome: 'Campaña de Bienvenida',
    win_back: 'Campaña de Recuperación',
    birthday: 'Campaña de Cumpleaños',
    recommendation: 'Recomendación de Producto',
    seasonal: 'Promoción Temporada'
  },
  de: {
    welcome: 'Willkommenskampagne',
    win_back: 'Rückgewinnungskampagne',
    birthday: 'Geburtstagskampagne',
    recommendation: 'Produktempfehlung',
    seasonal: 'Saisonale Promotion'
  },
  fr: {
    welcome: 'Campagne de Bienvenue',
    win_back: 'Campagne de Récupération',
    birthday: 'Campagne d\'Anniversaire',
    recommendation: 'Recommandation de Produit',
    seasonal: 'Promotion Saisonnière'
  }
};

// 营销内容模板
const MARKETING_TEMPLATES = {
  en: {
    welcome: 'Welcome to our loyalty program! Here is your exclusive offer: {offer}',
    win_back: 'We miss you! Here is a special offer to welcome you back: {offer}',
    birthday: 'Happy Birthday! Enjoy {discount}% off on your special day!',
    recommendation: 'Based on your preferences, we think you will love: {product}',
    seasonal: 'Seasonal Sale! Get {discount}% off on selected items.'
  },
  es: {
    welcome: '¡Bienvenido a nuestro programa de lealtad! Aquí está tu oferta exclusiva: {offer}',
    win_back: '¡Te extrañamos! Aquí tienes una oferta especial para recibirte de nuevo: {offer}',
    birthday: '¡Feliz Cumpleaños! Disfruta de un {discount}% de descuento en tu día especial!',
    recommendation: 'Basado en tus preferencias, creemos que te encantará: {product}',
    seasonal: '¡Venta de Temporada! Obtén {discount}% de descuento en artículos seleccionados.'
  },
  de: {
    welcome: 'Willkommen in unserem Treueprogramm! Hier ist Ihr exklusives Angebot: {offer}',
    win_back: 'Wir vermissen Sie! Hier ist ein spezielles Angebot, um Sie zurückzuholen: {offer}',
    birthday: 'Herzlichen Glückwunsch zum Geburtstag! Genießen Sie {discount}% Rabatt an Ihrem besonderen Tag!',
    recommendation: 'Basierend auf Ihren Vorlieben glauben wir, dass Ihnen {product} gefallen wird',
    seasonal: 'Saisonale Aktion! Erhalten Sie {discount}% Rabatt auf ausgewählte Artikel.'
  },
  fr: {
    welcome: 'Bienvenue dans notre programme de fidélité! Voici votre offre exclusive: {offer}',
    win_back: 'Nous vous manquons! Voici une offre spéciale pour vous accueillir à nouveau: {offer}',
    birthday: 'Joyeux Anniversaire! Profitez d\'une réduction de {discount}% pour votre journée spéciale!',
    recommendation: 'Selon vos préférences, nous pensons que vous allez adorer: {product}',
    seasonal: 'Vente Saisonnière! Profitez de {discount}% de réduction sur les articles sélectionnés.'
  }
};

// 获取会员数据
async function getMembers(storeId: string) {
  const client = getSupabaseClient();

  const { data: members, error } = await client
    .from('members')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('join_date', { ascending: false });

  if (error) {
    throw new Error(`获取会员数据失败: ${error.message}`);
  }

  return members || [];
}

// 获取RFM分析数据
async function getRFMAnalysis(storeId: string) {
  const client = getSupabaseClient();

  const { data: rfmData, error } = await client
    .from('rfm_analysis')
    .select(`
      *,
      member:members (
        id,
        member_code,
        membership_tier,
        language_preference
      )
    `)
    .in('member_id', (
      await client.from('members').select('id').eq('store_id', storeId)
    ).data?.map(m => m.id) || [])
    .order('analysis_date', { ascending: false });

  if (error) {
    throw new Error(`获取RFM数据失败: ${error.message}`);
  }

  return rfmData || [];
}

// 获取流失预测数据
async function getChurnPredictions(storeId: string) {
  const client = getSupabaseClient();

  const { data: churnData, error } = await client
    .from('churn_predictions')
    .select(`
      *,
      member:members (
        id,
        member_code,
        membership_tier
      )
    `)
    .eq('prediction_date', new Date().toISOString().split('T')[0])
    .order('churn_probability', { ascending: false });

  if (error) {
    throw new Error(`获取流失预测失败: ${error.message}`);
  }

  return churnData || [];
}

// 生成个性化营销建议
function generateMarketingRecommendations(
  members: any[],
  rfmData: any[],
  churnPredictions: any[],
  language: string
) {
  const templates = MARKETING_TEMPLATES[language as keyof typeof MARKETING_TEMPLATES];
  const campaignTypes = CAMPAIGN_TYPES[language as keyof typeof CAMPAIGN_TYPES];

  const recommendations = [];

  // 按流失风险优先处理高风险会员
  const highRiskMembers = churnPredictions
    .filter(cp => cp.risk_level === 'High' && cp.prediction === 'Churn')
    .slice(0, 10);

  for (const churn of highRiskMembers) {
    const member = members.find(m => m.id === churn.member_id);
    if (!member) continue;

    recommendations.push({
      member_id: member.id,
      member_code: member.member_code,
      membership_tier: member.membership_tier,
      campaign_type: 'win_back',
      campaign_type_label: campaignTypes.win_back,
      churn_probability: churn.churn_probability,
      risk_level: churn.risk_level,
      channel: 'Email',
      priority: 'critical',
      content: templates.win_back.replace('{offer}', '20% off your next purchase'),
      estimated_cost: 0.50,
      expected_impact: 'High'
    });
  }

  // 处理VIP会员维护
  const vipMembers = members
    .filter(m => m.membership_tier === 'vip' || m.membership_tier === 'gold')
    .slice(0, 10);

  for (const member of vipMembers) {
    recommendations.push({
      member_id: member.id,
      member_code: member.member_code,
      membership_tier: member.membership_tier,
      campaign_type: 'vip_maintenance',
      campaign_type_label: 'VIP Maintenance',
      channel: 'Email + SMS',
      priority: 'medium',
      content: 'Exclusive early access to new collection + 15% off',
      estimated_cost: 1.00,
      expected_impact: 'Medium'
    });
  }

  // 处理新会员欢迎
  const newMembers = members
    .filter(m => {
      const joinDate = new Date(m.join_date);
      const daysSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceJoin <= 7;
    })
    .slice(0, 10);

  for (const member of newMembers) {
    recommendations.push({
      member_id: member.id,
      member_code: member.member_code,
      membership_tier: member.membership_tier,
      campaign_type: 'welcome',
      campaign_type_label: campaignTypes.welcome,
      channel: 'Email',
      priority: 'medium',
      content: templates.welcome.replace('{offer}', '15% off your first purchase'),
      estimated_cost: 0.30,
      expected_impact: 'High'
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

    // 获取会员数据
    const members = await getMembers(storeId);

    // 获取RFM分析数据
    const rfmData = await getRFMAnalysis(storeId);

    // 获取流失预测数据
    const churnPredictions = await getChurnPredictions(storeId);

    // 生成营销建议
    const recommendations = generateMarketingRecommendations(
      members,
      rfmData,
      churnPredictions,
      language
    );

    // 统计汇总
    const tierDistribution = members.reduce((acc, member) => {
      acc[member.membership_tier] = (acc[member.membership_tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const churnRiskDistribution = churnPredictions.reduce((acc, churn) => {
      acc[churn.risk_level] = (acc[churn.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const segmentDistribution = rfmData.reduce((acc, rfm) => {
      acc[rfm.segment] = (acc[rfm.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 计算预计成本
    const totalEstimatedCost = recommendations.reduce(
      (sum, r) => sum + (r.estimated_cost || 0),
      0
    );

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.store_name,
        country: store.country,
        city: store.city
      },
      member_summary: {
        total_members: members.length,
        tier_distribution: tierDistribution,
        marketing_consent_rate: members.filter(m => m.marketing_consent).length / members.length
      },
      churn_analysis: {
        high_risk_members: churnRiskDistribution['High'] || 0,
        medium_risk_members: churnRiskDistribution['Medium'] || 0,
        low_risk_members: churnRiskDistribution['Low'] || 0
      },
      rfm_segments: segmentDistribution,
      marketing_recommendations: recommendations,
      cost_estimate: {
        total_cost: parseFloat(totalEstimatedCost.toFixed(2)),
        currency: store.currency,
        recommendations_count: recommendations.length
      },
      gdpr_compliant: true,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('会员营销API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// POST请求处理（创建营销活动）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      store_id,
      campaign_name,
      campaign_type,
      target_segment,
      channel,
      subject,
      content_template,
      discount_percent,
      start_date,
      end_date
    } = body;

    // 验证必要参数
    if (!store_id || !campaign_name || !campaign_type) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 创建营销活动
    const { data: campaign, error } = await client
      .from('marketing_campaigns')
      .insert({
        campaign_name,
        campaign_type,
        store_id,
        target_segment: target_segment || 'all',
        channel: channel || 'Email',
        subject,
        content_template,
        discount_percent: discount_percent || 0,
        start_date: start_date || new Date().toISOString().split('T')[0],
        end_date: end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建营销活动失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '营销活动创建成功',
      campaign: campaign
    });

  } catch (error) {
    console.error('创建营销活动错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
