'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  SushiPageHeader,
  Tag,
  SquaresFour,
  ForkKnife,
  Package,
  Database,
  ArrowRight,
} from '@/components/ui';
import { useCategories, useProducts } from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

export default function DashboardOverviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const { formatCurrency } = useFormatCurrency();

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. Header Trang
         ========================================================================= */}
      <SushiPageHeader
        title={t('dashboard.overviewTitle')}
        subtitle={t('dashboard.overviewSubtitle')}
      />

      {/* =========================================================================
          2. KPI Metric Cards (Grid 4 cột cân xứng phong cách Bento)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Danh Mục Thực Đơn */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 hover:border-sushi-primary/40 transition-all duration-300 shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.totalCategories')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sushi-primary group-hover:scale-105 transition-transform">
              <SquaresFour size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {categories.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {categories.length} {t('common.itemsCount')}
            </span>
          </div>
        </div>

        {/* Metric 2: Tổng Số Món Ăn & Combo */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 hover:border-amber-500/40 transition-all duration-300 shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.totalProducts')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <ForkKnife size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {products.length}
            </span>
            <span className="text-2xs text-amber-400 font-mono">
              Active Catalog
            </span>
          </div>
        </div>

        {/* Metric 3: Đơn Hàng & Bếp (Take Away) */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 hover:border-blue-500/40 transition-all duration-300 shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.orderSystemStatus')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Package size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-bold text-blue-400 tracking-tight font-sans">
              Take Away
            </span>
            <span className="inline-flex items-center space-x-1 text-2xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{t('dashboard.readyStatus')}</span>
            </span>
          </div>
        </div>

        {/* Metric 4: Cơ Sở Dữ Liệu & Hạ Tầng */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 hover:border-emerald-500/40 transition-all duration-300 shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.infraStatus')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Database size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-400 tracking-tight font-sans truncate">
              {t('dashboard.databaseValue')}
            </span>
            <span className="inline-flex items-center space-x-1 text-2xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>PostgreSQL</span>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Lối Tắt Vận Hành (Action Hub Cards)
         ========================================================================= */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-sushi-text">
            {t('dashboard.actionHubTitle')}
          </h2>
          <p className="text-xs text-sushi-text-dim">
            {t('dashboard.actionHubSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Danh Mục Món */}
          <button
            type="button"
            onClick={() => router.push('/dashboard/categories')}
            className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 hover:border-sushi-primary/50 hover:bg-sushi-card-hover/90 transition-all duration-200 text-left cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sushi-surface border border-sushi-border flex items-center justify-center text-sushi-primary mb-3 shadow-inner">
                <SquaresFour size={20} />
              </div>
              <h3 className="text-sm font-bold text-sushi-text group-hover:text-sushi-primary transition-colors">
                {t('dashboard.manageCategoriesBtn')}
              </h3>
              <p className="text-xs text-sushi-text-dim mt-1.5 leading-relaxed">
                {t('dashboard.actionCategoriesDesc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sushi-border/50 flex items-center justify-between text-xs font-semibold text-sushi-text-muted group-hover:text-white transition-colors">
              <span>{t('dashboard.categoriesTitle')}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-sushi-primary" />
            </div>
          </button>

          {/* Action 2: Món Ăn & Combo */}
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 hover:border-amber-500/50 hover:bg-sushi-card-hover/90 transition-all duration-200 text-left cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sushi-surface border border-sushi-border flex items-center justify-center text-amber-500 mb-3 shadow-inner">
                <ForkKnife size={20} />
              </div>
              <h3 className="text-sm font-bold text-sushi-text group-hover:text-amber-400 transition-colors">
                {t('dashboard.productsTitle')}
              </h3>
              <p className="text-xs text-sushi-text-dim mt-1.5 leading-relaxed">
                {t('dashboard.actionProductsDesc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sushi-border/50 flex items-center justify-between text-xs font-semibold text-sushi-text-muted group-hover:text-white transition-colors">
              <span>{t('dashboard.menuProducts')}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-400" />
            </div>
          </button>

          {/* Action 3: Đơn Hàng & Bếp */}
          <button
            type="button"
            onClick={() => router.push('/dashboard/orders')}
            className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 hover:border-blue-500/50 hover:bg-sushi-card-hover/90 transition-all duration-200 text-left cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sushi-surface border border-sushi-border flex items-center justify-center text-blue-400 shadow-inner">
                  <Package size={20} />
                </div>
                <Tag color="cyan" className="font-mono text-2xs mr-0">
                  Take Away
                </Tag>
              </div>
              <h3 className="text-sm font-bold text-sushi-text group-hover:text-blue-400 transition-colors">
                {t('dashboard.ordersTitle')}
              </h3>
              <p className="text-xs text-sushi-text-dim mt-1.5 leading-relaxed">
                {t('dashboard.actionOrdersDesc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sushi-border/50 flex items-center justify-between text-xs font-semibold text-sushi-text-muted group-hover:text-white transition-colors">
              <span>{t('dashboard.orders')}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-blue-400" />
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. Chi Tiết Danh Mục & Món Ăn Mới Nhất (Lưới 2 Cột Cân Đối)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: Danh Mục Thực Đơn Hiện Có */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-sushi-border/70 mb-4">
              <div>
                <h3 className="text-sm font-bold text-sushi-text">
                  {t('dashboard.recentCategoriesTitle')}
                </h3>
                <p className="text-2xs text-sushi-text-dim mt-0.5">
                  {t('dashboard.recentCategoriesSubtitle')}
                </p>
              </div>

              <Link
                href="/dashboard/categories"
                className="text-xs text-sushi-primary hover:text-sushi-primary-hover font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>{t('dashboard.viewAllCategories')}</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-sushi-text-dim">
                {t('common.uncategorized')}
              </div>
            ) : (
              <div className="divide-y divide-sushi-border/50">
                {categories.slice(0, 5).map((category, idx) => (
                  <div
                    key={category.id}
                    className="py-3 flex items-center justify-between hover:bg-sushi-surface/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-sushi-surface border border-sushi-border flex items-center justify-center text-xs font-mono font-bold text-sushi-text-dim shrink-0">
                        0{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-sushi-text truncate">
                          {category.name}
                        </div>
                        <div className="text-2xs text-sushi-text-dim font-mono truncate">
                          ID: {category.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <Tag color="success" className="font-semibold text-2xs mr-0">
                        {t('common.active')}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cột 2: Món Ăn & Combo Mới Cập Nhật */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-sushi-border/70 mb-4">
              <div>
                <h3 className="text-sm font-bold text-sushi-text">
                  {t('dashboard.recentProductsTitle')}
                </h3>
                <p className="text-2xs text-sushi-text-dim mt-0.5">
                  {t('dashboard.recentProductsSubtitle')}
                </p>
              </div>

              <Link
                href="/dashboard/products"
                className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center space-x-1 transition-colors"
              >
                <span>{t('dashboard.viewAllProducts')}</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="py-12 text-center text-xs text-sushi-text-dim">
                {t('dashboard.noProductsYet')}
              </div>
            ) : (
              <div className="divide-y divide-sushi-border/50">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="py-2.5 flex items-center justify-between hover:bg-sushi-surface/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-sushi-surface border border-sushi-border flex items-center justify-center shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <ForkKnife size={18} className="text-sushi-text-dim" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-sushi-text truncate">
                          {product.name}
                        </div>
                        <div className="flex items-center space-x-2 text-2xs text-sushi-text-dim font-mono">
                          <span>{product.sku}</span>
                          {product.category?.name && (
                            <>
                              <span>·</span>
                              <span className="text-sushi-text-muted truncate max-w-[100px]">
                                {product.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-3">
                      <Tag
                        color={product.type === 'COMBO' ? 'gold' : 'blue'}
                        className="text-2xs font-mono font-semibold mr-0"
                      >
                        {product.type}
                      </Tag>
                      <span className="text-xs font-bold text-sushi-text font-sans">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
