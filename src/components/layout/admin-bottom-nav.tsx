'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { BOTTOM_NAV_ITEMS, getActiveNavKey } from '@/config/navigation.config';
import { useAuth } from '@/features/auth';

export function AdminBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleItems = useMemo(() => {
    const userRole = user?.role;
    return BOTTOM_NAV_ITEMS.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return userRole ? (item.roles as readonly string[]).includes(userRole) : false;
    });
  }, [user?.role]);

  const selectedKey = useMemo(() => getActiveNavKey(pathname), [pathname]);

  const [isVisible, setIsVisible] = useState(true);
  const [prevPath, setPrevPath] = useState(pathname);
  const lastScrollY = useRef(0);

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

        if (currentScrollY <= 30) {
          setIsVisible(true);
          lastScrollY.current = Math.max(0, currentScrollY);
          rafId = null;
          return;
        }

        if (currentScrollY < 0) {
          rafId = null;
          return;
        }

        if (diff > 12) {
          setIsVisible(false);
          lastScrollY.current = currentScrollY;
        } else if (diff < -8) {
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
      className={`md:hidden fixed left-0 right-0 bottom-0 z-30 select-none bg-[#101114]/95 backdrop-blur-lg border-t border-sushi-border ${
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        transform: isVisible
          ? 'translate3d(0, 0, 0)'
          : 'translate3d(0, 100%, 0)',
        visibility: isVisible ? 'visible' : 'hidden',
        transition:
          'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out, visibility 0.25s',
      }}
    >
      <div className="flex items-center justify-around h-13 px-2 max-w-lg mx-auto">
        {visibleItems.map((item) => {
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
              className={`relative flex flex-col items-center justify-center h-11 px-3 rounded-lg transition-colors cursor-pointer focus-visible:outline-none ${
                isActive
                  ? 'text-white'
                  : 'text-sushi-text-dim hover:text-sushi-text-muted'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-sushi-primary" />
              )}
              <IconComponent
                size={20}
                weight={isActive ? 'fill' : 'regular'}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
