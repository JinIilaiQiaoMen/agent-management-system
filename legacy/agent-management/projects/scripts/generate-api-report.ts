/**
 * API 路由测试报告生成器
 *
 * 功能:
 * - 生成详细的HTML测试报告
 * - 包含响应详情、错误信息、性能指标
 * - 支持导出为Markdown格式
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  route: string;
  url: string;
  status: number;
  success: boolean;
  isJson: boolean;
  contentType: string | null;
  error: string | null;
  responseTime?: number;
  responseSize?: number;
}

interface TestReport {
  timestamp: string;
  baseUrl: string;
  totalRoutes: number;
  successCount: number;
  failedCount: number;
  results: TestResult[];
}

/**
 * 生成HTML报告
 */
export function generateHtmlReport(report: TestReport): string {
  const {
    timestamp,
    baseUrl,
    totalRoutes,
    successCount,
    failedCount,
    results,
  } = report;

  const successRate = ((successCount / totalRoutes) * 100).toFixed(2);

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API 路由测试报告</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }

    .header .meta {
      opacity: 0.9;
      font-size: 14px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .summary-card .label {
      font-size: 14px;
      color: #6b7280;
    }

    .summary-card.success .value {
      color: #10b981;
    }

    .summary-card.error .value {
      color: #ef4444;
    }

    .results {
      padding: 30px;
    }

    .results h2 {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .result-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 15px;
      overflow: hidden;
    }

    .result-header {
      padding: 15px 20px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .result-header .route {
      font-weight: 600;
      font-size: 16px;
    }

    .result-header .badge {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge.success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge.error {
      background: #fee2e2;
      color: #991b1b;
    }

    .result-body {
      padding: 20px;
    }

    .result-body .info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item .label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .info-item .value {
      font-weight: 500;
    }

    .result-body .error {
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 12px;
      color: #991b1b;
      font-size: 14px;
    }

    .footer {
      padding: 20px 30px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>API 路由测试报告</h1>
      <div class="meta">
        <span>测试时间: ${timestamp}</span> |
        <span>测试地址: ${baseUrl}</span>
      </div>
    </div>

    <div class="summary">
      <div class="summary-card">
        <div class="value">${totalRoutes}</div>
        <div class="label">总路由数</div>
      </div>
      <div class="summary-card success">
        <div class="value">${successCount}</div>
        <div class="label">成功</div>
      </div>
      <div class="summary-card error">
        <div class="value">${failedCount}</div>
        <div class="label">失败</div>
      </div>
      <div class="summary-card">
        <div class="value">${successRate}%</div>
        <div class="label">成功率</div>
      </div>
    </div>

    <div class="results">
      <h2>测试结果详情</h2>
      ${results.map((result) => `
        <div class="result-item">
          <div class="result-header">
            <span class="route">${result.route}</span>
            <span class="badge ${result.success && result.isJson ? 'success' : 'error'}">
              ${result.success && result.isJson ? '✅ 成功' : '❌ 失败'}
            </span>
          </div>
          <div class="result-body">
            <div class="info">
              <div class="info-item">
                <span class="label">URL</span>
                <span class="value">${result.url}</span>
              </div>
              <div class="info-item">
                <span class="label">状态码</span>
                <span class="value">${result.status}</span>
              </div>
              <div class="info-item">
                <span class="label">Content-Type</span>
                <span class="value">${result.contentType || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">JSON格式</span>
                <span class="value">${result.isJson ? '✅ 是' : '❌ 否'}</span>
              </div>
            </div>
            ${result.error ? `<div class="error">错误: ${result.error}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>此报告由 API 路由测试工具自动生成</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 生成Markdown报告
 */
export function generateMarkdownReport(report: TestReport): string {
  const {
    timestamp,
    baseUrl,
    totalRoutes,
    successCount,
    failedCount,
    results,
  } = report;

  const successRate = ((successCount / totalRoutes) * 100).toFixed(2);

  return `
# API 路由测试报告

**测试时间:** ${timestamp}
**测试地址:** ${baseUrl}

## 测试摘要

| 指标 | 数值 |
|------|------|
| 总路由数 | ${totalRoutes} |
| 成功 | ${successCount} |
| 失败 | ${failedCount} |
| 成功率 | ${successRate}% |

## 测试结果详情

${results.map((result) => `
### ${result.route}

| 属性 | 值 |
|------|-----|
| URL | ${result.url} |
| 状态码 | ${result.status} |
| Content-Type | ${result.contentType || 'N/A'} |
| JSON格式 | ${result.isJson ? '✅ 是' : '❌ 否'} |
| 状态 | ${result.success && result.isJson ? '✅ 成功' : '❌ 失败'} |

${result.error ? `**错误:** \`${result.error}\`` : ''}
`).join('\n')}

---

*此报告由 API 路由测试工具自动生成*
`;
}

/**
 * 保存报告
 */
export function saveReport(
  report: TestReport,
  format: 'html' | 'markdown' = 'html',
  outputPath?: string
) {
  const outputDir = outputPath || join(process.cwd(), 'reports');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 确保目录存在
  mkdirSync(outputDir, { recursive: true });

  // 生成报告内容
  const content =
    format === 'html' ? generateHtmlReport(report) : generateMarkdownReport(report);
  const extension = format === 'html' ? 'html' : 'md';
  const filename = `api-test-report-${timestamp}.${extension}`;
  const filepath = join(outputDir, filename);

  // 保存报告
  writeFileSync(filepath, content, 'utf-8');

  console.log(`✅ 报告已保存: ${filepath}`);

  return filepath;
}
