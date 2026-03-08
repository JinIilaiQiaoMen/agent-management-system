/**
 * 自动化办公模块
 * 支持工作流自动化、任务调度、事件触发等功能
 */

export interface AutomationTrigger {
  id: string;
  type: 'webhook' | 'schedule' | 'event' | 'manual';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AutomationAction {
  id: string;
  type: 'api_call' | 'email' | 'notification' | 'database' | 'ai_task';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  conditions?: AutomationCondition[];
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface AutomationExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * 工作流引擎
 */
export class WorkflowEngine {
  private workflows: Map<string, AutomationWorkflow> = new Map();
  private executions: Map<string, AutomationExecution> = new Map();

  /**
   * 注册工作流
   */
  registerWorkflow(workflow: AutomationWorkflow) {
    this.workflows.set(workflow.id, workflow);
    console.log(`工作流已注册: ${workflow.name}`);
  }

  /**
   * 触发工作流
   */
  async triggerWorkflow(workflowId: string, input: Record<string, any>) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`工作流不存在: ${workflowId}`);
    }

    if (!workflow.enabled) {
      throw new Error(`工作流已禁用: ${workflow.name}`);
    }

    // 检查条件
    if (workflow.conditions && !this.checkConditions(workflow.conditions, input)) {
      console.log(`工作流条件不满足: ${workflow.name}`);
      return null;
    }

    // 创建执行记录
    const execution: AutomationExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      status: 'pending',
      input,
      startedAt: new Date()
    };
    this.executions.set(execution.id, execution);

    try {
      execution.status = 'running';

      // 执行所有动作
      const results = await Promise.all(
        workflow.actions
          .filter(action => action.enabled)
          .map(action => this.executeAction(action, input))
      );

      execution.status = 'completed';
      execution.output = { results };
      execution.completedAt = new Date();

      console.log(`工作流执行成功: ${workflow.name}`);
      return execution;
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date();

      console.error(`工作流执行失败: ${workflow.name}`, error);
      throw error;
    }
  }

  /**
   * 检查条件
   */
  private checkConditions(conditions: AutomationCondition[], data: Record<string, any>): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(data, condition.field);

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  /**
   * 获取字段值（支持嵌套路径，如 'user.name'）
   */
  private getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * 执行动作
   */
  private async executeAction(action: AutomationAction, input: Record<string, any>) {
    console.log(`执行动作: ${action.type}`, action.config);

    switch (action.type) {
      case 'api_call':
        return this.executeApiCall(action.config, input);
      case 'email':
        return this.executeEmail(action.config, input);
      case 'notification':
        return this.executeNotification(action.config, input);
      case 'database':
        return this.executeDatabase(action.config, input);
      case 'ai_task':
        return this.executeAITask(action.config, input);
      default:
        throw new Error(`未知动作类型: ${action.type}`);
    }
  }

  /**
   * 执行 API 调用
   */
  private async executeApiCall(config: any, input: Record<string, any>) {
    const { url, method = 'POST', headers = {}, bodyTemplate } = config;

    // 替换模板变量
    const body = this.replaceTemplateVariables(bodyTemplate, input);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 执行邮件发送
   */
  private async executeEmail(config: any, input: Record<string, any>) {
    const { to, subject, bodyTemplate, cc, bcc } = config;

    // 替换模板变量
    const subjectReplaced = this.replaceTemplateVariables(subject, input);
    const body = this.replaceTemplateVariables(bodyTemplate, input);

    // 这里应该调用邮件发送服务
    console.log(`发送邮件: ${to}`, { subject: subjectReplaced, body });

    return { success: true, to, subject: subjectReplaced };
  }

  /**
   * 执行通知
   */
  private async executeNotification(config: any, input: Record<string, any>) {
    const { type = 'in_app', title, messageTemplate } = config;

    // 替换模板变量
    const message = this.replaceTemplateVariables(messageTemplate, input);

    console.log(`发送通知: ${type}`, { title, message });

    return { success: true, type, title, message };
  }

  /**
   * 执行数据库操作
   */
  private async executeDatabase(config: any, input: Record<string, any>) {
    const { table, operation, dataTemplate, where } = config;

    // 替换模板变量
    const data = this.replaceTemplateVariables(dataTemplate, input);

    // 这里应该调用数据库操作
    console.log(`数据库操作: ${table}.${operation}`, { data, where });

    return { success: true, table, operation, data };
  }

  /**
   * 执行 AI 任务
   */
  private async executeAITask(config: any, input: Record<string, any>) {
    const { task, promptTemplate, model = 'doubao' } = config;

    // 替换模板变量
    const prompt = this.replaceTemplateVariables(promptTemplate, input);

    // 这里应该调用 AI 服务
    console.log(`AI 任务: ${task}`, { prompt, model });

    return { success: true, task, prompt, result: 'AI generated content' };
  }

  /**
   * 替换模板变量
   * 支持 {{variable}} 和 {{nested.path}} 语法
   */
  private replaceTemplateVariables(template: any, data: Record<string, any>): any {
    if (typeof template === 'string') {
      return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const value = this.getFieldValue(data, path.trim());
        return value !== undefined ? String(value) : '';
      });
    }

    if (Array.isArray(template)) {
      return template.map(item => this.replaceTemplateVariables(item, data));
    }

    if (typeof template === 'object' && template !== null) {
      return Object.entries(template).reduce((acc, [key, value]) => {
        acc[key] = this.replaceTemplateVariables(value, data);
        return acc;
      }, {} as any);
    }

    return template;
  }

  /**
   * 获取工作流列表
   */
  getWorkflows(): AutomationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * 获取工作流详情
   */
  getWorkflow(workflowId: string): AutomationWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * 删除工作流
   */
  deleteWorkflow(workflowId: string) {
    this.workflows.delete(workflowId);
    console.log(`工作流已删除: ${workflowId}`);
  }

  /**
   * 获取执行记录
   */
  getExecutions(workflowId?: string): AutomationExecution[] {
    const allExecutions = Array.from(this.executions.values());
    if (workflowId) {
      return allExecutions.filter(e => e.workflowId === workflowId);
    }
    return allExecutions;
  }

  /**
   * 清理旧执行记录
   */
  cleanupOldExecutions(olderThanDays: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    for (const [id, execution] of this.executions.entries()) {
      if (execution.startedAt < cutoffDate) {
        this.executions.delete(id);
      }
    }
  }
}

// 导出单例实例
export const workflowEngine = new WorkflowEngine();

// 预置工作流
export const presetWorkflows: AutomationWorkflow[] = [
  {
    id: 'customer_lead_auto_assign',
    name: '新线索自动分配',
    description: '当有新线索时，自动分配给销售人员并发送通知',
    triggers: [
      {
        id: 'trigger_1',
        type: 'event',
        config: { event: 'lead.created' },
        enabled: true
      }
    ],
    actions: [
      {
        id: 'action_1',
        type: 'database',
        config: {
          table: 'leads',
          operation: 'update',
          dataTemplate: { assignedTo: '{{salesTeamId}}', status: 'contacted' },
          where: { id: '{{leadId}}' }
        },
        enabled: true
      },
      {
        id: 'action_2',
        type: 'email',
        config: {
          to: '{{salesEmail}}',
          subject: '新线索分配: {{companyName}}',
          bodyTemplate: '您好，有一个新的线索需要您跟进：\n公司: {{companyName}}\n邮箱: {{email}}\n\n请尽快联系客户。'
        },
        enabled: true
      },
      {
        id: 'action_3',
        type: 'notification',
        config: {
          type: 'in_app',
          title: '新线索分配',
          messageTemplate: '您有一个新的线索 {{companyName}} 需要跟进'
        },
        enabled: true
      }
    ],
    enabled: false,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'social_media_auto_reply',
    name: '社媒评论自动回复',
    description: '当收到评论时，自动回复并记录',
    triggers: [
      {
        id: 'trigger_1',
        type: 'webhook',
        config: { path: '/webhooks/social-media/comment' },
        enabled: true
      }
    ],
    actions: [
      {
        id: 'action_1',
        type: 'ai_task',
        config: {
          task: 'generate_reply',
          promptTemplate: '请友好地回复这条评论：{{commentText}}',
          model: 'doubao'
        },
        enabled: true
      },
      {
        id: 'action_2',
        type: 'database',
        config: {
          table: 'social_media_comments',
          operation: 'update',
          dataTemplate: { replyText: '{{result}}', isAutoReplied: true, repliedAt: '{{now}}' },
          where: { id: '{{commentId}}' }
        },
        enabled: true
      }
    ],
    enabled: false,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'supply_chain_low_stock_alert',
    name: '库存预警通知',
    description: '当库存低于阈值时，发送预警通知',
    triggers: [
      {
        id: 'trigger_1',
        type: 'schedule',
        config: { cron: '0 */2 * * *' }, // 每2小时执行一次
        enabled: true
      }
    ],
    actions: [
      {
        id: 'action_1',
        type: 'database',
        config: {
          table: 'inventory',
          operation: 'query',
          where: { stock: { operator: 'less_than', value: '{{minStock}}' } }
        },
        enabled: true
      },
      {
        id: 'action_2',
        type: 'email',
        config: {
          to: '{{purchasingEmail}}',
          subject: '库存预警: {{productName}}',
          bodyTemplate: '以下产品库存不足，请及时补货：\n产品: {{productName}}\n当前库存: {{stock}}\n最小库存: {{minStock}}'
        },
        enabled: true
      }
    ],
    conditions: [
      {
        id: 'condition_1',
        field: 'stock',
        operator: 'less_than',
        value: 10
      }
    ],
    enabled: false,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'customer_followup_reminder',
    name: '客户跟进提醒',
    description: '定期发送客户跟进提醒',
    triggers: [
      {
        id: 'trigger_1',
        type: 'schedule',
        config: { cron: '0 9 * * 1' }, // 每周一早上9点执行
        enabled: true
      }
    ],
    actions: [
      {
        id: 'action_1',
        type: 'database',
        config: {
          table: 'customers',
          operation: 'query',
          where: { lastContact: { operator: 'less_than', value: '{{daysAgo}}' } }
        },
        enabled: true
      },
      {
        id: 'action_2',
        type: 'email',
        config: {
          to: '{{salesEmail}}',
          subject: '客户跟进提醒',
          bodyTemplate: '以下客户需要跟进：\n{{customerList}}'
        },
        enabled: true
      }
    ],
    enabled: false,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
