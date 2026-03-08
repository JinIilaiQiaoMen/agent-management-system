/**
 * AI 请求缓存系统
 * 减少重复的 API 调用，降低成本
 */

import { CACHE_CONFIG } from './config';

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

/**
 * 生成缓存键
 */
function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');

  return `${CACHE_CONFIG.keyPrefix}:${prefix}:${sortedParams}`;
}

/**
 * 内存缓存（开发环境）
 */
class MemoryCache {
  private cache: Map<string, CacheItem> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    // 更新命中次数
    item.hits++;
    return item.data;
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 1
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const items = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalHits: items.reduce((sum, item) => sum + item.hits, 0),
      avgHits: items.length > 0 ? items.reduce((sum, item) => sum + item.hits, 0) / items.length : 0
    };
  }
}

const cache = new MemoryCache();

/**
 * 获取缓存数据
 */
export async function getFromCache<T>(type: 'llm' | 'image' | 'video' | 'customerAnalysis', params: Record<string, any>): Promise<T | null> {
  if (!CACHE_CONFIG.enabled) {
    return null;
  }

  const key = generateCacheKey(type, params);
  return cache.get<T>(key);
}

/**
 * 设置缓存数据
 */
export async function setCache<T>(
  type: 'llm' | 'image' | 'video' | 'customerAnalysis',
  params: Record<string, any>,
  data: T
): Promise<void> {
  if (!CACHE_CONFIG.enabled) {
    return;
  }

  const key = generateCacheKey(type, params);
  const ttl = CACHE_CONFIG.ttl[type];
  cache.set(key, data, ttl);
}

/**
 * 删除缓存
 */
export async function deleteCache(type: string, params: Record<string, any>): Promise<void> {
  const key = generateCacheKey(type, params);
  cache.delete(key);
}

/**
 * 清除所有缓存
 */
export async function clearCache(): Promise<void> {
  cache.clear();
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return cache.getStats();
}

/**
 * 预热缓存（批量加载常用数据）
 */
export async function warmupCache(commonQueries: Array<{ type: string; params: Record<string, any>; loader: () => Promise<any> }>) {
  console.log(`开始预热缓存，共 ${commonQueries.length} 个常用查询...`);

  for (const query of commonQueries) {
    try {
      const data = await query.loader();
      await setCache(query.type as any, query.params, data);
      console.log(`✓ 缓存已加载: ${query.type}`);
    } catch (error) {
      console.error(`✗ 缓存加载失败: ${query.type}`, error);
    }
  }

  console.log('缓存预热完成');
}
