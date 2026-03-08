import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import * as schema from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

// GET - 获取 OpenClaw 配置
export async function GET() {
  try {
    const db = await getDb(schema);
    const configs = await db.query.openclawConfigs.findMany({
      limit: 1,
    });

    if (configs.length === 0) {
      return NextResponse.json({ config: null });
    }

    const config = configs[0];
    return NextResponse.json({
      config: {
        id: config.id,
        webhookUrl: config.webhookUrl,
        apiKey: config.apiKey,
        autoTrigger: config.autoTrigger,
        notifyOnStart: config.notifyOnStart,
        notifyOnComplete: config.notifyOnComplete,
        notifyOnError: config.notifyOnError,
        description: config.description,
      },
    });
  } catch (error) {
    console.error('获取 OpenClaw 配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

// POST - 创建 OpenClaw 配置
export async function POST(request: NextRequest) {
  try {
    const db = await getDb(schema);
    const body = await request.json();
    const {
      webhookUrl,
      apiKey,
      autoTrigger = false,
      notifyOnStart = true,
      notifyOnComplete = true,
      notifyOnError = true,
      description = '',
    } = body;

    if (!webhookUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Webhook URL 和 API Key 不能为空' },
        { status: 400 }
      );
    }

    // 创建配置
    const [config] = await db
      .insert(schema.openclawConfigs)
      .values({
        webhookUrl,
        apiKey,
        autoTrigger,
        notifyOnStart,
        notifyOnComplete,
        notifyOnError,
        description,
      })
      .returning();

    return NextResponse.json({
      config: {
        id: config.id,
        webhookUrl: config.webhookUrl,
        apiKey: config.apiKey,
        autoTrigger: config.autoTrigger,
        notifyOnStart: config.notifyOnStart,
        notifyOnComplete: config.notifyOnComplete,
        notifyOnError: config.notifyOnError,
        description: config.description,
      },
    });
  } catch (error) {
    console.error('创建 OpenClaw 配置失败:', error);
    return NextResponse.json(
      { error: '创建配置失败' },
      { status: 500 }
    );
  }
}
