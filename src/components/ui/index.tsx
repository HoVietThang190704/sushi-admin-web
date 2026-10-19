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
  User,
  Storefront,
  ForkKnife,
  Package,
  ChartBar,
  Plus,
  Trash,
  PencilSimple,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  Info,
  Globe,
  CaretDown,
  CaretUp,
  List as ListIcon,
  SquaresFour,
  ShieldCheck,
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
 * Header chuẩn cho các trang Quản trị (Title, Breadcrumbs, Action buttons)
 */
export interface SushiPageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

export function SushiPageHeader({ title, subtitle, extra }: SushiPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-sushi-border gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-sushi-text tracking-tight font-sans">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-sushi-text-muted mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {extra && <div className="flex items-center space-x-3">{extra}</div>}
    </div>
  );
}
