'use client';

import React, { useState } from 'react';
import {
  ResponsiveModalDrawer,
  Select,
  Button,
} from '@/components/ui';
import { Check } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n';

export interface ProductFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  onReset: () => void;
  totalFilteredCount: number;
}

function FilterForm({
  selectedCategoryId,
  categoryOptions,
  totalFilteredCount,
  onClose,
  onApply,
  onReset,
}: {
  selectedCategoryId?: string;
  categoryOptions: Array<{ value: string; label: string }>;
  totalFilteredCount: number;
  onClose: () => void;
  onApply: (catId?: string) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const [tempCategoryId, setTempCategoryId] = useState<string | undefined>(selectedCategoryId);

  const hasActiveFilters = Boolean(tempCategoryId);

  const handleApply = () => {
    onApply(tempCategoryId);
    onClose();
  };

  const handleReset = () => {
    setTempCategoryId(undefined);
    onReset();
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Lọc theo danh mục */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-sushi-text-muted block">
            {t('dashboard.productCategoryLabel')}
          </label>
          <Select
            className="w-full h-11"
            placeholder={t('dashboard.allCategoriesFilter')}
            allowClear
            value={tempCategoryId || ''}
            onChange={(val) => setTempCategoryId(val ? String(val) : undefined)}
            options={[
              { value: '', label: t('dashboard.allCategoriesFilter') },
              ...categoryOptions,
            ]}
          />
        </div>
      </div>

      {/* Footer Hành Động */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-sushi-border/80">
        <Button
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className="rounded-xl flex-1 h-11 border-sushi-border text-sushi-text-muted hover:text-white"
        >
          {t('dashboard.clearFilter')}
        </Button>
        <Button
          type="primary"
          onClick={handleApply}
          className="rounded-xl flex-1 h-11 bg-sushi-gold hover:bg-sushi-gold/90 text-black font-semibold border-none flex items-center justify-center gap-1.5"
        >
          <Check size={16} weight="bold" />
          <span>{t('dashboard.applyFilter')} ({totalFilteredCount})</span>
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
  categoryOptions,
  onReset,
  totalFilteredCount,
}: ProductFilterDrawerProps) {
  const { t } = useTranslation();
  return (
    <ResponsiveModalDrawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      title={t('dashboard.filterProductsTitle')}
    >
      {open && (
        <FilterForm
          selectedCategoryId={selectedCategoryId}
          categoryOptions={categoryOptions}
          totalFilteredCount={totalFilteredCount}
          onClose={onClose}
          onApply={(catId) => {
            onSelectCategory(catId);
          }}
          onReset={onReset}
        />
      )}
    </ResponsiveModalDrawer>
  );
}
