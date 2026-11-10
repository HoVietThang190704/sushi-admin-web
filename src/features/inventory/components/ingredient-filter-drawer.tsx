'use client';

import React, { useState } from 'react';
import {
  ResponsiveModalDrawer,
  Button,
} from '@/components/ui';
import { Check, WarningCircle } from '@phosphor-icons/react';

export interface IngredientFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  alertFilter: 'ALL' | 'ALERTS';
  onSelectAlertFilter: (filter: 'ALL' | 'ALERTS') => void;
  onReset: () => void;
  totalFilteredCount: number;
  alertCount: number;
}

const FILTER_OPTIONS: Array<{
  value: 'ALL' | 'ALERTS';
  label: string;
  description: string;
}> = [
  {
    value: 'ALL',
    label: 'Tất cả trạng thái',
    description: 'Hiển thị toàn bộ danh mục nguyên vật liệu trong kho',
  },
  {
    value: 'ALERTS',
    label: 'Cảnh báo thiếu hụt / Sắp hết',
    description: 'Chỉ hiển thị nguyên liệu chạm ngưỡng tồn an toàn tối thiểu',
  },
];

function FilterForm({
  alertFilter,
  alertCount,
  totalFilteredCount,
  onClose,
  onApply,
  onReset,
}: {
  alertFilter: 'ALL' | 'ALERTS';
  alertCount: number;
  totalFilteredCount: number;
  onClose: () => void;
  onApply: (filter: 'ALL' | 'ALERTS') => void;
  onReset: () => void;
}) {
  const [tempFilter, setTempFilter] = useState<'ALL' | 'ALERTS'>(alertFilter);
  const hasActiveFilters = tempFilter !== 'ALL';

  const handleApply = () => {
    onApply(tempFilter);
    onClose();
  };

  const handleReset = () => {
    setTempFilter('ALL');
    onReset();
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-sushi-text-muted block">
          Trạng Thái Tồn Kho
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {FILTER_OPTIONS.map((item) => {
            const isSelected = tempFilter === item.value;
            const isAlertOption = item.value === 'ALERTS';

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTempFilter(item.value)}
                className={`p-3.5 rounded-xl text-xs border text-left flex items-start justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sushi-gold bg-sushi-gold/15 text-sushi-gold shadow-xs'
                    : 'border-sushi-border bg-sushi-surface/50 text-sushi-text-muted hover:text-white hover:bg-sushi-surface'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-sushi-text">{item.label}</span>
                    {isAlertOption && alertCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-3xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <WarningCircle size={12} weight="fill" />
                        <span>{alertCount} món</span>
                      </span>
                    )}
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
          <span>Áp dụng ({totalFilteredCount})</span>
        </Button>
      </div>
    </div>
  );
}

export function IngredientFilterDrawer({
  open,
  onClose,
  alertFilter,
  onSelectAlertFilter,
  onReset,
  totalFilteredCount,
  alertCount,
}: IngredientFilterDrawerProps) {
  return (
    <ResponsiveModalDrawer
      open={open}
      onClose={onClose}
      destroyOnClose
      destroyOnHidden
      title="Lọc Trạng Thái Nguyên Liệu"
    >
      {open && (
        <FilterForm
          alertFilter={alertFilter}
          alertCount={alertCount}
          totalFilteredCount={totalFilteredCount}
          onClose={onClose}
          onApply={onSelectAlertFilter}
          onReset={onReset}
        />
      )}
    </ResponsiveModalDrawer>
  );
}
