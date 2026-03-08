/**
 * 智能体系统数据转换工具
 */

import type { Agent, AgentTask, AgentKnowledgeBase, AgentTaskDeliverable, AgentConversation } from '@/lib/db';

/**
 * 智能体转换器
 */
export const agentTransformer = {
  /**
   * 转换为前端显示格式
   */
  toDisplay(agent: Agent) {
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.isActive ? 'active' : 'inactive',
      capabilities: (agent.capabilities as string[]) || [],
      description: agent.description || '',
      department: agent.department || null,
      parentId: agent.parentId || null,
      knowledgeBaseId: agent.knowledgeBaseId || null,
      systemPrompt: agent.systemPrompt || null,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  },

  /**
   * 转换为树形结构
   */
  toTree(agents: Agent[]) {
    const agentMap = new Map<string, Record<string, unknown>>();
    const roots: Record<string, unknown>[] = [];

    // 创建映射
    agents.forEach(agent => {
      agentMap.set(agent.id, {
        ...this.toDisplay(agent),
        children: [],
      });
    });

    // 构建树
    agents.forEach(agent => {
      const node = agentMap.get(agent.id)!;
      if (agent.parentId && agentMap.has(agent.parentId)) {
        (agentMap.get(agent.parentId)!['children'] as Record<string, unknown>[]).push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  },

  /**
   * 转换为选择器选项
   */
  toOptions(agents: Agent[]) {
    return agents.map(agent => ({
      value: agent.id,
      label: agent.name,
      role: agent.role,
    }));
  },
};

/**
 * 任务转换器
 */
export const taskTransformer = {
  /**
   * 转换为前端显示格式
   */
  toDisplay(task: AgentTask) {
    const metadata = task.metadata as Record<string, unknown> | null;
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      progress: (metadata?.progress as number) || 0,
      assignedAgentId: task.assignedAgentId || null,
      dueDate: (metadata?.dueDate as string) || null,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt || null,
    };
  },

  /**
   * 转换为看板列
   */
  toKanbanColumns(tasks: AgentTask[]) {
    const columns: Record<string, { id: string; title: string; tasks: Record<string, unknown>[] }> = {
      pending: { id: 'pending', title: '待分配', tasks: [] },
      assigned: { id: 'assigned', title: '已分配', tasks: [] },
      in_progress: { id: 'in_progress', title: '进行中', tasks: [] },
      completed: { id: 'completed', title: '已完成', tasks: [] },
    };

    tasks.forEach(task => {
      const display = this.toDisplay(task);
      if (columns[task.status]) {
        columns[task.status].tasks.push(display);
      }
    });

    return Object.values(columns);
  },

  /**
   * 转换为日历事件
   */
  toCalendarEvents(tasks: AgentTask[]) {
    return tasks
      .filter(task => {
        const metadata = task.metadata as Record<string, unknown> | null;
        return metadata?.dueDate;
      })
      .map(task => {
        const metadata = task.metadata as Record<string, unknown>;
        return {
          id: task.id,
          title: task.title,
          start: metadata.dueDate as string,
          end: metadata.dueDate as string,
          status: task.status,
          priority: task.priority,
        };
      });
  },
};

/**
 * 知识库转换器
 */
export const knowledgeBaseTransformer = {
  /**
   * 转换为前端显示格式
   */
  toDisplay(kb: AgentKnowledgeBase) {
    return {
      id: kb.id,
      name: kb.name,
      type: kb.type,
      agentId: kb.agentId || null,
      description: kb.description || '',
      documentCount: kb.documentCount || 0,
      isActive: kb.isActive,
      modifiedBy: kb.modifiedBy || null,
      createdAt: kb.createdAt,
      updatedAt: kb.updatedAt,
    };
  },

  /**
   * 转换为选择器选项
   */
  toOptions(kbs: AgentKnowledgeBase[]) {
    return kbs.map(kb => ({
      value: kb.id,
      label: kb.name,
      type: kb.type,
      documentCount: kb.documentCount || 0,
    }));
  },
};

/**
 * 成果转换器
 */
export const deliverableTransformer = {
  /**
   * 转换为前端显示格式
   */
  toDisplay(deliverable: AgentTaskDeliverable) {
    return {
      id: deliverable.id,
      taskId: deliverable.taskId,
      agentId: deliverable.agentId,
      title: deliverable.title,
      type: deliverable.type,
      content: deliverable.content,
      filePath: deliverable.filePath,
      fileName: deliverable.fileName,
      fileSize: deliverable.fileSize,
      fileType: deliverable.fileType,
      status: deliverable.status,
      version: deliverable.version,
      createdAt: deliverable.createdAt,
      updatedAt: deliverable.updatedAt,
    };
  },

  /**
   * 按类型分组
   */
  groupByType(deliverables: AgentTaskDeliverable[]) {
    const groups: Record<string, AgentTaskDeliverable[]> = {};
    
    deliverables.forEach(d => {
      const type = d.type || 'other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(d);
    });

    return groups;
  },
};

/**
 * 对话转换器
 */
export const conversationTransformer = {
  /**
   * 转换为前端显示格式
   */
  toDisplay(conversation: AgentConversation) {
    const metadata = conversation.metadata as Record<string, unknown> | null;
    return {
      id: conversation.id,
      agentId: conversation.agentId,
      taskId: conversation.taskId || null,
      userMessage: conversation.userMessage,
      agentResponse: conversation.agentResponse || null,
      modelUsed: conversation.modelUsed || null,
      metadata: metadata,
      createdAt: conversation.createdAt,
    };
  },

  /**
   * 转换为消息格式
   */
  toMessages(conversation: AgentConversation) {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    messages.push({
      role: 'user',
      content: conversation.userMessage,
    });
    
    if (conversation.agentResponse) {
      messages.push({
        role: 'assistant',
        content: conversation.agentResponse,
      });
    }
    
    return messages;
  },
};

/**
 * 统计数据转换器
 */
export const statsTransformer = {
  /**
   * 转换智能体统计数据
   */
  toAgentStats(agents: Agent[]) {
    return {
      total: agents.length,
      active: agents.filter(a => a.isActive).length,
      byDepartment: agents.reduce((acc, a) => {
        const dept = a.department || '未分配';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },

  /**
   * 转换任务统计数据
   */
  toTaskStats(tasks: AgentTask[]) {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      assigned: tasks.filter(t => t.status === 'assigned').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  },

  /**
   * 转换知识库统计数据
   */
  toKnowledgeBaseStats(kbs: AgentKnowledgeBase[]) {
    return {
      total: kbs.length,
      active: kbs.filter(kb => kb.isActive).length,
      totalDocuments: kbs.reduce((sum, kb) => sum + (kb.documentCount || 0), 0),
    };
  },
};

/**
 * 统一导出所有转换器
 */
export const transformers = {
  agent: agentTransformer,
  task: taskTransformer,
  knowledgeBase: knowledgeBaseTransformer,
  deliverable: deliverableTransformer,
  conversation: conversationTransformer,
  stats: statsTransformer,
};
