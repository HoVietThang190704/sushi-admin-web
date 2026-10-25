'use client';

// =============================================================================
// Sushi Platform - Centralized UI Design System & Component Hub
// =============================================================================

// 1. Export toàn bộ Components cốt lõi của Ant Design
export {
  // Layouts & Containers
  Layout,
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
  message,
  notification,

  // Navigation (Điều hướng)
  Menu,
  Dropdown,
  Breadcrumb,
  Pagination,

  // General
  Button,
} from 'antd';

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
} from '@phosphor-icons/react';

// 4. Các Components được bọc phong cách Sushi Platform cao cấp (Bespoke Wrappers)
import React from 'react';
import { Button as AntdButton, ButtonProps, Card as AntdCard, CardProps } from 'antd';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { SUSHICOLORS } from '@/lib/theme';

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
}

export function SushiMobileCardList<T>({
  items,
  loading,
  emptyState,
  renderItem,
  keyExtractor,
  className = '',
}: SushiMobileCardListProps<T>) {
  return (
    <div className={`md:hidden ${className}`}>
      {loading ? (
        <div className="py-12 text-center text-xs text-sushi-text-dim">
          Loading...
        </div>
      ) : items.length === 0 ? (
        emptyState || null
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => (
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
}

export function SushiPageHeader({ title, subtitle, extra, subtitleClassName }: SushiPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-sushi-border gap-4">
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
      {extra && <div className="flex items-center space-x-3">{extra}</div>}
    </div>
  );
}
