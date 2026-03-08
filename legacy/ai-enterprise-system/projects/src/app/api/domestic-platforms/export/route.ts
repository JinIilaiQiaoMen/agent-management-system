import { NextRequest, NextResponse } from 'next/server';

interface PublishRecord {
  id: string;
  platform: string;
  status: 'success' | 'failed' | 'pending';
  publishTime: string;
  contentType: string;
  title?: string;
  content: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
}

// 模拟发布记录数据
let publishRecords: PublishRecord[] = [
  {
    id: '1',
    platform: 'taobao',
    status: 'success',
    publishTime: '2026-03-01T10:00:00Z',
    contentType: 'product',
    title: '【新品上市】高品质宠物用品',
    content: '精选优质原料，严格品控，为您的爱宠提供最好的呵护。',
    likes: 150,
    comments: 20,
    shares: 10,
    views: 1200
  },
  {
    id: '2',
    platform: 'douyin',
    status: 'success',
    publishTime: '2026-03-01T11:00:00Z',
    contentType: 'video',
    content: '🔥 爆款来了！看看这款超好用的神器',
    likes: 3200,
    comments: 150,
    shares: 80,
    views: 15000
  },
  {
    id: '3',
    platform: 'xiaohongshu',
    status: 'success',
    publishTime: '2026-03-01T12:00:00Z',
    contentType: 'post',
    content: '今天给大家分享一款超好用的产品',
    likes: 890,
    comments: 45,
    shares: 25,
    views: 5600
  }
];

const platformNames: Record<string, string> = {
  taobao: '淘宝',
  jd: '京东',
  pinduoduo: '拼多多',
  douyin: '抖音',
  kuaishou: '快手',
  xiaohongshu: '小红书',
  weibo: '微博',
  bilibili: 'B站',
  wechat: '微信',
  toutiao: '今日头条'
};

const contentTypeNames: Record<string, string> = {
  product: '商品',
  post: '动态',
  video: '视频',
  article: '文章'
};

const statusNames: Record<string, string> = {
  success: '成功',
  failed: '失败',
  pending: '待发布'
};

/**
 * 导出发布报告
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'excel';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 按日期过滤
    let filteredRecords = [...publishRecords];
    if (startDate) {
      filteredRecords = filteredRecords.filter(r => r.publishTime >= startDate);
    }
    if (endDate) {
      filteredRecords = filteredRecords.filter(r => r.publishTime <= endDate);
    }

    // 按发布时间排序（最新的在前）
    filteredRecords.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      return exportCSV(filteredRecords, timestamp);
    } else {
      return exportExcel(filteredRecords, timestamp);
    }
  } catch (error: any) {
    console.error('导出报告失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '导出报告失败',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function exportCSV(records: PublishRecord[], timestamp: string): NextResponse {
  // CSV 头部
  const headers = [
    'ID',
    '平台',
    '状态',
    '内容类型',
    '标题',
    '内容',
    '点赞数',
    '评论数',
    '分享数',
    '浏览数',
    '发布时间'
  ];

  // CSV 内容
  const rows = records.map(record => [
    record.id,
    platformNames[record.platform] || record.platform,
    statusNames[record.status] || record.status,
    contentTypeNames[record.contentType] || record.contentType,
    record.title || '',
    record.content.replace(/"/g, '""'),
    record.likes || 0,
    record.comments || 0,
    record.shares || 0,
    record.views || 0,
    formatDateTime(record.publishTime)
  ]);

  // 组合 CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // 返回 CSV 文件
  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="发布报告_${timestamp}.csv"`
    }
  });
}

function exportExcel(records: PublishRecord[], timestamp: string): NextResponse {
  // 生成简单的 HTML 表格（可以被 Excel 识别）
  const headers = [
    'ID',
    '平台',
    '状态',
    '内容类型',
    '标题',
    '内容',
    '点赞数',
    '评论数',
    '分享数',
    '浏览数',
    '发布时间'
  ];

  const rows = records.map(record => `
    <tr>
      <td>${record.id}</td>
      <td>${platformNames[record.platform] || record.platform}</td>
      <td>${statusNames[record.status] || record.status}</td>
      <td>${contentTypeNames[record.contentType] || record.contentType}</td>
      <td>${record.title || ''}</td>
      <td>${record.content}</td>
      <td>${record.likes || 0}</td>
      <td>${record.comments || 0}</td>
      <td>${record.shares || 0}</td>
      <td>${record.views || 0}</td>
      <td>${formatDateTime(record.publishTime)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // 返回 Excel 文件
  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="发布报告_${timestamp}.xls"`
    }
  });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
