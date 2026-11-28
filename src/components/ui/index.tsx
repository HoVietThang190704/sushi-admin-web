'use client';

// =============================================================================
// Sushi Platform - Centralized UI Design System & Component Hub
// =============================================================================

export {
  Layout,
  App,
  Card,
  Space,
  Divider,
  Row,
  Col,
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
  Modal,
  Drawer,
  Alert,
  Popconfirm,
  Spin,
  Skeleton,
  Progress,
  Menu,
  Dropdown,
  Breadcrumb,
  Pagination,
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

export function AntdAppBridge() {
  const staticApp = AntdApp.useApp();
  React.useEffect(() => {
    bridgedMessage = staticApp.message;
    bridgedNotification = staticApp.notification;
    bridgedModal = staticApp.modal;
  }, [staticApp]);
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

export {
  SignIn,
  SignOut,
  LockSimple,
  LockSimpleOpen,
  Check,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  User,
  Users,
  Key,
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

import React from 'react';
import {
  Button as AntdButton,
  ButtonProps,
  Card as AntdCard,
  CardProps,
  Pagination as AntdPagination,
} from 'antd';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { SUSHICOLORS } from '@/lib/theme';
import { useTranslation } from '@/lib/i18n';

/**
 * Nút bấm chính phong cách phẳng, sắc nét (Tactile Vermilion, không bóng phát sáng giả tạo)
 */
export function SushiButton({ style, children, className, ...props }: ButtonProps) {
  const isPrimary = props.type === 'primary' || !props.type;

  return (
    <AntdButton
      {...props}
      style={{
        borderRadius: 8,
        fontWeight: 600,
        ...(isPrimary
          ? {
              background: SUSHICOLORS.primary,
              borderColor: '#ef4444',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 1px 2px rgba(0, 0, 0, 0.4)',
              color: '#ffffff',
            }
          : {}),
        ...style,
      }}
      className={`transition-all duration-150 cursor-pointer ${className || ''}`}
    >
      {children}
    </AntdButton>
  );
}

/**
 * Thẻ Card phẳng, viền mảnh 1px chuẩn kiến trúc Obsidian
 */
export function SushiCard({ style, children, className, ...props }: CardProps) {
  return (
    <AntdCard
      {...props}
      style={{
        background: SUSHICOLORS.card,
        borderColor: SUSHICOLORS.border,
        borderRadius: 10,
        ...style,
      }}
      className={`${className || ''}`}
    >
      {children}
    </AntdCard>
  );
}

/**
 * Thẻ Item danh sách trên Mobile: Gọn gàng, viền mảnh, không bo tròn quá đà
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
      className={`p-3.5 rounded-xl bg-sushi-card border border-sushi-border ${className}`}
    >
      {children}
    </div>
  );
}

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
          className="w-7 h-7 rounded-md flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface transition-colors border border-sushi-border cursor-pointer"
          aria-label={editLabel}
        >
          <PencilSimple size={13} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-7 h-7 rounded-md flex items-center justify-center text-sushi-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors border border-sushi-border cursor-pointer"
          aria-label={deleteLabel}
        >
          <Trash size={13} />
        </button>
      )}
    </div>
  );
}

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
          ? 'p-8 rounded-xl bg-sushi-card border border-sushi-border'
          : 'py-10 sm:py-12'
      } ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-sushi-surface border border-sushi-border flex items-center justify-center text-sushi-text-dim mb-2.5">
          {icon}
        </div>
      )}
      <p className="text-xs font-semibold text-sushi-text">{title}</p>
      {description && (
        <p className="text-2xs text-sushi-text-dim mt-1 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

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
        <div className="py-10 text-center text-xs text-sushi-text-dim font-mono">
          {t('common.loading')}
        </div>
      ) : items.length === 0 ? (
        emptyState || null
      ) : (
        <div className="space-y-2">
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
            <div className="flex items-center justify-between pt-2.5 pb-1 px-1 border-t border-sushi-border mt-2.5">
              <span className="text-2xs text-sushi-text-dim font-mono">
                {t('ordersPage.pageLabel')} {activePage}/{totalPages} · {items.length}{' '}
                {t('common.itemsCount')}
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
 * Header trang Quản trị: Tinh gọn, sắc sảo, không lặp tiêu đề rườm rà trên Mobile
 */
export interface SushiPageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  subtitleClassName?: string;
  className?: string;
}

export function SushiPageHeader({
  title,
  subtitle,
  extra,
  subtitleClassName,
  className,
}: SushiPageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 ${className || ''}`}
    >
      <div className="min-w-0">
        <h1 className="text-base sm:text-xl font-semibold text-sushi-text tracking-tight leading-snug">
          {title}
        </h1>
        {subtitle && (
          <p
            className={`hidden sm:block text-xs text-sushi-text-dim mt-0.5 truncate max-w-2xl ${subtitleClassName || ''}`}
          >
            {subtitle}
          </p>
        )}
      </div>
      {extra && (
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {extra}
        </div>
      )}
    </div>
  );
}

export { ResponsiveModalDrawer } from './responsive-modal-drawer';
export type { ResponsiveModalDrawerProps } from './responsive-modal-drawer';
export { SushiFloatingButton } from './sushi-floating-button';
export type { SushiFloatingButtonProps } from './sushi-floating-button';
