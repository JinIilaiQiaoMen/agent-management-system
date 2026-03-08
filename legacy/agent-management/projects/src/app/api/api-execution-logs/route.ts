import { NextRequest } from 'next/server';
import { getDbInstance } from '@/storage/database';
import { apiExecutionLogs, agentApiConfigs, agents } from '@/storage/database/shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

/**
 * 获取API执行日志列表
 */
async function getApiExecutionLogs(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const apiConfigId = searchParams.get('apiConfigId');
  const taskId = searchParams.get('taskId');
  const agentId = searchParams.get('agentId');
  const status = searchParams.get('status');
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const offset = (page - 1) * limit;
  const db = await getDbInstance();

  // 构建查询条件
  const conditions = [];
  if (apiConfigId) {
    conditions.push(eq(apiExecutionLogs.apiConfigId, apiConfigId));
  }
  if (taskId) {
    conditions.push(eq(apiExecutionLogs.taskId, taskId));
  }
  if (agentId) {
    conditions.push(eq(apiExecutionLogs.agentId, agentId));
  }
  if (status) {
    conditions.push(eq(apiExecutionLogs.status, status));
  }

  // 获取总数
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(apiExecutionLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = countResult[0]?.count || 0;

  // 获取日志列表
  const logs = await db
    .select({
      id: apiExecutionLogs.id,
      apiConfigId: apiExecutionLogs.apiConfigId,
      taskId: apiExecutionLogs.taskId,
      agentId: apiExecutionLogs.agentId,
      requestUrl: apiExecutionLogs.requestUrl,
      requestMethod: apiExecutionLogs.requestMethod,
      requestHeaders: apiExecutionLogs.requestHeaders,
      requestBody: apiExecutionLogs.requestBody,
      responseStatus: apiExecutionLogs.responseStatus,
      responseHeaders: apiExecutionLogs.responseHeaders,
      responseBody: apiExecutionLogs.responseBody,
      status: apiExecutionLogs.status,
      errorMessage: apiExecutionLogs.errorMessage,
      executionTime: apiExecutionLogs.executionTime,
      retries: apiExecutionLogs.retries,
      metadata: apiExecutionLogs.metadata,
      createdAt: apiExecutionLogs.createdAt,
      apiConfigName: agentApiConfigs.name,
      apiConfigType: agentApiConfigs.type,
      apiConfigUrl: agentApiConfigs.url,
      agentName: agents.name,
      agentRole: agents.role,
    })
    .from(apiExecutionLogs)
    .leftJoin(agentApiConfigs, eq(apiExecutionLogs.apiConfigId, agentApiConfigs.id))
    .leftJoin(agents, eq(apiExecutionLogs.agentId, agents.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(apiExecutionLogs.createdAt))
    .limit(limit)
    .offset(offset);

  // 格式化响应
  const formattedLogs = logs.map((log) => ({
    ...log,
    apiConfig: {
      id: log.apiConfigId,
      name: log.apiConfigName,
      type: log.apiConfigType,
      url: log.apiConfigUrl,
    },
    agent: {
      id: log.agentId,
      name: log.agentName,
      role: log.agentRole,
    },
  }));

  return successResponse(
    {
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    '获取API执行日志列表成功'
  );
}

export const GET = withErrorHandler(getApiExecutionLogs);
