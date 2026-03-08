import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import * as schema from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

// PUT - 更新 OpenClaw 配置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb(schema);
    const { id } = await params;
    const body = await request.json();
    const {
      webhookUrl,
      apiKey,
      autoTrigger,
      notifyOnStart,
      notifyOnComplete,
      notifyOnError,
      description,
    } = body;

    if (!webhookUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Webhook URL 和 API Key 不能为空' },
        { status: 400 }
      );
    }

    // 更新配置
    const [config] = await db
      .update(schema.openclawConfigs)
      .set({
        webhookUrl,
        apiKey,
        autoTrigger,
        notifyOnStart,
        notifyOnComplete,
        notifyOnError,
        description,
        updatedAt: new Date(),
      })
      .where(eq(schema.openclawConfigs.id, id))
      .returning();

    if (!config) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      );
    }

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
    console.error('更新 OpenClaw 配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    );
  }
}
