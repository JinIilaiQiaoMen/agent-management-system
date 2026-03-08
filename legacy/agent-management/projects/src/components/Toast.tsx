"use client";

import { useEffect, useState } from "react";
import { XCircle, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - (100 / toast.duration!);
        });
      }, 100);

      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [toast.id, toast.duration, onDismiss]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: "border-green-200 dark:border-green-800",
    error: "border-red-200 dark:border-red-800",
    warning: "border-yellow-200 dark:border-yellow-800",
    info: "border-blue-200 dark:border-blue-800",
  };

  return (
    <Card className={`p-4 shadow-lg ${colors[toast.type]}`}>
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {toast.message}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {toast.duration && progress > 0 && (
        <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-current opacity-20 transition-all duration-100"
            style={{
              width: `${progress}%`,
              backgroundColor:
                toast.type === "error"
                  ? "#ef4444"
                  : toast.type === "warning"
                  ? "#eab308"
                  : toast.type === "success"
                  ? "#22c55e"
                  : "#3b82f6",
            }}
          />
        </div>
      )}
    </Card>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 全局监听自定义事件
  useEffect(() => {
    const handleToast = (e: CustomEvent<Omit<Toast, "id">>) => {
      addToast(e.detail);
    };

    window.addEventListener("toast", handleToast as EventListener);
    return () => window.removeEventListener("toast", handleToast as EventListener);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

// 便捷方法
export function toast(data: Omit<Toast, "id">) {
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: data,
    })
  );
}

toast.success = (title: string, message?: string) => {
  toast({ type: "success", title, message, duration: 3000 });
};

toast.error = (title: string, message?: string) => {
  toast({ type: "error", title, message, duration: 5000 });
};

toast.warning = (title: string, message?: string) => {
  toast({ type: "warning", title, message, duration: 4000 });
};

toast.info = (title: string, message?: string) => {
  toast({ type: "info", title, message, duration: 3000 });
};
