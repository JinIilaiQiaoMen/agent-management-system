/**
 * ZAEP - 数据库集成模块
 * 
 * 整合AI智能化企业系统的Supabase配置
 * 和公司智能体管理系统的PostgreSQL配置
 */

import { createClient } from '@supabase/supabase-js';

// 环境变量类型定义
interface DatabaseConfig {
  // Supabase配置 (AI企业系统)
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // PostgreSQL配置 (智能体管理)
  postgres: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  
  // Redis配置 (可选)
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

// 默认配置
const DEFAULT_CONFIG: DatabaseConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  postgres: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'zaep',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  }
};

/**
 * 创建Supabase客户端 (AI企业系统)
 */
export function createSupabaseClient() {
  const { url, anonKey } = DEFAULT_CONFIG.supabase;
  
  if (!url || !anonKey) {
    console.warn('Supabase configuration missing');
    return null;
  }
  
  return createClient(url, anonKey);
}

/**
 * 创建PostgreSQL连接配置 (智能体管理)
 */
export function getPostgresConfig() {
  return {
    ...DEFAULT_CONFIG.postgres,
    connectionString: `postgresql://${DEFAULT_CONFIG.postgres.user}:${DEFAULT_CONFIG.postgres.password}@${DEFAULT_CONFIG.postgres.host}:${DEFAULT_CONFIG.postgres.port}/${DEFAULT_CONFIG.postgres.database}`,
  };
}

/**
 * 创建Redis配置
 */
export function getRedisConfig() {
  return DEFAULT_CONFIG.redis;
}

/**
 * 数据库连接池管理
 */
export class DatabasePool {
  private static instance: DatabasePool;
  private supabase = createSupabaseClient();
  
  private constructor() {}
  
  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }
  
  getSupabase() {
    return this.supabase;
  }
  
  getPostgres() {
    return getPostgresConfig();
  }
  
  getRedis() {
    return getRedisConfig();
  }
  
  /**
   * 测试所有数据库连接
   */
  async testConnections(): Promise<{
    supabase: boolean;
    postgres: boolean;
    redis: boolean;
  }> {
    const results = {
      supabase: false,
      postgres: false,
      redis: false,
    };
    
    // 测试Supabase
    if (this.supabase) {
      try {
        const { error } = await this.supabase.from('health').select('*').limit(1);
        results.supabase = !error;
      } catch {
        results.supabase = false;
      }
    }
    
    // PostgreSQL和Redis需要在应用启动时测试
    
    return results;
  }
}

export default DatabasePool.getInstance();
