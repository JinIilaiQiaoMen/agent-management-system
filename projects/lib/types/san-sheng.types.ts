/**
 * ZAEP 三省六部系统 - 基础类型定义
 */

/**
 * 诏令优先级
 */
export type EdictPriority = 'normal' | 'urgent' | 'critical';

/**
 * 诏令状态
 */
export type EdictStatus = 'draft' | 'reviewing' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * 六部枚举
 */
export enum Ministry {
  LIBU = '吏部',
  HUBU = '户部',
  LIBU_LI = '礼部',
  BINGBU = '兵部',
  XINGBU = '刑部',
  GONGBU = '工部'
}

/**
 * 皇帝圣旨（用户输入）
 */
export interface ImperialDecree {
  message: string;              // 皇帝的指令
  sessionId: string;           // 会话ID
  userId: string;               // 皇帝ID
  timestamp: number;            // 时间戳
  options?: {
    priority?: EdictPriority;
    requireAudit?: boolean;
  };
}

/**
 * 意图类型
 */
export interface Intent {
  id: string;
  name: string;
  description: string;
  confidence: number;           // 置信度 0-1
  targetMinistry?: Ministry;    // 目标六部
}

/**
 * 意图参数
 */
export interface IntentParams {
  [key: string]: any;
}

/**
 * 请求上下文
 */
export interface RequestContext {
  sessionId: string;
  userId: string;
  timestamp: number;
  conversationHistory?: ChatMessage[];
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * 诏令草案
 */
export interface EdictDraft {
  id: string;
  intent: Intent;
  parameters: IntentParams;
  targetMinistry: Ministry;
  priority: EdictPriority;
  createdBy: string;
  createdAt: number;
  status: EdictStatus;
}

/**
 * 诏令（审核通过后）
 */
export interface Edict {
  id: string;
  draftId: string;
  intent: Intent;
  parameters: IntentParams;
  targetMinistry: Ministry;
  priority: EdictPriority;
  approvedBy: string;
  approvedAt: number;
  status: EdictStatus;
}

/**
 * 审核检查项
 */
export interface CheckItem {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * 审核结果
 */
export interface ReviewResult {
  passed: boolean;
  checks: CheckItem[];
  reason?: RejectionReason;
  reviewedAt: number;
}

/**
 * 驳回原因
 */
export interface RejectionReason {
  category: 'permission' | 'safety' | 'logic' | 'risk';
  level: RiskLevel;
  message: string;
  suggestions: string[];
}

/**
 * 响应给皇帝
 */
export interface ResponseToEmperor {
  type: 'approval' | 'rejection' | 'warning';
  message: string;
  suggestions?: string[];
  edict?: EdictDraft;
  rejectionReason?: RejectionReason;
}

/**
 * Agent定义
 */
export interface Agent {
  id: string;
  name: string;
  ministry: Ministry;
  capabilities: string[];
  status: 'active' | 'inactive' | 'busy';
  description: string;
  version: string;
}

/**
 * 任务
 */
export interface Task {
  id: string;
  edictId: string;
  name: string;
  description: string;
  assignedAgentId: string;
  assignedAt: number;
  status: TaskStatus;
  priority: EdictPriority;
  parameters: IntentParams;
  result?: any;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  logs: TaskLog[];
}

/**
 * 任务日志
 */
export interface TaskLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

/**
 * 执行结果
 */
export interface ExecutionResult {
  success: boolean;
  taskId: string;
  agentId: string;
  data: any;
  logs: TaskLog[];
  executionTime: number;
  error?: string;
}

/**
 * 流程数据（用于监控）
 */
export interface ProcessFlow {
  processId: string;
  timestamp: number;
  imperialDecree: ImperialDecree;
  zhongshu?: ZhongshuData;
  menxia?: MenxiaData;
  shangshu?: ShangshuData;
  liubu?: LiubuData;
}

/**
 * 中书省数据
 */
export interface ZhongshuData {
  intent: Intent;
  parameters: IntentParams;
  draftId: string;
  decisionTime: number;
  completedAt: number;
}

/**
 * 门下省数据
 */
export interface MenxiaData {
  reviewResult: ReviewResult;
  edict?: Edict;
  completedAt: number;
}

/**
 * 尚书省数据
 */
export interface ShangshuData {
  taskId: string;
  agent: Agent;
  startedAt: number;
  completedAt: number;
  executionTime: number;
}

/**
 * 六部数据
 */
export interface LiubuData {
  ministry: Ministry;
  agent: Agent;
  taskResult: ExecutionResult;
}

/**
 * 监控指标
 */
export interface MonitorMetrics {
  completeness: number;          // 0-100
  compliance: number;            // 0-100
  efficiency: number;            // 0-100
  accuracy: number;              // 0-100
  traceability: number;          // 0-100
}

/**
 * 异常
 */
export interface Anomaly {
  id: string;
  processId: string;
  stage: 'zhongshu' | 'menxia' | 'shangshu' | 'liubu' | 'jinyiwei';
  level: 'info' | 'warn' | 'error' | 'critical';
  message: string;
  timestamp: number;
  data?: any;
}

/**
 * 监控报告
 */
export interface MonitorReport {
  processId: string;
  timestamp: number;
  metrics: MonitorMetrics;
  anomalies: Anomaly[];
  auditReportUrl?: string;
}

/**
 * 审计报告
 */
export interface AuditReport {
  processId: string;
  timestamp: number;
  imperialDecree: ImperialDecree;
  flow: ProcessFlow;
  metrics: MonitorMetrics;
  anomalies: Anomaly[];
  conclusion: string;
  recommendations: string[];
}

/**
 * 皇帝响应（API返回）
 */
export interface ImperialResponse {
  success: boolean;
  message: string;
  edictId?: string;
  result?: any;

  // 流程信息
  flow: {
    zhongshu?: {
      intent: string;
      parameters: any;
      decisionTime: number;
    };
    menxia?: {
      passed: boolean;
      checks: any[];
      rejectionReason?: string;
    };
    shangshu?: {
      ministry: string;
      agent: string;
      executionTime: number;
    };
  };

  // 审计信息
  audit?: {
    processId: string;
    reportUrl: string;
  };

  // 驳回信息
  rejection?: {
    reason: string;
    suggestions: string[];
  };
}
