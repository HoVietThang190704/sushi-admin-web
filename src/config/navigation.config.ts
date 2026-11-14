import React from 'react';
import {
  ChartBar,
  ForkKnife,
  SquaresFour,
  Package,
  CookingPot,
  Truck,
  QrCode,
  Gear,
  Storefront,
} from '@/components/ui';
import { TranslationKey } from '@/lib/i18n';

export interface NavChildItem {
  key: string;
  path: string;
  labelKey: TranslationKey;
  icon?: React.ComponentType<{
    size?: number;
    className?: string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }>;
}

export interface NavItem {
  key: string;
  path?: string;
  labelKey: TranslationKey;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }>;
  badge?: {
    text?: string;
    count?: number;
    color?: string;
  };
  exact?: boolean;
  hideInBottomNav?: boolean;
  children?: readonly NavChildItem[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    key: 'overview',
    path: '/dashboard',
    labelKey: 'dashboard.overview',
    icon: ChartBar,
    exact: true,
  },
  {
    key: 'categories',
    path: '/dashboard/categories',
    labelKey: 'dashboard.menuCategories',
    icon: SquaresFour,
  },
  {
    key: 'products',
    path: '/dashboard/products',
    labelKey: 'dashboard.menuProducts',
    icon: ForkKnife,
  },
  {
    key: 'inventory',
    path: '/dashboard/inventory',
    labelKey: 'dashboard.menuInventory',
    icon: CookingPot,
  },
  {
    key: 'orders',
    path: '/dashboard/orders',
    labelKey: 'dashboard.orders',
    icon: Package,
  },
  {
    key: 'settings',
    labelKey: 'dashboard.settingsGroup',
    icon: Gear,
    hideInBottomNav: true,
    children: [
      {
        key: 'store-settings',
        path: '/dashboard/store-settings',
        labelKey: 'dashboard.storeSettings',
        icon: Storefront,
      },
      {
        key: 'shipping',
        path: '/dashboard/shipping',
        labelKey: 'dashboard.shipping',
        icon: Truck,
      },
      {
        key: 'payment-settings',
        path: '/dashboard/settings',
        labelKey: 'dashboard.paymentSettings',
        icon: QrCode,
      },
    ],
  },
] as const;

/**
 * Danh sách items dành riêng cho thanh điều hướng đáy (Bottom Nav) trên Mobile:
 * Chỉ hiển thị 5 mục vận hành cốt lõi, không hiển thị mục Cấu hình
 */
export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter(
  (item) => !item.hideInBottomNav && Boolean(item.path),
) as Array<NavItem & { path: string }>;

/**
 * Tự động tìm key đang active từ đường dẫn hiện tại (hỗ trợ cả các mục con lồng nhau)
 */
export function getActiveNavKey(pathname: string): string {
  // 1. Kiểm tra trong các menu con (children) trước
  for (const item of NAV_ITEMS) {
    if (item.children) {
      for (const child of item.children) {
        if (pathname === child.path || pathname.startsWith(`${child.path}/`)) {
          return child.key;
        }
      }
    }
  }

  // 2. Kiểm tra các menu cấp 1
  for (const item of NAV_ITEMS) {
    if (item.path) {
      if (item.exact) {
        if (pathname === item.path) return item.key;
      } else {
        if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
          return item.key;
        }
      }
    }
  }

  return NAV_ITEMS[0]?.key ?? 'overview';
}

/**
 * Tìm key của menu cha nếu pathname đang thuộc về một menu con
 */
export function getActiveParentKey(pathname: string): string | null {
  for (const item of NAV_ITEMS) {
    if (item.children) {
      for (const child of item.children) {
        if (pathname === child.path || pathname.startsWith(`${child.path}/`)) {
          return item.key;
        }
      }
    }
  }
  return null;
}

/**
 * Lấy số thứ tự (index) của trang hiện tại để xác định hướng trượt (slide direction)
 */
export function getNavIndex(pathname: string): number {
  const activeKey = getActiveNavKey(pathname);
  const idx = BOTTOM_NAV_ITEMS.findIndex((item) => item.key === activeKey);
  return idx >= 0 ? idx : 0;
}
