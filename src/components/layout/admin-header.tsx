'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Layout,
  House,
  SignOut,
  User,
  Gear,
  CaretDown,
  Dropdown,
  ListIcon,
} from '@/components/ui';
import type { MenuProps } from '@/components/ui';
import { SUSHICOLORS } from '@/lib/theme';
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

  // Xác định NavItem hiện tại để render Breadcrumb
  const currentNav = useMemo(() => {
    const activeKey = getActiveNavKey(pathname);
    return NAV_ITEMS.find((item) => item.key === activeKey);
  }, [pathname]);

  // Chữ cái đại diện cho avatar
  const userInitial = useMemo(() => {
    if (user?.fullName) {
      return user.fullName.trim().charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  }, [user]);

  // Tên hiển thị người dùng (fallback email hoặc danh xưng)
  const displayName = useMemo(() => {
    if (user?.fullName?.trim()) return user.fullName;
    if (user?.email) return user.email.split('@')[0];
    return t('common.admin');
  }, [user, t]);

  // Menu Dropdown tài khoản quản trị
  const dropdownMenuItems: MenuProps['items'] = useMemo(() => {
    return [
      {
        key: 'user-info',
        disabled: true,
        label: (
          <div className="py-1 px-0.5 cursor-default select-text">
            <div className="font-semibold text-sushi-text text-sm truncate">
              {displayName}
            </div>
            {user?.email && (
              <div className="text-2xs text-sushi-text-dim truncate mt-0.5 font-mono">
                {user.email}
              </div>
            )}
            {user?.role && (
              <div className="mt-2">
                <span className="inline-block px-2 py-0.5 rounded-md text-2xs font-semibold font-mono uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: 'profile',
        icon: <User size={16} className="text-sushi-text-muted" />,
        label: <span>{t('dashboard.accountProfile')}</span>,
      },
      {
        key: 'settings',
        icon: <Gear size={16} className="text-sushi-text-muted" />,
        label: <span>{t('dashboard.accountSettings')}</span>,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <SignOut size={16} />,
        label: <span className="font-medium">{t('common.logout')}</span>,
        danger: true,
        onClick: () => logout(),
      },
    ];
  }, [displayName, user, t, logout]);

  return (
    <Header
      className={`border-b border-sushi-border/80 !px-4 sm:!px-6 flex items-center justify-between sticky top-0 z-10 select-none ${className || ''}`}
      style={{
        background: SUSHICOLORS.card,
        height: 64,
        lineHeight: 'normal',
      }}
    >
      {/* =========================================================================
          1. Left: Mobile Brand / Desktop Breadcrumbs
         ========================================================================= */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        {/* Mobile: Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface border border-sushi-border/70 shrink-0 cursor-pointer transition-colors"
          aria-label="Open mobile menu"
        >
          <ListIcon size={18} />
        </button>

        {/* Mobile: Logo & Brand Name */}
        <div className="flex md:hidden items-center space-x-2">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-sushi-border flex items-center justify-center shrink-0 bg-sushi-surface shadow-sm">
            <Image
              src="/logo.png"
              alt="Logo"
              width={22}
              height={22}
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-sushi-text tracking-wider text-xs font-sans">
            SUSHI ADMIN
          </span>
        </div>

        {/* Desktop: Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center space-x-2 text-sm truncate">
          <Link
            href="/dashboard"
            className="flex items-center text-sushi-text-dim hover:text-sushi-text transition-colors"
            title={t('dashboard.breadcrumbHome')}
          >
            <House size={16} />
          </Link>

          {currentNav && currentNav.path !== '/dashboard' && (
            <>
              <span className="text-sushi-text-dim/40 text-xs">/</span>
              <span className="font-semibold text-sushi-text truncate text-sm">
                {t(currentNav.labelKey)}
              </span>
            </>
          )}

          {(!currentNav || currentNav.path === '/dashboard') && (
            <>
              <span className="text-sushi-text-dim/40 text-xs">/</span>
              <span className="font-semibold text-sushi-text truncate text-sm">
                {t('dashboard.overview')}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* =========================================================================
          2. Right: Language & User Profile Dropdown
         ========================================================================= */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Language Switcher 1-Click Toggle (Chỉ hiện trên Desktop, Mobile đưa vào Drawer) */}
        <div className="hidden md:inline-flex">
          <LanguageSwitcher />
        </div>

        {/* Vertical Separator */}
        <div className="hidden md:block h-5 w-[1px] bg-sushi-border" />

        {/* User Profile Pill with Dropdown Menu */}
        <Dropdown
          menu={{ items: dropdownMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          classNames={{ root: 'sushi-dropdown' }}
        >
          <button
            type="button"
            className="flex items-center space-x-2 sm:space-x-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-sushi-surface/70 border border-sushi-border/70 hover:bg-sushi-surface hover:border-sushi-border transition-all duration-200 cursor-pointer shadow-sm group focus:outline-none focus:ring-1 focus:ring-sushi-primary/40"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sushi-primary to-amber-500 p-[1px] shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-sushi-surface flex items-center justify-center text-xs font-bold text-sushi-text">
                {userInitial}
              </div>
            </div>

            <span className="text-xs font-medium text-sushi-text max-w-[120px] truncate hidden md:inline">
              {displayName}
            </span>

            {user?.role && (
              <span className="px-1.5 py-0.5 rounded-md text-2xs font-semibold font-mono uppercase tracking-wider bg-amber-500/10 border border-amber-500/25 text-amber-400 hidden lg:inline">
                {user.role}
              </span>
            )}

            <CaretDown size={13} className="text-sushi-text-dim group-hover:text-sushi-text transition-colors hidden sm:inline" />
          </button>
        </Dropdown>
      </div>
    </Header>
  );
}
