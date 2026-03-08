#!/usr/bin/env node

/**
 * API 路由迁移助手
 *
 * 功能:
 * - 自动扫描所有API路由文件
 * - 检测是否使用了统一的响应格式
 * - 自动添加响应格式包装器
 * - 生成迁移报告
 */

import fs from 'fs';
import path from 'path';

const API_DIR = path.join(process.cwd(), 'src', 'app', 'api');

interface RouteFile {
  path: string;
  route: string;
  hasResponseWrapper: boolean;
  hasErrorHandler: boolean;
  functions: string[];
}

/**
 * 递归查找API路由文件
 */
function findRouteFiles(dir: string, base: string = ''): RouteFile[] {
  const files: RouteFile[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subFiles = findRouteFiles(fullPath, path.join(base, item));
      files.push(...subFiles);
    } else if (item === 'route.ts') {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const routePath = `/api/${base}`;

      files.push({
        path: fullPath,
        route: routePath,
        hasResponseWrapper: content.includes('jsonResponse(') || content.includes('successResponse('),
        hasErrorHandler: content.includes('withErrorHandler'),
        functions: extractFunctionNames(content),
      });
    }
  }

  return files;
}

/**
 * 提取函数名
 */
function extractFunctionNames(content: string): string[] {
  const functionRegex = /export (?:async )?function (\w+)|export const (\w+) =/g;
  const functions: string[] = [];
  let match;

  while ((match = functionRegex.exec(content)) !== null) {
    const functionName = match[1] || match[2];
    if (functionName && functionName !== 'GET' && functionName !== 'POST' && functionName !== 'PUT' && functionName !== 'DELETE') {
      functions.push(functionName);
    }
  }

  return functions;
}

/**
 * 添加响应格式包装器
 */
function addResponseWrapper(content: string): string {
  // 如果已经有import，在现有import后添加
  if (content.includes('import')) {
    return content.replace(
      /(import .* from ['"].*['"];?)/,
      "$1\nimport { jsonResponse, errorResponse } from '@/lib/api-response';"
    );
  }

  // 否则在文件开头添加import
  return `import { jsonResponse, errorResponse } from '@/lib/api-response';\n${content}`;
}

/**
 * 包装HTTP方法函数
 */
function wrapHttpMethodFunction(content: string, method: string): string {
  const functionPattern = new RegExp(
    `export (?:async )?function ${method}\\s*\\([^)]*\\)\\s*[\\{:](.*?)^\\n[\\s]*}`,
    'gms'
  );

  return content.replace(functionPattern, (match, body) => {
    // 检查是否已经包装
    if (body.includes('jsonResponse') || body.includes('errorResponse')) {
      return match;
    }

    // 提取返回语句
    const returnPattern = /return (NextResponse\\.json|new Response|Response\\.json)\(([^)]+)\)(\s*;?)/g;
    return body.replace(returnPattern, (returnMatch, responseType, returnData, semicolon) => {
      const indent = returnMatch.match(/^\s*/)?.[0] || '      ';
      return `${indent}return jsonResponse(${returnData})${semicolon}`;
    });
  });
}

/**
 * 迁移单个文件
 */
function migrateFile(file: RouteFile) {
  console.log(`\n🔄 处理: ${file.route}`);
  console.log(`   文件: ${file.path}`);

  let content = fs.readFileSync(file.path, 'utf-8');
  let modified = false;

  // 添加import
  if (!content.includes('api-response')) {
    console.log('   ✅ 添加响应格式导入');
    content = addResponseWrapper(content);
    modified = true;
  }

  // 包装GET函数
  if (file.functions.includes('GET') || content.includes('function GET')) {
    console.log('   ✅ 包装 GET 函数');
    content = wrapHttpMethodFunction(content, 'GET');
    modified = true;
  }

  // 包装POST函数
  if (file.functions.includes('POST') || content.includes('function POST')) {
    console.log('   ✅ 包装 POST 函数');
    content = wrapHttpMethodFunction(content, 'POST');
    modified = true;
  }

  // 包装PUT函数
  if (file.functions.includes('PUT') || content.includes('function PUT')) {
    console.log('   ✅ 包装 PUT 函数');
    content = wrapHttpMethodFunction(content, 'PUT');
    modified = true;
  }

  // 包装DELETE函数
  if (file.functions.includes('DELETE') || content.includes('function DELETE')) {
    console.log('   ✅ 包装 DELETE 函数');
    content = wrapHttpMethodFunction(content, 'DELETE');
    modified = true;
  }

  // 保存文件
  if (modified) {
    fs.writeFileSync(file.path, content, 'utf-8');
    console.log('   💾 文件已保存');
  } else {
    console.log('   ℹ️  无需修改');
  }

  return modified;
}

/**
 * 生成迁移报告
 */
function generateMigrationReport(files: RouteFile[]) {
  const total = files.length;
  const needsMigration = files.filter((f) => !f.hasResponseWrapper).length;
  const alreadyMigrated = total - needsMigration;

  console.log('\n📊 迁移报告');
  console.log('='.repeat(60));
  console.log(`总文件数: ${total}`);
  console.log(`已迁移: ${alreadyMigrated}`);
  console.log(`需要迁移: ${needsMigration}`);
  console.log('='.repeat(60));

  // 显示需要迁移的文件
  const needMigrationFiles = files.filter((f) => !f.hasResponseWrapper);
  if (needMigrationFiles.length > 0) {
    console.log('\n📋 需要迁移的文件:');
    needMigrationFiles.forEach((file) => {
      console.log(`  - ${file.route}`);
    });
  }

  // 显示已迁移的文件
  const migratedFiles = files.filter((f) => f.hasResponseWrapper);
  if (migratedFiles.length > 0) {
    console.log('\n✅ 已迁移的文件:');
    migratedFiles.forEach((file) => {
      console.log(`  - ${file.route}`);
    });
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 扫描 API 路由...');

  // 检查API目录是否存在
  if (!fs.existsSync(API_DIR)) {
    console.error('❌ API 目录不存在:', API_DIR);
    process.exit(1);
  }

  // 查找所有API路由文件
  const files = findRouteFiles(API_DIR);
  console.log(`📋 找到 ${files.length} 个 API 路由文件`);

  // 生成报告
  generateMigrationReport(files);

  // 询问是否执行迁移
  console.log('\n❓ 是否执行迁移? (y/n)');
  console.log('提示: 此操作会自动修改文件内容，建议先提交代码');

  const args = process.argv.slice(2);
  const autoMigrate = args.includes('--yes') || args.includes('-y');

  if (autoMigrate) {
    console.log('🚀 自动执行迁移...\n');
  } else {
    // 非交互模式，直接执行
    console.log('🚀 执行迁移...\n');
  }

  // 执行迁移
  let modifiedCount = 0;
  for (const file of files) {
    if (!file.hasResponseWrapper) {
      const modified = migrateFile(file);
      if (modified) {
        modifiedCount++;
      }
    }
  }

  console.log('\n✅ 迁移完成!');
  console.log(`📝 修改了 ${modifiedCount} 个文件`);
  console.log('\n💡 建议:');
  console.log('   1. 运行 npm run test:api 验证API是否正常');
  console.log('   2. 运行 npm run ts-check 检查类型错误');
}

// 运行迁移
main().catch((error) => {
  console.error('迁移失败:', error);
  process.exit(1);
});
