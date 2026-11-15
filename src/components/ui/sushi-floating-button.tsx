'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { Plus } from '@phosphor-icons/react';

export interface SushiFloatingButtonProps {
  onClick: () => void;
  /** Nhãn hiển thị cạnh icon (nếu không truyền sẽ hiển thị nút FAB tròn chỉ có icon) */
  label?: React.ReactNode;
  /** Icon chính (mặc định là dấu cộng Plus) */
  icon?: React.ReactNode;
  /** Thuộc tính hỗ trợ tiếp cận (accessibility) */
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  /** Chỉ hiển thị trên màn hình Mobile (< md, đồng bộ với AdminBottomNav). Mặc định: true */
  mobileOnly?: boolean;
  /** Khoảng cách từ đáy màn hình (mặc định tự động nằm ngay trên AdminBottomNav) */
  bottomOffset?: string;
  className?: string;
}

const emptySubscribe = () => () => {};

/**
 * Nút nổi FAB (Floating Action Button) chuẩn nhận diện thương hiệu Sushi Platform.
 * Sử dụng Portal ra document.body để không bị ảnh hưởng bởi `transform` / `will-change-transform`
 * của container hiệu ứng chuyển trang trong DashboardLayout.
 * Tự động ẩn khi lướt xuống và hiện lại khi lướt lên đồng bộ với AdminBottomNav.
 */
export function SushiFloatingButton({
  onClick,
  label,
  icon,
  ariaLabel,
  title,
  disabled = false,
  mobileOnly = true,
  bottomOffset = 'calc(env(safe-area-inset-bottom, 0px) + 5rem)',
  className = '',
}: SushiFloatingButtonProps) {
  const pathname = usePathname();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [isVisible, setIsVisible] = useState(true);
  const [prevPath, setPrevPath] = useState(pathname);
  const lastScrollY = useRef(0);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIsVisible(true);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;

        // Luôn hiện khi ở gần đầu trang (< 30px)
        if (currentScrollY <= 30) {
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

        // Lướt xuống qua ngưỡng 12px -> Ẩn nút FAB
        if (diff > 12) {
          setIsVisible(false);
          lastScrollY.current = currentScrollY;
        }
        // Lướt lên qua ngưỡng 8px -> Hiện lại nút FAB
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

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  const resolvedAriaLabel =
    ariaLabel || (typeof label === 'string' ? label : 'Thao tác nhanh');

  const buttonNode = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={resolvedAriaLabel}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      title={title || resolvedAriaLabel}
      style={{
        bottom: bottomOffset,
        transform: isVisible
          ? 'translate3d(0, 0, 0) scale(1)'
          : 'translate3d(0, calc(100% + env(safe-area-inset-bottom, 0px) + 5.5rem), 0) scale(0.9)',
        visibility: isVisible ? 'visible' : 'hidden',
        transition:
          'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.3s',
      }}
      className={[
        mobileOnly ? 'md:hidden' : '',
        'fixed right-4 z-40 flex items-center justify-center gap-1.5 h-12 rounded-full select-none',
        label ? 'px-4' : 'w-12',
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none',
        'bg-gradient-to-br from-sushi-primary to-[#b91c1c] text-white font-semibold text-xs',
        'border border-white/15 shadow-[0_8px_24px_rgba(225,29,72,0.55)]',
        'hover:brightness-110 active:scale-95 cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="flex items-center justify-center shrink-0">
        {icon ?? <Plus size={20} weight="bold" />}
      </span>
      {label && <span className="truncate">{label}</span>}
    </button>
  );

  return createPortal(buttonNode, document.body);
}
