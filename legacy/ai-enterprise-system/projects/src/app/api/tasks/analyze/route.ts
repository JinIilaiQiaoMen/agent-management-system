import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

/**
 * POST /api/tasks/analyze - 决策人分析任务
 */
export async function POST(request: NextRequest) {
  try {
    const { taskTitle, taskDescription, taskPriority } = await request.json();

    if (!taskTitle || !taskDescription) {
      return NextResponse.json(
        { error: "任务标题和描述不能为空" },
        { status: 400 }
      );
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 构建提示词
    const prompt = `你是公司的CEO和决策人，负责分析和规划公司任务。请对以下任务进行深入分析和规划。

【任务信息】
任务标题：${taskTitle}
任务描述：${taskDescription}
任务优先级：${taskPriority || '未指定'}

【分析要求】
1. **任务分析**：深入理解任务的核心需求、目标和约束条件
2. **任务拆解**：将大任务拆分为可执行的子任务
3. **智能体规划**：确定需要哪些专业智能体来完成任务
4. **提示词设计**：为每个智能体设计具体的任务提示词
5. **成果要求**：明确每个阶段需要交付什么成果（代码、文档、对话等）

【输出格式】
请严格按照以下JSON格式返回：
{
  "analysis": {
    "coreObjective": "任务的核心目标",
    "keyRequirements": ["需求1", "需求2", "需求3"],
    "constraints": ["约束1", "约束2"],
    "expectedDeliverables": ["交付物1", "交付物2"]
  },
  "subtasks": [
    {
      "id": "任务ID",
      "title": "子任务标题",
      "description": "详细描述",
      "agentRole": "需要的智能体角色",
      "prompt": "给该智能体的具体提示词",
      "deliverables": ["预期交付物"],
      "dependencies": ["依赖的任务ID列表"],
      "priority": "high/medium/low"
    }
  ],
  "workflow": "工作流程描述，说明任务的执行顺序和协作方式"
}

【注意事项】
- 子任务之间要逻辑清晰，有明确的先后顺序
- 每个子任务要有明确的负责人智能体
- 提示词要具体、可执行，包含具体要求和输出格式
- 考虑任务的复杂度，合理拆分为3-7个子任务
- 明确每个子任务的交付成果类型（对话、代码文件、文档等）
- 考虑是否需要知识库支持
- 考虑是否需要联网搜索`;

    // 调用大模型
    const messages = [
      {
        role: "system" as const,
        content: "你是公司CEO，擅长任务分析、资源规划和团队管理。你能够将复杂任务拆解为可执行的子任务，并为每个子任务分配合适的执行者。"
      },
      { role: "user" as const, content: prompt }
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
      throw new Error("无法解析AI生成的任务分析结果");
    }

    const parsedResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: parsedResult
    });
  } catch (error) {
    console.error("Failed to analyze task:", error);
    return NextResponse.json(
      { error: "任务分析失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
