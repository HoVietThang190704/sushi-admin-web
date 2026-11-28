'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layout,
  House,
  SignOut,
  CaretDown,
  Dropdown,
  ListIcon,
} from '@/components/ui';
import type { MenuProps } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useTranslation, LanguageSwitcher } from '@/lib/i18n';
import { NAV_ITEMS, getActiveNavKey } from '@/config/navigation.config';

const { Header } = Layout;

export interface AdminHeaderProps {
  onOpenMobileMenu?: () => void;
  className?: string;
}

export function AdminHeader({ onOpenMobileMenu, className }: AdminHeaderProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const currentNav = useMemo(() => {
    const activeKey = getActiveNavKey(pathname);
    for (const item of NAV_ITEMS) {
      if (item.key === activeKey) return item;
      if (item.children) {
        const child = item.children.find((c) => c.key === activeKey);
        if (child) return child;
      }
    }
    return NAV_ITEMS[0];
  }, [pathname]);

  const userInitial = useMemo(() => {
    if (user?.fullName) {
      return user.fullName.trim().charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  }, [user]);

  const displayName = useMemo(() => {
    if (user?.fullName?.trim()) return user.fullName;
    if (user?.email) return user.email.split('@')[0];
    return t('common.admin');
  }, [user, t]);

  const dropdownMenuItems: MenuProps['items'] = useMemo(() => {
    return [
      {
        key: 'user-info',
        disabled: true,
        label: (
          <div className="py-1 px-0.5 cursor-default select-text">
            <div className="font-semibold text-sushi-text text-xs truncate">
              {displayName}
            </div>
            {user?.email && (
              <div className="text-2xs text-sushi-text-dim truncate mt-0.5 font-mono">
                {user.email}
              </div>
            )}
            {user?.role && (
              <div className="mt-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded text-3xs font-mono uppercase tracking-wider bg-sushi-surface border border-sushi-border text-sushi-text-muted">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <SignOut size={15} />,
        label: <span className="font-medium text-xs">{t('common.logout')}</span>,
        danger: true,
        onClick: () => logout(),
      },
    ];
  }, [displayName, user, t, logout]);

  return (
    <Header
      className={`border-b border-sushi-border !px-3.5 sm:!px-6 flex items-center justify-between sticky top-0 z-10 select-none !h-12 md:!h-14 bg-[#0c0d0f]/95 backdrop-blur-md ${className || ''}`}
      style={{
        lineHeight: 'normal',
      }}
    >
      {/* Left: Mobile Menu & Active Section / Desktop Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden w-8 h-8 -ml-1 rounded-md flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface active:scale-95 shrink-0 cursor-pointer transition-colors focus:outline-none"
          aria-label="Open mobile menu"
        >
          <ListIcon size={18} />
        </button>

        {/* Mobile Section Label: Minimalist breadcrumb style */}
        <div className="flex md:hidden items-center gap-1.5 min-w-0">
          <span className="text-2xs font-mono uppercase tracking-wider text-sushi-text-dim">
            HANBI
          </span>
          <span className="text-sushi-border text-xs">/</span>
          <span className="font-medium text-sushi-text text-xs truncate">
            {currentNav ? t(currentNav.labelKey) : t('dashboard.overview')}
          </span>
        </div>

        {/* Desktop Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-xs truncate">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sushi-text-dim hover:text-sushi-text transition-colors font-mono uppercase tracking-wider text-2xs"
            title={t('dashboard.breadcrumbHome')}
          >
            <House size={14} />
            <span>HANBI POS</span>
          </Link>

          <span className="text-sushi-border">/</span>

          <span className="font-medium text-sushi-text truncate">
            {currentNav && currentNav.path !== '/dashboard'
              ? t(currentNav.labelKey)
              : t('dashboard.overview')}
          </span>
        </nav>
      </div>

      {/* Right: Language & Account */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden md:inline-flex">
          <LanguageSwitcher />
        </div>

        <div className="hidden md:block h-4 w-px bg-sushi-border" />

        <Dropdown
          menu={{ items: dropdownMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          classNames={{ root: 'sushi-dropdown' }}
        >
          <button
            type="button"
            className="flex items-center gap-2 px-1.5 py-1 md:px-2.5 md:py-1 rounded-lg bg-sushi-card border border-sushi-border hover:border-zinc-700 transition-colors cursor-pointer group focus:outline-none"
            aria-label="User menu"
          >
            <div className="w-6 h-6 rounded bg-sushi-surface border border-sushi-border flex items-center justify-center text-2xs font-mono font-semibold text-sushi-text shrink-0">
              {userInitial}
            </div>

            <span className="text-xs font-medium text-sushi-text max-w-[120px] truncate hidden md:inline">
              {displayName}
            </span>

            {user?.role && (
              <span className="px-1.5 py-0.5 rounded text-3xs font-mono uppercase tracking-wider bg-sushi-surface text-sushi-text-muted hidden lg:inline">
                {user.role}
              </span>
            )}

            <CaretDown size={11} className="text-sushi-text-dim group-hover:text-sushi-text transition-colors" />
          </button>
        </Dropdown>
      </div>
    </Header>
  );
}
