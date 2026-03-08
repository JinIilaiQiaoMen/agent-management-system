/**
 * Toast 组件
 * 使用 sonner 库提供 toast 通知功能
 */
"use client";

import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },
  error: (message: string) => {
    sonnerToast.error(message);
  },
  info: (message: string) => {
    sonnerToast.info(message);
  },
  warning: (message: string) => {
    sonnerToast.warning(message);
  },
  message: (message: string) => {
    sonnerToast.message(message);
  },
};

export { Toaster } from "sonner";
