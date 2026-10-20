'use client';

import React from 'react';
import Image from 'next/image';
import {
  Table,
  Tag,
  Typography,
  ForkKnife,
  PencilSimple,
  Trash,
  Tooltip,
} from '@/components/ui';
import { Product } from '../types';
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

  const columns = [
    {
      title: t('dashboard.productTableImage'),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 76,
      render: (url: string | null | undefined, record: Product) => (
        <div className="w-11 h-11 rounded-xl overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0 shadow-sm">
          {url ? (
            <Image
              src={url}
              alt={record.name}
              width={44}
              height={44}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <ForkKnife size={20} className="text-sushi-text-dim" />
          )}
        </div>
      ),
    },
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
        <Tag
          color={type === 'COMBO' ? 'gold' : 'blue'}
          className="text-2xs font-mono font-semibold"
        >
          {type}
        </Tag>
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
      width: 110,
      align: 'right' as const,
      render: (_: unknown, record: Product) => (
        <div className="flex items-center justify-end space-x-1">
          <Tooltip title={t('dashboard.edit')}>
            <button
              type="button"
              onClick={() => onEdit?.(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-card-hover transition-colors cursor-pointer border border-transparent hover:border-sushi-border"
              aria-label={t('dashboard.edit')}
            >
              <PencilSimple size={16} />
            </button>
          </Tooltip>

          <Tooltip title={t('dashboard.delete')}>
            <button
              type="button"
              onClick={() => onDelete?.(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
              aria-label={t('dashboard.delete')}
            >
              <Trash size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={products}
      columns={columns}
      rowKey="id"
      pagination={{
        pageSize: 8,
        showSizeChanger: false,
        className: 'py-3 px-4',
      }}
      scroll={{ x: 'max-content' }}
      className="border border-sushi-border rounded-2xl overflow-hidden shadow-sm"
      locale={{
        emptyText: (
          <div className="py-14 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-sushi-surface border border-sushi-border flex items-center justify-center text-sushi-text-dim mb-3 shadow-inner">
              <ForkKnife size={26} />
            </div>
            <p className="text-sm font-semibold text-sushi-text">
              {t('dashboard.noDataTitle')}
            </p>
            <p className="text-xs text-sushi-text-dim mt-1 max-w-sm leading-relaxed">
              {t('dashboard.noProductsDesc')}
            </p>
          </div>
        ),
      }}
    />
  );
}
