import { NextRequest, NextResponse } from "next/server";
import { taskDeliverableManager, knowledgeBaseManager, agentManager } from "@/storage/database";

/**
 * GET /api/tasks/[id]/deliverables - 获取任务的所有成果
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deliverables = await taskDeliverableManager.getTaskDeliverables(id);
    return NextResponse.json({
      success: true,
      data: deliverables
    });
  } catch (error) {
    console.error("Failed to get deliverables:", error);
    return NextResponse.json(
      { error: "获取任务成果失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/[id]/deliverables - 创建任务成果并自动分类保存
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. 创建任务成果
    const deliverable = await taskDeliverableManager.createTaskDeliverable({
      ...body,
      taskId: id,
      version: body.version || 1,
      status: body.status || "draft",
    });

    // 2. 智能分类
    try {
      const classifyResponse = await fetch("http://localhost:5000/api/classify-deliverable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: body.title,
          content: body.content,
          type: body.type
        }),
      });

      if (classifyResponse.ok) {
        const classifyResult = await classifyResponse.json();

        // 3. 保存到知识库
        if (body.agentId) {
          const agent = await agentManager.getAgentById(body.agentId);
          if (agent && agent.knowledgeBaseId) {
            // 创建文档记录
            await knowledgeBaseManager.updateDocumentCount(agent.knowledgeBaseId, 1);

            // 更新成果的元数据，包含分类信息
            await taskDeliverableManager.updateTaskDeliverable(deliverable.id, {
              metadata: {
                ...body.metadata,
                classification: classifyResult.data,
                savedToKnowledgeBase: true,
                knowledgeBaseId: agent.knowledgeBaseId,
                savedAt: new Date().toISOString()
              }
            });
          }
        }
      }
    } catch (classifyError) {
      console.error("Classification error (non-blocking):", classifyError);
      // 分类失败不影响成果创建
    }

    return NextResponse.json({
      success: true,
      data: deliverable
    });
  } catch (error) {
    console.error("Failed to create deliverable:", error);
    return NextResponse.json(
      { error: "创建任务成果失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
