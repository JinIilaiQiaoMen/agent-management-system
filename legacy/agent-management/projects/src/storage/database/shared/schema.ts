import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// 智能体表 - 存储公司架构中的各个智能体
// ==========================================
export const agents = pgTable(
  "agents",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    role: varchar("role", { length: 128 }).notNull(), // 角色，如CEO、CTO、产品经理等
    department: varchar("department", { length: 128 }), // 部门
    parentId: varchar("parent_id", { length: 36 }), // 上级智能体ID，用于树形结构
    description: text("description"), // 智能体描述
    systemPrompt: text("system_prompt"), // 系统提示词
    capabilities: jsonb("capabilities"), // 能力列表，如["技术决策", "团队管理", "产品规划"]
    knowledgeBaseId: varchar("knowledge_base_id", { length: 36 }), // 关联的知识库ID
    isActive: boolean("is_active").default(true).notNull(), // 是否启用
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    parentIdIdx: index("agents_parent_id_idx").on(table.parentId),
    departmentIdx: index("agents_department_idx").on(table.department),
  })
);

// ==========================================
// 知识库表 - 存储知识库信息
// ==========================================
export const knowledgeBases = pgTable(
  "knowledge_bases",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // 类型：common（通用）/individual（独立）
    agentId: varchar("agent_id", { length: 36 }), // 关联的智能体ID（如果类型为individual）
    description: text("description"), // 知识库描述
    documentCount: integer("document_count").default(0).notNull(), // 文档数量
    isActive: boolean("is_active").default(true).notNull(), // 是否启用
    modifiedBy: varchar("modified_by", { length: 128 }), // 最后修改人
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    agentIdIdx: index("knowledge_bases_agent_id_idx").on(table.agentId),
    typeIdx: index("knowledge_bases_type_idx").on(table.type),
  })
);

// ==========================================
// 任务表 - 存储CEO发布的任务
// ==========================================
export const tasks = pgTable(
  "tasks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 256 }).notNull(), // 任务标题
    description: text("description").notNull(), // 任务描述
    assignedAgentId: varchar("assigned_agent_id", { length: 36 }), // 分配给哪个智能体
    status: varchar("status", { length: 20 }).notNull().default("pending"), // 状态：pending/assigned/in_progress/completed
    priority: varchar("priority", { length: 20 }).notNull().default("medium"), // 优先级：high/medium/low
    createdBy: varchar("created_by", { length: 128 }).notNull(), // 创建者（CEO）
    metadata: jsonb("metadata"), // 元数据，如标签、截止日期等
    completedAt: timestamp("completed_at", { withTimezone: true }), // 完成时间
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    assignedAgentIdIdx: index("tasks_assigned_agent_id_idx").on(table.assignedAgentId),
    statusIdx: index("tasks_status_idx").on(table.status),
    createdAtIdx: index("tasks_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// 对话记录表 - 存储与智能体的对话
// ==========================================
export const conversations = pgTable(
  "conversations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 关联的智能体ID
    taskId: varchar("task_id", { length: 36 }), // 关联的任务ID（可选）
    userMessage: text("user_message").notNull(), // 用户消息
    agentResponse: text("agent_response"), // 智能体响应
    modelUsed: varchar("model_used", { length: 128 }), // 使用的模型
    metadata: jsonb("metadata"), // 元数据，如tokens数、耗时等
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    agentIdIdx: index("conversations_agent_id_idx").on(table.agentId),
    taskIdIdx: index("conversations_task_id_idx").on(table.taskId),
    createdAtIdx: index("conversations_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// 对话会话表 - 保存完整的对话会话记录
// ==========================================
export const conversationSessions = pgTable(
  "conversation_sessions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 256 }).notNull(), // 会话标题
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 关联的智能体ID
    taskId: varchar("task_id", { length: 36 }), // 关联的任务ID（可选）
    content: text("content").notNull(), // 完整对话内容（格式化后的文本）
    savedBy: varchar("saved_by", { length: 128 }).notNull(), // 保存人
    knowledgeBaseId: varchar("knowledge_base_id", { length: 36 }), // 关联的知识库ID（可选）
    tags: jsonb("tags"), // 标签
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    agentIdIdx: index("conversation_sessions_agent_id_idx").on(table.agentId),
    knowledgeBaseIdIdx: index("conversation_sessions_kb_idx").on(table.knowledgeBaseId),
    createdAtIdx: index("conversation_sessions_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// 对话盒子表 - 多智能体协作对话容器
// ==========================================
export const conversationBoxes = pgTable(
  "conversation_boxes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 256 }).notNull(), // 盒子标题
    description: text("description"), // 盒子描述
    taskId: varchar("task_id", { length: 36 }), // 关联的任务ID（可选）
    createdBy: varchar("created_by", { length: 128 }).notNull(), // 创建者
    status: varchar("status", { length: 20 }).notNull().default("active"), // 状态：active/archived
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    taskIdIdx: index("conv_boxes_task_idx").on(table.taskId),
    statusIdx: index("conv_boxes_status_idx").on(table.status),
    createdByIdx: index("conv_boxes_created_by_idx").on(table.createdBy),
  })
);

// ==========================================
// 对话盒子智能体关联表
// ==========================================
export const conversationBoxAgents = pgTable(
  "conversation_box_agents",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    boxId: varchar("box_id", { length: 36 }).notNull(), // 对话盒子ID
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 智能体ID
    role: varchar("role", { length: 20 }).notNull().default("participant"), // 角色：owner/participant
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    boxIdIdx: index("conv_box_agents_box_idx").on(table.boxId),
    agentIdIdx: index("conv_box_agents_agent_idx").on(table.agentId),
  })
);

// ==========================================
// 对话盒子消息表
// ==========================================
export const conversationBoxMessages = pgTable(
  "conversation_box_messages",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    boxId: varchar("box_id", { length: 36 }).notNull(), // 对话盒子ID
    content: text("content").notNull(), // 消息内容
    senderType: varchar("sender_type", { length: 20 }).notNull(), // 发送者类型：user/agent
    senderAgentId: varchar("sender_agent_id", { length: 36 }), // 如果是智能体发送，记录智能体ID
    replyToId: varchar("reply_to_id", { length: 36 }), // 回复的消息ID（可选）
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    boxIdIdx: index("conv_box_msgs_box_idx").on(table.boxId),
    senderAgentIdIdx: index("conv_box_msgs_agent_idx").on(table.senderAgentId),
    replyToIdIdx: index("conv_box_msgs_reply_idx").on(table.replyToId),
    createdAtIdx: index("conv_box_msgs_created_idx").on(table.createdAt),
  })
);

// ==========================================
// 智能体响应表
// ==========================================
export const conversationBoxAgentResponses = pgTable(
  "conversation_box_agent_responses",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    messageId: varchar("message_id", { length: 36 }).notNull(), // 消息ID
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 响应的智能体ID
    content: text("content").notNull(), // 响应内容
    isHidden: boolean("is_hidden").default(false).notNull(), // 是否隐藏（用于内部智能体间对话）
    metadata: jsonb("metadata"), // 元数据（如 tokens 数、耗时等）
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    messageIdIdx: index("conv_box_resps_msg_idx").on(table.messageId),
    agentIdIdx: index("conv_box_resps_agent_idx").on(table.agentId),
  })
);

// ==========================================
// 文档表 - 存储上传的文档信息
// ==========================================
export const documents = pgTable(
  "documents",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    fileName: varchar("file_name", { length: 256 }).notNull(), // 文件名
    filePath: text("file_path").notNull(), // 文件存储路径
    fileType: varchar("file_type", { length: 20 }).notNull(), // 文件类型：pdf,docx,xlsx,txt,md,csv,json等
    fileSize: integer("file_size").notNull(), // 文件大小（字节）
    content: text("content"), // 解析后的文本内容
    status: varchar("status", { length: 20 }).notNull().default("pending"), // 状态：pending/parsing/analyzed/failed
    knowledgeBaseId: varchar("knowledge_base_id", { length: 36 }), // 关联的知识库ID
    uploadedBy: varchar("uploaded_by", { length: 128 }).notNull(), // 上传人
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    metadata: jsonb("metadata").$type<{
      docId?: string;
      matchScore?: number;
      matchReason?: string;
      analysis?: string;
      recommendation?: string;
      [key: string]: any;
    }>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    knowledgeBaseIdIdx: index("documents_kb_idx").on(table.knowledgeBaseId),
    statusIdx: index("documents_status_idx").on(table.status),
    createdAtIdx: index("documents_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// 文档分类表
// ==========================================
export const documentCategories = pgTable(
  "document_categories",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 7 }).notNull().default("#3b82f6"),
    icon: varchar("icon", { length: 50 }).default("folder"),
    description: text("description"),
    knowledgeBaseId: varchar("knowledge_base_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    knowledgeBaseIdIdx: index("doc_categories_kb_idx").on(table.knowledgeBaseId),
  })
);

// ==========================================
// Zod Schemas for validation
// ==========================================
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Agent schemas
export const insertAgentSchema = createCoercedInsertSchema(agents).pick({
  name: true,
  role: true,
  department: true,
  parentId: true,
  description: true,
  systemPrompt: true,
  capabilities: true,
  knowledgeBaseId: true,
  isActive: true,
});

export const updateAgentSchema = createCoercedInsertSchema(agents)
  .pick({
    name: true,
    role: true,
    department: true,
    parentId: true,
    description: true,
    systemPrompt: true,
    capabilities: true,
    knowledgeBaseId: true,
    isActive: true,
  })
  .partial();

// KnowledgeBase schemas
export const insertKnowledgeBaseSchema = createCoercedInsertSchema(knowledgeBases).pick({
  name: true,
  type: true,
  agentId: true,
  description: true,
  isActive: true,
  modifiedBy: true,
});

export const updateKnowledgeBaseSchema = createCoercedInsertSchema(knowledgeBases)
  .pick({
    name: true,
    type: true,
    agentId: true,
    description: true,
    documentCount: true,
    isActive: true,
    modifiedBy: true,
  })
  .partial();

// Task schemas
export const insertTaskSchema = createCoercedInsertSchema(tasks).pick({
  title: true,
  description: true,
  assignedAgentId: true,
  status: true,
  priority: true,
  createdBy: true,
  metadata: true,
});

export const updateTaskSchema = createCoercedInsertSchema(tasks)
  .pick({
    title: true,
    description: true,
    assignedAgentId: true,
    status: true,
    priority: true,
    metadata: true,
    completedAt: true,
  })
  .partial();

// Conversation schemas
export const insertConversationSchema = createCoercedInsertSchema(conversations).pick({
  agentId: true,
  taskId: true,
  userMessage: true,
  agentResponse: true,
  modelUsed: true,
  metadata: true,
});

// ==========================================
// 任务成果表 - 存储任务的各种输出成果
// ==========================================
export const taskDeliverables = pgTable(
  "task_deliverables",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    taskId: varchar("task_id", { length: 36 }).notNull(), // 关联的任务ID
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 创建该成果的智能体ID
    title: varchar("title", { length: 256 }).notNull(), // 成果标题
    type: varchar("type", { length: 50 }).notNull(), // 成果类型：conversation（对话）,code（代码文件）,document（文档）,file（文件）,report（报告）,design（设计稿）等
    content: text("content"), // 文本内容（对话、代码、文档等）
    filePath: text("file_path"), // 文件路径（如果是文件类型）
    fileName: varchar("file_name", { length: 256 }), // 文件名
    fileSize: integer("file_size"), // 文件大小（字节）
    fileType: varchar("file_type", { length: 50 }), // 文件类型：js,ts,py,md,pdf等
    status: varchar("status", { length: 20 }).notNull().default("draft"), // 状态：draft（草稿）,reviewing（审核中）,approved（已批准）,rejected（已拒绝）
    version: integer("version").default(1).notNull(), // 版本号
    metadata: jsonb("metadata"), // 元数据，如依赖关系、测试结果等
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    taskIdIdx: index("task_deliverables_task_id_idx").on(table.taskId),
    agentIdIdx: index("task_deliverables_agent_id_idx").on(table.agentId),
    typeIdx: index("task_deliverables_type_idx").on(table.type),
    statusIdx: index("task_deliverables_status_idx").on(table.status),
    createdAtIdx: index("task_deliverables_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// 智能体API配置表 - 存储智能体的API模型接口配置
// ==========================================
export const agentApiConfigs = pgTable(
  "agent_api_configs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 关联的智能体ID
    name: varchar("name", { length: 128 }).notNull(), // API名称
    type: varchar("type", { length: 20 }).notNull().default("REST"), // API类型：REST, GraphQL, WebSocket
    url: text("url").notNull(), // API地址
    method: varchar("method", { length: 10 }).notNull().default("GET"), // HTTP方法：GET, POST, PUT, DELETE, PATCH
    headers: jsonb("headers").$type<Record<string, string>>(), // 请求头
    queryParams: jsonb("query_params").$type<Record<string, string>>(), // 查询参数
    bodyTemplate: text("body_template"), // 请求体模板（支持变量替换）
    authType: varchar("auth_type", { length: 20 }), // 认证类型：none, api_key, bearer, oauth2, basic
    authConfig: jsonb("auth_config").$type<{
      apiKey?: string;
      apiKeyHeader?: string;
      token?: string;
      username?: string;
      password?: string;
      clientId?: string;
      clientSecret?: string;
      oauthUrl?: string;
      [key: string]: any;
    }>(), // 认证配置
    description: text("description"), // 描述
    isActive: boolean("is_active").default(true).notNull(), // 是否启用
    timeout: integer("timeout").default(30000).notNull(), // 超时时间（毫秒）
    retryCount: integer("retry_count").default(0).notNull(), // 重试次数
    rateLimit: integer("rate_limit").default(60).notNull(), // 速率限制（每分钟请求数）
    metadata: jsonb("metadata").$type<{
      tags?: string[];
      category?: string;
      version?: string;
      documentation?: string;
      responseSchema?: any;
      [key: string]: any;
    }>(), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    agentIdIdx: index("agent_api_configs_agent_id_idx").on(table.agentId),
    typeIdx: index("agent_api_configs_type_idx").on(table.type),
    isActiveIdx: index("agent_api_configs_is_active_idx").on(table.isActive),
    createdAtIdx: index("agent_api_configs_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// API执行日志表 - 存储API调用日志
// ==========================================
export const apiExecutionLogs = pgTable(
  "api_execution_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    apiConfigId: varchar("api_config_id", { length: 36 }).notNull(), // 关联的API配置ID
    taskId: varchar("task_id", { length: 36 }), // 关联的任务ID（可选）
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 调用该API的智能体ID
    requestUrl: text("request_url").notNull(), // 请求URL
    requestMethod: varchar("request_method", { length: 10 }).notNull(), // 请求方法
    requestHeaders: jsonb("request_headers").$type<Record<string, string>>(), // 请求头
    requestBody: text("request_body"), // 请求体
    responseStatus: integer("response_status"), // 响应状态码
    responseHeaders: jsonb("response_headers").$type<Record<string, string>>(), // 响应头
    responseBody: text("response_body"), // 响应体
    status: varchar("status", { length: 20 }).notNull(), // 执行状态：success, failed, timeout, error
    errorMessage: text("error_message"), // 错误信息
    executionTime: integer("execution_time").notNull(), // 执行耗时（毫秒）
    retries: integer("retries").default(0).notNull(), // 重试次数
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    apiConfigIdIdx: index("api_exec_logs_api_config_id_idx").on(table.apiConfigId),
    taskIdIdx: index("api_exec_logs_task_id_idx").on(table.taskId),
    agentIdIdx: index("api_exec_logs_agent_id_idx").on(table.agentId),
    statusIdx: index("api_exec_logs_status_idx").on(table.status),
    createdAtIdx: index("api_exec_logs_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// OpenClaw配置表 - 存储OpenClaw集成配置
// ==========================================
export const openclawConfigs = pgTable(
  "openclaw_configs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    webhookUrl: text("webhook_url").notNull(), // Webhook URL
    apiKey: text("api_key").notNull(), // API Key
    autoTrigger: boolean("auto_trigger").default(false).notNull(), // 自动触发
    notifyOnStart: boolean("notify_on_start").default(true).notNull(), // 任务开始通知
    notifyOnComplete: boolean("notify_on_complete").default(true).notNull(), // 任务完成通知
    notifyOnError: boolean("notify_on_error").default(true).notNull(), // 任务错误通知
    description: text("description"), // 描述
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    createdAtIdx: index("openclaw_configs_created_at_idx").on(table.createdAt),
  })
);

// ==========================================
// TypeScript types
// ==========================================
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type UpdateAgent = z.infer<typeof updateAgentSchema>;

export type KnowledgeBase = typeof knowledgeBases.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type UpdateKnowledgeBase = z.infer<typeof updateKnowledgeBaseSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type ConversationSession = typeof conversationSessions.$inferSelect;

// ==========================================
// Conversation Session Schemas
// ==========================================
export const insertConversationSessionSchema = createCoercedInsertSchema(conversationSessions).pick({
  title: true,
  agentId: true,
  taskId: true,
  content: true,
  savedBy: true,
  knowledgeBaseId: true,
  tags: true,
  metadata: true,
});

export type InsertConversationSession = z.infer<typeof insertConversationSessionSchema>;

// ==========================================
// Conversation Box Schemas
// ==========================================
export const insertConversationBoxSchema = createCoercedInsertSchema(conversationBoxes).pick({
  title: true,
  description: true,
  taskId: true,
  createdBy: true,
  status: true,
  metadata: true,
});

export const updateConversationBoxSchema = createCoercedInsertSchema(conversationBoxes)
  .pick({
    title: true,
    description: true,
    status: true,
    metadata: true,
  })
  .partial();

export const insertConversationBoxAgentSchema = createCoercedInsertSchema(conversationBoxAgents).pick({
  boxId: true,
  agentId: true,
  role: true,
});

export const insertConversationBoxMessageSchema = createCoercedInsertSchema(conversationBoxMessages).pick({
  boxId: true,
  content: true,
  senderType: true,
  senderAgentId: true,
  replyToId: true,
  metadata: true,
});

export const insertConversationBoxAgentResponseSchema = createCoercedInsertSchema(conversationBoxAgentResponses).pick({
  messageId: true,
  agentId: true,
  content: true,
  isHidden: true,
  metadata: true,
});

// ==========================================
// TypeScript types
// ==========================================
export type ConversationBox = typeof conversationBoxes.$inferSelect;
export type InsertConversationBox = z.infer<typeof insertConversationBoxSchema>;
export type UpdateConversationBox = z.infer<typeof updateConversationBoxSchema>;

export type ConversationBoxAgent = typeof conversationBoxAgents.$inferSelect;
export type InsertConversationBoxAgent = z.infer<typeof insertConversationBoxAgentSchema>;

export type ConversationBoxMessage = typeof conversationBoxMessages.$inferSelect;
export type InsertConversationBoxMessage = z.infer<typeof insertConversationBoxMessageSchema>;

export type ConversationBoxAgentResponse = typeof conversationBoxAgentResponses.$inferSelect;
export type InsertConversationBoxAgentResponse = z.infer<typeof insertConversationBoxAgentResponseSchema>;

// ==========================================
// Document Schemas
// ==========================================
export const insertDocumentSchema = createCoercedInsertSchema(documents).pick({
  fileName: true,
  filePath: true,
  fileType: true,
  fileSize: true,
  content: true,
  status: true,
  knowledgeBaseId: true,
  uploadedBy: true,
  metadata: true,
});

// Document Category schemas
export const insertDocumentCategorySchema = createCoercedInsertSchema(
  documentCategories
).pick({
  name: true,
  color: true,
  icon: true,
  description: true,
  knowledgeBaseId: true,
});

export const updateDocumentCategorySchema = createCoercedInsertSchema(
  documentCategories
).pick({
  name: true,
  color: true,
  icon: true,
  description: true,
}).partial();

export type DocumentCategory = typeof documentCategories.$inferSelect;
export type InsertDocumentCategory = z.infer<typeof insertDocumentCategorySchema>;

// Task Deliverable schemas
export const insertTaskDeliverableSchema = createCoercedInsertSchema(taskDeliverables).pick({
  taskId: true,
  agentId: true,
  title: true,
  type: true,
  content: true,
  filePath: true,
  fileName: true,
  fileSize: true,
  fileType: true,
  status: true,
  version: true,
  metadata: true,
});

export const updateTaskDeliverableSchema = createCoercedInsertSchema(taskDeliverables)
  .pick({
    taskId: true,
    agentId: true,
    title: true,
    type: true,
    content: true,
    filePath: true,
    fileName: true,
    fileSize: true,
    fileType: true,
    status: true,
    version: true,
    metadata: true,
  })
  .partial();

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type TaskDeliverable = typeof taskDeliverables.$inferSelect;
export type InsertTaskDeliverable = z.infer<typeof insertTaskDeliverableSchema>;
export type UpdateTaskDeliverable = z.infer<typeof updateTaskDeliverableSchema>;

// ==========================================
// Agent API Config schemas
// ==========================================
export const insertAgentApiConfigSchema = createCoercedInsertSchema(agentApiConfigs).pick({
  agentId: true,
  name: true,
  type: true,
  url: true,
  method: true,
  headers: true,
  queryParams: true,
  bodyTemplate: true,
  authType: true,
  authConfig: true,
  description: true,
  isActive: true,
  timeout: true,
  retryCount: true,
  rateLimit: true,
  metadata: true,
});

export const updateAgentApiConfigSchema = createCoercedInsertSchema(agentApiConfigs)
  .pick({
    name: true,
    type: true,
    url: true,
  method: true,
  headers: true,
  queryParams: true,
  bodyTemplate: true,
  authType: true,
  authConfig: true,
  description: true,
  isActive: true,
  timeout: true,
  retryCount: true,
  rateLimit: true,
  metadata: true,
  })
  .partial();

// API Execution Log schemas
export const insertApiExecutionLogSchema = createCoercedInsertSchema(apiExecutionLogs).pick({
  apiConfigId: true,
  taskId: true,
  agentId: true,
  requestUrl: true,
  requestMethod: true,
  requestHeaders: true,
  requestBody: true,
  responseStatus: true,
  responseHeaders: true,
  responseBody: true,
  status: true,
  errorMessage: true,
  executionTime: true,
  retries: true,
  metadata: true,
});

// OpenClaw Config schemas
export const insertOpenClawConfigSchema = createCoercedInsertSchema(openclawConfigs).pick({
  webhookUrl: true,
  apiKey: true,
  autoTrigger: true,
  notifyOnStart: true,
  notifyOnComplete: true,
  notifyOnError: true,
  description: true,
});

export const updateOpenClawConfigSchema = createCoercedInsertSchema(openclawConfigs)
  .pick({
    webhookUrl: true,
    apiKey: true,
    autoTrigger: true,
    notifyOnStart: true,
    notifyOnComplete: true,
    notifyOnError: true,
    description: true,
  })
  .partial();

// ==========================================
// TypeScript types
// ==========================================
export type AgentApiConfig = typeof agentApiConfigs.$inferSelect;
export type InsertAgentApiConfig = z.infer<typeof insertAgentApiConfigSchema>;
export type UpdateAgentApiConfig = z.infer<typeof updateAgentApiConfigSchema>;

export type ApiExecutionLog = typeof apiExecutionLogs.$inferSelect;
export type InsertApiExecutionLog = z.infer<typeof insertApiExecutionLogSchema>;

export type OpenClawConfig = typeof openclawConfigs.$inferSelect;
export type InsertOpenClawConfig = z.infer<typeof insertOpenClawConfigSchema>;
export type UpdateOpenClawConfig = z.infer<typeof updateOpenClawConfigSchema>;


