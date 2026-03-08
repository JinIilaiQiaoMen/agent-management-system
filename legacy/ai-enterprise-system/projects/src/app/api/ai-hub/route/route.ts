import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import crypto from 'crypto';

/**
 * 模型智能路由API
 * 根据输入特征智能选择最合适的模型
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      task_type,
      input_text,
      input_tokens,
      complexity = 'medium',
      requires_reasoning = false,
      context_length = 'medium',
      max_tokens = 4000,
      requires_vision = false,
      requires_function_calling = false,
    } = body;

    const supabase = getSupabaseClient();

    // 1. 计算请求复杂度
    const estimatedTokens = input_tokens || estimateTokens(input_text);
    const actualComplexity = calculateComplexity({
      input_text,
      input_tokens: estimatedTokens,
      complexity,
      requires_reasoning,
    });

    // 2. 查找匹配的路由规则
    const { data: rules, error: rulesError } = await supabase
      .from('model_routing_rules')
      .select('*')
      .eq('task_type', task_type)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(10);

    if (rulesError) {
      throw new Error(`获取路由规则失败: ${rulesError.message}`);
    }

    // 获取所有模型提供商
    const { data: providers } = await supabase
      .from('model_providers')
      .select('*')
      .eq('is_active', true);

    // 3. 根据规则和条件选择最合适的模型
    let selectedRule = null;
    let selectedModel = null;
    let confidence = 0;
    let reason = '';

    if (rules && rules.length > 0) {
      for (const rule of (rules as any[])) {
        const conditions = rule.conditions || {};
        const matchResult = matchRuleConditions(conditions, {
          complexity: actualComplexity,
          max_tokens,
          requires_reasoning,
          context_length,
          estimated_tokens: estimatedTokens,
          requires_vision,
          requires_function_calling,
        });

        if (matchResult.match) {
          selectedRule = rule;
          // 查找对应的提供商
          const provider = (providers || []).find((p: any) => p.id === rule.model_provider_id);
          selectedModel = {
            provider_id: rule.model_provider_id,
            provider_name: provider?.provider_name,
            model_name: rule.model_name,
            model_display_name: provider?.provider_display_name,
            cost_per_1k_tokens: provider?.cost_per_1k_tokens,
            average_latency_ms: provider?.average_latency_ms,
            success_rate: provider?.success_rate,
          };
          confidence = matchResult.confidence;
          reason = matchResult.reason;
          break;
        }
      }
    }

    // 4. 如果没有匹配的规则，使用默认规则
    if (!selectedModel) {
      const { data: defaultProvider } = await supabase
        .from('model_providers')
        .select('*')
        .eq('is_active', true)
        .eq('health_status', 'healthy')
        .order('priority', { ascending: true })
        .limit(1)
        .single();

      if (defaultProvider) {
        selectedModel = {
          provider_id: defaultProvider.id,
          provider_name: defaultProvider.provider_name,
          model_name: 'default-model',
          model_display_name: defaultProvider.provider_display_name,
          cost_per_1k_tokens: defaultProvider.cost_per_1k_tokens,
          average_latency_ms: defaultProvider.average_latency_ms,
          success_rate: defaultProvider.success_rate,
        };
        reason = '使用默认模型（无匹配的路由规则）';
        confidence = 0.5;
      } else {
        throw new Error('没有可用的模型提供商');
      }
    }

    // 5. 计算预估成本
    const estimatedCost = calculateEstimatedCost(estimatedTokens, max_tokens, selectedModel.cost_per_1k_tokens);

    // 6. 记录路由决策日志
    const requestId = `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await supabase.from('routing_decision_logs').insert({
      request_id: requestId,
      task_type,
      input_text: input_text?.substring(0, 500),
      input_tokens: estimatedTokens,
      selected_model_provider_id: selectedModel.provider_id,
      selected_model_name: selectedModel.model_name,
      routing_rule_id: selectedRule?.id,
      routing_reason: reason,
      alternative_models: rules?.map((r: any) => ({
        rule: r.rule_name,
        model: r.model_name,
        priority: r.priority,
      })),
      routing_confidence: confidence,
    });

    return NextResponse.json({
      success: true,
      request_id: requestId,
      task_type,
      complexity: actualComplexity,
      estimated_tokens: estimatedTokens,
      selected_model: selectedModel,
      routing_rule: selectedRule
        ? {
            id: selectedRule.id,
            name: selectedRule.rule_name,
            description: selectedRule.rule_description,
            cache_enabled: selectedRule.cache_enabled,
            cache_ttl_seconds: selectedRule.cache_ttl_seconds,
          }
        : null,
      routing_confidence: confidence,
      routing_reason: reason,
      estimated_cost: estimatedCost,
      fallback_model: selectedRule?.fallback_model_name
        ? {
            provider_name: selectedRule.fallback_provider_id,
            model_name: selectedRule.fallback_model_name,
          }
        : null,
    });
  } catch (error: any) {
    console.error('模型路由错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '模型路由失败',
      },
      { status: 500 }
    );
  }
}

// 估算token数量
function estimateTokens(text: string): number {
  if (!text) return 0;
  // 简单估算：英文约4字符/token，中文约1.5字符/token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}

// 计算复杂度
function calculateComplexity(params: {
  input_text?: string;
  input_tokens: number;
  complexity?: string;
  requires_reasoning?: boolean;
}): 'low' | 'medium' | 'high' {
  if (params.complexity && params.complexity !== 'medium') {
    return params.complexity as 'low' | 'medium' | 'high';
  }

  let score = 0;
  if (params.requires_reasoning) score += 30;
  if (params.input_tokens > 2000) score += 30;
  else if (params.input_tokens > 500) score += 15;
  if (params.input_text && params.input_text.length > 1000) score += 20;

  if (score >= 50) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

// 匹配路由规则条件
function matchRuleConditions(
  conditions: any,
  params: {
    complexity: string;
    max_tokens: number;
    requires_reasoning: boolean;
    context_length: string;
    estimated_tokens: number;
    requires_vision?: boolean;
    requires_function_calling?: boolean;
  }
): { match: boolean; confidence: number; reason: string } {
  let confidence = 0;
  let reasons: string[] = [];

  // 检查复杂度
  if (conditions.complexity && conditions.complexity !== params.complexity) {
    return { match: false, confidence: 0, reason: `复杂度不匹配: 需要${conditions.complexity}, 实际${params.complexity}` };
  }
  if (conditions.complexity) {
    confidence += 30;
    reasons.push(`复杂度匹配: ${params.complexity}`);
  }

  // 检查max_tokens
  if (conditions.max_tokens && params.estimated_tokens > conditions.max_tokens) {
    return { match: false, confidence: 0, reason: `超出最大tokens限制: 需要${conditions.max_tokens}, 实际${params.estimated_tokens}` };
  }
  if (conditions.max_tokens) {
    confidence += 20;
    reasons.push(`tokens限制匹配`);
  }

  // 检查推理需求
  if (conditions.requires_reasoning !== undefined && conditions.requires_reasoning !== params.requires_reasoning) {
    return { match: false, confidence: 0, reason: `推理需求不匹配` };
  }
  if (conditions.requires_reasoning !== undefined) {
    confidence += 25;
    reasons.push(`推理需求匹配`);
  }

  // 检查上下文长度
  if (conditions.context_length) {
    const contextOrder = { short: 0, medium: 1, long: 2, very_long: 3 };
    const requiredLevel = contextOrder[conditions.context_length as keyof typeof contextOrder] ?? 1;
    const actualLevel = contextOrder[params.context_length as keyof typeof contextOrder] ?? 1;

    if (actualLevel < requiredLevel) {
      return { match: false, confidence: 0, reason: `上下文长度不足: 需要${conditions.context_length}, 实际${params.context_length}` };
    }
    confidence += 15;
    reasons.push(`上下文长度匹配`);
  }

  confidence = Math.min(confidence, 100);
  return { match: true, confidence, reason: reasons.join(', ') };
}

// 计算预估成本
function calculateEstimatedCost(
  inputTokens: number,
  maxOutputTokens: number,
  costPer1kTokens: number
): number {
  return ((inputTokens + maxOutputTokens) / 1000) * costPer1kTokens;
}
