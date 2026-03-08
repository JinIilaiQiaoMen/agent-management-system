/**
 * ZAEP 门下省 - 权限检查器
 * 负责检查用户权限
 */

import { CheckItem } from '../types/san-sheng.types';

/**
 * 权限定义
 */
interface PermissionRule {
  name: string;
  description: string;
  requiredRole: string[];
  allowedActions: string[];
  forbiddenActions?: string[];
}

/**
 * 权限检查器
 */
export class PermissionChecker {
  private permissions: PermissionRule[];

  constructor() {
    this.permissions = this.initializePermissions();
  }

  /**
   * 初始化权限规则
   */
  private initializePermissions(): PermissionRule[] {
    return [
      {
        name: '户部操作权限',
        description: '客户分析、财务分析等户部功能',
        requiredRole: ['admin', 'analyst', 'sales'],
        allowedActions: ['customer_analysis', 'finance_analysis'],
      },
      {
        name: '礼部操作权限',
        description: '邮件生成、内容生成等礼部功能',
        requiredRole: ['admin', 'marketing', 'sales'],
        allowedActions: ['email_generation', 'content_generation'],
      },
      {
        name: '吏部操作权限',
        description: 'HR管理、招聘等吏部功能',
        requiredRole: ['admin', 'hr'],
        allowedActions: ['hr_management', 'recruitment'],
      },
      {
        name: '兵部操作权限',
        description: '风险评估、安全审计等兵部功能',
        requiredRole: ['admin', 'security'],
        allowedActions: ['risk_assessment', 'security_audit'],
      },
      {
        name: '刑部操作权限',
        description: '合规检查等刑部功能',
        requiredRole: ['admin', 'compliance'],
        allowedActions: ['compliance_check'],
      },
      {
        name: '工部操作权限',
        description: '数据采集、系统维护等工部功能',
        requiredRole: ['admin', 'developer', 'ops'],
        allowedActions: ['data_crawl', 'system_maintenance'],
      },
    ];
  }

  /**
   * 检查权限
   * @param intent - 意图
   * @param userId - 用户ID
   * @param userRoles - 用户角色列表
   */
  async checkPermission(
    intent: { id: string; name: string },
    userId: string,
    userRoles: string[] = ['user'] // 默认普通用户
  ): Promise<CheckItem> {
    console.log(`[门下省] 权限检查: 用户=${userId}, 角色=${userRoles.join(',')}, 意图=${intent.id}`);

    // 1. 检查用户ID是否有效
    if (!userId || userId === 'anonymous') {
      return {
        name: '用户身份验证',
        passed: false,
        message: '用户身份无效，请先登录',
      };
    }

    // 2. 检查用户角色
    if (!userRoles || userRoles.length === 0) {
      return {
        name: '角色验证',
        passed: false,
        message: '用户没有分配任何角色',
      };
    }

    // 3. 检查是否有admin角色（admin拥有所有权限）
    if (userRoles.includes('admin')) {
      return {
        name: '权限检查',
        passed: true,
        message: '管理员权限验证通过',
      };
    }

    // 4. 检查意图是否在允许的操作中
    const permission = this.permissions.find(p =>
      p.allowedActions.includes(intent.id)
    );

    if (!permission) {
      return {
        name: '权限检查',
        passed: false,
        message: `未找到意图"${intent.name}"的权限定义`,
      };
    }

    // 5. 检查用户角色是否有权限
    const hasRequiredRole = userRoles.some(role =>
      permission.requiredRole.includes(role)
    );

    if (!hasRequiredRole) {
      return {
        name: '角色权限',
        passed: false,
        message: `当前角色没有权限执行"${intent.name}"操作`,
        details: {
          requiredRoles: permission.requiredRole,
          currentRoles: userRoles,
        },
      };
    }

    // 6. 检查是否在禁止的操作中
    if (permission.forbiddenActions && permission.forbiddenActions.includes(intent.id)) {
      return {
        name: '操作限制',
        passed: false,
        message: `当前角色被禁止执行"${intent.name}"操作`,
      };
    }

    // 7. 权限检查通过
    return {
      name: '权限检查',
      passed: true,
      message: `权限验证通过: ${permission.name}`,
      details: {
        matchedPermission: permission.name,
        userRoles: userRoles,
      },
    };
  }

  /**
   * 检查特殊操作权限
   * @param action - 操作名称
   * @param userId - 用户ID
   * @param userRoles - 用户角色列表
   */
  async checkSpecialAction(
    action: string,
    userId: string,
    userRoles: string[] = ['user']
  ): Promise<CheckItem> {
    // 危险操作列表
    const dangerousActions = [
      'delete_all',
      'truncate_table',
      'drop_database',
      'clear_cache',
      'restart_system',
    ];

    if (dangerousActions.includes(action)) {
      if (!userRoles.includes('admin')) {
        return {
          name: '危险操作权限',
          passed: false,
          message: `操作"${action}"为危险操作，仅管理员可执行`,
        };
      }
    }

    return {
      name: '特殊操作权限',
      passed: true,
      message: `操作"${action}"权限检查通过`,
    };
  }

  /**
   * 获取用户所有权限
   * @param userRoles - 用户角色列表
   */
  async getUserPermissions(userRoles: string[]): Promise<{
    allowedActions: string[];
    forbiddenActions: string[];
  }> {
    const allowedActions: string[] = [];
    const forbiddenActions: string[] = [];

    for (const permission of this.permissions) {
      // 管理员拥有所有权限
      if (userRoles.includes('admin')) {
        allowedActions.push(...permission.allowedActions);
        if (permission.forbiddenActions) {
          forbiddenActions.push(...permission.forbiddenActions);
        }
        continue;
      }

      // 检查用户是否有权限
      const hasRequiredRole = userRoles.some(role =>
        permission.requiredRole.includes(role)
      );

      if (hasRequiredRole) {
        allowedActions.push(...permission.allowedActions);
        if (permission.forbiddenActions) {
          forbiddenActions.push(...permission.forbiddenActions);
        }
      }
    }

    return {
      allowedActions: [...new Set(allowedActions)], // 去重
      forbiddenActions: [...new Set(forbiddenActions)], // 去重
    };
  }

  /**
   * 添加权限规则
   * @param permission - 权限规则
   */
  addPermission(permission: PermissionRule): void {
    this.permissions.push(permission);
    console.log(`[门下省] 添加权限规则: ${permission.name}`);
  }

  /**
   * 移除权限规则
   * @param name - 权限名称
   */
  removePermission(name: string): boolean {
    const index = this.permissions.findIndex(p => p.name === name);
    if (index !== -1) {
      this.permissions.splice(index, 1);
      console.log(`[门下省] 移除权限规则: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * 获取所有权限规则
   */
  getAllPermissions(): PermissionRule[] {
    return this.permissions;
  }
}

/**
 * 单例实例
 */
export const permissionChecker = new PermissionChecker();

/**
 * 检查权限的便捷函数
 */
export async function checkPermission(
  intent: { id: string; name: string },
  userId: string,
  userRoles?: string[]
): Promise<CheckItem> {
  return permissionChecker.checkPermission(intent, userId, userRoles);
}
