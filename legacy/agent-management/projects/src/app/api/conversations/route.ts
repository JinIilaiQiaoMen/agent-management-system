import { NextRequest, NextResponse } from "next/server";
import { conversationManager } from "@/storage/database";

/**
 * GET /api/conversations - 获取对话记录
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const taskId = searchParams.get("taskId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const filters: any = {};
    if (agentId) {
      filters.agentId = agentId;
    }
    if (taskId) {
      filters.taskId = taskId;
    }

    const conversations = await conversationManager.getConversations({
      skip,
      limit,
      filters,
      orderBy: "createdAt",
      order: "desc",
    });

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("Failed to get conversations:", error);
    return NextResponse.json(
      {
        error: "获取对话记录失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
