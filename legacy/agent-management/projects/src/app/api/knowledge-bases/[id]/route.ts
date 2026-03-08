import { NextRequest, NextResponse } from "next/server";
import { knowledgeBaseManager } from "@/storage/database";

// PATCH: 更新知识库信息（包括内容和修改人）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, type, agentId, isActive, modifiedBy } = body;

    if (!id) {
      return NextResponse.json(
        { error: "缺少知识库ID" },
        { status: 400 }
      );
    }

    // 验证必填字段
    if (!modifiedBy) {
      return NextResponse.json(
        { error: "缺少修改人信息" },
        { status: 400 }
      );
    }

    // 更新知识库
    const updatedKb = await knowledgeBaseManager.updateKnowledgeBase(id, {
      name,
      description,
      type,
      agentId,
      isActive,
      modifiedBy,
    });

    if (!updatedKb) {
      return NextResponse.json(
        { error: "知识库不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedKb,
    });
  } catch (error) {
    console.error("更新知识库失败:", error);
    return NextResponse.json(
      { error: "更新知识库失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
