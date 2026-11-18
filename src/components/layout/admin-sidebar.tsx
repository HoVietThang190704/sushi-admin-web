'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Layout,
  Menu,
  Tooltip,
  Drawer,
  CaretLeft,
  CaretRight,
} from '@/components/ui';
import { SUSHICOLORS } from '@/lib/theme';
import { useTranslation, LanguageSwitcher } from '@/lib/i18n';
import { NAV_ITEMS, getActiveNavKey, getActiveParentKey } from '@/config/navigation.config';
import { useRealtime } from '@/providers/realtime-provider';
import { useAuth } from '@/features/auth';

const { Sider } = Layout;

export interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
}

export function AdminSidebar({
  collapsed,
  onCollapse,
  mobileOpen = false,
  onMobileClose,
  className,
}: AdminSidebarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useRealtime();
  const { user } = useAuth();

  // Tự động suy ra active key & parent key từ pathname thông qua navigation config
  const selectedKey = useMemo(() => getActiveNavKey(pathname), [pathname]);
  const activeParentKey = useMemo(() => getActiveParentKey(pathname), [pathname]);

  // Quản lý trạng thái mở/đóng của các submenu, đồng bộ khi chuyển route theo chuẩn React 19
  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    activeParentKey ? [activeParentKey] : ['settings']
  );
  const [prevParentKey, setPrevParentKey] = useState<string | null>(activeParentKey);

  if (activeParentKey !== prevParentKey) {
    setPrevParentKey(activeParentKey);
    if (activeParentKey && !openKeys.includes(activeParentKey)) {
      setOpenKeys((prev) => [...prev, activeParentKey]);
    }
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // Sinh danh sách Menu Items từ NAV_ITEMS (Lọc theo vai trò của tài khoản)
  const menuItems = useMemo(
    () => {
      const userRole = user?.role;
      return NAV_ITEMS.filter((item) => {
        if (!item.roles || item.roles.length === 0) return true;
        return userRole ? (item.roles as readonly string[]).includes(userRole) : false;
      }).map((item) => {
        const IconComponent = item.icon;
        const isActive = selectedKey === item.key;
        const isParentActive = activeParentKey === item.key;

        // Nếu là mục cha có các mục con xổ xuống (như Cấu hình)
        if (item.children && item.children.length > 0) {
          const visibleChildren = item.children.filter((child) => {
            if (!child.roles || child.roles.length === 0) return true;
            return userRole ? (child.roles as readonly string[]).includes(userRole) : false;
          });

          return {
            key: item.key,
            icon: (
              <IconComponent
                size={20}
                weight={isParentActive ? 'fill' : 'regular'}
              />
            ),
            label: (
              <span className={`text-sm ${isParentActive ? 'font-semibold text-white' : 'font-medium'}`}>
                {t(item.labelKey)}
              </span>
            ),
            children: visibleChildren.map((child) => {
              const isChildActive = selectedKey === child.key;
              const ChildIcon = child.icon;

              return {
                key: child.key,
                icon: ChildIcon ? (
                  <ChildIcon
                    size={17}
                    weight={isChildActive ? 'fill' : 'regular'}
                  />
                ) : undefined,
                label: (
                  <span className={`text-xs ${isChildActive ? 'font-semibold text-white' : 'font-medium text-sushi-text-muted'}`}>
                    {t(child.labelKey)}
                  </span>
                ),
              };
            }),
          };
        }

        // Mục menu đơn cấp 1
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
      });
    },
    [selectedKey, activeParentKey, user?.role, t]
  );

  const handleMenuClick = ({ key }: { key: string }) => {
    // 1. Tìm trong các mục con trước
    for (const item of NAV_ITEMS) {
      if (item.children) {
        const child = item.children.find((c) => c.key === key);
        if (child) {
          onMobileClose?.();
          router.push(child.path);
          return;
        }
      }
    }

    // 2. Tìm trong các mục cấp 1
    const targetItem = NAV_ITEMS.find((item) => item.key === key);
    if (targetItem?.path) {
      onMobileClose?.();
      router.push(targetItem.path);
    }
  };

  const renderSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col h-full bg-sushi-card">
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
              className="w-8 h-8 object-contain"
              priority
            />
          </div>

          {(!collapsed || isDrawer) && (
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
          openKeys={collapsed && !isDrawer ? [] : openKeys}
          onOpenChange={handleOpenChange}
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
        {isDrawer ? (
          <div className="flex items-center justify-between px-2 gap-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span className="text-2xs text-sushi-text-dim font-mono">
                {isConnected ? 'Realtime · Online' : 'Realtime · Offline'}
              </span>
            </div>
            <LanguageSwitcher />
          </div>
        ) : !collapsed ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span className="text-2xs text-sushi-text-dim font-mono">
                {isConnected ? 'Realtime · Online' : 'Realtime · Offline'}
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
  );

  return (
    <>
      {/* 1. Desktop Sider (Hidden on Mobile) */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={null}
        width={256}
        collapsedWidth={80}
        className={`hidden md:block border-r border-sushi-border select-none transition-all duration-300 z-20 ${className || ''}`}
        style={{
          background: SUSHICOLORS.card,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {renderSidebarContent(false)}
      </Sider>

      {/* 2. Mobile Drawer Navigation */}
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        size={270}
        closable={false}
        className="md:hidden sushi-mobile-drawer"
        styles={{
          body: { padding: 0, backgroundColor: SUSHICOLORS.card },
          section: { backgroundColor: SUSHICOLORS.card },
        }}
      >
        {renderSidebarContent(true)}
      </Drawer>
    </>
  );
}
