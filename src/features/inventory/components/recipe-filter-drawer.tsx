'use client';

import React, { useState } from 'react';
import {
  ResponsiveModalDrawer,
  Button,
} from '@/components/ui';
import { Check, CheckCircle, WarningCircle } from '@phosphor-icons/react';

export interface RecipeFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filterStatus: 'ALL' | 'CONFIGURED' | 'MISSING';
  onSelectFilterStatus: (status: 'ALL' | 'CONFIGURED' | 'MISSING') => void;
  onReset: () => void;
  totalFilteredCount?: number;
}

const FILTER_OPTIONS: Array<{
  value: 'ALL' | 'CONFIGURED' | 'MISSING';
  label: string;
  description: string;
  icon?: React.ReactNode;
}> = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    description: 'Hiển thị toàn bộ danh sách món đơn',
  },
  {
    value: 'CONFIGURED',
    label: 'Đã có công thức định mức',
    description: 'Món đã sẵn sàng chế biến, không bị chặn bếp',
    icon: <CheckCircle size={14} weight="fill" className="text-emerald-400" />,
  },
  {
    value: 'MISSING',
    label: 'Chưa có công thức (Chặn bếp)',
    description: 'Bếp sẽ bị chặn chế biến món này cho đến khi có BOM',
    icon: <WarningCircle size={14} weight="fill" className="text-red-400" />,
  },
];

function FilterForm({
  filterStatus,
  totalFilteredCount,
  onClose,
  onApply,
  onReset,
}: {
  filterStatus: 'ALL' | 'CONFIGURED' | 'MISSING';
  totalFilteredCount?: number;
  onClose: () => void;
  onApply: (status: 'ALL' | 'CONFIGURED' | 'MISSING') => void;
  onReset: () => void;
}) {
  const [tempStatus, setTempStatus] = useState<'ALL' | 'CONFIGURED' | 'MISSING'>(filterStatus);
  const hasActiveFilters = tempStatus !== 'ALL';

  const handleApply = () => {
    onApply(tempStatus);
    onClose();
  };

  const handleReset = () => {
    setTempStatus('ALL');
    onReset();
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-sushi-text-muted block">
          Trạng Thái Công Thức Món
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {FILTER_OPTIONS.map((item) => {
            const isSelected = tempStatus === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTempStatus(item.value)}
                className={`p-3.5 rounded-xl text-xs border text-left flex items-start justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sushi-gold bg-sushi-gold/15 text-sushi-gold shadow-xs'
                    : 'border-sushi-border bg-sushi-surface/50 text-sushi-text-muted hover:text-white hover:bg-sushi-surface'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-sushi-text">{item.label}</span>
                    {item.icon}
                  </div>
                  <p className="text-2xs text-sushi-text-dim leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {isSelected && <Check size={18} weight="bold" className="text-sushi-gold shrink-0 ml-2 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Hành Động */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-sushi-border/80">
        <Button
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className="rounded-xl flex-1 h-11 border-sushi-border text-sushi-text-muted hover:text-white"
        >
          Xóa bộ lọc
        </Button>
        <Button
          type="primary"
          onClick={handleApply}
          className="rounded-xl flex-1 h-11 bg-sushi-gold hover:bg-sushi-gold/90 text-black font-semibold border-none flex items-center justify-center gap-1.5"
        >
          <Check size={16} weight="bold" />
          <span>
            Áp dụng {typeof totalFilteredCount === 'number' && `(${totalFilteredCount})`}
          </span>
        </Button>
      </div>
    </div>
  );
}

export function RecipeFilterDrawer({
  open,
  onClose,
  filterStatus,
  onSelectFilterStatus,
  onReset,
  totalFilteredCount,
}: RecipeFilterDrawerProps) {
  return (
    <ResponsiveModalDrawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      title="Lọc Trạng Thái Công Thức"
    >
      {open && (
        <FilterForm
          filterStatus={filterStatus}
          totalFilteredCount={totalFilteredCount}
          onClose={onClose}
          onApply={onSelectFilterStatus}
          onReset={onReset}
        />
      )}
    </ResponsiveModalDrawer>
  );
}
