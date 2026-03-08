/**
 * ZAEP 门下省 - 审核系统
 * 负责审核诏令，如有不妥可驳回
 */

import { v4 as uuidv4 } from 'uuid';
import { PermissionChecker, checkPermission } from './permission-checker';
import { SafetyChecker, checkSafety } from './safety-checker';
import { RiskAssessor, assessRisk } from './risk-assessor';
import {
  EdictDraft,
  Edict,
  ReviewResult,
  CheckItem,
  RiskLevel,
} from '../types/san-sheng.types';

/**
 * 门下省 - 审核封驳机构
 */
export class MenxiaSheng {
  private permissionChecker: PermissionChecker;
  private safetyChecker: SafetyChecker;
  private riskAssessor: RiskAssessor;

  constructor() {
    this.permissionChecker = new PermissionChecker();
    this.safetyChecker = new SafetyChecker();
    this.riskAssessor = new RiskAssessor();
  }

  /**
   * 审核诏令
   * @param edictDraft - 诏令草案
   */
  async reviewEdict(edictDraft: EdictDraft): Promise<ReviewResult> {
    console.log(`[门下省] 开始审核诏令: ${edictDraft.id}`);
    const startTime = Date.now();

    const checks: CheckItem[] = [];

    // 1. 权限检查
    const permissionCheck = await this.checkPermission(edictDraft);
    checks.push(permissionCheck);

    if (!permissionCheck.passed) {
      return this.createReviewResult(false, checks, startTime);
    }

    // 2. 安全检查
    const safetyCheck = await this.checkSafety(edictDraft);
    checks.push(safetyCheck);

    if (!safetyCheck.passed) {
      return this.createReviewResult(false, checks, startTime);
    }

    // 3. 逻辑检查
    const logicCheck = await this.checkLogic(edictDraft);
    checks.push(logicCheck);

    if (!logicCheck.passed) {
      return this.createReviewResult(false, checks, startTime);
    }

    // 4. 风险评估
    const riskCheck = await this.checkRisk(edictDraft);
    checks.push(riskCheck);

    // 5. 综合判断
    const passed = this.finalizeDecision(checks);

    console.log(`[门下省] 审核完成: 通过=${passed}, 耗时=${Date.now() - startTime}ms`);

    return this.createReviewResult(passed, checks, startTime);
  }

  /**
   * 权限检查
   */
  private async checkPermission(edictDraft: EdictDraft): Promise<CheckItem> {
    // 从草拟诏令中提取用户信息（这里暂时使用默认值）
    const userId = edictDraft.createdBy || 'anonymous';
    const userRoles = ['user']; // TODO: 从用户系统获取

    const check = await this.permissionChecker.checkPermission(
      {
        id: edictDraft.intent.id,
        name: edictDraft.intent.name,
      },
      userId,
      userRoles
    );

    return check;
  }

  /**
   * 安全检查
   */
  private async checkSafety(edictDraft: EdictDraft): Promise<CheckItem> {
    // 从参数中提取原始消息（如果存在）
    const message = edictDraft.parameters.rawText || edictDraft.intent.name;

    const check = await this.safetyChecker.checkSafety(
      {
        id: edictDraft.intent.id,
        name: edictDraft.intent.name,
      },
      edictDraft.parameters,
      message
    );

    return check;
  }

  /**
   * 逻辑检查
   */
  private async checkLogic(edictDraft: EdictDraft): Promise<CheckItem> {
    console.log(`[门下省] 逻辑检查: 意图=${edictDraft.intent.id}`);

    const issues: string[] = [];

    // 1. 检查参数完整性
    const requiredParams = this.getRequiredParams(edictDraft.intent.id);
    for (const param of requiredParams) {
      if (!edictDraft.parameters[param]) {
        issues.push(`缺少必需参数: ${param}`);
      }
    }

    // 2. 检查参数有效性
    const validationIssues = this.validateParameters(
      edictDraft.intent.id,
      edictDraft.parameters
    );
    issues.push(...validationIssues);

    // 3. 检查意图与六部匹配
    const intentMinistryMatch = this.checkIntentMinistryMatch(edictDraft);
    if (!intentMinistryMatch.passed) {
      issues.push(intentMinistryMatch.message);
    }

    // 4. 检查优先级合理性
    const priorityCheck = this.checkPriorityRationale(edictDraft);
    if (!priorityCheck.passed) {
      issues.push(priorityCheck.message);
    }

    if (issues.length > 0) {
      return {
        name: '逻辑检查',
        passed: false,
        message: '发现逻辑问题',
        details: {
          issues: issues,
          suggestion: '请检查参数和意图是否正确',
        },
      };
    }

    return {
      name: '逻辑检查',
      passed: true,
      message: '逻辑检查通过',
      details: {
        params: Object.keys(edictDraft.parameters),
      },
    };
  }

  /**
   * 风险评估
   */
  private async checkRisk(edictDraft: EdictDraft): Promise<CheckItem> {
    // 从参数中提取原始消息
    const message = edictDraft.parameters.rawText || edictDraft.intent.name;

    const check = await this.riskAssessor.assessRisk(
      {
        id: edictDraft.intent.id,
        name: edictDraft.intent.name,
      },
      edictDraft.parameters,
      message
    );

    return check;
  }

  /**
   * 综合判断
   */
  private finalizeDecision(checks: CheckItem[]): boolean {
    // 如果有任何检查失败，则驳回
    const failedChecks = checks.filter(c => !c.passed);

    // 必须通过的检查项
    const mustPassChecks = ['权限检查', '安全检查', '逻辑检查'];
    for (const mustPass of mustPassChecks) {
      if (failedChecks.some(c => c.name === mustPass)) {
        return false;
      }
    }

    // 风险检查如果是critical，也驳回
    const riskCheck = checks.find(c => c.name === '风险评估');
    if (riskCheck && (riskCheck as any).riskLevel === 'critical') {
      return false;
    }

    return true;
  }

  /**
   * 创建审核结果
   */
  private createReviewResult(
    passed: boolean,
    checks: CheckItem[],
    startTime: number
  ): ReviewResult {
    let reason;

    if (!passed) {
      // 找到失败的原因
      const failedChecks = checks.filter(c => !c.passed);

      // 优先处理权限和安全问题
      const priorityFailed = failedChecks.find(c =>
        ['权限检查', '安全检查'].includes(c.name)
      );

      if (priorityFailed) {
        reason = this.createRejectionReasonFromCheck(priorityFailed);
      } else if ((checks.find(c => c.name === '风险评估') as any)?.riskLevel === 'critical') {
        reason = this.riskAssessor.generateRejectionReason(
          'critical',
          (checks.find(c => c.name === '风险评估') as any).riskFactors
        );
      } else {
        reason = this.createRejectionReasonFromCheck(failedChecks[0]);
      }
    }

    return {
      passed,
      checks,
      reason,
      reviewedAt: Date.now(),
    };
  }

  /**
   * 从检查项创建驳回原因
   */
  private createRejectionReasonFromCheck(check: CheckItem): any {
    const category = this.mapCheckNameToCategory(check.name);
    const riskLevel = this.estimateRiskLevelFromCheck(check);

    return {
      category,
      level: riskLevel,
      message: check.message,
      suggestions: this.getSuggestionsFromCheck(check),
    };
  }

  /**
   * 映射检查名称到类别
   */
  private mapCheckNameToCategory(checkName: string): 'permission' | 'safety' | 'logic' | 'risk' {
    const mapping: Record<string, any> = {
      '权限检查': 'permission',
      '安全检查': 'safety',
      '逻辑检查': 'logic',
      '风险评估': 'risk',
    };
    return mapping[checkName] || 'logic';
  }

  /**
   * 从检查项估算风险等级
   */
  private estimateRiskLevelFromCheck(check: CheckItem): RiskLevel {
    // 如果检查项本身有riskLevel，直接使用
    if ((check as any).riskLevel) {
      return (check as any).riskLevel;
    }

    // 根据检查名称估算
    const riskLevels: Record<string, RiskLevel> = {
      '权限检查': 'medium',
      '安全检查': 'high',
      '逻辑检查': 'low',
    };

    return riskLevels[check.name] || 'low';
  }

  /**
   * 从检查项获取建议
   */
  private getSuggestionsFromCheck(check: CheckItem): string[] {
    const suggestions: string[] = [];

    // 如果检查项有详细信息
    if (check.details && check.details.suggestion) {
      suggestions.push(check.details.suggestion);
    }

    // 根据检查名称添加默认建议
    const defaultSuggestions: Record<string, string[]> = {
      '权限检查': ['请联系管理员开通相应权限', '或使用其他方式完成任务'],
      '安全检查': ['请确认操作不会造成数据损坏', '建议先备份数据'],
      '逻辑检查': ['请检查输入参数是否完整', '或提供更详细的描述'],
      '风险评估': ['建议降低操作风险', '或分批执行，逐步验证'],
    };

    if (defaultSuggestions[check.name]) {
      suggestions.push(...defaultSuggestions[check.name]);
    }

    return suggestions;
  }

  /**
   * 获取必需参数
   */
  private getRequiredParams(intentId: string): string[] {
    const requiredParamsMap: Record<string, string[]> = {
      'customer_analysis': ['company'],
      'email_generation': ['recipient'],
      'data_crawl': ['url'],
      'recruitment': ['position'],
    };
    return requiredParamsMap[intentId] || [];
  }

  /**
   * 验证参数
   */
  private validateParameters(intentId: string, parameters: any): string[] {
    const issues: string[] = [];

    switch (intentId) {
      case 'customer_analysis':
        if (parameters.company && typeof parameters.company !== 'string') {
          issues.push('company参数必须是字符串');
        }
        break;

      case 'email_generation':
        if (parameters.recipient && !this.isValidEmail(parameters.recipient)) {
          issues.push('recipient参数不是有效的邮箱地址');
        }
        break;

      case 'data_crawl':
        if (parameters.url && !this.isValidUrl(parameters.url)) {
          issues.push('url参数不是有效的URL');
        }
        break;

      case 'recruitment':
        if (parameters.position && typeof parameters.position !== 'string') {
          issues.push('position参数必须是字符串');
        }
        break;
    }

    return issues;
  }

  /**
   * 检查意图与六部匹配
   */
  private checkIntentMinistryMatch(edictDraft: EdictDraft): CheckItem {
    // 意图应该已经设置了targetMinistry
    if (!edictDraft.intent.targetMinistry) {
      return {
        name: '意图六部匹配',
        passed: false,
        message: '意图未设置目标六部',
      };
    }

    return {
      name: '意图六部匹配',
      passed: true,
      message: `意图"${edictDraft.intent.name}"正确匹配到${edictDraft.intent.targetMinistry}`,
    };
  }

  /**
   * 检查优先级合理性
   */
  private checkPriorityRationale(edictDraft: EdictDraft): CheckItem {
    // 如果是urgent或critical，应该有特殊原因
    if (edictDraft.priority === 'urgent' || edictDraft.priority === 'critical') {
      // 检查参数中是否有紧急标记
      const message = edictDraft.parameters.rawText || '';
      const urgentKeywords = ['紧急', '立即', '马上', '危险', '严重'];

      const hasUrgentKeyword = urgentKeywords.some(kw => message.includes(kw));

      if (!hasUrgentKeyword) {
        return {
          name: '优先级检查',
          passed: false,
          message: '设置高优先级但没有找到紧急原因',
          details: {
            suggestion: '建议确认是否需要高优先级，或在描述中说明紧急原因',
          },
        };
      }
    }

    return {
      name: '优先级检查',
      passed: true,
      message: '优先级设置合理',
    };
  }

  /**
   * 验证邮箱
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 审核通过后生成诏令
   */
  async approveEdict(edictDraft: EdictDraft): Promise<Edict> {
    return {
      id: `edict_${uuidv4()}`,
      draftId: edictDraft.id,
      intent: edictDraft.intent,
      parameters: edictDraft.parameters,
      targetMinistry: edictDraft.targetMinistry,
      priority: edictDraft.priority,
      approvedBy: 'menxia_sheng', // 门下省审批
      approvedAt: Date.now(),
      status: 'approved',
    };
  }
}

/**
 * 单例实例
 */
export const menxiaSheng = new MenxiaSheng();

/**
 * 审核诏令的便捷函数
 */
export async function reviewEdict(edictDraft: EdictDraft): Promise<ReviewResult> {
  return menxiaSheng.reviewEdict(edictDraft);
}
