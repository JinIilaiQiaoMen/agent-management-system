import { NextRequest } from 'next/server';
import { db, agentApiConfigs, agents } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

/**
 * 获取单个API配置详情
 */
async function getApiConfig(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db
    .select({
      id: agentApiConfigs.id,
      name: agentApiConfigs.name,
      type: agentApiConfigs.type,
      url: agentApiConfigs.url,
      method: agentApiConfigs.method,
      headers: agentApiConfigs.headers,
      queryParams: agentApiConfigs.queryParams,
      bodyTemplate: agentApiConfigs.bodyTemplate,
      authType: agentApiConfigs.authType,
      authConfig: agentApiConfigs.authConfig,
      description: agentApiConfigs.description,
      isActive: agentApiConfigs.isActive,
      timeout: agentApiConfigs.timeout,
      retryCount: agentApiConfigs.retryCount,
      rateLimit: agentApiConfigs.rateLimit,
      createdAt: agentApiConfigs.createdAt,
      updatedAt: agentApiConfigs.updatedAt,
      agentId: agents.id,
      agentName: agents.name,
      agentRole: agents.role,
    })
    .from(agentApiConfigs)
    .leftJoin(agents, eq(agentApiConfigs.agentId, agents.id))
    .where(eq(agentApiConfigs.id, id))
    .limit(1);

  const config = result[0];

  if (!config) {
    return errorResponse('API配置不存在', 404);
  }

  // 格式化响应
  const formattedConfig = {
    ...config,
    agent: {
      id: config.agentId,
      name: config.agentName,
      role: config.agentRole,
    },
  };

  return successResponse(formattedConfig, '获取API配置详情成功');
}

/**
 * 更新API配置
 */
async function updateApiConfig(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // 验证API配置是否存在
  const existingConfigs = await db
    .select()
    .from(agentApiConfigs)
    .where(eq(agentApiConfigs.id, id))
    .limit(1);

  const existingConfig = existingConfigs[0];

  if (!existingConfig) {
    return errorResponse('API配置不存在', 404);
  }

  // 更新配置
  const updatedConfigs = await db
    .update(agentApiConfigs)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(agentApiConfigs.id, id))
    .returning();

  return successResponse(updatedConfigs[0], 'API配置更新成功');
}

/**
 * 删除API配置
 */
async function deleteApiConfig(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 验证API配置是否存在
  const existingConfigs = await db
    .select()
    .from(agentApiConfigs)
    .where(eq(agentApiConfigs.id, id))
    .limit(1);

  const existingConfig = existingConfigs[0];

  if (!existingConfig) {
    return errorResponse('API配置不存在', 404);
  }

  // 删除配置
  await db.delete(agentApiConfigs).where(eq(agentApiConfigs.id, id));

  return successResponse({ id }, 'API配置删除成功');
}

export const GET = withErrorHandler(getApiConfig);
export const PUT = withErrorHandler(updateApiConfig);
export const DELETE = withErrorHandler(deleteApiConfig);
