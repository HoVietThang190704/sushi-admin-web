'use client';

import React, { useState } from 'react';
import {
  Table,
  Typography,
  ForkKnife,
  Eye,
  PencilSimple,
  Trash,
  Tooltip,
  SushiMobileCardList,
  SushiCardItem,
  SushiCardActions,
  SushiEmptyState,
} from '@/components/ui';
import { Product } from '../types';
import { ProductDetailModal } from './product-detail-modal';
import { useTranslation } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

const { Text } = Typography;

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatCurrency();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const columns = [
    {
      title: t('dashboard.productTableName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <div className="py-1">
          <Text strong className="text-sushi-text block text-sm font-sans">
            {name}
          </Text>
          <div className="flex items-center space-x-2 text-2xs text-sushi-text-dim font-mono mt-0.5">
            <span>SKU: {record.sku}</span>
            {record.barcode && (
              <>
                <span>·</span>
                <span>Barcode: {record.barcode}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('dashboard.productTableCategory'),
      key: 'category',
      width: 170,
      render: (_: unknown, record: Product) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-sushi-surface border border-sushi-border text-sushi-text-muted">
          {record.category?.name || t('common.uncategorized')}
        </span>
      ),
    },
    {
      title: t('dashboard.productTableType'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-2xs font-mono font-semibold border ${
            type === 'COMBO'
              ? 'bg-sushi-gold/15 text-sushi-gold border-sushi-gold/30'
              : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
          }`}
        >
          {type}
        </span>
      ),
    },
    {
      title: t('dashboard.productTablePrice'),
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 140,
      render: (price: number | string) => (
        <span className="text-sushi-text font-bold font-sans text-sm">
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: t('dashboard.productTableStatus'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isActive
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-emerald-500' : 'bg-zinc-500'
            }`}
          />
          <span>{isActive ? t('common.active') : t('common.inactive')}</span>
        </span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 140,
      align: 'right' as const,
      render: (_: unknown, record: Product) => (
        <div
          className="flex items-center justify-end space-x-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={t('ordersPage.detailBtn')}>
            <button
              type="button"
              onClick={() => setSelectedProduct(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-sushi-gold hover:bg-sushi-gold/10 transition-colors cursor-pointer border border-transparent hover:border-sushi-gold/30"
              aria-label={t('ordersPage.detailBtn')}
            >
              <Eye size={16} />
            </button>
          </Tooltip>

          {onEdit && (
            <Tooltip title={t('dashboard.edit')}>
              <button
                type="button"
                onClick={() => onEdit(record)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-card-hover transition-colors cursor-pointer border border-transparent hover:border-sushi-border"
                aria-label={t('dashboard.edit')}
              >
                <PencilSimple size={16} />
              </button>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip title={t('dashboard.delete')}>
              <button
                type="button"
                onClick={() => onDelete(record)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
                aria-label={t('dashboard.delete')}
              >
                <Trash size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 1. Giao diện Mobile Card List (< md) */}
      <SushiMobileCardList
        items={products}
        pageSize={8}
        loading={loading}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<ForkKnife size={26} />}
            title={t('dashboard.noDataTitle')}
            description={t('dashboard.noProductsDesc')}
          />
        }
        renderItem={(product) => (
          <SushiCardItem className="cursor-pointer hover:border-sushi-gold/50 transition-all active:scale-[0.99]">
            <div onClick={() => setSelectedProduct(product)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-sm font-bold text-sushi-text truncate leading-snug">
                    {product.name}
                  </h4>
                  <div className="text-2xs text-sushi-text-muted truncate">
                    {product.category?.name || t('common.uncategorized')}
                  </div>
                  <div className="text-2xs text-sushi-text-dim font-mono truncate">
                    SKU: {product.sku}
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-sushi-gold hover:bg-sushi-gold/10 transition-colors border border-sushi-border/60 cursor-pointer"
                    aria-label={t('ordersPage.detailBtn')}
                    title={t('ordersPage.detailBtn')}
                  >
                    <Eye size={14} />
                  </button>
                  <SushiCardActions
                    onEdit={onEdit ? () => onEdit(product) : undefined}
                    onDelete={onDelete ? () => onDelete(product) : undefined}
                    editLabel={t('dashboard.edit')}
                    deleteLabel={t('dashboard.delete')}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-3xs font-mono font-semibold border ${
                      product.type === 'COMBO'
                        ? 'bg-sushi-gold/15 text-sushi-gold border-sushi-gold/30'
                        : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    {product.type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-medium border ${
                      product.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-zinc-500/10 border-zinc-500/25 text-zinc-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        product.isActive ? 'bg-emerald-500' : 'bg-zinc-500'
                      }`}
                    />
                    <span>{product.isActive ? t('common.active') : t('common.inactive')}</span>
                  </span>
                </div>

                <span className="text-sm font-bold text-sushi-gold font-mono shrink-0">
                  {formatCurrency(product.sellingPrice)}
                </span>
              </div>
            </div>
          </SushiCardItem>
        )}
      />

      {/* 2. Giao diện Desktop Table (>= md) */}
      <div className="hidden md:block">
        <Table
          loading={loading}
          dataSource={products}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => setSelectedProduct(record),
            className: 'cursor-pointer hover:bg-zinc-900/60 transition-colors',
          })}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '16', '32'],
            className: 'py-3 px-4',
          }}
          scroll={{ x: 'max-content' }}
          className="border border-sushi-border rounded-2xl overflow-hidden shadow-sm"
          locale={{
            emptyText: (
              <SushiEmptyState
                icon={<ForkKnife size={26} />}
                title={t('dashboard.noDataTitle')}
                description={t('dashboard.noProductsDesc')}
              />
            ),
          }}
        />
      </div>

      {/* 3. Modal / Bottom Sheet Chi tiết món ăn */}
      <ProductDetailModal
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onEdit={onEdit}
      />
    </>
  );
}
