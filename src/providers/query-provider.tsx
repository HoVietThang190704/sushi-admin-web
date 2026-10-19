'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 phút: Dữ liệu tươi mới, không gọi lại API thừa thãi
            gcTime: 5 * 60 * 1000, // 5 phút: Lưu trong bộ nhớ đệm
            refetchOnWindowFocus: false, // Tránh refetch giật màn hình khi người dùng đổi tab
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
