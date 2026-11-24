'use client';

import React from 'react';
import Image from 'next/image';
import {
  ResponsiveModalDrawer,
  Button,
  Spin,
  SquaresFour,
  ForkKnife,
  Copy,
  PencilSimple,
  message,
} from '@/components/ui';
import { Category } from '../types';
import { useCategoryDetail } from '../hooks/use-categories';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';
import { useTranslation } from '@/lib/i18n';

export interface CategoryDetailModalProps {
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (category: Category) => void;
}

export function CategoryDetailModal({
  category,
  open,
  onClose,
  onEdit,
}: CategoryDetailModalProps) {
  const { t, locale } = useTranslation();
  const { formatCurrency } = useFormatCurrency();

  const { data: detailCategory, isLoading } = useCategoryDetail(
    open && category ? category.id : undefined,
  );

  if (!category) return null;

  const activeCategory = detailCategory || category;
  const products = activeCategory.products || [];
  const totalCount = activeCategory._count?.products ?? products.length;
  const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';

  const handleCopyId = () => {
    navigator.clipboard.writeText(activeCategory.id);
    message.success(`${t('dashboard.copied')}: ${activeCategory.id.slice(0, 8)}...`);
  };

  return (
    <ResponsiveModalDrawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      width={600}
      title={
        <div className="flex items-center gap-2 font-bold text-sushi-text text-sm sm:text-base">
          <SquaresFour size={20} className="text-sushi-gold shrink-0" weight="fill" />
          <span className="truncate">{t('dashboard.categoryDetailTitle')}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          {onEdit && (
            <Button
              icon={<PencilSimple size={16} />}
              onClick={() => {
                onClose();
                onEdit(activeCategory);
              }}
              className="rounded-xl h-11 sm:h-10 px-4 border-sushi-gold/40 text-sushi-gold hover:bg-sushi-gold/10 font-medium flex-1 sm:flex-none"
            >
              {t('dashboard.edit')}
            </Button>
          )}
          <Button
            type="primary"
            onClick={onClose}
            className="rounded-xl h-11 sm:h-10 px-5 font-semibold flex-1 sm:flex-none"
          >
            {t('dashboard.closeBtn')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* 1. Hero Card: Tên danh mục, Trạng thái & Số lượng món */}
        <div className="p-4 rounded-2xl bg-sushi-surface/60 border border-sushi-border/80 flex items-center gap-3.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sushi-card border border-sushi-border text-sushi-primary flex items-center justify-center shrink-0 shadow-inner">
            <SquaresFour size={28} weight="fill" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-sushi-text leading-snug truncate">
              {activeCategory.name}
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-2xs font-semibold font-mono bg-blue-500/10 border border-blue-500/25 text-blue-400">
                {totalCount} {t('common.itemsCount')}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{t('common.active')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Thông số định danh (Bento 2 cột) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-sushi-surface/40 border border-sushi-border/70">
            <div className="text-2xs text-sushi-text-dim uppercase font-mono">
              {t('dashboard.categoryTableId')}
            </div>
            <div className="mt-1 flex items-center justify-between gap-1.5">
              <span className="text-xs font-mono font-bold text-sushi-text truncate">
                {activeCategory.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-sushi-text-muted hover:text-sushi-gold p-1 rounded cursor-pointer shrink-0 transition-colors"
                aria-label="Copy UUID"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sushi-surface/40 border border-sushi-border/70">
            <div className="text-2xs text-sushi-text-dim uppercase font-mono">
              {t('dashboard.productCreatedAtLabel')}
            </div>
            <div className="mt-1 text-xs font-mono font-semibold text-sushi-text">
              {activeCategory.createdAt
                ? new Date(activeCategory.createdAt).toLocaleDateString(dateLocale)
                : '—'}
            </div>
          </div>
        </div>

        {/* 3. Danh sách các món ăn thuộc danh mục này */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-sushi-surface/40 border border-sushi-border/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ForkKnife size={17} className="text-sushi-gold shrink-0" weight="fill" />
              <span className="text-xs font-bold uppercase tracking-wider text-sushi-text">
                {t('dashboard.categoryDishesListTitle')}
              </span>
            </div>
            <span className="text-2xs font-mono text-sushi-gold font-semibold">
              {products.length} {t('common.itemsCount')}
            </span>
          </div>

          {isLoading ? (
            <div className="py-6 flex justify-center">
              <Spin size="small" />
            </div>
          ) : products.length > 0 ? (
            <div className="divide-y divide-sushi-border/50 rounded-xl border border-sushi-border/60 bg-sushi-card/80 overflow-hidden max-h-72 overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="px-3 py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <ForkKnife size={16} className="text-sushi-text-dim" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-semibold text-sushi-text truncate">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-3xs font-mono text-sushi-text-dim">
                        <span>SKU: {product.sku}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="font-mono font-bold text-sushi-gold">
                      {formatCurrency(product.sellingPrice)}
                    </div>
                    <div
                      className={`text-3xs font-medium ${
                        product.isActive ? 'text-emerald-400' : 'text-zinc-400'
                      }`}
                    >
                      {product.isActive ? t('common.active') : t('common.inactive')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-sushi-text-dim italic">
              {t('dashboard.categoryDishesEmpty')}
            </div>
          )}
        </div>
      </div>
    </ResponsiveModalDrawer>
  );
}
