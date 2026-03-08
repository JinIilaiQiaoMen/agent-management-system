"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 记录错误到日志
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // 可以在这里发送错误到日志服务
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-10 w-10 text-red-500 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  发生了错误
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  页面遇到了一些问题，请刷新重试
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleReset} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" />
                重新加载
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                返回首页
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  错误详情（仅开发环境显示）
                </summary>
                <pre className="mt-2 text-xs text-slate-600 dark:text-slate-400 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
