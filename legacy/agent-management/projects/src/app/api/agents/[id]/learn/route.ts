import { NextRequest, NextResponse } from "next/server";
import { agentManager, knowledgeBaseManager } from "@/storage/database";
import { Config, HeaderUtils, SearchClient, KnowledgeClient, DataSourceType } from "coze-coding-dev-sdk";

/**
 * POST /api/agents/[id]/learn - 智能体自主学习
 * 智能体根据当前任务和角色，主动搜索相关知识并添加到知识库
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;

  try {
    const body = await request.json();
    const { context, keywords } = body;

    // 获取智能体信息
    const agent = await agentManager.getAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ error: "智能体不存在" }, { status: 404 });
    }

    // 检查是否有知识库
    if (!agent.knowledgeBaseId) {
      // 如果没有知识库，创建一个
      const kb = await knowledgeBaseManager.createKnowledgeBase({
        name: `${agent.name} - 自学习知识库`,
        type: "individual",
        agentId: agent.id,
        description: `${agent.name}通过自主学习积累的知识库`,
        modifiedBy: "SYSTEM",
      });

      // 更新智能体的知识库ID
      await agentManager.updateAgent(agentId, { knowledgeBaseId: kb.id });

      agent.knowledgeBaseId = kb.id;
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置
    const config = new Config();
    const searchClient = new SearchClient(config, customHeaders);
    const knowledgeClient = new KnowledgeClient(config);

    // 确定搜索关键词
    let searchTerms: string[] = [];
    
    if (keywords && Array.isArray(keywords)) {
      searchTerms = keywords;
    } else if (context) {
      // 从上下文中提取关键词
      searchTerms = extractKeywords(context, agent.role);
    } else {
      // 使用智能体的角色和能力作为默认搜索关键词
      searchTerms = [
        ...(agent.capabilities as string[] || []),
        agent.role,
        agent.department || '',
      ].filter(Boolean);
    }

    // 执行搜索并添加到知识库
    const learningResults = [];
    const datasetName = `kb_${agent.knowledgeBaseId}`;

    for (const term of searchTerms.slice(0, 5)) {
      try {
        // 搜索相关知识
        const searchResponse = await searchClient.webSearch(term, 3, false);

        if (searchResponse.web_items && searchResponse.web_items.length > 0) {
          // 构建知识内容
          const knowledgeContent = {
            term,
            items: searchResponse.web_items.map(item => ({
              title: item.title,
              siteName: item.site_name,
              snippet: item.snippet,
              url: item.url || '',
              publishTime: item.publish_time || '',
            })),
            summary: searchResponse.summary || '',
            learnedAt: new Date().toISOString(),
          };

          // 添加到知识库
          const document = {
            source: DataSourceType.URI,
            uri: `auto-learn:${term}:${Date.now()}`,
            content: JSON.stringify(knowledgeContent),
          };

          const addResponse = await knowledgeClient.addDocuments([document], datasetName);

          if (addResponse.code === 0) {
            learningResults.push({
              term,
              itemCount: searchResponse.web_items.length,
              docId: addResponse.doc_ids?.[0],
            });
          }
        }
      } catch (error) {
        console.error(`Failed to learn about "${term}":`, error);
      }
    }

    // 更新知识库文档数量
    await knowledgeBaseManager.updateDocumentCount(agent.knowledgeBaseId, learningResults.length);

    return NextResponse.json({
      success: true,
      message: `智能体 ${agent.name} 学习完成`,
      data: {
        agentId: agent.id,
        agentName: agent.name,
        knowledgeBaseId: agent.knowledgeBaseId,
        learnedTerms: learningResults.map(r => r.term),
        totalItems: learningResults.reduce((sum, r) => sum + r.itemCount, 0),
        learningResults,
        learnedAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error("Agent learning error:", error);
    return NextResponse.json(
      {
        error: "智能体自主学习失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 从上下文中提取关键词
 */
function extractKeywords(context: string, role: string): string[] {
  const keywords: string[] = [];
  
  // 提取引号中的关键词
  const quoteMatches = context.match(/["「『]([^"」』]+)["」』]/g);
  if (quoteMatches) {
    keywords.push(...quoteMatches.map(m => m.replace(/["「『」』]/g, '')));
  }
  
  // 提取【】中的内容
  const bracketMatches = context.match(/【([^】]+)】/g);
  if (bracketMatches) {
    keywords.push(...bracketMatches.map(m => m.replace(/[【】]/g, '')));
  }
  
  // 提取技术关键词（大写字母组合）
  const techKeywords = context.match(/[A-Z]{2,}(?:[A-Z][a-z]*)?/g) || [];
  keywords.push(...techKeywords);
  
  // 提取中文技术名词（常见模式）
  const chineseTechPatterns = [
    /人工智能/g, /机器学习/g, /深度学习/g, /自然语言处理/g,
    /计算机视觉/g, /知识图谱/g, /大模型/g, /微调/g,
    /API/g, /接口/g, /框架/g, /平台/g, /系统/g,
  ];
  
  chineseTechPatterns.forEach(pattern => {
    const matches = context.match(pattern);
    if (matches) {
      keywords.push(...matches);
    }
  });
  
  // 添加角色相关关键词
  if (role) {
    keywords.push(role);
  }
  
  // 去重并限制数量
  return [...new Set(keywords)].filter(k => k.length >= 2).slice(0, 10);
}
