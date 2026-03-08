import { NextRequest, NextResponse } from "next/server";
import { agentManager } from "@/storage/database";

/**
 * GET /api/agents - 获取所有智能体
 */
export async function GET() {
  try {
    const agents = await agentManager.getAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error("Failed to get agents:", error);
    return NextResponse.json({ error: "获取智能体列表失败" }, { status: 500 });
  }
}

/**
 * POST /api/agents - 创建智能体
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agent = await agentManager.createAgent(body);
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Failed to create agent:", error);
    return NextResponse.json({ error: "创建智能体失败" }, { status: 500 });
  }
}
