import { NextRequest } from 'next/server';
import { db, agentApiConfigs, agents } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

/**
 * 获取智能体的所有API配置
 */
async function getAgentApiConfigs(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeInactive = searchParams.get('includeInactive') === 'true';

  // 验证智能体是否存在
  const agentResult = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  const agent = agentResult[0];

  if (!agent) {
    return errorResponse('智能体不存在', 404);
  }

  // 获取API配置列表
  const configs = await db
    .select()
    .from(agentApiConfigs)
    .where(eq(agentApiConfigs.agentId, agentId))
    .orderBy(desc(agentApiConfigs.createdAt));

  return successResponse(
    {
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
      },
      configs,
    },
    '获取智能体API配置列表成功'
  );
}

export const GET = withErrorHandler(getAgentApiConfigs);
