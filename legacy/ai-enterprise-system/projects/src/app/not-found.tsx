import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          页面未找到
        </h2>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          您访问的页面不存在或已被移除
        </p>

        <div className="flex gap-2">
          <Link href="/" className="flex-1">
            <Button className="w-full">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
