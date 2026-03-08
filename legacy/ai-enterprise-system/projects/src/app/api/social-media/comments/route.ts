import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialMediaComments, autoReplyRules } from '@/storage/database/shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateText } from '@/lib/llm';

/**
 * 评论管理 API
 * 获取评论、回复评论、自动回复
 */

// GET - 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const postId = searchParams.get('postId');
    const status = searchParams.get('status'); // pending, replied, unreplied
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 构建筛选条件
    const conditions = [];
    if (platform) {
      conditions.push(eq(socialMediaComments.platform, platform));
    }
    if (postId) {
      conditions.push(eq(socialMediaComments.postId, postId));
    }
    if (status === 'replied') {
      conditions.push(eq(socialMediaComments.isAutoReplied, true));
    } else if (status === 'unreplied') {
      conditions.push(eq(socialMediaComments.isAutoReplied, false));
    }

    // 执行查询
    const comments = await db
      .select()
      .from(socialMediaComments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(socialMediaComments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      comments,
      total: comments.length
    });
  } catch (error: any) {
    console.error('获取评论失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取评论失败',
      details: error.message
    }, { status: 500 });
  }
}

// POST - 回复评论或批量自动回复
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 检查是否为批量自动回复请求
    if (body.batch === true) {
      const { platform, postId } = body;
      return await handleBatchAutoReplyInternal(platform, postId);
    }
    
    const { commentId, replyText, replyStrategy = 'manual' } = body;

    if (!commentId || !replyText) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: commentId, replyText'
      }, { status: 400 });
    }

    // 查找评论
    const comment = await db.select().from(socialMediaComments).where(eq(socialMediaComments.id, commentId)).limit(1);

    if (!comment || comment.length === 0) {
      return NextResponse.json({
        success: false,
        error: '评论不存在'
      }, { status: 404 });
    }

    // 更新回复信息
    const now = new Date().toISOString();
    const updatedComment = await db
      .update(socialMediaComments)
      .set({
        replyText,
        isAutoReplied: replyStrategy !== 'manual',
        replyStrategy,
        repliedAt: now
      })
      .where(eq(socialMediaComments.id, commentId))
      .returning();

    return NextResponse.json({
      success: true,
      comment: updatedComment[0],
      message: '回复成功'
    });
  } catch (error: any) {
    console.error('回复评论失败:', error);
    return NextResponse.json({
      success: false,
      error: '回复失败',
      details: error.message
    }, { status: 500 });
  }
}

// 自动回复评论（内部函数，不导出）
async function generateAutoReply(commentId: string, platform: string): Promise<string | null> {
  try {
    // 获取评论信息
    const comment = await db.select().from(socialMediaComments).where(eq(socialMediaComments.id, commentId)).limit(1);

    if (!comment || comment.length === 0) {
      return null;
    }

    const commentData = comment[0];
    const commentText = commentData.commentText;

    // 1. 先尝试规则匹配
    const rules = await db
      .select()
      .from(autoReplyRules)
      .where(and(
        eq(autoReplyRules.platform, platform),
        eq(autoReplyRules.enabled, true)
      ))
      .orderBy(desc(autoReplyRules.priority));

    for (const rule of rules) {
      const keywords = rule.keywords as string[];
      if (keywords.some(keyword => commentText.toLowerCase().includes(keyword.toLowerCase()))) {
        // 更新规则使用次数
        await db
          .update(autoReplyRules)
          .set({
            responseCount: (rule.responseCount || 0) + 1,
            lastUsedAt: new Date().toISOString()
          })
          .where(eq(autoReplyRules.id, rule.id));

        return rule.template;
      }
    }

    // 2. 规则未匹配，使用 LLM 生成回复
    const systemPrompt = `你是一位专业的社交媒体客服，擅长友好、专业地回复用户评论。`;

    const userPrompt = `请友好、专业地回复以下评论：

评论内容：${commentText}

要求：
1. 语气友好、亲切
2. 回复简洁（不超过50字）
3. 如有疑问，引导用户私信
4. 保持积极正面的态度`;

    const llmReply = await generateText(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { model: 'doubao', temperature: 0.8 }
    );

    return llmReply;
  } catch (error) {
    console.error('生成自动回复失败:', error);
    return null;
  }
}

// 批量自动回复（内部函数）
async function handleBatchAutoReplyInternal(platform?: string, postId?: string) {
  try {
    const conditions = [];
    if (platform) {
      conditions.push(eq(socialMediaComments.platform, platform));
    }
    if (postId) {
      conditions.push(eq(socialMediaComments.postId, postId));
    }
    conditions.push(eq(socialMediaComments.isAutoReplied, false));

    // 获取未回复的评论
    const unrepliedComments = await db
      .select()
      .from(socialMediaComments)
      .where(and(...conditions));

    let successCount = 0;
    const results = [];

    for (const comment of unrepliedComments) {
      const replyText = await generateAutoReply(comment.id, comment.platform);

      if (replyText) {
        await db
          .update(socialMediaComments)
          .set({
            replyText,
            isAutoReplied: true,
            replyStrategy: 'auto',
            repliedAt: new Date().toISOString()
          })
          .where(eq(socialMediaComments.id, comment.id));

        successCount++;
        results.push({
          commentId: comment.id,
          success: true,
          replyText
        });
      } else {
        results.push({
          commentId: comment.id,
          success: false,
          error: '无法生成回复'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功回复 ${successCount}/${unrepliedComments.length} 条评论`,
      results
    });
  } catch (error: any) {
    console.error('批量自动回复失败:', error);
    return NextResponse.json({
      success: false,
      error: '批量自动回复失败',
      details: error.message
    }, { status: 500 });
  }
}
