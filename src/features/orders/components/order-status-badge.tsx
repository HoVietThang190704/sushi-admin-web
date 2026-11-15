'use client';

import React from 'react';
import { Tag } from '@/components/ui';
import { OrderStatus } from '../types';
import { useTranslation, TranslationKey } from '@/lib/i18n';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; labelKey: TranslationKey; color: string; bg: string; border: string; text: string }
> = {
  PENDING: {
    label: 'Chờ tiếp nhận',
    labelKey: 'ordersPage.statusPending',
    color: 'gold',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    labelKey: 'ordersPage.statusConfirmed',
    color: 'blue',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  PREPARING: {
    label: 'Đang chế biến',
    labelKey: 'ordersPage.statusPreparing',
    color: 'orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  READY_FOR_PICKUP: {
    label: 'Chờ giao hàng',
    labelKey: 'ordersPage.statusReady',
    color: 'purple',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    labelKey: 'ordersPage.statusDelivering',
    color: 'cyan',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    labelKey: 'ordersPage.statusCompleted',
    color: 'green',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  CANCELLED: {
    label: 'Đã hủy',
    labelKey: 'ordersPage.statusCancelled',
    color: 'red',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useTranslation();
  const config = ORDER_STATUS_CONFIG[status];

  if (!config) {
    return (
      <Tag
        className="px-2.5 py-1 rounded-full text-xs font-medium border bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
        style={{ margin: 0 }}
      >
        {status}
      </Tag>
    );
  }

  return (
    <Tag
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}
      style={{ margin: 0 }}
    >
      {t(config.labelKey)}
    </Tag>
  );
}
