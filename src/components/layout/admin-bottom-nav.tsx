'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { NAV_ITEMS, getActiveNavKey } from '@/config/navigation.config';

export function AdminBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Xác định active key tự động từ pathname thông qua navigation config
  const selectedKey = useMemo(() => getActiveNavKey(pathname), [pathname]);

  // Trạng thái hiển thị khi cuộn trang (Facebook-style scroll-to-hide)
  const [isVisible, setIsVisible] = useState(true);
  const [prevPath, setPrevPath] = useState(pathname);
  const lastScrollY = useRef(0);

  // Luôn reset thanh navigation về trạng thái hiển thị khi đổi trang theo chuẩn React 19
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsVisible(true);
  }

  useEffect(() => {
    let rafId: number | null = null;
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Luôn hiện khi ở gần đầu trang (< 30px) hoặc chạm đáy trang
        if (currentScrollY <= 30 || (maxScroll > 60 && currentScrollY >= maxScroll - 30)) {
          setIsVisible(true);
          lastScrollY.current = Math.max(0, currentScrollY);
          rafId = null;
          return;
        }

        // Bỏ qua overscroll âm trên iOS Safari
        if (currentScrollY < 0) {
          rafId = null;
          return;
        }

        // Cuộn xuống qua ngưỡng 12px -> Ẩn thanh bottom nav
        if (diff > 12) {
          setIsVisible(false);
          lastScrollY.current = currentScrollY;
        }
        // Cuộn lên qua ngưỡng 8px -> Hiện lại thanh bottom nav
        else if (diff < -8) {
          setIsVisible(true);
          lastScrollY.current = currentScrollY;
        }

        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <nav
      aria-label="Mobile navigation"
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={`md:hidden fixed left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-30 select-none ${
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)',
        transform: isVisible
          ? 'translate3d(0, 0, 0)'
          : 'translate3d(0, calc(100% + env(safe-area-inset-bottom, 0px) + 2rem), 0)',
        visibility: isVisible ? 'visible' : 'hidden',
        transition:
          'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.3s',
      }}
    >
      <div className="flex items-center justify-around h-14 px-2 rounded-full bg-[#1c1c20]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = selectedKey === item.key;
          const label = t(item.labelKey);

          return (
            <Link
              key={item.key}
              href={item.path}
              prefetch={true}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={isVisible ? 0 : -1}
              className={`flex items-center justify-center h-10 w-12 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sushi-primary ${
                isActive
                  ? 'bg-white/15 text-sushi-primary shadow-sm scale-105'
                  : 'text-sushi-text-muted hover:text-white hover:bg-white/5 active:scale-95'
              }`}
            >
              <IconComponent
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                className="transition-transform"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
