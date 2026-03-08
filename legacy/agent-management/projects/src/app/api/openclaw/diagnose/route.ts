import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import * as schema from '@/storage/database/shared/schema';

// POST - 诊断 OpenClaw 集成问题
export async function POST(request: NextRequest) {
  try {
    const db = await getDb(schema);

    // 获取 OpenClaw 配置
    const configs = await db.query.openclawConfigs.findMany({
      limit: 1,
    });

    if (configs.length === 0) {
      return NextResponse.json({
        success: false,
        status: 'not_configured',
        message: 'OpenClaw 未配置',
        recommendations: [
          '访问 /openclaw-integration 页面配置 OpenClaw',
          '填写正确的 Webhook URL 和 API Key',
        ],
      });
    }

    const config = configs[0];

    const diagnosticInfo = {
      configExists: true,
      webhookUrl: config.webhookUrl,
      apiKeyValid: config.apiKey ? true : false,
      autoTrigger: config.autoTrigger,
      notifyOnStart: config.notifyOnStart,
      notifyOnComplete: config.notifyOnComplete,
      notifyOnError: config.notifyOnError,
      systemUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
      apiEndpoints: {
        triggerTask: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/openclaw/trigger-task`,
        taskStatus: (taskId: string) => `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/openclaw/task-status/${taskId}`,
        testConnection: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/openclaw/test`,
      },
    };

    // 分析 Webhook URL
    const webhookAnalysis = analyzeWebhookUrl(config.webhookUrl);

    // 尝试测试连接
    let connectionTest = null;
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          message: 'OpenClaw 诊断测试',
        }),
      });

      connectionTest = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : '连接失败',
      };
    }

    return NextResponse.json({
      success: true,
      diagnosticInfo,
      webhookAnalysis,
      connectionTest,
      recommendations: generateRecommendations(diagnosticInfo, webhookAnalysis, connectionTest),
    });
  } catch (error) {
    console.error('OpenClaw 诊断失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '诊断失败',
      },
      { status: 500 }
    );
  }
}

function analyzeWebhookUrl(webhookUrl: string) {
  const issues = [];
  const warnings = [];

  try {
    const url = new URL(webhookUrl);

    // 检查协议
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      issues.push('Webhook URL 协议不正确，应该使用 http:// 或 https://');
    }

    // 检查域名
    if (!url.hostname) {
      issues.push('Webhook URL 缺少域名');
    }

    // 检查路径
    if (!url.pathname) {
      warnings.push('Webhook URL 可能缺少路径');
    }

    // 检查是否包含实例 ID
    const instanceIdMatch = url.pathname.match(/vefaas-[a-z0-9-]+/);
    if (instanceIdMatch) {
      const instanceId = instanceIdMatch[0];
      return {
        hasInstanceId: true,
        instanceId,
        issues: [],
        warnings: [
          `检测到实例 ID: ${instanceId}`,
          '请确认此实例在 OpenClaw 平台是否存在',
        ],
      };
    }

    return {
      hasInstanceId: false,
      issues,
      warnings,
    };
  } catch (error) {
    return {
      hasInstanceId: false,
      issues: ['Webhook URL 格式不正确'],
      warnings: [],
    };
  }
}

function generateRecommendations(
  diagnosticInfo: any,
  webhookAnalysis: any,
  connectionTest: any
) {
  const recommendations = [];

  // 检查配置
  if (!diagnosticInfo.apiKeyValid) {
    recommendations.push({
      priority: 'high',
      category: '配置',
      message: 'API Key 未设置，请在 /openclaw-integration 页面配置',
    });
  }

  if (!diagnosticInfo.autoTrigger) {
    recommendations.push({
      priority: 'medium',
      category: '配置',
      message: '自动触发未启用，OpenClaw 无法自动触发任务',
    });
  }

  // 检查 Webhook URL
  if (webhookAnalysis.issues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Webhook URL',
      message: `Webhook URL 存在问题: ${webhookAnalysis.issues.join(', ')}`,
    });
  }

  if (webhookAnalysis.hasInstanceId) {
    recommendations.push({
      priority: 'high',
      category: 'OpenClaw 平台',
      message: `检测到实例 ID: ${webhookAnalysis.instanceId}，请确认该实例在 OpenClaw 平台是否存在`,
      actions: [
        '登录 OpenClaw 平台',
        '检查实例列表',
        '如果实例不存在，请创建新实例或使用正确的实例 ID',
        '更新 Webhook URL 配置',
      ],
    });
  }

  // 检查连接
  if (connectionTest && !connectionTest.success) {
    recommendations.push({
      priority: 'high',
      category: '连接',
      message: `连接测试失败: ${connectionTest.error || connectionTest.statusText}`,
      actions: [
        '检查网络连接',
        '验证 Webhook URL 是否正确',
        '确认 API Key 是否有效',
        '检查 OpenClaw 平台是否正常运行',
      ],
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'low',
      category: '状态',
      message: '配置看起来正常，但 OpenClaw 仍然报告实例未找到',
      actions: [
        '联系 OpenClaw 技术支持',
        '检查 OpenClaw 平台的实例列表',
        '确认 Webhook URL 中的实例 ID 与平台中的实例 ID 一致',
      ],
    });
  }

  return recommendations;
}
