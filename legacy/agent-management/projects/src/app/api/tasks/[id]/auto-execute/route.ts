import { NextRequest, NextResponse } from "next/server";
import { taskManager, agentManager, knowledgeBaseManager } from "@/storage/database";
import { LLMClient, Config, HeaderUtils, SearchClient, KnowledgeClient, DataSourceType } from "coze-coding-dev-sdk";

/**
 * POST /api/tasks/[id]/auto-execute - 自动执行任务（全流程自动化）
 * 流程：
 * 1. 生成智能体团队
 * 2. 负责人智能体分析任务并拆解
 * 3. 专业智能体自主学习并执行子任务
 * 4. 负责人智能体汇总成果并交付
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;

  try {
    console.log(`[Task Auto-Execute] 开始执行任务: ${taskId}`);

    // 更新任务状态为执行中
    await taskManager.updateTask(taskId, {
      status: "in_progress",
    });
    console.log(`[Task Auto-Execute] 任务状态已更新为执行中`);

    // 获取任务信息
    const task = await taskManager.getTaskById(taskId);
    if (!task) {
      console.error(`[Task Auto-Execute] 任务不存在: ${taskId}`);
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    console.log(`[Task Auto-Execute] 任务信息: ${task.title}`);

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置
    const config = new Config();
    const llmClient = new LLMClient(config);
    const searchClient = new SearchClient(config, customHeaders);
    const knowledgeClient = new KnowledgeClient(config);

    // 步骤 1: 智能体团队生成（如果还没有）
    let agents = await agentManager.getAgents({
      filters: { isActive: true }
    });
    
    if (agents.length === 0) {
      console.log(`[Task Auto-Execute] 没有智能体，开始生成团队`);

      // 生成智能体团队
      const teamGenResponse = await fetch(
        new URL(`/api/tasks/${taskId}/generate-agents`, request.url),
        {
          method: "POST",
        }
      );

      if (!teamGenResponse.ok) {
        console.error(`[Task Auto-Execute] 生成智能体团队失败`);
        return NextResponse.json({ error: "生成智能体团队失败" }, { status: 500 });
      }

      // 获取任务关联的智能体
      const assignedTask = await taskManager.getTaskById(taskId);
      if (!assignedTask?.assignedAgentId) {
        console.error(`[Task Auto-Execute] 未分配负责人智能体`);
        return NextResponse.json({ error: "未分配负责人智能体" }, { status: 500 });
      }

      agents = await agentManager.getAgents({
        filters: { isActive: true }
      });

      console.log(`[Task Auto-Execute] 智能体团队生成完成，共 ${agents.length} 个智能体`);
    }

    // 找到负责人智能体
    const leaderAgent = agents.find(a => a.id === task.assignedAgentId) || agents[0];
    if (!leaderAgent) {
      console.error(`[Task Auto-Execute] 没有找到负责人智能体`);
      return NextResponse.json({ error: "没有找到负责人智能体" }, { status: 500 });
    }

    console.log(`[Task Auto-Execute] 负责人智能体: ${leaderAgent.name}`);

    // 获取专业智能体
    const specialistAgents = agents.filter(a => a.id !== leaderAgent.id);
    console.log(`[Task Auto-Execute] 专业智能体数量: ${specialistAgents.length}`);

    // 步骤 2: 负责人智能体分析任务并拆解
    console.log(`[Task Auto-Execute] 步骤 2: 分析任务`);
    
    const analysisPrompt = `作为任务负责人，请分析以下任务并拆解为可执行的子任务：

任务标题：${task.title}
任务描述：${task.description}
任务优先级：${task.priority}

请输出：
1. 任务核心目标
2. 关键需求（3-5条）
3. 子任务拆解（每个子任务包含：任务名称、执行智能体角色、具体要求、预期成果）
4. 工作流程（步骤说明）

可用专业智能体：
${specialistAgents.map(a => `- ${a.name}（${a.role}）：${a.description || ''}`).join('\n')}

请以结构化的格式输出，便于后续执行。`;

    const analysisMessages = [
      { role: "system" as const, content: leaderAgent.systemPrompt || `你是${leaderAgent.name}，${leaderAgent.role}。` },
      { role: "user" as const, content: analysisPrompt }
    ];

    let taskAnalysis = "";
    try {
      const analysisStream = llmClient.stream(analysisMessages, { temperature: 0.7 }, undefined, customHeaders);
      for await (const chunk of analysisStream) {
        if (chunk.content) {
          taskAnalysis += chunk.content.toString();
        }
      }
      console.log(`[Task Auto-Execute] 任务分析完成，内容长度: ${taskAnalysis.length}`);
    } catch (error) {
      console.error(`[Task Auto-Execute] 任务分析失败:`, error);
      throw new Error(`任务分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    // 步骤 3: 专业智能体自主学习并执行子任务
    console.log(`[Task Auto-Execute] 步骤 3: 专业智能体执行子任务`);
    
    const executionResults = [];

    for (const specialist of specialistAgents) {
      console.log(`[Task Auto-Execute] 执行智能体: ${specialist.name} (${specialist.role})`);

      // 为每个智能体生成执行提示
      const executionPrompt = `${taskAnalysis}

作为${specialist.name}（${specialist.role}），请根据你的专业能力完成相关子任务。

你的职责：${specialist.description || ''}
你的能力：${(specialist.capabilities as string[] | undefined)?.join('、') || ''}

请执行以下操作：
1. 分析你需要完成的子任务
2. 通过联网搜索获取相关知识和最新信息
3. 生成具体的执行方案或代码
4. 将重要的知识点和参考资料添加到你的知识库
5. 输出你的成果（代码、文档、方案等）

请详细输出你的工作过程和最终成果。`;

      // 专业智能体执行任务
      const specialistMessages = [
        { role: "system" as const, content: specialist.systemPrompt || `你是${specialist.name}，${specialist.role}。` },
        { role: "user" as const, content: executionPrompt }
      ];

      let result = "";
      try {
        const specialistStream = llmClient.stream(specialistMessages, { temperature: 0.7 }, undefined, customHeaders);
        for await (const chunk of specialistStream) {
          if (chunk.content) {
            result += chunk.content.toString();
          }
        }
      } catch (error) {
        console.error(`[Task Auto-Execute] 智能体 ${specialist.name} 执行失败:`, error);
        result = `执行失败: ${error instanceof Error ? error.message : '未知错误'}`;
      }

      console.log(`[Task Auto-Execute] ${specialist.name} 执行完成，内容长度: ${result.length}`);

      // 提取搜索关键词
      const searchKeywords = extractSearchKeywords(result);

      // 自主学习：搜索并添加知识库
      const knowledgeItems = [];
      if (specialist.knowledgeBaseId) {
        console.log(`[Task Auto-Execute] ${specialist.name} 开始自主学习`);
        
        for (const keyword of searchKeywords.slice(0, 3)) {
          try {
            const searchResult = await searchClient.webSearch(keyword, 3, false);
            
            if (searchResult.web_items && searchResult.web_items.length > 0) {
              const knowledgeContent = searchResult.web_items.map(item => 
                `标题：${item.title}\n来源：${item.site_name}\n摘要：${item.snippet}\n链接：${item.url || ''}`
              ).join('\n\n');

              // 添加到知识库
              const document = {
                source: DataSourceType.TEXT,
                raw_data: knowledgeContent,
              };

              const tableName = `kb_${specialist.knowledgeBaseId}`;
              await knowledgeClient.addDocuments([document], tableName);

              knowledgeItems.push({
                keyword,
                itemCount: searchResult.web_items.length
              });
            }
          } catch (error) {
            console.error(`[Task Auto-Execute] 自主学习失败 (${keyword}):`, error);
          }
        }

        console.log(`[Task Auto-Execute] ${specialist.name} 学习了 ${knowledgeItems.length} 个知识点`);

        // 更新知识库文档数量
        await knowledgeBaseManager.updateDocumentCount(specialist.knowledgeBaseId, knowledgeItems.length);
      }

      executionResults.push({
        agentId: specialist.id,
        agentName: specialist.name,
        agentRole: specialist.role,
        result,
        knowledgeLearned: knowledgeItems
      });
    }

    // 步骤 4: 负责人智能体汇总成果
    console.log(`[Task Auto-Execute] 步骤 4: 汇总成果`);
    
    const summaryPrompt = `作为任务负责人，请汇总以下专业智能体的执行结果，整合成最终的可交付成果：

原始任务：
标题：${task.title}
描述：${task.description}

任务分析：
${taskAnalysis}

专业智能体执行结果：
${executionResults.map(r => `
【${r.agentName}（${r.agentRole}）】
${r.result}

学习知识点：
${r.knowledgeLearned.map(k => `- ${k.keyword}（${k.itemCount}条）`).join('\n')}
`).join('\n')}

请整合所有成果，输出：
1. 整体完成情况
2. 关键成果总结
3. 可交付物清单
4. 后续建议

请以专业、清晰的方式输出最终交付报告。`;

    const summaryMessages = [
      { role: "system" as const, content: leaderAgent.systemPrompt || `你是${leaderAgent.name}，${leaderAgent.role}。` },
      { role: "user" as const, content: summaryPrompt }
    ];

    let finalSummary = "";
    try {
      const summaryStream = llmClient.stream(summaryMessages, { temperature: 0.7 }, undefined, customHeaders);
      for await (const chunk of summaryStream) {
        if (chunk.content) {
          finalSummary += chunk.content.toString();
        }
      }
      console.log(`[Task Auto-Execute] 成果汇总完成`);
    } catch (error) {
      console.error(`[Task Auto-Execute] 成果汇总失败:`, error);
      finalSummary = `汇总失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }

    // 保存最终成果到任务成果
    console.log(`[Task Auto-Execute] 保存任务成果`);
    const { taskDeliverableManager } = await import("@/storage/database");
    await taskDeliverableManager.createTaskDeliverable({
      taskId,
      agentId: leaderAgent.id,
      title: `任务执行报告 - ${new Date().toLocaleString()}`,
      type: "report",
      content: `# 任务执行报告\n\n## 任务概述\n\n${task.title}\n\n${task.description}\n\n## 任务分析\n\n${taskAnalysis}\n\n## 执行过程\n\n${executionResults.map(r => `### ${r.agentName}（${r.agentRole}）\n\n${r.result}\n\n**学习知识点**：${r.knowledgeLearned.map(k => k.keyword).join('、')}\n`).join('\n')}\n\n## 最终成果\n\n${finalSummary}\n\n## 执行时间\n\n${new Date().toLocaleString()}`,
      status: "approved",
      version: 1,
    });

    // 更新任务状态为已完成
    await taskManager.updateTask(taskId, {
      status: "completed",
      completedAt: new Date(),
    });

    console.log(`[Task Auto-Execute] 任务执行完成: ${taskId}`);

    return NextResponse.json({
      success: true,
      message: "任务自动执行完成",
      data: {
        taskId,
        taskAnalysis,
        executionResults,
        finalSummary,
        executedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error("[Task Auto-Execute] Error:", error);
    
    // 更新任务状态为失败
    try {
      await taskManager.updateTask(taskId, {
        status: "failed",
        metadata: { error: error.message },
      });
    } catch (updateError) {
      console.error("[Task Auto-Execute] Failed to update task status:", updateError);
    }

    return NextResponse.json(
      {
        error: "自动执行任务失败",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * 提取搜索关键词
 */
function extractSearchKeywords(text: string): string[] {
  const keywords: string[] = [];
  
  // 提取引号中的关键词
  const quoteMatches = text.match(/["「『]([^"」』]+)["」』]/g);
  if (quoteMatches) {
    keywords.push(...quoteMatches.map(m => m.replace(/["「『」』]/g, '')));
  }
  
  // 提取【】中的内容
  const bracketMatches = text.match(/【([^】]+)】/g);
  if (bracketMatches) {
    keywords.push(...bracketMatches.map(m => m.replace(/[【】]/g, '')));
  }
  
  // 提取技术关键词
  const techKeywords = text.match(/[A-Z]{2,}(?:[A-Z][a-z]*)?/g) || [];
  keywords.push(...techKeywords);
  
  // 去重并限制数量
  return [...new Set(keywords)].slice(0, 10);
}
