/**
 * ZAEP 三省系统统一入口
 * 整合中书省、门下省、尚书省的完整流程
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ImperialDecree,
  ImperialResponse,
  ProcessFlow,
  EdictStatus,
  RiskLevel
} from '@/lib/types/san-sheng.types';

// TODO: 实现这些类
import { ZhongshuSheng } from '@/lib/zhongshusheng/decider';
import { MenxiaSheng } from '@/lib/menxiasheng/auditor';
import { TaskDispatcher } from '@/lib/shangshusheng/dispatcher';
import { MonitorSystem } from '@/lib/jinyiwei/monitor';

/**
 * 三省系统统一入口
 * 负责整合三省流程，协调锦衣卫监控
 */
export class SanShengSystem {
  private zhongshu: ZhongshuSheng;
  private menxia: MenxiaSheng;
  private shangshu: TaskDispatcher;
  private jinyiwei: MonitorSystem;

  constructor() {
    this.zhongshu = new ZhongshuSheng();
    this.menxia = new MenxiaSheng();
    this.shangshu = new TaskDispatcher();
    this.jinyiwei = new MonitorSystem();
  }

  /**
   * 处理皇帝圣旨（主流程）
   * @param decree - 皇帝的圣旨
   */
  async handleImperialDecree(decree: ImperialDecree): Promise<ImperialResponse> {
    const processId = uuidv4();
    const flow: ProcessFlow = {
      processId,
      timestamp: Date.now(),
      imperialDecree: decree,
    };

    try {
      // ===== 1. 中书省：草拟诏令 =====
      flow.zhongshu = await this.processZhongshu(decree, flow);

      // ===== 2. 门下省：审核诏令 =====
      flow.menxia = await this.processMenxia(decree, flow);

      // 如果审核未通过，返回驳回响应
      if (!flow.menxia.edict) {
        return this.createRejectionResponse(
          processId,
          flow.menxia.reviewResult.reason!,
          flow
        );
      }

      // ===== 3. 尚书省：执行诏令 =====
      flow.shangshu = await this.processShangshu(flow.menxia.edict, flow);

      // ===== 4. 锦衣卫：监控全流程 =====
      const monitorReport = await this.jinyiwei.monitorProcess(processId, flow);

      // ===== 5. 返回成功响应 =====
      return this.createSuccessResponse(
        processId,
        flow.shangshu,
        monitorReport
      );

    } catch (error) {
      // 记录异常
      await this.jinyiwei.logAnomaly(processId, {
        stage: 'zhongshu',
        level: 'error',
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: Date.now(),
      });

      return this.createErrorResponse(
        processId,
        error instanceof Error ? error.message : '未知错误',
        flow
      );
    }
  }

  /**
   * 处理中书省流程
   */
  private async processZhongshu(decree: ImperialDecree, flow: ProcessFlow) {
    const startTime = Date.now();

    // 草拟诏令
    const edictDraft = await this.zhongshu.draftEdict(
      decree.message,
      {
        sessionId: decree.sessionId,
        userId: decree.userId,
        timestamp: decree.timestamp,
        conversationHistory: [], // TODO: 从数据库获取
      }
    );

    return {
      intent: edictDraft.intent,
      parameters: edictDraft.parameters,
      draftId: edictDraft.id,
      decisionTime: Date.now() - startTime,
      completedAt: Date.now(),
    };
  }

  /**
   * 处理门下省流程
   */
  private async processMenxia(decree: ImperialDecree, flow: ProcessFlow) {
    // 审核诏令草案
    const reviewResult = await this.menxia.reviewEdict({
      id: flow.zhongshu!.draftId,
      intent: flow.zhongshu!.intent,
      parameters: flow.zhongshu!.parameters,
      targetMinistry: flow.zhongshu!.intent.targetMinistry || '吏部' as any,
      priority: decree.options?.priority || 'normal',
      createdBy: decree.userId,
      createdAt: decree.timestamp,
      status: 'draft',
    });

    if (!reviewResult.passed) {
      // 审核未通过，驳回
      return {
        reviewResult,
        completedAt: Date.now(),
      };
    }

    // 审核通过，生成诏令
    const edict = {
      id: uuidv4(),
      draftId: flow.zhongshu!.draftId,
      intent: flow.zhongshu!.intent,
      parameters: flow.zhongshu!.parameters,
      targetMinistry: flow.zhongshu!.intent.targetMinistry || '吏部' as any,
      priority: decree.options?.priority || 'normal',
      approvedBy: 'system',
      approvedAt: Date.now(),
      status: 'approved' as EdictStatus,
    };

    return {
      reviewResult,
      edict,
      completedAt: Date.now(),
    };
  }

  /**
   * 处理尚书省流程
   */
  private async processShangshu(edict: any, flow: ProcessFlow) {
    const startTime = Date.now();

    // 执行诏令
    const executionResult = await this.shangshu.executeEdict(edict);

    return {
      taskId: executionResult.taskId,
      agent: {
        id: executionResult.agentId,
        name: 'TODO', // 从结果中获取
        ministry: edict.targetMinistry,
        capabilities: [],
        status: 'active' as const,
        description: '',
        version: '1.0.0',
      },
      startedAt: startTime,
      completedAt: Date.now(),
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * 创建成功响应
   */
  private createSuccessResponse(
    processId: string,
    shangshu: any,
    monitorReport: any
  ): ImperialResponse {
    return {
      success: true,
      message: '圣旨已成功执行',
      edictId: shangshu.taskId,
      flow: {
        zhongshu: undefined,
        menxia: undefined,
        shangshu: {
          ministry: shangshu.agent.ministry,
          agent: shangshu.agent.name,
          executionTime: shangshu.executionTime,
        },
      },
      audit: {
        processId,
        reportUrl: `/api/jinyiwei/audit/${processId}`,
      },
    };
  }

  /**
   * 创建驳回响应
   */
  private createRejectionResponse(
    processId: string,
    rejectionReason: any,
    flow: ProcessFlow
  ): ImperialResponse {
    return {
      success: false,
      message: '圣旨已被驳回',
      rejection: {
        reason: rejectionReason.message,
        suggestions: rejectionReason.suggestions,
      },
      flow: {
        zhongshu: undefined,
        menxia: {
          passed: false,
          checks: [],
          rejectionReason: rejectionReason.message,
        },
        shangshu: undefined,
      },
      audit: {
        processId,
        reportUrl: `/api/jinyiwei/audit/${processId}`,
      },
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(
    processId: string,
    errorMessage: string,
    flow: ProcessFlow
  ): ImperialResponse {
    return {
      success: false,
      message: '执行过程中发生错误',
      flow: {
        zhongshu: undefined,
        menxia: undefined,
        shangshu: undefined,
      },
      audit: {
        processId,
        reportUrl: `/api/jinyiwei/audit/${processId}`,
      },
    };
  }
}

/**
 * 单例实例
 */
export const sanShengSystem = new SanShengSystem();

/**
 * 处理圣旨的便捷函数
 */
export async function handleImperialDecree(decree: ImperialDecree): Promise<ImperialResponse> {
  return sanShengSystem.handleImperialDecree(decree);
}
