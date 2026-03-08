/**
 * 全局错误监听器
 * 捕获未处理的Promise rejection和其他全局错误
 */

if (typeof window !== "undefined") {
  // 捕获未处理的Promise rejection
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);

    // 使用toast显示错误
    import("@/components/Toast").then(({ toast }) => {
      toast.error(
        "操作失败",
        event.reason?.message || "发生了未知错误"
      );
    });

    // 阻止默认的控制台错误
    event.preventDefault();
  });

  // 捕获全局错误
  window.addEventListener("error", (event) => {
    console.error("Global Error:", event.error);

    // 只捕获真正的错误，不是资源加载错误
    if (event.error) {
      import("@/components/Toast").then(({ toast }) => {
        toast.error(
          "系统错误",
          event.error?.message || "发生了未知错误"
        );
      });
    }
  });
}
