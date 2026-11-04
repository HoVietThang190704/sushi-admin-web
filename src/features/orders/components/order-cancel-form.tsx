'use client';

import React from 'react';
import { Button, Input, Popconfirm } from '@/components/ui';
import { WarningCircle } from '@phosphor-icons/react';

interface OrderCancelFormProps {
  reason: string;
  onChangeReason: (val: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
  isMobile?: boolean;
}

export function OrderCancelForm({
  reason,
  onChangeReason,
  onCancel,
  onConfirm,
  isPending,
  isMobile = false,
}: OrderCancelFormProps) {
  return (
    <div
      className={`p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 ${
        isMobile ? 'text-xs' : ''
      }`}
    >
      <div className="text-sm font-semibold text-rose-400 flex items-center gap-1.5">
        <WarningCircle size={18} />
        Xác nhận hủy đơn hàng này
      </div>
      <Input
        placeholder="Nhập lý do hủy đơn (ví dụ: Hết nguyên liệu, Khách đổi ý...)"
        value={reason}
        onChange={(e) => onChangeReason(e.target.value)}
        className="rounded-lg text-xs sm:text-sm"
      />
      <div className="flex justify-end gap-2 pt-1">
        <Button size="small" onClick={onCancel}>
          Hủy bỏ
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn hủy đơn hàng này?"
          onConfirm={onConfirm}
          okText="Đồng ý hủy"
          cancelText="Quay lại"
        >
          <Button
            size="small"
            danger
            type="primary"
            loading={isPending}
          >
            Xác nhận Hủy
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}
