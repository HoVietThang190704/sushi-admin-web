'use client';

import React from 'react';
import Image from 'next/image';
import {
  ResponsiveModalDrawer,
  Button,
  Spin,
  ForkKnife,
  CookingPot,
  Copy,
  CheckCircle,
  WarningCircle,
  Package,
  PencilSimple,
  message,
} from '@/components/ui';
import { Product } from '../types';
import { useProductDetail } from '../hooks/use-products';
import { useRecipeByProduct } from '@/features/inventory';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';
import { useTranslation } from '@/lib/i18n';

export interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  open,
  onClose,
  onEdit,
}: ProductDetailModalProps) {
  const { t, locale } = useTranslation();
  const { formatCurrency } = useFormatCurrency();

  const { data: detailProduct, isLoading: loadingDetail } = useProductDetail(
    open && product ? product.id : undefined,
  );

  const { data: recipe, isLoading: loadingRecipe } = useRecipeByProduct(
    open && product?.type === 'SINGLE' ? product.id : undefined,
  );

  if (!product) return null;

  const activeProduct = detailProduct || product;
  const comboItems = activeProduct.comboItemsAsParent || [];
  const recipeItems = recipe?.items || [];

  const estimatedBomCost = recipeItems.reduce((sum, item) => {
    const unitCost = Number(item.ingredient?.costPrice || 0);
    return sum + unitCost * Number(item.quantity || 0);
  }, 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${t('dashboard.copied')}: ${text}`);
  };

  const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';

  return (
    <ResponsiveModalDrawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      width={600}
      title={
        <div className="flex items-center gap-2 font-bold text-sushi-text text-sm sm:text-base">
          <ForkKnife size={20} className="text-sushi-gold shrink-0" weight="fill" />
          <span className="truncate">{t('dashboard.productDetailTitle')}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          {onEdit && (
            <Button
              icon={<PencilSimple size={16} />}
              onClick={() => {
                onClose();
                onEdit(activeProduct);
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
        {/* 1. Hero Card: Ảnh món ăn, Tên, Phân loại, Trạng thái & Giá bán */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-sushi-surface/60 border border-sushi-border/80 flex items-start gap-3.5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-sushi-border bg-sushi-card flex items-center justify-center shrink-0 shadow-md">
            {activeProduct.imageUrl ? (
              <Image
                src={activeProduct.imageUrl}
                alt={activeProduct.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <ForkKnife size={32} className="text-sushi-text-dim" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-sushi-text leading-snug">
                {activeProduct.name}
              </h3>
              <div className="text-xs text-sushi-text-muted mt-0.5">
                {activeProduct.category?.name || t('common.uncategorized')}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-mono font-semibold border ${
                  activeProduct.type === 'COMBO'
                    ? 'bg-sushi-gold/15 text-sushi-gold border-sushi-gold/30'
                    : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                }`}
              >
                {activeProduct.type}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-medium border ${
                  activeProduct.isActive
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    activeProduct.isActive ? 'bg-emerald-500' : 'bg-zinc-500'
                  }`}
                />
                <span>
                  {activeProduct.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </span>
            </div>

            <div className="pt-0.5">
              <span className="text-lg sm:text-xl font-extrabold text-sushi-gold font-mono">
                {formatCurrency(activeProduct.sellingPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Thông số định danh (Bento 2x2) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-sushi-surface/40 border border-sushi-border/70">
            <div className="text-2xs text-sushi-text-dim uppercase font-mono">
              {t('dashboard.productSkuLabel')}
            </div>
            <div className="mt-1 flex items-center justify-between gap-1.5">
              <span className="text-xs font-mono font-bold text-sushi-text truncate">
                {activeProduct.sku}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeProduct.sku)}
                className="text-sushi-text-muted hover:text-sushi-gold p-1 rounded cursor-pointer shrink-0 transition-colors"
                aria-label="Copy SKU"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sushi-surface/40 border border-sushi-border/70">
            <div className="text-2xs text-sushi-text-dim uppercase font-mono">
              {t('dashboard.productBarcodeLabel')}
            </div>
            <div className="mt-1 text-xs font-mono font-semibold text-sushi-text truncate">
              {activeProduct.barcode || '—'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sushi-surface/40 border border-sushi-border/70">
            <div className="text-2xs text-sushi-text-dim uppercase font-mono">
              {t('dashboard.productCreatedAtLabel')}
            </div>
            <div className="mt-1 text-xs font-mono text-sushi-text-muted">
              {activeProduct.createdAt
                ? new Date(activeProduct.createdAt).toLocaleDateString(dateLocale)
                : '—'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sushi-surface/40 border border-sushi-border/70">
            <div className="text-2xs text-sushi-text-dim uppercase font-mono">
              {t('dashboard.productUpdatedAtLabel')}
            </div>
            <div className="mt-1 text-xs font-mono text-sushi-text-muted">
              {activeProduct.updatedAt
                ? new Date(activeProduct.updatedAt).toLocaleDateString(dateLocale)
                : '—'}
            </div>
          </div>
        </div>

        {/* 2.5. Đồ ăn kèm & Mô tả món ăn (nếu có) */}
        {(activeProduct.accompaniments || activeProduct.description) && (
          <div className="p-3.5 rounded-2xl bg-sushi-surface/40 border border-sushi-border/70 space-y-2 text-xs">
            {activeProduct.accompaniments && (
              <div>
                <span className="text-2xs text-sushi-text-dim uppercase font-mono block">
                  {t('dashboard.productAccompanimentsLabel')}
                </span>
                <span className="text-sushi-gold font-medium mt-0.5 block">
                  {activeProduct.accompaniments}
                </span>
              </div>
            )}
            {activeProduct.description && (
              <div>
                <span className="text-2xs text-sushi-text-dim uppercase font-mono block">
                  {t('dashboard.productDescriptionLabel')}
                </span>
                <span className="text-sushi-text-muted mt-0.5 block leading-relaxed">
                  {activeProduct.description}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. Nội dung chuyên biệt theo loại món: SINGLE (Công thức BOM) hoặc COMBO (Món thành phần) */}
        {activeProduct.type === 'SINGLE' ? (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-sushi-surface/40 border border-sushi-border/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CookingPot size={17} className="text-sushi-gold shrink-0" weight="fill" />
                <span className="text-xs font-bold uppercase tracking-wider text-sushi-text">
                  {t('dashboard.productRecipeBomTitle')}
                </span>
              </div>

              {!loadingRecipe && (
                recipeItems.length > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle size={12} weight="fill" />
                    <span>
                      {t('recipeView.statusConfigured')} ({recipeItems.length}{' '}
                      {t('recipeView.ingredientsShort')})
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-red-500/15 border border-red-500/30 text-red-400">
                    <WarningCircle size={12} weight="fill" />
                    <span>{t('recipeView.statusMissing')}</span>
                  </span>
                )
              )}
            </div>

            {loadingRecipe ? (
              <div className="py-6 flex justify-center">
                <Spin size="small" />
              </div>
            ) : recipeItems.length > 0 ? (
              <div className="space-y-2.5">
                <div className="divide-y divide-sushi-border/50 rounded-xl border border-sushi-border/60 bg-sushi-card/80 overflow-hidden">
                  {recipeItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-sushi-text truncate">
                          {item.ingredient?.name || item.ingredientId}
                        </div>
                        {item.ingredient?.code && (
                          <div className="text-3xs text-sushi-text-dim font-mono">
                            {item.ingredient.code}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="font-bold text-sushi-gold">
                          {Number(item.quantity)} {item.ingredient?.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {estimatedBomCost > 0 && (
                  <div className="flex items-center justify-between px-1 pt-1 text-xs">
                    <span className="text-sushi-text-muted">
                      {t('dashboard.productEstCostLabel')}
                    </span>
                    <span className="font-mono font-bold text-sushi-text">
                      {formatCurrency(estimatedBomCost)}
                    </span>
                  </div>
                )}

                {recipe?.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
                    <span className="font-semibold block mb-0.5">
                      {t('recipeView.notesLabel')}:
                    </span>
                    <span>{recipe.notes}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-sushi-text-dim italic">
                {t('recipeView.notDeclared')}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-sushi-surface/40 border border-sushi-border/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package size={17} className="text-sushi-gold shrink-0" weight="fill" />
                <span className="text-xs font-bold uppercase tracking-wider text-sushi-text">
                  {t('dashboard.productComboItemsTitle')}
                </span>
              </div>
              <span className="text-2xs font-mono text-sushi-gold font-semibold">
                {comboItems.length} {t('common.itemsCount')}
              </span>
            </div>

            {loadingDetail ? (
              <div className="py-6 flex justify-center">
                <Spin size="small" />
              </div>
            ) : comboItems.length > 0 ? (
              <div className="divide-y divide-sushi-border/50 rounded-xl border border-sushi-border/60 bg-sushi-card/80 overflow-hidden">
                {comboItems.map((ci) => (
                  <div
                    key={ci.id}
                    className="px-3 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-sushi-gold/15 border border-sushi-gold/30 text-sushi-gold font-mono font-bold text-2xs shrink-0">
                        {ci.quantity}x
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sushi-text truncate">
                          {ci.childProduct?.name || ci.childProductId}
                        </div>
                        {ci.childProduct?.sku && (
                          <div className="text-3xs text-sushi-text-dim font-mono">
                            SKU: {ci.childProduct.sku}
                          </div>
                        )}
                      </div>
                    </div>
                    {ci.childProduct?.sellingPrice !== undefined && (
                      <span className="font-mono text-sushi-text-muted shrink-0">
                        {formatCurrency(ci.childProduct.sellingPrice)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-sushi-text-dim italic">
                {t('dashboard.productComboEmpty')}
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveModalDrawer>
  );
}
