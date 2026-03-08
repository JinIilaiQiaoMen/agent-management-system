'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // 未登录，跳转到登录页
        router.push('/login');
      } else if (requireAdmin && !isAdmin) {
        // 需要管理员权限但不是管理员
        router.push('/');
      }
    }
  }, [loading, isAuthenticated, isAdmin, requireAdmin, router]);

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录或权限不足
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  // 已登录且有权限
  return <>{children}</>;
}
