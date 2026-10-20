'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS, getNavIndex } from '@/config/navigation.config';

export interface UseDashboardSwipeResult {
  contentRef: React.RefObject<HTMLDivElement | null>;
  direction: 'forward' | 'backward';
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchCancel: () => void;
  };
}

/**
 * Hook quản lý cử chỉ vuốt chuyển tab và animation tương tác trên mobile
 */
export function useDashboardSwipe(): UseDashboardSwipeResult {
  const pathname = usePathname();
  const router = useRouter();

  // Xác định hướng lướt (direction) dựa trên index tab cũ và mới
  const currentIndex = getNavIndex(pathname);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [prevIndex, setPrevIndex] = useState(currentIndex);

  if (currentIndex !== prevIndex) {
    setDirection(currentIndex > prevIndex ? 'forward' : 'backward');
    setPrevIndex(currentIndex);
  }

  // Tải trước (prefetch) các tab liền kề để chuyển route tức thì
  useEffect(() => {
    if (currentIndex < NAV_ITEMS.length - 1) {
      router.prefetch(NAV_ITEMS[currentIndex + 1].path);
    }
    if (currentIndex > 0) {
      router.prefetch(NAV_ITEMS[currentIndex - 1].path);
    }
  }, [currentIndex, router]);

  // Quản lý tương tác vuốt kéo theo ngón tay với requestAnimationFrame
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isSwiping = useRef(false);
  const isVerticalScroll = useRef(false);
  const isNavigating = useRef(false);
  const rafId = useRef<number | null>(null);
  const dragOffsetRef = useRef<number>(0);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimeout = () => {
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  };

  // Dọn dẹp inline transform và hủy timer khi đổi route
  useEffect(() => {
    clearResetTimeout();
    if (contentRef.current) {
      contentRef.current.style.transform = '';
      contentRef.current.style.transition = '';
      contentRef.current.style.opacity = '';
    }
    isNavigating.current = false;
  }, [pathname]);

  // Hủy RAF và timer khi unmount
  useEffect(() => {
    return () => {
      clearResetTimeout();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, []);

  const updateDragPosition = () => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(${dragOffsetRef.current}px, 0, 0)`;
      contentRef.current.style.transition = 'none';
    }
    rafId.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isNavigating.current) return;
    clearResetTimeout();

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Không kích hoạt cử chỉ vuốt nếu chạm vào các control tương tác hoặc bảng cuộn
    if (
      target.closest(
        'input, textarea, select, button, a, [role="button"], [role="dialog"], [role="tab"], ' +
        '.ant-table-content, .ant-table-wrapper, .ant-modal, .ant-drawer, .ant-select-dropdown, ' +
        '.ant-picker-dropdown, .ant-pagination, .ant-tabs-nav, [data-no-swipe="true"]'
      )
    ) {
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isSwiping.current = false;
    isVerticalScroll.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      isVerticalScroll.current ||
      isNavigating.current
    ) {
      return;
    }

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Phân biệt cuộn dọc vs vuốt ngang
    if (!isSwiping.current) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) >= Math.abs(deltaX)) {
        isVerticalScroll.current = true;
        return;
      }
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isSwiping.current = true;
      }
    }

    if (isSwiping.current) {
      let offset = deltaX;

      // Cản lực lò xo (rubber-band) nếu vuốt vượt mép ngoài cùng của tab đầu hoặc tab cuối
      if (
        (currentIndex === 0 && deltaX > 0) ||
        (currentIndex === NAV_ITEMS.length - 1 && deltaX < 0)
      ) {
        offset = deltaX * 0.22;
      }

      dragOffsetRef.current = offset;
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(updateDragPosition);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    const startX = touchStartX.current;
    const startTime = touchStartTime.current;
    const wasSwiping = isSwiping.current;

    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
    isVerticalScroll.current = false;

    if (!wasSwiping || !contentRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const duration = Date.now() - startTime;
    const velocity = Math.abs(deltaX) / Math.max(duration, 1);

    // Ngưỡng chuyển tab: vuốt xa > 50px hoặc vuốt nhanh (flick) > 20px
    const shouldSwitch = Math.abs(deltaX) > 50 || (Math.abs(deltaX) > 20 && velocity > 0.3);

    if (shouldSwitch && deltaX < 0 && currentIndex < NAV_ITEMS.length - 1) {
      // Vuốt sang trái -> Chuyển sang Tab tiếp theo bên phải tức thì
      isNavigating.current = true;
      contentRef.current.style.transition = 'transform 0.16s ease-out, opacity 0.16s ease-out';
      contentRef.current.style.transform = 'translate3d(-80px, 0, 0)';
      contentRef.current.style.opacity = '0';
      router.push(NAV_ITEMS[currentIndex + 1].path);
    } else if (shouldSwitch && deltaX > 0 && currentIndex > 0) {
      // Vuốt sang phải -> Chuyển về Tab trước đó bên trái tức thì
      isNavigating.current = true;
      contentRef.current.style.transition = 'transform 0.16s ease-out, opacity 0.16s ease-out';
      contentRef.current.style.transform = 'translate3d(80px, 0, 0)';
      contentRef.current.style.opacity = '0';
      router.push(NAV_ITEMS[currentIndex - 1].path);
    } else {
      // Không đủ ngưỡng vuốt hoặc ở mép biên -> Bung hồi về vị trí cũ bằng spring curve mượt mà
      const targetEl = contentRef.current;
      targetEl.style.transition = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
      targetEl.style.transform = 'translate3d(0, 0, 0)';

      clearResetTimeout();
      resetTimeoutRef.current = setTimeout(() => {
        if (targetEl && !isNavigating.current) {
          targetEl.style.transform = '';
          targetEl.style.transition = '';
          targetEl.style.opacity = '';
        }
        resetTimeoutRef.current = null;
      }, 220);
    }
  };

  const handleTouchCancel = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
    isVerticalScroll.current = false;

    if (contentRef.current) {
      const targetEl = contentRef.current;
      targetEl.style.transition = 'transform 0.2s ease-out';
      targetEl.style.transform = 'translate3d(0, 0, 0)';

      clearResetTimeout();
      resetTimeoutRef.current = setTimeout(() => {
        if (targetEl) {
          targetEl.style.transform = '';
          targetEl.style.transition = '';
          targetEl.style.opacity = '';
        }
        resetTimeoutRef.current = null;
      }, 200);
    }
  };

  return {
    contentRef,
    direction,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
