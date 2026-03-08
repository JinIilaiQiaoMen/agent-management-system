#!/usr/bin/env node

/**
 * API 路由测试工具
 *
 * 功能:
 * - 扫描所有API路由
 * - 发送测试请求
 * - 验证响应是否为JSON格式
 * - 生成测试报告
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const API_DIR = path.join(process.cwd(), 'src', 'app', 'api');

/**
 * 递归查找API路由
 */
function findApiRoutes(dir: string, base: string = ''): string[] {
  const routes: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subRoutes = findApiRoutes(fullPath, path.join(base, item));
      routes.push(...subRoutes);
    } else if (item === 'route.ts') {
      // 转换路径为URL
      const routePath = base
        .split(path.sep)
        .map((segment) => {
          // 处理动态路由 [param] -> :param
          if (segment.startsWith('[') && segment.endsWith(']')) {
            return `:${segment.slice(1, -1)}`;
          }
          return segment;
        })
        .join('/');

      routes.push(`/api/${routePath}`);
    }
  }

  return routes;
}

/**
 * 测试单个API路由
 */
async function testApiRoute(route: string) {
  const url = `${BASE_URL}${route}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    return {
      route,
      url,
      status: response.status,
      success: response.ok,
      isJson,
      contentType,
      error: null,
    };
  } catch (error) {
    return {
      route,
      url,
      status: 0,
      success: false,
      isJson: false,
      contentType: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 生成测试报告
 */
function generateReport(results: any[]) {
  const total = results.length;
  const success = results.filter((r) => r.success && r.isJson).length;
  const failed = total - success;

  console.log('\n📊 API 路由测试报告');
  console.log('='.repeat(60));
  console.log(`总计: ${total} 个路由`);
  console.log(`✅ 成功: ${success} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log('='.repeat(60));

  // 显示失败的路由
  const failedRoutes = results.filter((r) => !r.success || !r.isJson);
  if (failedRoutes.length > 0) {
    console.log('\n❌ 失败的路由:');
    failedRoutes.forEach((result) => {
      console.log(`\n  ${result.route}`);
      console.log(`    URL: ${result.url}`);
      console.log(`    Status: ${result.status}`);
      console.log(`    Content-Type: ${result.contentType || 'N/A'}`);
      console.log(`    Is JSON: ${result.isJson ? '✅' : '❌'}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });
  }

  // 显示成功的路由
  const successRoutes = results.filter((r) => r.success && r.isJson);
  if (successRoutes.length > 0) {
    console.log('\n✅ 成功的路由:');
    successRoutes.forEach((result) => {
      console.log(`  ${result.route} (Status: ${result.status})`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(
    failed > 0
      ? `⚠️  测试未通过，请检查失败的路由`
      : `✅ 所有测试通过！`
  );
  console.log('='.repeat(60));
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始扫描 API 路由...');

  // 检查API目录是否存在
  if (!fs.existsSync(API_DIR)) {
    console.error('❌ API 目录不存在:', API_DIR);
    process.exit(1);
  }

  // 查找所有API路由
  const routes = findApiRoutes(API_DIR);
  console.log(`📋 找到 ${routes.length} 个 API 路由:`);
  routes.forEach((route) => console.log(`  - ${route}`));

  console.log(`\n🚀 开始测试 API 路由 (${BASE_URL})...`);

  // 测试所有路由
  const results = [];
  for (const route of routes) {
    console.log(`\n测试: ${route}`);
    const result = await testApiRoute(route);
    results.push(result);

    if (result.success && result.isJson) {
      console.log(`  ✅ 成功 (Status: ${result.status})`);
    } else {
      console.log(`  ❌ 失败`);
    }
  }

  // 生成报告
  generateReport(results);

  // 退出码
  const hasFailed = results.some((r) => !r.success || !r.isJson);
  process.exit(hasFailed ? 1 : 0);
}

// 运行测试
main().catch((error) => {
  console.error('测试失败:', error);
  process.exit(1);
});
