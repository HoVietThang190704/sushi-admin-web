export function getApiBaseUrl(): string {
  // Khi chạy trong trình duyệt, luôn dùng đường dẫn tương đối '' để yêu cầu đi qua Next.js rewrite (cổng 3004).
  // Nhờ đó cookie trở thành First-Party Cookie, khắc phục 100% lỗi iOS Safari chặn cookie khác cổng (3004 vs 3000).
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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

  // Tự động làm mới phiên đăng nhập (Silent Token Refresh) khi token 15 phút hết hạn
  if (
    response.status === 401 &&
    !isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => fetchApi<T>(endpoint, options, true));
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (refreshRes.ok) {
        processQueue(null);
        return fetchApi<T>(endpoint, options, true);
      } else {
        processQueue(new Error('Phiên đăng nhập đã hết hạn'));
      }
    } catch (err) {
      processQueue(err);
    } finally {
      isRefreshing = false;
    }
  }

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
