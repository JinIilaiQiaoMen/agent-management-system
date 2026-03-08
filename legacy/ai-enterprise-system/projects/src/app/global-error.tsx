/**
 * 全局错误边界
 * 用于捕获和处理未预期的错误
 */

'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台或错误追踪服务
    console.error('[Global Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          出现了一些问题
        </h2>
        
        <p className="text-sm text-gray-600 text-center mb-4">
          {error.message || '发生了未知错误，请稍后重试'}
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 text-center mb-4">
            错误编号: {error.digest}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
