'use client';

import React from 'react';
import { Input, Popconfirm } from '@/components/ui';
import { WarningCircle, CircleNotch } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();

  return (
    <div
      className={`p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2.5 ${
        isMobile ? 'text-xs' : ''
      }`}
    >
      <div className="text-sm font-semibold text-rose-400 flex items-center gap-1.5">
        <WarningCircle size={18} weight="fill" />
        <span>{t('ordersPage.cancelConfirmTitle')}</span>
      </div>
      <Input
        placeholder={t('ordersPage.cancelReasonPlaceholder')}
        value={reason}
        onChange={(e) => onChangeReason(e.target.value)}
        className="rounded-xl text-xs sm:text-sm h-10"
      />
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-3.5 rounded-xl border border-sushi-border bg-sushi-surface/80 hover:bg-zinc-800 text-sushi-text-muted hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          {t('common.cancel')}
        </button>
        <Popconfirm
          title={t('ordersPage.cancelConfirmQuestion')}
          onConfirm={onConfirm}
          okText={t('ordersPage.cancelConfirmOk')}
          cancelText={t('common.cancel')}
        >
          <button
            type="button"
            disabled={isPending}
            className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-60"
          >
            {isPending && <CircleNotch size={14} className="animate-spin" />}
            <span>{t('ordersPage.cancelConfirmBtn')}</span>
          </button>
        </Popconfirm>
      </div>
    </div>
  );
}
