/**
 * 数据库扩展 Schema - 宠物跨境业务专用
 * 扩展现有数据库结构，增加宠物产品、社媒运营、供应链等模块
 */

import { pgTable, serial, text, timestamp, jsonb, integer, decimal, boolean, index } from 'drizzle-orm/pg-core';

// ============================================
// 宠物产品模块
// ============================================

/**
 * 宠物产品 SKU 表
 */
export const petProductSkus = pgTable('pet_product_skus', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 玩具、食品、用品、服饰、医疗
  subCategory: text('subCategory'),
  brand: text('brand'),
  targetPet: jsonb('target_pet').notNull().$type<string[]>(), // ['dog', 'cat', 'bird']
  ageRange: text('ageRange'),
  material: text('material'),
  size: text('size'),
  weight: decimal('weight'),
  dimensions: jsonb('dimensions').$type<{ length: number; width: number; height: number }>(),
  images: jsonb('images').$type<string[]>(),
  videos: jsonb('videos').$type<string[]>(),
  features: jsonb('features').$type<string[]>(),
  specifications: jsonb('specifications').$type<Record<string, any>>(),
  costPrice: decimal('cost_price'),
  retailPrice: decimal('retail_price'),
  wholesalePrice: decimal('wholesale_price'),
  isActive: boolean('is_active').notNull().default(true),
  status: text('status').notNull().default('draft'), // draft, active, discontinued
  erpSku: text('erp_sku'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  skuIndex: index('pet_product_skus_sku_idx').on(table.sku),
  categoryIndex: index('pet_product_skus_category_idx').on(table.category),
  statusIndex: index('pet_product_skus_status_idx').on(table.status),
}));

/**
 * 宠物产品内容生成记录
 */
export const petContentGenerations = pgTable('pet_content_generations', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull(),
  platform: text('platform').notNull(), // tiktok, instagram, youtube, amazon, website
  language: text('language').notNull(),
  contentType: text('content_type').notNull(), // caption, listing, description, videoContent
  generatedContent: jsonb('generated_content').notNull(),
  modelUsed: text('model_used'),
  cost: decimal('cost'),
  cached: boolean('cached').notNull().default(false),
  status: text('status').notNull().default('pending'), // pending, generated, published, failed
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  skuIndex: index('pet_content_generations_sku_idx').on(table.sku),
  platformIndex: index('pet_content_generations_platform_idx').on(table.platform),
  statusIndex: index('pet_content_generations_status_idx').on(table.status),
}));

/**
 * 宠物产品图片/视频素材
 */
export const petProductAssets = pgTable('pet_product_assets', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull(),
  assetType: text('asset_type').notNull(), // scene, unboxing, features, video, userPhoto
  assetUrl: text('asset_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  generatedBy: text('generated_by'), // ai, manual, customer
  workflow: text('workflow'), // comfyui workflow name
  isApproved: boolean('is_approved').notNull().default(false),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  skuIndex: index('pet_product_assets_sku_idx').on(table.sku),
  assetTypeIndex: index('pet_product_assets_type_idx').on(table.assetType),
}));

// ============================================
// 社媒运营模块
// ============================================

/**
 * 社媒账号管理
 */
export const socialMediaAccounts = pgTable('social_media_accounts', {
  id: serial('id').primaryKey(),
  platform: text('platform').notNull(), // tiktok, instagram, youtube, facebook, linkedin
  accountId: text('account_id').notNull(),
  accountName: text('account_name').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiry: timestamp('token_expiry'),
  followers: integer('followers').default(0),
  following: integer('following').default(0),
  posts: integer('posts').default(0),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  isActive: boolean('is_active').notNull().default(true),
  autoPublishEnabled: boolean('auto_publish_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  platformIndex: index('social_media_accounts_platform_idx').on(table.platform),
  accountIndex: index('social_media_accounts_account_idx').on(table.accountId),
}));

/**
 * 社媒内容发布计划
 */
export const socialMediaPosts = pgTable('social_media_posts', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').notNull(),
  sku: text('sku'),
  postType: text('post_type').notNull(), // image, video, story, reel, carousel
  caption: text('caption'),
  mediaUrls: jsonb('media_urls').$type<string[]>().notNull(),
  hashtags: jsonb('hashtags').$type<string[]>(),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  status: text('status').notNull().default('scheduled'), // scheduled, published, failed, cancelled
  platformPostId: text('platform_post_id'),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  shares: integer('shares').default(0),
  views: integer('views').default(0),
  engagementRate: decimal('engagement_rate'),
  complianceCheckPassed: boolean('compliance_check_passed').notNull().default(false),
  complianceIssues: jsonb('compliance_issues').$type<any[]>(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  accountIndex: index('social_media_posts_account_idx').on(table.accountId),
  statusIndex: index('social_media_posts_status_idx').on(table.status),
  scheduledAtIndex: index('social_media_posts_scheduled_idx').on(table.scheduledAt),
}));

// ============================================
// 供应链模块
// ============================================

/**
 * 爆品预测
 */
export const hotProductPredictions = pgTable('hot_product_predictions', {
  id: serial('id').primaryKey(),
  categoryName: text('category_name').notNull(),
  productName: text('product_name').notNull(),
  description: text('description'),
  targetPet: jsonb('target_pet').$type<string[]>(),
  marketDemand: jsonb('market_demand').$type<{ current: number; projected: number; growthRate: number }>(),
  competitionLevel: text('competition_level').notNull(), // low, medium, high
  recommendedPrice: decimal('recommended_price'),
  estimatedMargin: decimal('estimated_margin'),
  developmentCost: decimal('development_cost'),
  timeToMarket: integer('time_to_market'), // days
  riskScore: decimal('risk_score'), // 0-1
  priority: text('priority').notNull(), // high, medium, low
  status: text('status').notNull().default('pending'), // pending, approved, developing, launched, cancelled
  aiConfidence: decimal('ai_confidence'), // 0-1
  dataSource: jsonb('data_source').$type<any[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryIndex: index('hot_product_predictions_category_idx').on(table.categoryName),
  statusIndex: index('hot_product_predictions_status_idx').on(table.status),
  priorityIndex: index('hot_product_predictions_priority_idx').on(table.priority),
}));

/**
 * 供应商管理
 */
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // rawMaterial, packaging, oem
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: jsonb('address').$type<any>(),
  products: jsonb('products').$type<string[]>(),
  leadTime: integer('lead_time'), // days
  moq: integer('moq'), // minimum order quantity
  qualityRating: decimal('quality_rating'), // 0-5
  priceCompetitiveness: text('price_competitiveness'), // excellent, good, average, poor
  paymentTerms: text('payment_terms'),
  status: text('status').notNull().default('active'), // active, inactive
  lastOrderDate: timestamp('last_order_date'),
  totalOrders: integer('total_orders').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  typeIndex: index('suppliers_type_idx').on(table.type),
  statusIndex: index('suppliers_status_idx').on(table.status),
}));

/**
 * 库存管理
 */
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  quantity: integer('quantity').notNull().default(0),
  reservedQuantity: integer('reserved_quantity').notNull().default(0),
  availableQuantity: integer('available_quantity').notNull().default(0),
  warehouseId: text('warehouse_id'),
  location: text('location'),
  reorderPoint: integer('reorder_point'),
  reorderQuantity: integer('reorder_quantity'),
  lastRestockDate: timestamp('last_restock_date'),
  lastSaleDate: timestamp('last_sale_date'),
  daysOfStock: integer('days_of_stock'),
  turnoverRate: decimal('turnover_rate'),
  status: text('status').notNull().default('normal'), // normal, low, outOfStock, overstock
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  skuIndex: index('inventory_sku_idx').on(table.sku),
  statusIndex: index('inventory_status_idx').on(table.status),
}));

// ============================================
// 线下渠道模块
// ============================================

/**
 * 线下门店
 */
export const offlineStores = pgTable('offline_stores', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // corporate, franchise, partnership
  address: jsonb('address').notNull().$type<any>(),
  country: text('country').notNull(),
  state: text('state'),
  city: text('city').notNull(),
  zipCode: text('zip_code'),
  latitude: decimal('latitude'),
  longitude: decimal('longitude'),
  phone: text('phone'),
  email: text('email'),
  manager: text('manager'),
  openingDate: timestamp('opening_date'),
  status: text('status').notNull().default('planned'), // planned, active, closed
  storeSize: integer('store_size'), // square feet
  monthlyRent: decimal('monthly_rent'),
  petDensityScore: decimal('pet_density_score'), // 0-10
  competitionScore: decimal('competition_score'), // 0-10
  demographicScore: decimal('demographic_score'), // 0-10
  locationScore: decimal('location_score'), // 0-10
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  countryIndex: index('offline_stores_country_idx').on(table.country),
  cityIndex: index('offline_stores_city_idx').on(table.city),
  statusIndex: index('offline_stores_status_idx').on(table.status),
}));

/**
 * 线下渠道商
 */
export const offlineChannelPartners = pgTable('offline_channel_partners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // retailer, distributor, wholesaler
  chainType: text('chain_type'), // chain, independent, online
  industry: text('industry').notNull(), // petRetail, generalRetail, pharmacy, grocery
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: jsonb('address').$type<any>(),
  numberOfStores: integer('number_of_stores'),
  averageMonthlySales: decimal('average_monthly_sales'),
  targetAudience: jsonb('target_audience').$type<string[]>(),
  priority: text('priority').notNull(), // high, medium, low
  status: text('status').notNull().default('prospect'), // prospect, contacted, negotiating, active, inactive
  lastContactDate: timestamp('last_contact_date'),
  nextFollowUpDate: timestamp('next_follow_up_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  typeIndex: index('offline_channel_partners_type_idx').on(table.type),
  statusIndex: index('offline_channel_partners_status_idx').on(table.status),
  priorityIndex: index('offline_channel_partners_priority_idx').on(table.priority),
}));

// ============================================
// AI 能力中台模块
// ============================================

/**
 * API 用量记录
 */
export const apiUsageLogs = pgTable('api_usage_logs', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  modelName: text('model_name').notNull(),
  modelType: text('model_type').notNull(), // llm, image, video
  source: text('source').notNull(), // local, paid
  department: text('department').notNull(),
  userId: text('user_id').notNull(),
  taskType: text('task_type'),
  tokens: integer('tokens'),
  cost: decimal('cost').notNull(),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  cached: boolean('cached').notNull().default(false),
}, (table) => ({
  timestampIndex: index('api_usage_logs_timestamp_idx').on(table.timestamp),
  departmentIndex: index('api_usage_logs_department_idx').on(table.department),
  modelIndex: index('api_usage_logs_model_idx').on(table.modelName),
}));

/**
 * 模型微调记录
 */
export const modelFineTuning = pgTable('model_fine_tuning', {
  id: serial('id').primaryKey(),
  baseModel: text('base_model').notNull(),
  fineTunedModelName: text('fine_tuned_model_name').notNull(),
  datasetName: text('dataset_name').notNull(),
  datasetSize: integer('dataset_size'),
  trainingEpochs: integer('training_epochs'),
  learningRate: decimal('learning_rate'),
  trainingStartTime: timestamp('training_start_time'),
  trainingEndTime: timestamp('training_end_time'),
  trainingDuration: integer('training_duration'), // seconds
  status: text('status').notNull().default('pending'), // pending, training, completed, failed
  loss: decimal('loss'),
  metrics: jsonb('metrics').$type<Record<string, number>>(),
  evaluationResults: jsonb('evaluation_results').$type<any>(),
  modelPath: text('model_path'),
  deployed: boolean('deployed').notNull().default(false),
  deployedAt: timestamp('deployed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  statusIndex: index('model_fine_tuning_status_idx').on(table.status),
}));
