#!/usr/bin/env node

/**
 * 环境变量验证脚本
 *
 * 功能:
 * - 检查必填的环境变量是否已配置
 * - 验证环境变量的格式是否正确
 * - 生成配置报告
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 必填的环境变量
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'COZE_API_KEY',
  'COZE_BUCKET_ENDPOINT_URL',
  'COZE_BUCKET_NAME',
  'COZE_BUCKET_REGION',
  'COZE_LLM_API_KEY',
  'COZE_LLM_BASE_URL',
  'COZE_WEB_SEARCH_API_KEY',
  'JWT_SECRET',
  'API_SECRET_KEY',
  'SESSION_SECRET',
  'PASSWORD_SALT',
  'ALLOWED_ORIGINS',
];

// 需要验证格式的环境变量
const FORMAT_VALIDATORS = {
  DATABASE_URL: (value) => {
    return value.startsWith('postgresql://');
  },
  COZE_BUCKET_ENDPOINT_URL: (value) => {
    return value.startsWith('https://') || value.startsWith('http://');
  },
  PORT: (value) => {
    const port = parseInt(value);
    return !isNaN(port) && port > 0 && port < 65536;
  },
  JWT_SECRET: (value) => {
    return value.length >= 32;
  },
  ALLOWED_ORIGINS: (value) => {
    return value && value.length > 0;
  },
};

// 推荐的生产环境配置
const RECOMMENDED_PROD_CONFIGS = {
  NODE_ENV: 'production',
  LOG_LEVEL: ['warn', 'error'],
  BACKUP_ENABLED: 'true',
  ENABLE_RATE_LIMIT: 'true',
  ENABLE_ERROR_REPORTING: 'true',
  DEVTOOLS_ENABLED: 'false',
  SHOW_DETAILED_ERRORS: 'false',
};

// 加载环境变量
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').trim();
      // 移除引号
      const cleanValue = value.replace(/^['"]|['"]$/g, '');
      envVars[key] = cleanValue;
    }
  });

  return envVars;
}

// 验证环境变量
function validateEnvVars(envVars, isProduction = false) {
  const errors = [];
  const warnings = [];

  // 检查必填变量
  REQUIRED_ENV_VARS.forEach((varName) => {
    if (!envVars[varName] || envVars[varName].trim() === '') {
      errors.push(`❌ 缺少必填环境变量: ${varName}`);
    }
  });

  // 验证格式
  Object.entries(FORMAT_VALIDATORS).forEach(([varName, validator]) => {
    const value = envVars[varName];
    if (value && !validator(value)) {
      errors.push(`❌ ${varName} 格式不正确: ${value}`);
    }
  });

  // 生产环境检查
  if (isProduction) {
    // 检查是否使用默认密码
    if (envVars.DATABASE_URL?.includes('postgres@postgres') ||
        envVars.DATABASE_URL?.includes('CHANGE_ME')) {
      warnings.push('⚠️  生产环境数据库使用了默认密码，请修改！');
    }

    // 检查密钥强度
    if (envVars.JWT_SECRET?.length < 32) {
      warnings.push('⚠️  JWT_SECRET 长度不足，建议至少32字符！');
    }

    // 检查是否使用示例密钥
    const weakSecrets = ['your_', 'CHANGE_ME', 'example'];
    if (envVars.JWT_SECRET && weakSecrets.some(prefix => envVars.JWT_SECRET.includes(prefix))) {
      errors.push('❌ JWT_SECRET 使用了示例密钥，请修改！');
    }

    // 检查推荐的配置
    Object.entries(RECOMMENDED_PROD_CONFIGS).forEach(([key, expected]) => {
      const actual = envVars[key];
      if (expected.includes(actual)) {
        // 正确，忽略
      } else {
        warnings.push(`⚠️  生产环境建议设置 ${key}=${expected}`);
      }
    });
  }

  return { errors, warnings };
}

// 生成报告
function generateReport(envVars, errors, warnings, isProduction) {
  console.log('\n========================================');
  console.log('环境变量配置验证报告');
  console.log('========================================\n');

  console.log(`📋 环境: ${isProduction ? '生产环境' : '开发环境'}`);
  console.log(`📝 配置文件: .env${isProduction ? '.production' : ''}`);
  console.log(`✅ 已配置变量数: ${Object.keys(envVars).length}`);
  console.log(`❌ 错误数: ${errors.length}`);
  console.log(`⚠️  警告数: ${warnings.length}\n`);

  // 显示错误
  if (errors.length > 0) {
    console.log('❌ 错误:');
    errors.forEach((error) => console.log(`  ${error}`));
    console.log('');
  }

  // 显示警告
  if (warnings.length > 0) {
    console.log('⚠️  警告:');
    warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log('');
  }

  // 显示已配置的变量（隐藏敏感信息）
  console.log('📦 已配置的环境变量:');
  const sensitiveVars = [
    'SECRET', 'PASSWORD', 'TOKEN', 'KEY', 'AUTH', 'SALT',
  ];

  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      const isSensitive = sensitiveVars.some((sensitive) =>
        key.toUpperCase().includes(sensitive)
      );
      const displayValue = isSensitive ? '***已配置***' : value;
      console.log(`  ${key} = ${displayValue}`);
    }
  });

  console.log('\n========================================');

  // 显示结果
  if (errors.length > 0) {
    console.log('❌ 验证失败！请修复错误后重试。');
    return false;
  } else if (warnings.length > 0) {
    console.log('⚠️  验证通过，但存在警告，建议修复。');
    return true;
  } else {
    console.log('✅ 所有配置项验证通过！');
    return true;
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const isProduction = args.includes('--prod') || args.includes('-p');
  const envFileName = isProduction ? '.env.production' : '.env';
  const envPath = path.join(process.cwd(), envFileName);

  console.log(`🔍 正在检查 ${envFileName} 文件...`);

  const envVars = loadEnvFile(envPath);

  if (!envVars) {
    console.error(`❌ 找不到 ${envFileName} 文件！`);
    console.log(`\n💡 提示: 请先复制示例文件：`);
    console.log(`   cp ${envFileName}.example ${envFileName}`);
    process.exit(1);
  }

  console.log(`✅ 找到 ${envFileName} 文件\n`);

  const { errors, warnings } = validateEnvVars(envVars, isProduction);
  const success = generateReport(envVars, errors, warnings, isProduction);

  process.exit(success ? 0 : 1);
}

// 运行
main();
