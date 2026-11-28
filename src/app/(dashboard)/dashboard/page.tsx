'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  SushiPageHeader,
  SquaresFour,
  ForkKnife,
  Package,
  CookingPot,
  ArrowRight,
  ChartBar,
} from '@/components/ui';
import { useCategories, useProducts } from '@/features/catalog';
import { useIngredients, useInventoryAlerts } from '@/features/inventory';
import { useOrders } from '@/features/orders';
import { useTranslation } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

export default function DashboardOverviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const { data: ingredients = [] } = useIngredients();
  const { data: alerts = [] } = useInventoryAlerts();
  const { data: ordersData } = useOrders({ page: 1, limit: 50 });
  const { formatCurrency } = useFormatCurrency();

  const totalOrders = ordersData?.total ?? 0;
  const pendingOrdersCount =
    ordersData?.items?.filter((o) => o.status === 'PENDING').length ?? 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Header */}
      <div className="pb-3 border-b border-sushi-border flex items-center justify-between gap-3">
        <SushiPageHeader
          title={t('dashboard.overviewTitle')}
          subtitle={t('dashboard.overviewSubtitle')}
        />
        <Link
          href="/dashboard/reports"
          className="h-8 px-3 rounded-lg bg-sushi-surface border border-sushi-border hover:border-zinc-600 text-xs font-medium text-sushi-text inline-flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <ChartBar size={14} className="text-sushi-text-muted" />
          <span>{t('dashboard.accountingReports')}</span>
        </Link>
      </div>

      {/* 2. Architectural Metric Ledger Grid (1px Divided - No Rainbow Icon Boxes) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sushi-border border border-sushi-border rounded-xl overflow-hidden">
        {/* Metric 1: Categories */}
        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('dashboard.totalCategories')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
              {categories.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {t('dashboard.groupsCountUnit')}
            </span>
          </div>
        </div>

        {/* Metric 2: Menu Products */}
        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('dashboard.totalProducts')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
              {products.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              SKU
            </span>
          </div>
        </div>

        {/* Metric 3: Ingredients */}
        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('dashboard.totalIngredients')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
              {ingredients.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {t('dashboard.menuInventory')}
            </span>
          </div>
        </div>

        {/* Metric 4: Stock Alerts */}
        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
              {t('dashboard.alertItemsCount')}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                alerts.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl sm:text-2xl font-semibold font-mono tracking-tight ${
                alerts.length > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {alerts.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {alerts.length > 0 ? t('dashboard.alertLow') : t('dashboard.alertSafe')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operations Quick-Access Strip */}
      <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
        <div className="px-4 py-2.5 border-b border-sushi-border flex items-center justify-between">
          <h2 className="text-2xs font-mono font-semibold uppercase tracking-wider text-sushi-text-muted">
            {t('dashboard.actionHubTitle')}
          </h2>
          <span className="text-2xs font-mono text-sushi-text-dim hidden sm:inline">
            {t('dashboard.actionHubSubtitle')}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sushi-border">
          {[
            {
              path: '/dashboard/orders',
              icon: Package,
              title: t('dashboard.ordersTitle'),
              meta:
                pendingOrdersCount > 0
                  ? `${pendingOrdersCount} ${t('dashboard.pendingApprovalCount')}`
                  : `${totalOrders} ${t('dashboard.ordersCountUnit')}`,
              highlight: pendingOrdersCount > 0,
            },
            {
              path: '/dashboard/products',
              icon: ForkKnife,
              title: t('dashboard.productsTitle'),
              meta: `${products.length} ${t('common.itemsCount')}`,
              highlight: false,
            },
            {
              path: '/dashboard/inventory',
              icon: CookingPot,
              title: t('dashboard.menuInventory'),
              meta: `${ingredients.length} ${t('common.itemsCount')}`,
              highlight: alerts.length > 0,
            },
            {
              path: '/dashboard/categories',
              icon: SquaresFour,
              title: t('dashboard.categoriesTitle'),
              meta: `${categories.length} ${t('dashboard.groupsCountUnit')}`,
              highlight: false,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => router.push(item.path)}
                className="bg-sushi-card hover:bg-sushi-surface/80 p-3.5 sm:p-4 text-left transition-colors cursor-pointer group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between w-full">
                  <Icon
                    size={16}
                    className="text-sushi-text-dim group-hover:text-sushi-text transition-colors"
                  />
                  <ArrowRight
                    size={13}
                    className="text-sushi-text-dim group-hover:text-white group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-sushi-text truncate">
                    {item.title}
                  </div>
                  <div
                    className={`text-2xs font-mono mt-0.5 truncate ${
                      item.highlight ? 'text-amber-400 font-medium' : 'text-sushi-text-dim'
                    }`}
                  >
                    {item.meta}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Catalog Snapshot (Flush Editorial Lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Categories */}
        <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-sushi-border flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sushi-text font-mono">
              {t('dashboard.recentCategoriesTitle')}
            </h3>
            <Link
              href="/dashboard/categories"
              className="text-2xs font-mono text-sushi-text-muted hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{t('dashboard.viewAllCategories')}</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="py-10 text-center text-xs text-sushi-text-dim">
              {t('common.uncategorized')}
            </div>
          ) : (
            <div className="divide-y divide-sushi-border/60">
              {categories.slice(0, 6).map((category, idx) => (
                <div
                  key={category.id}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-sushi-surface/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xs font-mono text-sushi-text-dim w-5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-sushi-text truncate">
                      {category.name}
                    </span>
                  </div>

                  <span className="text-2xs font-mono text-sushi-text-dim shrink-0">
                    {category._count?.products ?? 0} {t('common.itemsCount')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-sushi-border flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sushi-text font-mono">
              {t('dashboard.recentProductsTitle')}
            </h3>
            <Link
              href="/dashboard/products"
              className="text-2xs font-mono text-sushi-text-muted hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{t('dashboard.viewAllProducts')}</span>
              <ArrowRight size={11} />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="py-10 text-center text-xs text-sushi-text-dim">
              {t('dashboard.noProductsYet')}
            </div>
          ) : (
            <div className="divide-y divide-sushi-border/60">
              {products.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-sushi-surface/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-sushi-surface border border-sushi-border flex items-center justify-center shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <ForkKnife size={14} className="text-sushi-text-dim" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-sushi-text truncate">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-2xs text-sushi-text-dim font-mono">
                        <span>{product.sku}</span>
                        {product.category?.name && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[110px]">
                              {product.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold text-sushi-text shrink-0 ml-3">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
