/**
 * API工具函数
 * 提供统一的API调用和错误处理
 */

/**
 * 统一的fetch包装器
 * 自动处理错误响应，确保返回JSON而不是HTML错误页面
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // 检查响应是否是JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      // 尝试解析错误响应
      if (isJson) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "请求失败");
      } else {
        // 如果不是JSON，可能是HTML错误页面
        const text = await response.text();
        if (text.startsWith("<!DOCTYPE")) {
          throw new Error(`API错误 (${response.status}): ${response.statusText}`);
        }
        throw new Error(text);
      }
    }

    // 如果成功响应，确保返回的是JSON
    if (!isJson) {
      const text = await response.text();
      if (text.startsWith("<!DOCTYPE")) {
        throw new Error("API返回了HTML页面而不是JSON");
      }
      throw new Error("API返回了非JSON响应");
    }

    return response;
  } catch (error) {
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      throw new Error("API返回了无效的JSON格式");
    }
    throw error;
  }
}

/**
 * GET请求
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetchWithErrorHandling(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

/**
 * POST请求
 */
export async function apiPost<T>(url: string, data?: any): Promise<T> {
  const response = await fetchWithErrorHandling(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * PUT请求
 */
export async function apiPut<T>(url: string, data?: any): Promise<T> {
  const response = await fetchWithErrorHandling(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * DELETE请求
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetchWithErrorHandling(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

/**
 * 上传文件
 */
export async function apiUpload<T>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<T> {
  const response = await fetchWithErrorHandling(url, {
    method: "POST",
    body: formData,
  });

  return response.json();
}
