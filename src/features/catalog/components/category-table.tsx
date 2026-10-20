'use client';

import React from 'react';
import {
  Table,
  Tag,
  Typography,
  SquaresFour,
  PencilSimple,
  Trash,
  Copy,
  Tooltip,
  message,
} from '@/components/ui';
import { Category } from '../types';
import { useTranslation } from '@/lib/i18n';

const { Text } = Typography;

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function CategoryTable({ categories, loading, onEdit, onDelete }: CategoryTableProps) {
  const { t } = useTranslation();

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    message.success(`${t('dashboard.copied')}: ${id.slice(0, 8)}...`);
  };

  const columns = [
    {
      title: t('dashboard.categoryTableName'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <div className="flex items-center space-x-3 py-1">
          <div className="w-9 h-9 rounded-xl bg-sushi-surface border border-sushi-border text-sushi-primary flex items-center justify-center shrink-0 shadow-sm">
            <SquaresFour size={18} weight="fill" />
          </div>
          <div className="min-w-0">
            <Text strong className="text-sushi-text block text-sm font-sans">
              {text}
            </Text>
            <div className="flex items-center space-x-1.5 text-2xs text-sushi-text-dim font-mono mt-0.5">
              <span>ID: {record.id.slice(0, 8)}...</span>
              <Tooltip title={t('dashboard.copied')}>
                <button
                  type="button"
                  onClick={(e) => handleCopyId(record.id, e)}
                  className="hover:text-sushi-text transition-colors p-0.5 cursor-pointer"
                  aria-label="Copy UUID"
                >
                  <Copy size={12} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t('dashboard.categoryTableCount'),
      key: 'productsCount',
      width: 160,
      render: (_: unknown, record: Category) => {
        const count = record._count?.products || 0;
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold font-mono bg-blue-500/10 border border-blue-500/25 text-blue-400">
            {count} {t('common.itemsCount')}
          </span>
        );
      },
    },
    {
      title: t('dashboard.categoryTableStatus'),
      key: 'status',
      width: 170,
      render: () => (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{t('common.active')}</span>
        </span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, record: Category) => (
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
      dataSource={categories}
      columns={columns}
      rowKey="id"
      pagination={{
        pageSize: 8,
        showSizeChanger: false,
        className: 'py-3 px-4',
      }}
      expandable={{
        childrenColumnName: 'none', // Tắt hoàn toàn icon (+) mở rộng cây thừa thãi
      }}
      scroll={{ x: 'max-content' }}
      className="border border-sushi-border rounded-2xl overflow-hidden shadow-sm"
      locale={{
        emptyText: (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-sushi-surface border border-sushi-border flex items-center justify-center text-sushi-text-dim mb-3">
              <SquaresFour size={24} />
            </div>
            <p className="text-sm font-semibold text-sushi-text">
              {t('dashboard.noDataTitle')}
            </p>
            <p className="text-xs text-sushi-text-dim mt-1 max-w-sm">
              {t('dashboard.noCategoriesDesc')}
            </p>
          </div>
        ),
      }}
    />
  );
}
