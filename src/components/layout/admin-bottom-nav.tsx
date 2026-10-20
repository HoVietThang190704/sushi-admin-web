'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { NAV_ITEMS, getActiveNavKey } from '@/config/navigation.config';

export function AdminBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Xác định active key tự động từ pathname thông qua navigation config
  const selectedKey = useMemo(() => getActiveNavKey(pathname), [pathname]);

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-sushi-card/95 backdrop-blur-lg border-t border-sushi-border/80 shadow-2xl select-none"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = selectedKey === item.key;

          return (
            <Link
              key={item.key}
              href={item.path}
              className="flex flex-col items-center justify-center h-full py-1 transition-all duration-150 cursor-pointer group relative"
            >
              {/* Vạch chỉ báo active phía trên tab */}
              {isActive && (
                <span className="absolute top-0 w-8 h-[2px] rounded-full bg-sushi-primary shadow-[0_0_8px_#ef4444]" />
              )}

              <IconComponent
                size={20}
                weight={isActive ? 'fill' : 'regular'}
                className={`transition-colors ${
                  isActive
                    ? 'text-sushi-primary'
                    : 'text-sushi-text-dim group-hover:text-sushi-text-muted'
                }`}
              />

              <span
                className={`text-2xs mt-1 truncate max-w-full px-0.5 tracking-tight ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-sushi-text-dim group-hover:text-sushi-text-muted font-medium'
                }`}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
