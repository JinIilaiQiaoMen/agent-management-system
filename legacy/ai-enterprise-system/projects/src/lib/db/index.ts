/**
 * 数据库连接模块
 * 使用 Drizzle ORM 连接到 PostgreSQL
 * 强制使用真实数据库，不提供模拟模式
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/storage/database/shared/schema';

// 从环境变量获取数据库 URL
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('❌ 错误：未配置数据库连接。请设置 DATABASE_URL 或 POSTGRES_URL 环境变量');
}

// 创建 PostgreSQL 连接
let client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

if (databaseUrl) {
  try {
    client = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    _db = drizzle(client, { schema });
    console.log('✅ 数据库连接已建立');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    throw new Error('数据库连接失败，请检查 DATABASE_URL 环境变量配置');
  }
}

// 导出数据库实例
export const db = _db!;

// 导出 schema
export * from '@/storage/database/shared/schema';

// 导出 Drizzle ORM 操作符
export { eq, and, or, desc, asc, like, ilike, inArray, notInArray, isNull, isNotNull, gte, lte, gt, lt, between } from 'drizzle-orm';
