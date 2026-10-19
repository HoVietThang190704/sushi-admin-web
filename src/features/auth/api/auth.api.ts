import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { UserProfile, LoginResponse } from '@/types/auth';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export const authApi = {
  /**
   * Đăng nhập tài khoản (Nhận HttpOnly Cookie cho Web và JSON cho Mobile)
   */
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (dto: RegisterDto): Promise<UserProfile> => {
    return fetchApi<UserProfile>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Lấy thông tin tài khoản hiện tại qua JWT Cookie/Header
   */
  getMe: async (): Promise<UserProfile> => {
    return fetchApi<UserProfile>(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * Đăng xuất và xóa sạch Cookies
   */
  logout: async (): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },

  /**
   * Làm mới Access Token khi hết hạn
   */
  refresh: async (refreshToken?: string): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
