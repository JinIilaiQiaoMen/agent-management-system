import { NextRequest } from 'next/server';
import { getDbInstance } from '@/storage/database';
import { agentApiConfigs, apiExecutionLogs } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

/**
 * 测试API配置
 */
async function testApiConfig(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const testData = body.testData || {};
  const db = await getDbInstance();

  // 获取API配置
  const configs = await db
    .select()
    .from(agentApiConfigs)
    .where(eq(agentApiConfigs.id, id))
    .limit(1);

  const config = configs[0];

  if (!config) {
    return errorResponse('API配置不存在', 404);
  }

  const startTime = Date.now();
  let responseStatus: number | null = null;
  let responseHeaders: Record<string, string> = {};
  let responseBody: string | null = null;
  let status = 'success';
  let errorMessage: string | null = null;

  try {
    // 构建请求URL
    let url = config.url;
    if (config.queryParams && Object.keys(config.queryParams).length > 0) {
      const queryParams = new URLSearchParams(config.queryParams);
      url += `?${queryParams.toString()}`;
    }

    // 构建请求头
    const headers: Record<string, string> = { ...config.headers };

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
    });

    // 获取响应状态
    responseStatus = response.status;

    // 获取响应头
    response.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    // 获取响应体
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const json = await response.json();
      responseBody = JSON.stringify(json, null, 2);
    } else {
      responseBody = await response.text();
    }

    // 检查状态码
    if (!response.ok) {
      status = 'failed';
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    status = 'error';
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  const executionTime = Date.now() - startTime;

  // 记录执行日志
  await db.insert(apiExecutionLogs).values({
    apiConfigId: config.id,
    taskId: null,
    agentId: config.agentId,
    requestUrl: config.url,
    requestMethod: config.method,
    requestHeaders: config.headers || {},
    requestBody: config.bodyTemplate,
    responseStatus,
    responseHeaders,
    responseBody,
    status,
    errorMessage,
    executionTime,
    retries: 0,
    metadata: {
      testData,
      isTest: true,
    },
  });

  if (status === 'success') {
    return successResponse(
      {
        status,
        responseStatus,
        responseHeaders,
        responseBody,
        executionTime,
      },
      'API测试成功'
    );
  } else {
    return errorResponse(errorMessage || 'API测试失败', 400);
  }
}

export const POST = withErrorHandler(testApiConfig);
