'use client';

import React, { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/types/auth';
import { authApi } from '../api/auth.api';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Sử dụng TanStack Query v5 để quản lý Cache phiên đăng nhập
  const { data: user = null, isLoading: loading } = useQuery<UserProfile | null>({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch {
        return null;
      }
    },
    // Chỉ lưu cache 5 phút khi đã đăng nhập thành công; nếu chưa đăng nhập (null) thì stale ngay
    staleTime: (query) => (query.state.data ? 5 * 60 * 1000 : 0),
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  const setUser = (newUser: UserProfile | null) => {
    queryClient.setQueryData(authKeys.me, newUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear(); // Xóa sạch toàn bộ Cache khi người dùng đăng xuất
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
