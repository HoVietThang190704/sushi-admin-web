'use client';

import { useSyncExternalStore, useCallback } from 'react';

/**
 * Hook nhận diện màn hình di động sử dụng useSyncExternalStore chuẩn React 18/19
 * @param breakpoint Điểm ngắt độ rộng màn hình (mặc định 768px - Tailwind 'md')
 */
export function useIsMobile(breakpoint = 768) {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

      if (mql.addEventListener) {
        mql.addEventListener('change', callback);
        return () => mql.removeEventListener('change', callback);
      }

      // Fallback cho trình duyệt Safari/WebKit cũ hơn
      mql.addListener(callback);
      return () => mql.removeListener(callback);
    },
    [breakpoint],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  }, [breakpoint]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
