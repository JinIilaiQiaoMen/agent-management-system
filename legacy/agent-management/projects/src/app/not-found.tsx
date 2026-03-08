"use client";

import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  useEffect(() => {
    console.error("404 Not Found");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="max-w-md w-full p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* 404 文本 */}
          <div className="relative">
            <h1 className="text-8xl font-bold text-slate-200 dark:text-slate-700 select-none">
              404
            </h1>
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-slate-700 dark:text-slate-300">
              页面未找到
            </p>
          </div>

          {/* 提示信息 */}
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-400">
              很抱歉，您访问的页面不存在或已被移除
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回上页
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              className="flex-1 gap-2"
            >
              <Home className="h-4 w-4" />
              回到首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
