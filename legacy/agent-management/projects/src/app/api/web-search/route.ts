import { NextRequest, NextResponse } from "next/server";
import { SearchClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

/**
 * POST /api/web-search - 联网搜索
 */
export async function POST(request: NextRequest) {
  try {
    const { query, count = 10, needSummary = true } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "搜索内容不能为空" }, { status: 400 });
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 配置搜索客户端
    const config = new Config();
    const client = new SearchClient(config, customHeaders);

    // 执行搜索
    const response = await client.webSearch(query, count, needSummary);

    // 格式化返回结果
    const results = {
      summary: response.summary,
      webItems: response.web_items?.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        siteName: item.site_name,
        snippet: item.snippet,
        summary: item.summary,
        publishTime: item.publish_time,
      })) || [],
    };

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Web search error:", error);
    return NextResponse.json(
      { error: "搜索失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
