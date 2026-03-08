// API工具函数

export async function apiGet(url: string, params?: Record<string, any>) {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  const response = await fetch(url + queryString);
  return response.json();
}

export async function apiPost(url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiPut(url: string, data: any) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiDelete(url: string) {
  const response = await fetch(url, { method: 'DELETE' });
  return response.json();
}
