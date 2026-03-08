import { NextRequest } from 'next/server';
import { getDbInstance } from '@/storage/database';
import { agentApiConfigs, agents } from '@/storage/database/shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

/**
 * 获取所有API配置列表
 */
async function getApiConfigs(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId');
  const isActive = searchParams.get('isActive');

  const db = await getDbInstance();

  // 构建查询条件
  const conditions = [];
  if (agentId) {
    conditions.push(eq(agentApiConfigs.agentId, agentId));
  }
  if (isActive === 'true') {
    conditions.push(eq(agentApiConfigs.isActive, true));
  } else if (isActive === 'false') {
    conditions.push(eq(agentApiConfigs.isActive, false));
  }

  // 执行查询
  let configs;
  if (conditions.length > 0) {
    configs = await db
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
      .where(and(...conditions))
      .orderBy(desc(agentApiConfigs.createdAt));
  } else {
    configs = await db
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
      .orderBy(desc(agentApiConfigs.createdAt));
  }

  // 格式化响应
  const formattedConfigs = configs.map((config) => ({
    ...config,
    agent: {
      id: config.agentId,
      name: config.agentName,
      role: config.agentRole,
    },
  }));

  return successResponse({ configs: formattedConfigs }, '获取API配置列表成功');
}

/**
 * 创建新的API配置
 */
async function createApiConfig(request: NextRequest) {
  const body = await request.json();
  const db = await getDbInstance();

  // 验证必填字段
  if (!body.agentId) {
    return errorResponse('agentId 不能为空', 400);
  }
  if (!body.name) {
    return errorResponse('name 不能为空', 400);
  }
  if (!body.url) {
    return errorResponse('url 不能为空', 400);
  }

  // 验证智能体是否存在
  const agentResult = await db
    .select()
    .from(agents)
    .where(eq(agents.id, body.agentId))
    .limit(1);

  const agent = agentResult[0];

  if (!agent) {
    return errorResponse('智能体不存在', 404);
  }

  // 创建API配置
  const newConfig = await db
    .insert(agentApiConfigs)
    .values({
      agentId: body.agentId,
      name: body.name,
      type: body.type || 'REST',
      url: body.url,
      method: body.method || 'GET',
      headers: body.headers || {},
      queryParams: body.queryParams || {},
      bodyTemplate: body.bodyTemplate,
      authType: body.authType || 'none',
      authConfig: body.authConfig || {},
      description: body.description,
      isActive: body.isActive ?? true,
      timeout: body.timeout || 30000,
      retryCount: body.retryCount || 0,
      rateLimit: body.rateLimit || 60,
      metadata: body.metadata || {},
    })
    .returning();

  return successResponse(newConfig[0], 'API配置创建成功');
}

export const GET = withErrorHandler(getApiConfigs);
export const POST = withErrorHandler(createApiConfig);
