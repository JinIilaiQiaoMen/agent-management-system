import { NextRequest, NextResponse } from 'next/server';
import { executeAgentApiCalls } from '@/lib/api-executor';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

/**
 * 执行智能体的API调用
 */
async function executeAgentApis(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { taskId, testData } = body;

  // 执行API调用
  const results = await executeAgentApiCalls(id, {
    taskId,
    testData,
  });

  // 统计结果
  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.length - successCount;

  if (failedCount === 0) {
    return successResponse(
      {
        agentId: id,
        total: results.length,
        success: successCount,
        failed: failedCount,
        results,
      },
      '所有API调用成功'
    );
  } else {
    // 部分失败，使用 207 Multi-Status
    const response = successResponse(
      {
        agentId: id,
        total: results.length,
        success: successCount,
        failed: failedCount,
        results,
      },
      `${failedCount} 个API调用失败`
    );
    // 修改状态码为 207
    return new NextResponse(response.body, {
      status: 207,
      headers: response.headers,
    });
  }
}

export const POST = withErrorHandler(executeAgentApis);
