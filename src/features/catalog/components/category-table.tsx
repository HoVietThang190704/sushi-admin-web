'use client';

import { Table, Tag, Space, Typography, SquaresFour } from '@/components/ui';
import { Category } from '../types';
import { useTranslation } from '@/lib/i18n';

const { Text } = Typography;

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
}

export function CategoryTable({ categories, loading }: CategoryTableProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('dashboard.categoryTableName'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <span className="w-7 h-7 rounded-lg bg-sushi-surface border border-sushi-border text-sushi-primary flex items-center justify-center shrink-0 shadow-sm">
            <SquaresFour size={15} />
          </span>
          <Text strong className="text-sushi-text">
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: t('dashboard.categoryTableId'),
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Text copyable className="text-sushi-text-dim text-xs font-mono">
          {id}
        </Text>
      ),
    },
    {
      title: t('dashboard.categoryTableCount'),
      key: 'productsCount',
      render: (_: unknown, record: Category) => (
        <Tag color="cyan">
          {record._count?.products || 0} {t('common.itemsCount')}
        </Tag>
      ),
    },
    {
      title: t('dashboard.categoryTableStatus'),
      key: 'status',
      render: () => <Tag color="success">{t('common.active')}</Tag>,
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={categories}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 8 }}
      className="border border-sushi-border rounded-xl overflow-hidden"
    />
  );
}
