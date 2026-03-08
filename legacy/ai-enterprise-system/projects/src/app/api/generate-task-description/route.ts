import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

/**
 * 根据任务名称自动生成任务描述和需求
 */
export async function POST(request: NextRequest) {
  try {
    const { taskTitle, taskPriority } = await request.json();

    if (!taskTitle) {
      return NextResponse.json(
        { error: "任务名称不能为空" },
        { status: 400 }
      );
    }

    // 构建生成提示词
    const prompt = `作为企业CEO和项目管理专家，请根据以下任务信息，生成详细的任务描述和需求配置：

任务名称：${taskTitle}
任务优先级：${taskPriority || "medium"}

请以JSON格式返回以下信息：
{
  "taskDescription": "详细的任务描述，包括任务背景、目标和价值",
  "taskRequirements": [
    "具体需求1",
    "具体需求2",
    ...
  ],
  "successCriteria": [
    "成功标准1",
    "成功标准2",
    ...
  ],
  "suggestedAgents": [
    {
      "role": "角色名称",
      "responsibilities": "职责描述"
    },
    ...
  ],
  "estimatedDuration": "预估工期（如：3-5天）"
}

要求：
1. 任务描述要专业、详实，包含任务背景、目标和价值
2. 需求要具体、可执行
3. 成功标准要可衡量
4. 推荐的智能体角色要合理
5. 预估工期要合理
6. 确保返回的JSON格式正确，可以被直接解析`;

    // 调用大模型生成
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config);

    const messages = [
      {
        role: "system" as const,
        content: "你是企业CEO和项目管理专家，擅长将简短的任务名称转化为详细的任务描述和需求。你总是以JSON格式返回结构化的任务信息。"
      },
      {
        role: "user" as const,
        content: prompt
      }
    ];

    const llmStream = llmClient.stream(messages, { temperature: 0.7 }, undefined, customHeaders);

    // 解析响应
    let responseText = "";
    for await (const chunk of llmStream) {
      if (chunk.content) {
        responseText += chunk.content.toString();
      }
    }

    // 解析返回的JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("无法解析AI生成的任务描述");
    }

    const generatedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: generatedData,
    });
  } catch (error: any) {
    console.error("Failed to generate task description:", error);
    return NextResponse.json(
      {
        error: "生成任务描述失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
