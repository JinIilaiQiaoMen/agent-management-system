import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { taskManager, agentManager, knowledgeBaseManager } from "@/storage/database";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/tasks/[id]/generate-agents - 根据任务生成智能体
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取任务信息
    const task = await taskManager.getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 构建提示词
    const prompt = `你是一个专业的公司智能体架构设计师和AI工作流专家。请根据以下任务，设计一个完整的智能体团队和工作流程。

【任务信息】
任务标题：${task.title}
任务描述：${task.description}
任务优先级：${task.priority}

【智能体设计要求】
1. 深入分析任务需求，识别涉及的关键职能和技能
2. 设计一个智能体团队架构，包括：
   - 负责人智能体（团队领导，负责任务协调和最终交付）
   - 专业智能体（根据任务需要，1-4个，如技术专家、产品经理、设计师等）
3. 每个智能体需要包含：
   - name: 智能体名称（简洁专业）
   - role: 职位/角色
   - department: 所属部门
   - description: 详细职责描述（100-200字）
   - capabilities: 能力标签（3-5个核心能力）
   - systemPrompt: 系统提示词（300-500字，包含：角色定位、核心职责、工作流程、决策原则、质量标准）

【系统提示词必须包含】：
1. 明确的角色定位和职责范围
2. 核心工作流程和协作方式
3. 决策原则和质量标准
4. **联网搜索能力**：明确告知智能体可以使用联网搜索获取最新信息
5. **任务协作**：如何与其他智能体协作完成任务
6. **交付标准**：明确工作成果的质量要求

【工作流程设计】
1. 任务分析阶段：负责人智能体分析需求，制定计划
2. 任务分解：根据智能体能力分配子任务
3. 协作执行：各智能体按分工协作，定期同步
4. 质量控制：每个阶段输出需要符合质量标准
5. 整合交付：负责人汇总成果，形成最终交付物

【输出格式】
请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "agents": [
    {
      "name": "智能体名称",
      "role": "职位",
      "department": "部门",
      "description": "职责描述",
      "capabilities": ["能力1", "能力2", "能力3"],
      "systemPrompt": "详细的系统提示词..."
    }
  ],
  "workflow": "工作流程描述，说明智能体如何协作完成任务"
}

【重要提示】
- 第一个智能体必须是任务负责人
- 根据任务复杂度生成2-5个智能体
- 系统提示词要具体、可执行，避免空泛
- 确保每个智能体的能力互补，避免重复
- 工作流程要清晰、可追踪`;

    // 调用大模型
    const messages = [
      { role: "system" as const, content: "你是一个专业的公司架构设计专家，擅长根据任务需求设计智能体层级架构。" },
      { role: "user" as const, content: prompt },
    ];

    const llmStream = client.stream(messages, { temperature: 0.7 }, undefined, customHeaders);

    // 解析响应
    let responseText = "";
    for await (const chunk of llmStream) {
      if (chunk.content) {
        responseText += chunk.content.toString();
      }
    }

    // 提取JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("无法解析AI生成的智能体信息");
    }

    const parsedResult = JSON.parse(jsonMatch[0]);
    const agentsData = parsedResult.agents || [];
    const workflow = parsedResult.workflow || "";

    if (agentsData.length === 0) {
      return NextResponse.json({ error: "AI未生成任何智能体" }, { status: 400 });
    }

    // 创建智能体和知识库
    const createdAgents: any[] = [];
    let parentAgentId: string | null = null;

    for (let i = 0; i < agentsData.length; i++) {
      const agentData = agentsData[i];

      // 1. 创建智能体的专属知识库
      const knowledgeBase = await knowledgeBaseManager.createKnowledgeBase({
        name: `${agentData.name} - 专属知识库`,
        type: "individual",
        agentId: "", // 先创建知识库，稍后关联
        description: `为${agentData.name}（${agentData.role}）创建的专属知识库，用于存储${agentData.department || '相关'}领域的专业知识和项目文档。`,
        isActive: true,
        modifiedBy: "CEO",
      });

      // 2. 创建智能体
      const newAgent = await agentManager.createAgent({
        name: agentData.name,
        role: agentData.role,
        department: agentData.department || null,
        description: agentData.description,
        capabilities: agentData.capabilities || [],
        systemPrompt: agentData.systemPrompt,
        parentId: parentAgentId,
        knowledgeBaseId: knowledgeBase.id,
        isActive: true,
      });

      // 3. 更新知识库的智能体关联
      await knowledgeBaseManager.updateKnowledgeBase(knowledgeBase.id, {
        agentId: newAgent.id,
      });

      createdAgents.push({
        ...newAgent,
        knowledgeBaseId: knowledgeBase.id
      });

      // 第一个智能体是负责人，后续智能体以其为父节点
      if (i === 0) {
        parentAgentId = newAgent.id;
      }
    }

    // 将负责人智能体分配给任务
    if (createdAgents.length > 0) {
      await taskManager.assignTask(task.id, createdAgents[0].id);
      // 将任务状态改为已分配
      await taskManager.updateTask(task.id, {
        status: "assigned",
        description: task.description + `\n\n【工作流程】\n${workflow}`
      });
    }

    return NextResponse.json({
      success: true,
      message: `成功生成 ${createdAgents.length} 个智能体`,
      data: createdAgents,
      workflow: workflow,
    });
  } catch (error) {
    console.error("Failed to generate agents:", error);
    return NextResponse.json(
      { error: "生成智能体失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
