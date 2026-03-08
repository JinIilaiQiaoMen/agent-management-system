import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";
import { agentManager } from "@/storage/database";

/**
 * POST /api/knowledge-bases/analyze-match - 分析文档与智能体的匹配度
 */
export async function POST(request: NextRequest) {
  try {
    const { knowledgeBaseId, documentContent, documentType, documentTitle } = await request.json();

    if (!knowledgeBaseId || !documentContent) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 获取知识库信息
    const { knowledgeBaseManager } = await import("@/storage/database");
    const kb = await knowledgeBaseManager.getKnowledgeBaseById(knowledgeBaseId);
    if (!kb) {
      return NextResponse.json({ error: "知识库不存在" }, { status: 404 });
    }

    // 获取关联的智能体
    let agent = null;
    if (kb.agentId) {
      agent = await agentManager.getAgentById(kb.agentId);
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置LLM客户端
    const config = new Config();
    const llmClient = new LLMClient(config);

    // 构建分析提示
    const analysisPrompt = `请分析以下文档内容与指定智能体角色的匹配度，给出0-100的评分和详细说明。

【智能体信息】
${agent ? `
- 名称：${agent.name}
- 角色：${agent.role}
- 部门：${agent.department || '无'}
- 描述：${agent.description || '无'}
- 能力：${Array.isArray(agent.capabilities) ? agent.capabilities.join('、') : '无'}
` : '该知识库是通用知识库，不关联特定智能体。'}

【文档信息】
- 类型：${documentType || '未知'}
- 标题：${documentTitle || '无'}
- 内容：
${documentContent}

【分析要求】
1. 评估文档内容与智能体角色的相关性和匹配度（0-100分）
2. 说明匹配度评分的依据和理由
3. 如果匹配度较低，说明哪些方面不匹配
4. 如果匹配度较高，说明哪些方面非常匹配

【输出格式】
请以JSON格式输出，包含以下字段：
{
  "matchScore": 0-100的数字,
  "matchReason": "匹配度评分的详细说明",
  "analysis": "分析过程和关键点",
  "recommendation": "是否推荐将此文档添加到该智能体的知识库（是/否）"
}

请只输出JSON，不要输出其他内容。`;

    // 调用LLM进行分析
    const response = await llmClient.invoke([
      {
        role: "system",
        content: "你是一个专业的知识库文档分析师，擅长评估文档内容与特定角色的匹配度。你的分析应该客观、准确、有依据。"
      },
      {
        role: "user",
        content: analysisPrompt
      }
    ], { temperature: 0.3 });

    const analysisResult = response.content || "";

    // 尝试解析JSON结果
    let matchData = {
      matchScore: 50,
      matchReason: "无法解析分析结果",
      analysis: analysisResult,
      recommendation: "不确定"
    };

    try {
      // 提取JSON部分
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        matchData = {
          matchScore: parsed.matchScore || 50,
          matchReason: parsed.matchReason || "未提供说明",
          analysis: parsed.analysis || analysisResult,
          recommendation: parsed.recommendation || "不确定"
        };
      }
    } catch (parseError) {
      console.error("Failed to parse analysis result:", parseError);
      // 如果解析失败，使用文本内容作为分析结果
      matchData.analysis = analysisResult;
    }

    return NextResponse.json({
      success: true,
      data: {
        knowledgeBaseId,
        agentId: kb.agentId,
        agentName: agent?.name || null,
        agentRole: agent?.role || null,
        ...matchData
      }
    });

  } catch (error: any) {
    console.error("Failed to analyze document match:", error);
    return NextResponse.json(
      { error: "分析文档匹配度失败", details: error.message },
      { status: 500 }
    );
  }
}
