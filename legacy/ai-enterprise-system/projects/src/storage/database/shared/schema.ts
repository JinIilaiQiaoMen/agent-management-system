import { pgTable, serial, timestamp, text, varchar, integer, boolean, jsonb, index, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// System table (keep existing)
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Customers table - 客户信息表
export const customers = pgTable(
	"customers",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		companyName: varchar("company_name", { length: 255 }).notNull(),
		website: varchar("website", { length: 500 }),
		email: varchar("email", { length: 255 }),
		phone: varchar("phone", { length: 50 }),
		country: varchar("country", { length: 100 }),
		industry: varchar("industry", { length: 100 }),
		employeeSize: varchar("employee_size", { length: 50 }), // 员工规模
		annualRevenue: varchar("annual_revenue", { length: 50 }), // 年收入
		socialLinks: jsonb("social_links"), // 社交媒体链接（LinkedIn, Facebook等）
		source: varchar("source", { length: 100 }), // 客户来源
		status: varchar("status", { length: 50 }).default("new"), // new, contacted, qualified, customer, lost
		score: integer("score").default(0), // 客户评分
		notes: text("notes"), // 备注
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		index("customers_email_idx").on(table.email),
		index("customers_status_idx").on(table.status),
		index("customers_score_idx").on(table.score),
	]
);

// Customer Analysis table - 客户背调分析表
export const customerAnalysis = pgTable(
	"customer_analysis",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		customerId: varchar("customer_id", { length: 36 }).notNull().references(() => customers.id, { onDelete: "cascade" }),
		analysisType: varchar("analysis_type", { length: 50 }).notNull(), // company, market, financial, risk
		dataSources: jsonb("data_sources"), // 数据来源（网站抓取、LinkedIn、新闻等）
		analysisResult: jsonb("analysis_result").notNull(), // AI 分析结果
		summary: text("summary"), // 分析摘要
		sources: text("sources"), // 信息来源链接
		confidence: integer("confidence").default(0), // 可信度评分 0-100
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("customer_analysis_customer_id_idx").on(table.customerId),
		index("customer_analysis_type_idx").on(table.analysisType),
	]
);

// Leads table - 线索表
export const leads = pgTable(
	"leads",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		customerId: varchar("customer_id", { length: 36 }).references(() => customers.id, { onDelete: "set null" }),
		companyName: varchar("company_name", { length: 255 }).notNull(),
		email: varchar("email", { length: 255 }),
		source: varchar("source", { length: 100 }), // 抓取来源
		sourceUrl: varchar("source_url", { length: 1000 }), // 抓取源URL
		contactPerson: varchar("contact_person", { length: 255 }), // 联系人
		title: varchar("title", { length: 255 }), // 职位
		country: varchar("country", { length: 100 }),
		industry: varchar("industry", { length: 100 }),
		score: integer("score").default(0), // 线索评分
		status: varchar("status", { length: 50 }).default("new"), // new, qualified, contacted, converted, rejected
		priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
		notes: text("notes"),
		extractedData: jsonb("extracted_data"), // 抓取的原始数据
		scrapedAt: timestamp("scraped_at", { withTimezone: true, mode: 'string' }), // 抓取时间
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		index("leads_email_idx").on(table.email),
		index("leads_status_idx").on(table.status),
		index("leads_score_idx").on(table.score),
		index("leads_priority_idx").on(table.priority),
	]
);

// Email Templates table - 邮件模板表
export const emailTemplates = pgTable(
	"email_templates",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 255 }).notNull(),
		category: varchar("category", { length: 100 }).notNull(), // intro, followup, quote, invoice
		subject: varchar("subject", { length: 500 }).notNull(),
		body: text("body").notNull(),
		language: varchar("language", { length: 20 }).default("en"), // 语言
		variables: jsonb("variables"), // 模板变量 {name, company, product}
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		index("email_templates_category_idx").on(table.category),
		index("email_templates_language_idx").on(table.language),
	]
);

// Emails table - 邮件记录表
export const emails = pgTable(
	"emails",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		customerId: varchar("customer_id", { length: 36 }).references(() => customers.id, { onDelete: "set null" }),
		leadId: varchar("lead_id", { length: 36 }).references(() => leads.id, { onDelete: "set null" }),
		templateId: varchar("template_id", { length: 36 }).references(() => emailTemplates.id, { onDelete: "set null" }),
		toEmail: varchar("to_email", { length: 255 }).notNull(),
		toName: varchar("to_name", { length: 255 }),
		subject: varchar("subject", { length: 500 }).notNull(),
		body: text("body").notNull(),
		type: varchar("type", { length: 50 }).notNull(), // intro, followup, quote, custom
		language: varchar("language", { length: 20 }).default("en"),
		status: varchar("status", { length: 50 }).default("draft"), // draft, sent, failed
		sendAt: timestamp("send_at", { withTimezone: true, mode: 'string' }),
		error: text("error"), // 发送错误信息
		aiGenerated: boolean("ai_generated").default(false).notNull(),
		aiPrompt: text("ai_prompt"), // AI 生成时的提示词
		variables: jsonb("variables"), // 使用到的变量
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		index("emails_customer_id_idx").on(table.customerId),
		index("emails_lead_id_idx").on(table.leadId),
		index("emails_status_idx").on(table.status),
		index("emails_send_at_idx").on(table.sendAt),
	]
);

// Conversations table - 对话记录表（谈单辅助）
export const conversations = pgTable(
	"conversations",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		customerId: varchar("customer_id", { length: 36 }).references(() => customers.id, { onDelete: "cascade" }),
		leadId: varchar("lead_id", { length: 36 }).references(() => leads.id, { onDelete: "set null" }),
		messages: jsonb("messages").notNull(), // 对话消息数组 [{role, content, timestamp}]
		context: jsonb("context"), // 对话上下文（产品信息、报价等）
		status: varchar("status", { length: 50 }).default("active"), // active, closed, archived
		summary: text("summary"), // 对话摘要
		nextAction: text("next_action"), // 下一步行动
		lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }),
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		index("conversations_customer_id_idx").on(table.customerId),
		index("conversations_status_idx").on(table.status),
	]
);

// Knowledge Documents table - 知识库文档表
export const knowledgeDocuments = pgTable(
	"knowledge_documents",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		title: varchar("title", { length: 500 }).notNull(),
		content: text("content").notNull(),
		category: varchar("category", { length: 100 }), // product, pricing, process, faq
		tags: jsonb("tags"), // 标签数组
		sourceType: varchar("source_type", { length: 50 }), // text, url, file
		sourceUrl: varchar("source_url", { length: 1000 }),
		docId: varchar("doc_id", { length: 100 }), // 知识库中的文档ID
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		index("knowledge_documents_category_idx").on(table.category),
		index("knowledge_documents_doc_id_idx").on(table.docId),
	]
);

// Monitoring Logs table - 系统监控日志表
export const monitoringLogs = pgTable(
	"monitoring_logs",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		module: varchar("module", { length: 100 }).notNull(), // scraping, llm, email, analysis
		action: varchar("action", { length: 100 }).notNull(), // 具体操作
		status: varchar("status", { length: 50 }).notNull(), // success, error, warning
		message: text("message"), // 日志消息
		errorDetails: jsonb("error_details"), // 错误详情
		duration: integer("duration"), // 执行时长（毫秒）
		metadata: jsonb("metadata"), // 额外信息
		createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("monitoring_logs_module_idx").on(table.module),
		index("monitoring_logs_status_idx").on(table.status),
		index("monitoring_logs_created_at_idx").on(table.createdAt),
	]
);

// Create schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

export const insertCustomerSchema = createCoercedInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createCoercedInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailTemplateSchema = createCoercedInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSchema = createCoercedInsertSchema(emails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createCoercedInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeDocumentSchema = createCoercedInsertSchema(knowledgeDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonitoringLogSchema = createCoercedInsertSchema(monitoringLogs).omit({
  id: true,
  createdAt: true,
});

// Social Media Posts table - 社媒发布表
export const socialMediaPosts = pgTable(
  "social_media_posts",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platform: varchar("platform", { length: 50 }).notNull(), // tiktok, instagram, youtube, facebook
    content: text("content").notNull(),
    mediaUrls: jsonb("media_urls"), // 媒体文件 URLs
    hashtags: jsonb("hashtags"), // 标签数组
    status: varchar("status", { length: 20 }).default("pending"), // pending, scheduled, published, failed
    scheduledTime: timestamp("scheduled_time", { withTimezone: true, mode: 'string' }),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
    platformPostId: varchar("platform_post_id", { length: 100 }), // 平台返回的帖子ID
    likes: integer("likes").default(0),
    comments: integer("comments").default(0),
    shares: integer("shares").default(0),
    views: integer("views").default(0),
    errorMessage: text("error_message"),
    createdBy: varchar("created_by", { length: 100 }), // 创建者
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("posts_platform_idx").on(table.platform),
    index("posts_status_idx").on(table.status),
    index("posts_scheduled_time_idx").on(table.scheduledTime),
  ]
);

// Social Media Comments table - 评论表
export const socialMediaComments = pgTable(
  "social_media_comments",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    postId: varchar("post_id", { length: 36 }).references(() => socialMediaPosts.id, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 50 }).notNull(),
    commentId: varchar("comment_id", { length: 100 }), // 平台返回的评论ID
    userId: varchar("user_id", { length: 100 }),
    username: varchar("username", { length: 100 }),
    commentText: text("comment_text").notNull(),
    replyText: text("reply_text"),
    isAutoReplied: boolean("is_auto_replied").default(false),
    replyStrategy: varchar("reply_strategy", { length: 50 }), // rule-based, llm, template
    repliedAt: timestamp("replied_at", { withTimezone: true, mode: 'string' }),
    likes: integer("likes").default(0),
    sentiment: varchar("sentiment", { length: 20 }), // positive, neutral, negative
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("comments_post_id_idx").on(table.postId),
    index("comments_platform_idx").on(table.platform),
    index("comments_user_id_idx").on(table.userId),
  ]
);

// User Segments table - 用户分层表
export const userSegments = pgTable(
  "user_segments",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 100 }).notNull(),
    platform: varchar("platform", { length: 50 }).notNull(),
    segmentType: varchar("segment_type", { length: 50 }).notNull(), // VIP, active, dormant, new, churned
    score: integer("score").default(0), // 用户评分
    engagementLevel: integer("engagement_level").default(0), // 互动等级 0-100
    totalInteractions: integer("total_interactions").default(0), // 总互动次数
    lastInteractionAt: timestamp("last_interaction_at", { withTimezone: true, mode: 'string' }),
    totalSpent: numeric("total_spent", { precision: 10, scale: 2 }).default("0"), // 总消费金额
    purchaseCount: integer("purchase_count").default(0), // 购买次数
    tags: jsonb("tags"), // 用户标签
    metadata: jsonb("metadata"), // 额外数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("segments_user_id_idx").on(table.userId),
    index("segments_type_idx").on(table.segmentType),
    index("segments_platform_idx").on(table.platform),
    index("segments_engagement_idx").on(table.engagementLevel),
  ]
);

// Auto Reply Rules table - 自动回复规则表
export const autoReplyRules = pgTable(
  "auto_reply_rules",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platform: varchar("platform", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    keywords: jsonb("keywords").notNull(), // 触发关键词数组
    template: text("template").notNull(), // 回复模板
    replyType: varchar("reply_type", { length: 50 }).default("rule"), // rule, llm, template
    priority: integer("priority").default(0), // 优先级 0-100
    enabled: boolean("enabled").default(true),
    sentimentFilter: varchar("sentiment_filter", { length: 20 }), // 情感过滤
    maxReplies: integer("max_replies").default(3), // 最大回复次数
    cooldownMinutes: integer("cooldown_minutes").default(60), // 冷却时间（分钟）
    responseCount: integer("response_count").default(0), // 已回复次数
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: 'string' }),
    createdBy: varchar("created_by", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("rules_platform_idx").on(table.platform),
    index("rules_enabled_idx").on(table.enabled),
    index("rules_priority_idx").on(table.priority),
  ]
);

// Segment Rules table - 分层规则表
export const segmentRules = pgTable(
  "segment_rules",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    segmentType: varchar("segment_type", { length: 50 }).notNull(), // VIP, active, dormant, new, churned
    platform: varchar("platform", { length: 50 }),
    conditions: jsonb("conditions").notNull(), // 分层条件
    priority: integer("priority").default(0), // 优先级
    enabled: boolean("enabled").default(true),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("segment_rules_type_idx").on(table.segmentType),
    index("segment_rules_enabled_idx").on(table.enabled),
  ]
);

// Analytics Data table - 分析数据表
export const analyticsData = pgTable(
  "analytics_data",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platform: varchar("platform", { length: 50 }).notNull(),
    postId: varchar("post_id", { length: 36 }).references(() => socialMediaPosts.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true, mode: 'string' }).notNull(),
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    comments: integer("comments").default(0),
    shares: integer("shares").default(0),
    clicks: integer("clicks").default(0),
    engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }).default("0"), // 互动率
    reach: integer("reach").default(0), // 触达人数
    impressions: integer("impressions").default(0), // 展示次数
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("analytics_platform_idx").on(table.platform),
    index("analytics_date_idx").on(table.date),
    index("analytics_post_id_idx").on(table.postId),
  ]
);

// TypeScript types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = z.infer<typeof insertKnowledgeDocumentSchema>;
export type MonitoringLog = typeof monitoringLogs.$inferSelect;
export type InsertMonitoringLog = z.infer<typeof insertMonitoringLogSchema>;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;
export type SocialMediaComment = typeof socialMediaComments.$inferSelect;
export type InsertSocialMediaComment = typeof socialMediaComments.$inferInsert;
export type UserSegment = typeof userSegments.$inferSelect;
export type InsertUserSegment = typeof userSegments.$inferInsert;
export type AutoReplyRule = typeof autoReplyRules.$inferSelect;
export type InsertAutoReplyRule = typeof autoReplyRules.$inferInsert;
export type SegmentRule = typeof segmentRules.$inferSelect;
export type InsertSegmentRule = typeof segmentRules.$inferInsert;
export type AnalyticsData = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = typeof analyticsData.$inferInsert;

// ==========================================
// 智能体管理系统表
// ==========================================

// Agents table - 智能体表
export const agents = pgTable(
  "agents",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    role: varchar("role", { length: 128 }).notNull(), // 角色，如CEO、CTO、产品经理等
    department: varchar("department", { length: 128 }), // 部门
    parentId: varchar("parent_id", { length: 36 }), // 上级智能体ID，用于树形结构
    description: text("description"), // 智能体描述
    systemPrompt: text("system_prompt"), // 系统提示词
    capabilities: jsonb("capabilities"), // 能力列表，如["技术决策", "团队管理", "产品规划"]
    knowledgeBaseId: varchar("knowledge_base_id", { length: 36 }), // 关联的知识库ID
    isActive: boolean("is_active").default(true).notNull(), // 是否启用
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("agents_parent_id_idx").on(table.parentId),
    index("agents_department_idx").on(table.department),
    index("agents_is_active_idx").on(table.isActive),
  ]
);

// Agent Knowledge Bases table - 智能体知识库表
export const agentKnowledgeBases = pgTable(
  "agent_knowledge_bases",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // 类型：common（通用）/individual（独立）
    agentId: varchar("agent_id", { length: 36 }), // 关联的智能体ID（如果类型为individual）
    description: text("description"), // 知识库描述
    documentCount: integer("document_count").default(0).notNull(), // 文档数量
    isActive: boolean("is_active").default(true).notNull(), // 是否启用
    modifiedBy: varchar("modified_by", { length: 128 }), // 最后修改人
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("agent_kb_agent_id_idx").on(table.agentId),
    index("agent_kb_type_idx").on(table.type),
  ]
);

// Agent Tasks table - 智能体任务表
export const agentTasks = pgTable(
  "agent_tasks",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 256 }).notNull(), // 任务标题
    description: text("description").notNull(), // 任务描述
    assignedAgentId: varchar("assigned_agent_id", { length: 36 }), // 分配给哪个智能体
    status: varchar("status", { length: 20 }).notNull().default("pending"), // 状态：pending/assigned/in_progress/completed
    priority: varchar("priority", { length: 20 }).notNull().default("medium"), // 优先级：high/medium/low
    createdBy: varchar("created_by", { length: 128 }).notNull(), // 创建者
    metadata: jsonb("metadata"), // 元数据，如标签、截止日期等
    completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }), // 完成时间
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("agent_tasks_assigned_agent_id_idx").on(table.assignedAgentId),
    index("agent_tasks_status_idx").on(table.status),
    index("agent_tasks_priority_idx").on(table.priority),
    index("agent_tasks_created_at_idx").on(table.createdAt),
  ]
);

// Agent Task Deliverables table - 任务成果表
export const agentTaskDeliverables = pgTable(
  "agent_task_deliverables",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    taskId: varchar("task_id", { length: 36 }).notNull().references(() => agentTasks.id, { onDelete: "cascade" }), // 关联的任务ID
    agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }), // 创建该成果的智能体ID
    title: varchar("title", { length: 256 }).notNull(), // 成果标题
    type: varchar("type", { length: 50 }).notNull(), // 成果类型：conversation, code, document, file, report, design
    content: text("content"), // 文本内容
    filePath: text("file_path"), // 文件路径
    fileName: varchar("file_name", { length: 256 }), // 文件名
    fileSize: integer("file_size"), // 文件大小（字节）
    fileType: varchar("file_type", { length: 50 }), // 文件类型
    status: varchar("status", { length: 20 }).notNull().default("draft"), // 状态：draft/reviewing/approved/rejected
    version: integer("version").default(1).notNull(), // 版本号
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("deliverables_task_id_idx").on(table.taskId),
    index("deliverables_agent_id_idx").on(table.agentId),
    index("deliverables_type_idx").on(table.type),
    index("deliverables_status_idx").on(table.status),
  ]
);

// Agent Conversations table - 智能体对话记录表
export const agentConversations = pgTable(
  "agent_conversations",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }), // 关联的智能体ID
    taskId: varchar("task_id", { length: 36 }).references(() => agentTasks.id, { onDelete: "set null" }), // 关联的任务ID（可选）
    userMessage: text("user_message").notNull(), // 用户消息
    agentResponse: text("agent_response"), // 智能体响应
    modelUsed: varchar("model_used", { length: 128 }), // 使用的模型
    metadata: jsonb("metadata"), // 元数据，如tokens数、耗时等
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("agent_convs_agent_id_idx").on(table.agentId),
    index("agent_convs_task_id_idx").on(table.taskId),
    index("agent_convs_created_at_idx").on(table.createdAt),
  ]
);

// Agent Knowledge Documents table - 智能体知识库文档表
export const agentKnowledgeDocuments = pgTable(
  "agent_knowledge_documents",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    knowledgeBaseId: varchar("knowledge_base_id", { length: 36 }).notNull().references(() => agentKnowledgeBases.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 256 }).notNull(), // 文件名
    filePath: text("file_path").notNull(), // 文件存储路径（对象存储URL）
    fileType: varchar("file_type", { length: 20 }).notNull(), // 文件类型
    fileSize: integer("file_size").notNull(), // 文件大小（字节）
    content: text("content"), // 解析后的文本内容
    docId: varchar("doc_id", { length: 100 }), // 知识库中的文档ID
    status: varchar("status", { length: 20 }).notNull().default("pending"), // 状态：pending/parsing/analyzed/failed
    uploadedBy: varchar("uploaded_by", { length: 128 }).notNull(), // 上传人
    metadata: jsonb("metadata"), // 元数据
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("agent_docs_kb_id_idx").on(table.knowledgeBaseId),
    index("agent_docs_status_idx").on(table.status),
  ]
);

// 智能体管理系统类型导出
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type AgentKnowledgeBase = typeof agentKnowledgeBases.$inferSelect;
export type InsertAgentKnowledgeBase = typeof agentKnowledgeBases.$inferInsert;
export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;
export type AgentTaskDeliverable = typeof agentTaskDeliverables.$inferSelect;
export type InsertAgentTaskDeliverable = typeof agentTaskDeliverables.$inferInsert;
export type AgentConversation = typeof agentConversations.$inferSelect;
export type InsertAgentConversation = typeof agentConversations.$inferInsert;
export type AgentKnowledgeDocument = typeof agentKnowledgeDocuments.$inferSelect;
export type InsertAgentKnowledgeDocument = typeof agentKnowledgeDocuments.$inferInsert;

// ==========================================
// 智能体API配置表 - 存储智能体的API模型接口配置
// ==========================================
export const agentApiConfigs = pgTable(
  "agent_api_configs",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    agentId: varchar("agent_id", { length: 36 }).notNull(), // 关联的智能体ID
    name: varchar("name", { length: 128 }).notNull(), // API名称
    type: varchar("type", { length: 20 }).notNull().default("REST"), // API类型：REST, GraphQL, WebSocket
    url: text("url").notNull(), // API地址
    method: varchar("method", { length: 10 }).notNull().default("GET"), // HTTP方法
    headers: jsonb("headers").$type<Record<string, string>>(), // 请求头
    queryParams: jsonb("query_params").$type<Record<string, string>>(), // 查询参数
    bodyTemplate: text("body_template"), // 请求体模板
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
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("agent_api_configs_agent_id_idx").on(table.agentId),
    index("agent_api_configs_type_idx").on(table.type),
    index("agent_api_configs_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// API执行日志表 - 存储API调用日志
// ==========================================
export const apiExecutionLogs = pgTable(
  "api_execution_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
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
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("api_exec_logs_api_config_id_idx").on(table.apiConfigId),
    index("api_exec_logs_task_id_idx").on(table.taskId),
    index("api_exec_logs_agent_id_idx").on(table.agentId),
    index("api_exec_logs_status_idx").on(table.status),
  ]
);

// API配置类型导出
export type AgentApiConfig = typeof agentApiConfigs.$inferSelect;
export type InsertAgentApiConfig = typeof agentApiConfigs.$inferInsert;
export type ApiExecutionLog = typeof apiExecutionLogs.$inferSelect;
export type InsertApiExecutionLog = typeof apiExecutionLogs.$inferInsert;

// ============================================
// 社媒运营Agent相关表
// ============================================

// Social Media Agents table - 社媒运营智能体表
export const socialMediaAgents = pgTable(
  "social_media_agents",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    platform: varchar("platform", { length: 50 }).notNull(), // tiktok, instagram, youtube, facebook, douyin, xiaohongshu, weibo
    platformIcon: varchar("platform_icon", { length: 10 }), // 平台图标emoji
    status: varchar("status", { length: 20 }).default("idle"), // active, idle, offline, error
    capabilities: jsonb("capabilities"), // 能力配置 [{id, name, enabled, icon, description}]
    config: jsonb("config"), // Agent配置 {autoReply, autoSchedule, contentStyle, targetAudience, postingSchedule, replyRules}
    stats: jsonb("stats"), // 统计数据 {totalTasks, successRate, avgResponseTime, engagementRate, followers, posts, replies}
    tasks: jsonb("tasks"), // 当前任务列表
    lastActiveAt: timestamp("last_active_at", { withTimezone: true, mode: 'string' }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("social_media_agents_platform_idx").on(table.platform),
    index("social_media_agents_status_idx").on(table.status),
    index("social_media_agents_is_active_idx").on(table.isActive),
  ]
);

// Social Media Scheduled Tasks table - 社媒定时任务表
export const socialMediaScheduledTasks = pgTable(
  "social_media_scheduled_tasks",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    agentId: varchar("agent_id", { length: 36 }).notNull().references(() => socialMediaAgents.id, { onDelete: "cascade" }),
    agentName: varchar("agent_name", { length: 255 }),
    platform: varchar("platform", { length: 50 }).notNull(),
    platformIcon: varchar("platform_icon", { length: 10 }),
    taskType: varchar("task_type", { length: 50 }).notNull(), // content_gen, auto_reply, schedule, analytics, engage
    title: varchar("title", { length: 500 }).notNull(),
    content: text("content").notNull(),
    mediaUrls: jsonb("media_urls"), // 媒体文件URL数组
    scheduledTime: timestamp("scheduled_time", { withTimezone: true, mode: 'string' }).notNull(),
    status: varchar("status", { length: 20 }).default("pending"), // pending, running, completed, failed, cancelled
    priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
    repeat: varchar("repeat", { length: 20 }).default("none"), // none, daily, weekly, monthly
    executedAt: timestamp("executed_at", { withTimezone: true, mode: 'string' }),
    errorMessage: text("error_message"),
    result: jsonb("result"), // 执行结果
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index("social_media_tasks_agent_id_idx").on(table.agentId),
    index("social_media_tasks_platform_idx").on(table.platform),
    index("social_media_tasks_status_idx").on(table.status),
    index("social_media_tasks_scheduled_time_idx").on(table.scheduledTime),
    index("social_media_tasks_priority_idx").on(table.priority),
  ]
);

// 类型导出
export type SocialMediaAgent = typeof socialMediaAgents.$inferSelect;
export type InsertSocialMediaAgent = typeof socialMediaAgents.$inferInsert;
export type SocialMediaScheduledTask = typeof socialMediaScheduledTasks.$inferSelect;
export type InsertSocialMediaScheduledTask = typeof socialMediaScheduledTasks.$inferInsert;
