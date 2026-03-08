/**
 * API 调用服务
 *
 * 功能:
 * - 执行智能体配置的API调用
 * - 支持多种认证方式（API Key, Bearer, Basic, OAuth2）
 * - 自动重试机制
 * - 执行日志记录
 */

import { db, agentApiConfigs, apiExecutionLogs } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

interface ApiCallOptions {
  taskId?: string;
  testData?: Record<string, any>;
}

interface ApiCallResult {
  success: boolean;
  status: number | null;
  headers: Record<string, string>;
  body: string | null;
  error: string | null;
  executionTime: number;
}

/**
 * 执行API调用
 */
export async function executeApiCall(
  apiConfigId: string,
  options: ApiCallOptions = {}
): Promise<ApiCallResult> {
  const { taskId, testData = {} } = options;

  // 获取API配置
  const configs = await db
    .select()
    .from(agentApiConfigs)
    .where(eq(agentApiConfigs.id, apiConfigId))
    .limit(1);

  const config = configs[0];

  if (!config) {
    throw new Error('API配置不存在');
  }

  if (!config.isActive) {
    throw new Error('API配置已禁用');
  }

  const startTime = Date.now();
  let lastError: Error | null = null;
  let retries = 0;

  // 重试机制
  while (retries <= (config.retryCount || 0)) {
    try {
      const result = await callApi(config, taskId, testData);
      const executionTime = Date.now() - startTime;

      // 记录成功日志
      await logExecution(config, taskId, {
        status: 'success',
        responseStatus: result.status,
        responseHeaders: result.headers,
        responseBody: result.body,
        errorMessage: null,
        executionTime,
        retries,
        testData,
      });

      return {
        success: true,
        status: result.status,
        headers: result.headers,
        body: result.body,
        error: null,
        executionTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;

      if (retries <= (config.retryCount || 0)) {
        // 等待后重试
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  // 重试失败，记录错误日志
  const executionTime = Date.now() - startTime;
  await logExecution(config, taskId, {
    status: 'error',
    responseStatus: null,
    responseHeaders: {},
    responseBody: null,
    errorMessage: lastError?.message || '未知错误',
    executionTime,
    retries,
    testData,
  });

  return {
    success: false,
    status: null,
    headers: {},
    body: null,
    error: lastError?.message || 'API调用失败',
    executionTime,
  };
}

/**
 * 调用API
 */
async function callApi(
  config: any,
  taskId: string | undefined,
  testData: Record<string, any>
): Promise<{
  status: number;
  headers: Record<string, string>;
  body: string;
}> {
  // 构建请求URL
  let url = config.url;
  if (config.queryParams && Object.keys(config.queryParams).length > 0) {
    const queryParams = new URLSearchParams(config.queryParams);
    url += `?${queryParams.toString()}`;
  }

  // 构建请求头
  const headers: Record<string, string> = { ...(config.headers || {}) };

  // 处理认证
  if (config.authType === 'api_key' && config.authConfig?.apiKey) {
    const headerName = config.authConfig.apiKeyHeader || 'X-API-Key';
    headers[headerName] = config.authConfig.apiKey;
  } else if (config.authType === 'bearer' && config.authConfig?.token) {
    headers['Authorization'] = `Bearer ${config.authConfig.token}`;
  } else if (config.authType === 'basic' && config.authConfig?.username && config.authConfig?.password) {
    const credentials = Buffer.from(
      `${config.authConfig.username}:${config.authConfig.password}`
    ).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  // 添加默认的 Content-Type
  if (['POST', 'PUT', 'PATCH'].includes(config.method) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // 构建请求体
  let requestBody: string | undefined;
  if (config.bodyTemplate && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
    // 替换模板中的变量
    let bodyTemplate = config.bodyTemplate;
    Object.keys(testData).forEach((key) => {
      bodyTemplate = bodyTemplate.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        JSON.stringify(testData[key])
      );
    });
    requestBody = bodyTemplate;
  }

  // 发送请求
  const response = await fetch(url, {
    method: config.method,
    headers,
    body: requestBody,
    signal: AbortSignal.timeout(config.timeout || 30000),
  });

  // 获取响应头
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value: string, key: string) => {
    responseHeaders[key] = value;
  });

  // 获取响应体
  const contentType = response.headers.get('content-type');
  let responseBody: string;
  if (contentType?.includes('application/json')) {
    const json = await response.json();
    responseBody = JSON.stringify(json, null, 2);
  } else {
    responseBody = await response.text();
  }

  // 检查状态码
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return {
    status: response.status,
    headers: responseHeaders,
    body: responseBody,
  };
}

/**
 * 记录执行日志
 */
async function logExecution(
  config: any,
  taskId: string | undefined,
  data: {
    status: string;
    responseStatus: number | null;
    responseHeaders: Record<string, string>;
    responseBody: string | null;
    errorMessage: string | null;
    executionTime: number;
    retries: number;
    testData: Record<string, any>;
  }
) {
  try {
    await db.insert(apiExecutionLogs).values({
      apiConfigId: config.id,
      taskId: taskId || null,
      agentId: config.agentId,
      requestUrl: config.url,
      requestMethod: config.method,
      requestHeaders: config.headers || {},
      requestBody: config.bodyTemplate,
      responseStatus: data.responseStatus,
      responseHeaders: data.responseHeaders,
      responseBody: data.responseBody,
      status: data.status,
      errorMessage: data.errorMessage,
      executionTime: data.executionTime,
      retries: data.retries,
      metadata: {
        testData: data.testData,
      },
    });
  } catch (error) {
    console.error('记录执行日志失败:', error);
  }
}

/**
 * 批量执行API调用
 */
export async function executeBatchApiCalls(
  apiConfigIds: string[],
  options: ApiCallOptions = {}
): Promise<ApiCallResult[]> {
  const results: ApiCallResult[] = [];

  for (const apiConfigId of apiConfigIds) {
    try {
      const result = await executeApiCall(apiConfigId, options);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        status: null,
        headers: {},
        body: null,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      });
    }
  }

  return results;
}

/**
 * 获取智能体的所有API配置
 */
export async function getAgentApiConfigs(agentId: string) {
  const configs = await db
    .select()
    .from(agentApiConfigs)
    .where(eq(agentApiConfigs.agentId, agentId))
    .orderBy(desc(agentApiConfigs.createdAt));

  return configs.filter((config: { isActive: boolean }) => config.isActive);
}

/**
 * 执行智能体的所有API调用
 */
export async function executeAgentApiCalls(
  agentId: string,
  options: ApiCallOptions = {}
): Promise<ApiCallResult[]> {
  const configs = await getAgentApiConfigs(agentId);

  if (configs.length === 0) {
    return [];
  }

  return executeBatchApiCalls(configs.map((c: { id: string }) => c.id), options);
}
