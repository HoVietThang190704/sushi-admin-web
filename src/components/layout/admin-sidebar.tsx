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

  const selectedKey = useMemo(() => getActiveNavKey(pathname), [pathname]);
  const activeParentKey = useMemo(() => getActiveParentKey(pathname), [pathname]);

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

        if (item.children && item.children.length > 0) {
          const visibleChildren = item.children.filter((child) => {
            if (!child.roles || child.roles.length === 0) return true;
            return userRole ? (child.roles as readonly string[]).includes(userRole) : false;
          });

          return {
            key: item.key,
            icon: (
              <IconComponent
                size={18}
                weight={isParentActive ? 'fill' : 'regular'}
              />
            ),
            label: (
              <span className={`text-[13px] ${isParentActive ? 'font-semibold text-white' : 'font-normal'}`}>
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
                    size={15}
                    weight={isChildActive ? 'fill' : 'regular'}
                  />
                ) : undefined,
                label: (
                  <span className={`text-xs ${isChildActive ? 'font-medium text-white' : 'font-normal text-sushi-text-muted'}`}>
                    {t(child.labelKey)}
                  </span>
                ),
              };
            }),
          };
        }

        return {
          key: item.key,
          icon: (
            <IconComponent
              size={18}
              weight={isActive ? 'fill' : 'regular'}
            />
          ),
          label: (
            <span className={`text-[13px] ${isActive ? 'font-semibold text-white' : 'font-normal'}`}>
              {t(item.labelKey)}
            </span>
          ),
        };
      });
    },
    [selectedKey, activeParentKey, user?.role, t]
  );

  const handleMenuClick = ({ key }: { key: string }) => {
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

    const targetItem = NAV_ITEMS.find((item) => item.key === key);
    if (targetItem?.path) {
      onMobileClose?.();
      router.push(targetItem.path);
    }
  };

  const renderSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col h-full bg-[#101114]">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-sushi-border shrink-0">
        <div className="flex items-center gap-2.5 w-full overflow-hidden">
          <div className="relative w-7 h-7 rounded-md overflow-hidden border border-sushi-border flex items-center justify-center shrink-0 bg-sushi-surface">
            <Image
              src="/logo.png"
              alt="Sushi Platform Logo"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
              priority
            />
          </div>

          {(!collapsed || isDrawer) && (
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-semibold text-sushi-text tracking-tight text-sm truncate">
                Hanbi
              </span>
              <span className="text-3xs text-sushi-text-dim font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-sushi-surface border border-sushi-border">
                POS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
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

      {/* Footer Status & Collapse */}
      <div className="p-2.5 border-t border-sushi-border bg-[#0d0e11] shrink-0">
        {isDrawer ? (
          <div className="flex items-center justify-between px-2 gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full h-1.5 w-1.5 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-2xs text-sushi-text-dim font-mono">
                {isConnected ? 'SYNC · LIVE' : 'SYNC · OFFLINE'}
              </span>
            </div>
            <LanguageSwitcher />
          </div>
        ) : !collapsed ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full h-1.5 w-1.5 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-2xs text-sushi-text-dim font-mono">
                {isConnected ? 'SYNC · LIVE' : 'SYNC · OFFLINE'}
              </span>
            </div>

            <Tooltip title={t('dashboard.collapseSidebar')} placement="right">
              <button
                type="button"
                onClick={() => onCollapse(true)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-sushi-text-dim hover:text-white hover:bg-sushi-surface transition-colors cursor-pointer"
                aria-label={t('dashboard.collapseSidebar')}
              >
                <CaretLeft size={14} weight="bold" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip title={t('dashboard.expandSidebar')} placement="right">
              <button
                type="button"
                onClick={() => onCollapse(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-sushi-text-dim hover:text-white hover:bg-sushi-surface transition-colors cursor-pointer"
                aria-label={t('dashboard.expandSidebar')}
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={null}
        width={236}
        collapsedWidth={68}
        className={`hidden md:block border-r border-sushi-border select-none transition-all duration-200 z-20 ${className || ''}`}
        style={{
          background: '#101114',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {renderSidebarContent(false)}
      </Sider>

      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        size={260}
        closable={false}
        classNames={{
          wrapper: 'md:hidden',
          section: 'sushi-mobile-drawer',
        }}
        styles={{
          body: { padding: 0, backgroundColor: '#101114' },
        }}
      >
        {renderSidebarContent(true)}
      </Drawer>
    </>
  );
}
