'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onExport?: (format: 'csv' | 'excel') => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'excel' | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(format);
    setShowMenu(false);

    try {
      let url = `/api/domestic-platforms/export?format=${format}`;

      if (dateRange !== 'all') {
        const startDate = getStartDate(dateRange);
        url += `&startDate=${startDate}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('导出失败');
      }

      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `发布报告_${Date.now()}.csv`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      // 下载文件
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);

      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setExporting(null);
    }
  };

  const getStartDate = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    now.setDate(now.getDate() - days);
    return now.toISOString().split('T')[0];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Download className="h-4 w-4" />
        <span>导出报告</span>
      </button>

      {/* 下拉菜单 */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            {/* 日期范围选择 */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  时间范围
                </span>
              </div>
              <div className="flex space-x-1">
                {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      dateRange === range
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {range === '7d' ? '7天' : range === '30d' ? '30天' : range === '90d' ? '90天' : '全部'}
                  </button>
                ))}
              </div>
            </div>

            {/* 导出选项 */}
            <div className="p-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting !== null}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    CSV 格式
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    适用于 Excel, Google Sheets
                  </div>
                </div>
                {exporting === 'csv' && (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                )}
              </button>

              <button
                onClick={() => handleExport('excel')}
                disabled={exporting !== null}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Excel 格式
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    适用于 Microsoft Excel
                  </div>
                </div>
                {exporting === 'excel' && (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                )}
              </button>
            </div>

            {/* 说明 */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                导出的报告包含所有发布记录的详细信息，包括互动数据和发布状态。
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
