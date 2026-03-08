import { NextRequest, NextResponse } from "next/server";
import { KnowledgeClient, Config, DataSourceType, HeaderUtils } from "coze-coding-dev-sdk";
import { knowledgeBaseManager, documentManager } from "@/storage/database";

/**
 * POST /api/knowledge-bases/add-document - 添加文档到知识库
 * 支持：
 * - 纯文本内容
 * - 网页 URL
 */
export async function POST(request: NextRequest) {
  try {
    const { knowledgeBaseId, type, content } = await request.json();

    if (!knowledgeBaseId || !type || !content) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    if (type !== "text" && type !== "url") {
      return NextResponse.json(
        { error: "不支持的文档类型，仅支持 text 和 url" },
        { status: 400 }
      );
    }

    // 获取知识库信息
    const kb = await knowledgeBaseManager.getKnowledgeBaseById(knowledgeBaseId);
    if (!kb) {
      return NextResponse.json({ error: "知识库不存在" }, { status: 404 });
    }

    // 使用简化的数据集名称（只使用字母和数字）
    const datasetName = `kb_${kb.id.replace(/-/g, '')}`;

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置知识库客户端
    const config = new Config();
    const knowledgeClient = new KnowledgeClient(config, customHeaders);

    // 根据类型构建文档
    const document = {
      source: type === "url" ? DataSourceType.URL : DataSourceType.TEXT,
      raw_data: type === "text" ? content : undefined,
      url: type === "url" ? content : undefined,
    };

    console.log(`Adding document to dataset: ${datasetName}`);
    console.log(`Document type: ${type}, content length: ${content.length}`);

    // 添加文档到知识库
    const response = await knowledgeClient.addDocuments([document], datasetName);

    console.log(`Knowledge base response: code=${response.code}, msg=${response.msg}`);

    if (response.code !== 0) {
      console.error("Failed to add document to knowledge base:", response.msg);
      return NextResponse.json(
        { error: `添加文档失败: ${response.msg}` },
        { status: 500 }
      );
    }

    const docId = response.doc_ids?.[0];

    // 调用AI分析文档匹配度
    let matchData = {
      matchScore: 50,
      matchReason: "未进行分析",
      analysis: "",
      recommendation: "不确定"
    };

    try {
      const analyzeResponse = await fetch(`${request.nextUrl.origin}/api/knowledge-bases/analyze-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeBaseId,
          documentContent: content,
          documentType: type,
          documentTitle: type === "url" ? content : "文本文档"
        })
      });

      if (analyzeResponse.ok) {
        const analyzeResult = await analyzeResponse.json();
        if (analyzeResult.success && analyzeResult.data) {
          matchData = {
            matchScore: analyzeResult.data.matchScore || 50,
            matchReason: analyzeResult.data.matchReason || "未提供说明",
            analysis: analyzeResult.data.analysis || "",
            recommendation: analyzeResult.data.recommendation || "不确定"
          };
        }
      }
    } catch (analyzeError) {
      console.error("Failed to analyze document match:", analyzeError);
      // 分析失败不影响文档添加，只记录日志
    }

    // 保存文档记录到数据库
    try {
      await documentManager.createDocument({
        fileName: type === "url" ? content : "文本文档",
        filePath: datasetName,
        fileType: type,
        fileSize: content.length,
        content: content.substring(0, 5000), // 只保存前5000个字符
        status: "analyzed",
        knowledgeBaseId,
        uploadedBy: "CEO",
        metadata: {
          docId,
          matchScore: matchData.matchScore,
          matchReason: matchData.matchReason,
          analysis: matchData.analysis,
          recommendation: matchData.recommendation
        }
      });
    } catch (dbError) {
      console.error("Failed to save document record:", dbError);
      // 数据库保存失败不影响返回结果，只记录日志
    }

    // 更新文档数量
    await knowledgeBaseManager.updateDocumentCount(knowledgeBaseId, 1);

    return NextResponse.json({
      success: true,
      docIds: response.doc_ids,
      matchAnalysis: matchData
    });
  } catch (error: any) {
    console.error("Failed to add document:", error);
    return NextResponse.json(
      { error: "添加文档失败", details: error.message },
      { status: 500 }
    );
  }
}
