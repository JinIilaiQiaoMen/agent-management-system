"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-lg w-full p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* 错误图标 */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>

              {/* 错误信息 */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  发生了严重错误
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  应用遇到了一个严重的错误，请尝试刷新页面或返回首页
                </p>
              </div>

              {/* 错误详情（开发环境） */}
              {process.env.NODE_ENV === "development" && (
                <div className="w-full p-4 bg-red-50 dark:bg-red-950/20 rounded-md text-left">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                    错误详情:
                  </p>
                  <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 w-full">
                <Button
                  onClick={reset}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  重新加载
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 gap-2"
                >
                  <Home className="h-4 w-4" />
                  返回首页
                </Button>
              </div>

              {/* 错误摘要 */}
              <p className="text-xs text-slate-500 dark:text-slate-500">
                错误摘要: {error.digest}
              </p>
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}
