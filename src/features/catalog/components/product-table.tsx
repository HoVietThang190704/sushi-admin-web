'use client';

import { Table, Tag, Space, Typography } from '@/components/ui';
import { Product } from '../types';
import { useTranslation } from '@/lib/i18n';
import Image from 'next/image';

const { Text } = Typography;

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
}

export function ProductTable({ products, loading }: ProductTableProps) {
  const { t } = useTranslation();

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const columns = [
    {
      title: t('dashboard.productTableImage'),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url: string | null | undefined, record: Product) => (
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-sushi-border bg-sushi-surface flex items-center justify-center shrink-0 shadow-sm">
          {url ? (
            <Image
              src={url}
              alt={record.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-xl">🍣</span>
          )}
        </div>
      ),
    },
    {
      title: t('dashboard.productTableSku'),
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
      render: (sku: string) => (
        <span className="px-2.5 py-1 rounded-md bg-sushi-surface border border-sushi-border text-sushi-text-muted text-xs font-mono">
          {sku}
        </span>
      ),
    },
    {
      title: t('dashboard.productTableName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <div>
          <Text strong className="text-sushi-text block">
            {name}
          </Text>
          {record.barcode && (
            <span className="text-2xs text-sushi-text-dim font-mono">
              Barcode: {record.barcode}
            </span>
          )}
        </div>
      ),
    },
    {
      title: t('dashboard.productTableCategory'),
      key: 'category',
      render: (_: unknown, record: Product) => (
        <Tag color="cyan">
          {record.category?.name || 'Chưa phân loại'}
        </Tag>
      ),
    },
    {
      title: t('dashboard.productTableType'),
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => (
        <Tag color={type === 'COMBO' ? 'purple' : 'blue'}>
          {type}
        </Tag>
      ),
    },
    {
      title: t('dashboard.productTablePrice'),
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 150,
      render: (price: number | string) => (
        <Text strong className="text-sushi-primary font-mono text-sm">
          {formatPrice(price)}
        </Text>
      ),
    },
    {
      title: t('dashboard.productTableStatus'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? t('common.active') : 'Tạm ngừng'}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={products}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 8 }}
      className="border border-sushi-border rounded-2xl overflow-hidden"
    />
  );
}
