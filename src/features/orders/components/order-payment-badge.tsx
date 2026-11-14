'use client';

import React from 'react';
import { Tag } from '@/components/ui';
import { PaymentStatus } from '../types';

interface OrderPaymentBadgeProps {
  status: PaymentStatus;
}

export function OrderPaymentBadge({ status }: OrderPaymentBadgeProps) {
  const isPaid = status === 'PAID';

  return (
    <Tag
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border leading-normal ${
        isPaid
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      }`}
      style={{ margin: 0 }}
    >
      {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
    </Tag>
  );
}
