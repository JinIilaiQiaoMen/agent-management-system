import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

/**
 * POST /api/classify-deliverable - 智能分类任务成果
 */
export async function POST(request: NextRequest) {
  try {
    const { title, content, type } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "内容不能为空" },
        { status: 400 }
      );
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    // 构建分类提示词
    const prompt = `你是一个专业的AI内容分类专家。请根据以下内容，将其分类到合适的类别中。

【内容信息】
标题：${title || '无标题'}
类型：${type || '未指定'}
内容：${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

【分类标准】
1. **技能（Skill）**：可复用的代码、函数、工具类、算法、API接口、技术方法等
   - 特征：包含代码、函数定义、算法逻辑、技术实现等
   - 示例：Python函数、TypeScript类、算法实现、API端点、数据处理方法

2. **工作流（Workflow）**：流程描述、操作步骤、任务流程、工作流程图等
   - 特征：包含步骤、流程、顺序、操作说明等
   - 示例：任务执行流程、操作指南、工作步骤、处理流程图

3. **对话文档（Document）**：问答、说明、解释性内容、分析报告、需求文档等
   - 特征：包含问题回答、说明解释、分析内容、需求描述等
   - 示例：技术文档、需求说明、分析报告、问答记录、解释说明

4. **配置（Config）**：配置文件、环境设置、参数定义、系统设置等
   - 特征：包含配置项、参数、环境变量、设置等
   - 示例：配置文件、环境变量、参数设置、系统配置

5. **数据（Data）**：数据结构、数据格式、示例数据、测试数据等
   - 特征：包含数据样本、数据结构、数据格式、测试数据等
   - 示例：JSON数据、CSV数据、测试数据、数据结构定义

6. **设计（Design）**：UI设计、架构设计、系统设计、原型设计等
   - 特征：包含设计思路、架构方案、UI描述、设计规范等
   - 示例：系统架构、UI设计稿、设计方案、设计文档

【输出格式】
请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "category": "分类结果（skill/workflow/document/config/data/design）",
  "confidence": 0.95,
  "reason": "分类原因说明",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "suggestedTags": ["建议标签1", "建议标签2"]
}

【注意事项】
- 只能选择上面6个分类之一
- confidence 是分类置信度（0-1之间的数值）
- reason 说明为什么这样分类
- keywords 提取内容中的关键词（3-5个）
- suggestedTags 给出适合的标签建议（2-3个）`;

    // 调用大模型进行分类
    const messages = [
      {
        role: "system" as const,
        content: "你是一个专业的AI内容分类专家，能够准确识别内容的类型和特征，将其分类到最合适的类别中。"
      },
      { role: "user" as const, content: prompt }
    ];

    const llmStream = client.stream(messages, { temperature: 0.3 }, undefined, customHeaders);

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
      throw new Error("无法解析AI生成的分类结果");
    }

    const classification = JSON.parse(jsonMatch[0]);

    // 映射分类到知识库标签
    const categoryMapping: { [key: string]: string } = {
      skill: "技能",
      workflow: "工作流",
      document: "文档",
      config: "配置",
      data: "数据",
      design: "设计"
    };

    return NextResponse.json({
      success: true,
      data: {
        ...classification,
        categoryLabel: categoryMapping[classification.category] || classification.category
      }
    });
  } catch (error) {
    console.error("Failed to classify deliverable:", error);
    return NextResponse.json(
      { error: "分类失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
