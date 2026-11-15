'use client';

// =============================================================================
// Sushi Platform - Centralized UI Design System & Component Hub
// =============================================================================

// 1. Export toàn bộ Components cốt lõi của Ant Design
export {
  // Layouts & Containers
  Layout,
  App,
  Card,
  Space,
  Divider,
  Row,
  Col,

  // Data Entry (Nhập liệu & Biểu mẫu)
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  TimePicker,
  Switch,
  Checkbox,
  Radio,
  Upload,

  // Data Display (Hiển thị dữ liệu & Bảng)
  Table,
  Tag,
  Badge,
  Avatar,
  Statistic,
  Descriptions,
  List,
  Tabs,
  Collapse,
  Empty,
  Tooltip,
  Popover,
  Typography,

  // Feedback & Overlays (Thông báo & Cửa sổ popup)
  Modal,
  Drawer,
  Alert,
  Popconfirm,
  Spin,
  Skeleton,
  Progress,

  // Navigation (Điều hướng)
  Menu,
  Dropdown,
  Breadcrumb,
  Pagination,

  // General
  Button,
} from 'antd';

import {
  App as AntdApp,
  message as antdStaticMessage,
  notification as antdStaticNotification,
} from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';
import type { HookAPI as ModalHookAPI } from 'antd/es/modal/useModal';

let bridgedMessage: MessageInstance | null = null;
let bridgedNotification: NotificationInstance | null = null;
let bridgedModal: ModalHookAPI | null = null;

/**
 * Cầu nối Context tự động cho message / notification / modal của Ant Design v5
 * Giúp toàn bộ lệnh gọi `message.success(...)` dùng chung Dynamic Theme từ `<App>`
 * mà không phát sinh cảnh báo Console Error.
 */
export function AntdAppBridge() {
  const staticApp = AntdApp.useApp();
  bridgedMessage = staticApp.message;
  bridgedNotification = staticApp.notification;
  bridgedModal = staticApp.modal;
  return null;
}

export const message: typeof antdStaticMessage = new Proxy(antdStaticMessage, {
  get(target, prop, receiver) {
    if (bridgedMessage && prop in bridgedMessage) {
      const value = Reflect.get(bridgedMessage, prop);
      return typeof value === 'function' ? value.bind(bridgedMessage) : value;
    }
    const fallback = Reflect.get(target, prop, receiver);
    return typeof fallback === 'function' ? fallback.bind(target) : fallback;
  },
});

export const notification: typeof antdStaticNotification = new Proxy(
  antdStaticNotification,
  {
    get(target, prop, receiver) {
      if (bridgedNotification && prop in bridgedNotification) {
        const value = Reflect.get(bridgedNotification, prop);
        return typeof value === 'function' ? value.bind(bridgedNotification) : value;
      }
      const fallback = Reflect.get(target, prop, receiver);
      return typeof fallback === 'function' ? fallback.bind(target) : fallback;
    },
  },
);

export const modalConfirm = (
  ...args: Parameters<ModalHookAPI['confirm']>
) => {
  if (bridgedModal) {
    return bridgedModal.confirm(...args);
  }
};

// 2. Export các Types phổ biến của Ant Design
export type {
  TableColumnsType,
  TableProps,
  FormInstance,
  FormProps,
  MenuProps,
  SelectProps,
  UploadFile,
  UploadProps,
  ModalProps,
  DrawerProps,
} from 'antd';

// 3. UNIFIED ICON SET: Bộ Icon đồng bộ toàn hệ sinh thái từ Phosphor Icons
export {
  SignIn,
  SignOut,
  LockSimple,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  User,
  House,
  Storefront,
  ForkKnife,
  Package,
  ChartBar,
  Plus,
  Trash,
  PencilSimple,
  MagnifyingGlass,
  Funnel,
  Copy,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  Info,
  Globe,
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
  SidebarSimple,
  List as ListIcon,
  SquaresFour,
  ShieldCheck,
  Gear,
  Cpu,
  Database,
  CookingPot,
  Receipt,
  ArrowsClockwise,
  ImageSquare,
  Truck,
  MapPin,
  QrCode,
  CreditCard,
} from '@phosphor-icons/react';

// 4. Các Components được bọc phong cách Sushi Platform cao cấp (Bespoke Wrappers)
import React from 'react';
import { Button as AntdButton, ButtonProps, Card as AntdCard, CardProps, Pagination as AntdPagination } from 'antd';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { SUSHICOLORS } from '@/lib/theme';
import { useTranslation } from '@/lib/i18n';

/**
 * Nút bấm chuẩn nhận diện thương hiệu Sushi Platform (Đỏ son Vermilion gradient)
 */
export function SushiButton({ style, children, className, ...props }: ButtonProps) {
  const isPrimary = props.type === 'primary' || !props.type;

  return (
    <AntdButton
      {...props}
      style={{
        borderRadius: 10,
        fontWeight: 600,
        ...(isPrimary
          ? {
              background: `linear-gradient(135deg, ${SUSHICOLORS.primary} 0%, ${SUSHICOLORS.primaryDark} 100%)`,
              borderColor: SUSHICOLORS.primary,
              boxShadow: `0 4px 14px 0 ${SUSHICOLORS.primary}55`,
              color: SUSHICOLORS.text,
            }
          : {}),
        ...style,
      }}
      className={`transition-all duration-200 cursor-pointer ${className || ''}`}
    >
      {children}
    </AntdButton>
  );
}

/**
 * Thẻ Card chuẩn phong cách tối giản màu đá than tre (Charcoal)
 */
export function SushiCard({ style, children, className, ...props }: CardProps) {
  return (
    <AntdCard
      {...props}
      style={{
        background: SUSHICOLORS.card,
        borderColor: SUSHICOLORS.border,
        borderRadius: 16,
        ...style,
      }}
      className={`shadow-lg ${className || ''}`}
    >
      {children}
    </AntdCard>
  );
}

/**
 * Thẻ Item chuẩn cho danh sách Mobile
 */
export function SushiCardItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-3.5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Cụm nút thao tác Sửa / Xóa chuẩn cho thẻ Card
 */
export interface SushiCardActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

export function SushiCardActions({
  onEdit,
  onDelete,
  editLabel = 'Chỉnh sửa',
  deleteLabel = 'Xóa',
  className = '',
}: SushiCardActionsProps) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className={`flex items-center space-x-1 shrink-0 ${className}`}>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-card-hover transition-colors border border-sushi-border/60 cursor-pointer"
          aria-label={editLabel}
        >
          <PencilSimple size={14} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors border border-sushi-border/60 cursor-pointer"
          aria-label={deleteLabel}
        >
          <Trash size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Component hiển thị trạng thái rỗng dùng chung cho cả Table Desktop & Card Mobile
 */
export interface SushiEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  isCard?: boolean;
}

export function SushiEmptyState({
  icon,
  title,
  description,
  className = '',
  isCard = false,
}: SushiEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        isCard
          ? 'p-8 rounded-2xl bg-sushi-card border border-sushi-border'
          : 'py-12 sm:py-14'
      } ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sushi-surface border border-sushi-border flex items-center justify-center text-sushi-text-dim mb-3 shadow-inner">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-sushi-text">{title}</p>
      {description && (
        <p className="text-xs text-sushi-text-dim mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Danh sách dạng Card trên Mobile (< md) tự động quản lý Loading, Empty và Spacing
 */
export interface SushiMobileCardListProps<T> {
  items: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
  pageSize?: number;
}

export function SushiMobileCardList<T>({
  items,
  loading,
  emptyState,
  renderItem,
  keyExtractor,
  className = '',
  pageSize = 8,
}: SushiMobileCardListProps<T>) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState(1);

  // Tự động điều chỉnh trang khi tổng số items thay đổi
  const totalPages = pageSize ? Math.max(1, Math.ceil(items.length / pageSize)) : 1;
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const displayItems = React.useMemo(() => {
    if (!pageSize || items.length <= pageSize) return items;
    const start = (activePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, activePage]);

  return (
    <div className={`md:hidden ${className}`}>
      {loading ? (
        <div className="py-12 text-center text-xs text-sushi-text-dim">
          {t('common.loading')}
        </div>
      ) : items.length === 0 ? (
        emptyState || null
      ) : (
        <div className="space-y-2.5">
          {displayItems.map((item, index) => (
            <React.Fragment
              key={
                keyExtractor
                  ? keyExtractor(item, index)
                  : ((item as { id?: string | number })?.id ?? index)
              }
            >
              {renderItem(item, index)}
            </React.Fragment>
          ))}

          {pageSize && items.length > 0 && (
            <div className="flex items-center justify-between pt-3 pb-1 px-1 border-t border-sushi-border/40 mt-3">
              <span className="text-2xs text-sushi-text-dim font-mono">
                {t('ordersPage.pageLabel')} {activePage} / {totalPages} ({items.length}{' '}
                {t('common.itemsCount')})
              </span>
              <AntdPagination
                simple
                current={activePage}
                total={items.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                size="small"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Header chuẩn cho các trang Quản trị (Title, Breadcrumbs, Action buttons)
 */
export interface SushiPageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  subtitleClassName?: string;
  className?: string;
}

export function SushiPageHeader({ title, subtitle, extra, subtitleClassName, className }: SushiPageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 sm:pb-6 sm:mb-6 border-b border-sushi-border gap-4 ${className || ''}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-sushi-text tracking-tight font-sans">
          {title}
        </h1>
        {subtitle && (
          <p className={`text-xs sm:text-sm text-sushi-text-muted mt-1 font-sans ${subtitleClassName || ''}`}>
            {subtitle}
          </p>
        )}
      </div>
      {extra && <div className="flex items-center space-x-3 w-full sm:w-auto">{extra}</div>}
    </div>
  );
}

export { ResponsiveModalDrawer } from './responsive-modal-drawer';
export type { ResponsiveModalDrawerProps } from './responsive-modal-drawer';
export { SushiFloatingButton } from './sushi-floating-button';
export type { SushiFloatingButtonProps } from './sushi-floating-button';


