'use client';

import React, { useState } from 'react';
import {
  ResponsiveModalDrawer,
  Select,
  Button,
} from '@/components/ui';
import { Check } from '@phosphor-icons/react';

export interface ProductFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  onReset: () => void;
  totalFilteredCount: number;
}

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả loại' },
  { value: 'SINGLE', label: 'Món đơn (Single)' },
  { value: 'COMBO', label: 'Combo / Set' },
];

function FilterForm({
  selectedCategoryId,
  selectedType,
  categoryOptions,
  totalFilteredCount,
  onClose,
  onApply,
  onReset,
}: {
  selectedCategoryId?: string;
  selectedType: string;
  categoryOptions: Array<{ value: string; label: string }>;
  totalFilteredCount: number;
  onClose: () => void;
  onApply: (catId?: string, type?: string) => void;
  onReset: () => void;
}) {
  const [tempCategoryId, setTempCategoryId] = useState<string | undefined>(selectedCategoryId);
  const [tempType, setTempType] = useState<string>(selectedType);

  const hasActiveFilters = Boolean(tempCategoryId || (tempType && tempType !== 'ALL'));

  const handleApply = () => {
    onApply(tempCategoryId, tempType);
    onClose();
  };

  const handleReset = () => {
    setTempCategoryId(undefined);
    setTempType('ALL');
    onReset();
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Lọc theo danh mục */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-sushi-text-muted block">
            Danh Mục Món Ăn
          </label>
          <Select
            className="w-full h-11"
            placeholder="Tất cả danh mục"
            allowClear
            value={tempCategoryId || ''}
            onChange={(val) => setTempCategoryId(val ? String(val) : undefined)}
            options={[
              { value: '', label: 'Tất cả danh mục' },
              ...categoryOptions,
            ]}
          />
        </div>

        {/* Lọc theo loại món: Single / Combo */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-sushi-text-muted block">
            Phân Loại Sản Phẩm
          </label>
          <div className="grid grid-cols-1 gap-2">
            {TYPE_OPTIONS.map((item) => {
              const isSelected = tempType === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTempType(item.value)}
                  className={`py-3 px-4 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sushi-gold bg-sushi-gold/15 text-sushi-gold shadow-xs'
                      : 'border-sushi-border bg-sushi-surface/50 text-sushi-text-muted hover:text-white hover:bg-sushi-surface'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check size={16} weight="bold" className="text-sushi-gold" />}
                </button>
              );
            })}
          </div>
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

export function ProductFilterDrawer({
  open,
  onClose,
  selectedCategoryId,
  onSelectCategory,
  selectedType,
  onSelectType,
  categoryOptions,
  onReset,
  totalFilteredCount,
}: ProductFilterDrawerProps) {
  return (
    <ResponsiveModalDrawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      title="Bộ Lọc Món Ăn"
    >
      {open && (
        <FilterForm
          selectedCategoryId={selectedCategoryId}
          selectedType={selectedType}
          categoryOptions={categoryOptions}
          totalFilteredCount={totalFilteredCount}
          onClose={onClose}
          onApply={(catId, type) => {
            onSelectCategory(catId);
            if (type) onSelectType(type);
          }}
          onReset={onReset}
        />
      )}
    </ResponsiveModalDrawer>
  );
}
