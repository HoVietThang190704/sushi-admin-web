'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Layout,
  Menu,
  Tooltip,
  CaretLeft,
  CaretRight,
} from '@/components/ui';
import { SUSHICOLORS } from '@/lib/theme';
import { useTranslation } from '@/lib/i18n';
import { NAV_ITEMS, getActiveNavKey } from '@/config/navigation.config';

const { Sider } = Layout;

export interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  className?: string;
}

export function AdminSidebar({ collapsed, onCollapse, className }: AdminSidebarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  // Tự động suy ra active key từ pathname thông qua navigation config
  const selectedKey = useMemo(() => getActiveNavKey(pathname), [pathname]);

  // Sinh danh sách Menu Items từ NAV_ITEMS (Không hardcode)
  const menuItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const isActive = selectedKey === item.key;

        return {
          key: item.key,
          icon: (
            <IconComponent
              size={20}
              weight={isActive ? 'fill' : 'regular'}
            />
          ),
          label: (
            <span className={`text-sm ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>
              {t(item.labelKey)}
            </span>
          ),
        };
      }),
    [selectedKey, t]
  );

  const handleMenuClick = ({ key }: { key: string }) => {
    const targetItem = NAV_ITEMS.find((item) => item.key === key);
    if (targetItem) {
      router.push(targetItem.path);
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={256}
      collapsedWidth={80}
      className={`border-r border-sushi-border select-none transition-all duration-300 z-20 ${className || ''}`}
      style={{
        background: SUSHICOLORS.card,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div className="flex flex-col h-full">
        {/* =========================================================================
            1. Brand Header
           ========================================================================= */}
        <div className="h-16 flex items-center px-4 border-b border-sushi-border/80 shrink-0">
          <div className="flex items-center space-x-3 w-full overflow-hidden">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-sushi-border/90 flex items-center justify-center shrink-0 bg-sushi-surface shadow-md">
              <Image
                src="/logo.png"
                alt="Sushi Platform Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-bold text-sushi-text tracking-wider text-sm font-sans truncate">
                  SUSHI ADMIN
                </span>
                <span className="text-2xs text-sushi-text-dim tracking-wider font-mono uppercase truncate">
                  {t('dashboard.sidebarSubtitle')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            2. Main Menu Navigation
           ========================================================================= */}
        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <Menu
            theme="dark"
            selectedKeys={[selectedKey]}
            mode="inline"
            onClick={handleMenuClick}
            items={menuItems}
            className="sushi-admin-menu"
          />
        </div>

        {/* =========================================================================
            3. Sidebar Footer (Collapse Toggle & Status)
           ========================================================================= */}
        <div className="p-3 border-t border-sushi-border/80 bg-sushi-surface/40 shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-2xs text-sushi-text-dim font-mono">
                  Online · v1.0
                </span>
              </div>

              <Tooltip title={t('dashboard.collapseSidebar')} placement="right">
                <button
                  type="button"
                  onClick={() => onCollapse(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-card-hover transition-colors cursor-pointer border border-transparent hover:border-sushi-border"
                  aria-label={t('dashboard.collapseSidebar')}
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="flex justify-center">
              <Tooltip title={t('dashboard.expandSidebar')} placement="right">
                <button
                  type="button"
                  onClick={() => onCollapse(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-card-hover transition-colors cursor-pointer border border-transparent hover:border-sushi-border"
                  aria-label={t('dashboard.expandSidebar')}
                >
                  <CaretRight size={18} weight="bold" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </Sider>
  );
}
