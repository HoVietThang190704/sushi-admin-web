const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    // BẮT BUỘC: credentials: 'include' để trình duyệt tự động gửi và nhận HttpOnly Cookie
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Trích xuất thông báo lỗi chuẩn từ BaseResponse hoặc lỗi mặc định
    const errorMessage =
      data?.error?.message ||
      data?.message ||
      (Array.isArray(data?.message) ? data.message.join(', ') : 'Something went wrong');
    throw new Error(errorMessage);
  }

  // Tự động bóc tách trường data từ BaseResponse nếu có
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}
