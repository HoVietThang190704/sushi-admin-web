'use client';

import React from 'react';
import { Tag } from '@/components/ui';
import { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; text: string }
> = {
  PENDING: {
    label: 'Chờ tiếp nhận',
    color: 'gold',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'blue',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  PREPARING: {
    label: 'Đang chế biến',
    color: 'orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  READY_FOR_PICKUP: {
    label: 'Chờ giao hàng',
    color: 'purple',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: 'cyan',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    color: 'green',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'red',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status,
    color: 'default',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
  };

  return (
    <Tag
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}
      style={{ margin: 0 }}
    >
      {config.label}
    </Tag>
  );
}
