import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialMediaAgents } from '@/storage/database/shared/schema';
import { PLATFORMS } from '@/lib/social-media/platform-config';
import { DOMESTIC_PLATFORMS } from '@/lib/social-media/domestic-platforms';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/social-media-agents
 * 获取所有社媒Agent列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    // 构建查询
    let query = db.select().from(socialMediaAgents);

    // 执行查询
    const agents = await query;

    // 过滤
    let filteredAgents = agents;
    if (platform) {
      filteredAgents = filteredAgents.filter((a: typeof agents[0]) => a.platform === platform);
    }
    if (status) {
      filteredAgents = filteredAgents.filter((a: typeof agents[0]) => a.status === status);
    }

    // 计算总体统计
    const stats = {
      totalAgents: agents.length,
      activeAgents: agents.filter((a: typeof agents[0]) => a.status === 'active').length,
      idleAgents: agents.filter((a: typeof agents[0]) => a.status === 'idle').length,
      offlineAgents: agents.filter((a: typeof agents[0]) => a.status === 'offline').length,
      totalTasks: agents.reduce((sum: number, a: typeof agents[0]) => {
        const agentStats = a.stats as { totalTasks?: number } | null;
        return sum + (agentStats?.totalTasks || 0);
      }, 0),
      avgSuccessRate:
        agents.length > 0
          ? agents.reduce((sum: number, a: typeof agents[0]) => {
              const agentStats = a.stats as { successRate?: number } | null;
              return sum + (agentStats?.successRate || 0);
            }, 0) / agents.length
          : 0,
      totalFollowers: agents.reduce((sum: number, a: typeof agents[0]) => {
        const agentStats = a.stats as { followers?: number } | null;
        return sum + (agentStats?.followers || 0);
      }, 0),
      totalPosts: agents.reduce((sum: number, a: typeof agents[0]) => {
        const agentStats = a.stats as { posts?: number } | null;
        return sum + (agentStats?.posts || 0);
      }, 0),
    };

    return NextResponse.json({
      agents: filteredAgents,
      stats,
    });
  } catch (error: any) {
    console.error('获取Agent列表失败:', error);
    return NextResponse.json(
      { error: '获取Agent列表失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-media-agents
 * 创建新Agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, name, config } = body;

    if (!platform) {
      return NextResponse.json({ error: '缺少平台参数' }, { status: 400 });
    }

    // 获取平台信息
    const platformConfig = PLATFORMS[platform] || DOMESTIC_PLATFORMS[platform];
    if (!platformConfig) {
      return NextResponse.json({ error: `不支持的平台: ${platform}` }, { status: 400 });
    }

    // 默认能力配置
    const defaultCapabilities = [
      {
        id: 'content_gen',
        name: '内容生成',
        enabled: true,
        icon: '✨',
        description: 'AI生成平台专属内容',
      },
      {
        id: 'auto_reply',
        name: '自动回复',
        enabled: true,
        icon: '💬',
        description: '智能回复评论和私信',
      },
      {
        id: 'schedule',
        name: '定时发布',
        enabled: false,
        icon: '📅',
        description: '自动安排最佳发布时间',
      },
      {
        id: 'analytics',
        name: '数据分析',
        enabled: true,
        icon: '📊',
        description: '追踪表现和用户互动',
      },
      {
        id: 'engage',
        name: '互动增强',
        enabled: false,
        icon: '🎯',
        description: '自动互动和用户增长',
      },
    ];

    // 默认统计
    const defaultStats = {
      totalTasks: 0,
      successRate: 100,
      avgResponseTime: 0,
      engagementRate: 0,
      followers: 0,
      posts: 0,
      replies: 0,
    };

    // 默认配置
    const defaultConfig = {
      autoReply: false,
      autoSchedule: false,
      contentStyle: '专业教育',
      targetAudience: '18-35岁年轻人',
      postingSchedule: ['09:00', '12:00', '18:00', '21:00'],
      replyRules: ['积极回应', '品牌一致性', '及时响应'],
      ...config,
    };

    // 插入数据库
    const [newAgent] = await db
      .insert(socialMediaAgents)
      .values({
        name: name || `${platformConfig.name} 运营助手`,
        platform,
        platformIcon: platformConfig.icon,
        status: 'idle',
        capabilities: defaultCapabilities,
        stats: defaultStats,
        config: defaultConfig,
        tasks: [],
        isActive: true,
        lastActiveAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      agent: newAgent,
      message: 'Agent创建成功',
    });
  } catch (error: any) {
    console.error('创建Agent失败:', error);
    return NextResponse.json(
      { success: false, error: '创建Agent失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social-media-agents
 * 更新Agent
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少Agent ID' }, { status: 400 });
    }

    // 更新数据库
    const [updatedAgent] = await db
      .update(socialMediaAgents)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(socialMediaAgents.id, id))
      .returning();

    if (!updatedAgent) {
      return NextResponse.json({ error: 'Agent不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
      message: 'Agent更新成功',
    });
  } catch (error: any) {
    console.error('更新Agent失败:', error);
    return NextResponse.json(
      { success: false, error: '更新Agent失败', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-media-agents
 * 删除Agent
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少Agent ID' }, { status: 400 });
    }

    // 删除
    await db.delete(socialMediaAgents).where(eq(socialMediaAgents.id, id));

    return NextResponse.json({
      success: true,
      message: 'Agent已删除',
    });
  } catch (error: any) {
    console.error('删除Agent失败:', error);
    return NextResponse.json(
      { success: false, error: '删除Agent失败', details: error.message },
      { status: 500 }
    );
  }
}
