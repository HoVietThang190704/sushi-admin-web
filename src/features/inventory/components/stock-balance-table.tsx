'use client';

import React from 'react';
import {
  Table,
  Typography,
  CookingPot,
  Plus,
  ArrowRight,
  Tooltip,
} from '@/components/ui';
import { Ingredient } from '../types';
import { useTranslation } from '@/lib/i18n';

const { Text } = Typography;

interface StockBalanceTableProps {
  ingredients: Ingredient[];
  loading?: boolean;
  onStockIn?: (ingredient: Ingredient) => void;
  onStockOut?: (ingredient: Ingredient) => void;
}

export function StockBalanceTable({
  ingredients,
  loading,
  onStockIn,
  onStockOut,
}: StockBalanceTableProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('dashboard.ingredientCode'),
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string) => (
        <span className="px-2.5 py-1 rounded-md bg-sushi-surface border border-sushi-border text-sushi-text-muted text-xs font-mono font-semibold">
          {code}
        </span>
      ),
    },
    {
      title: t('dashboard.ingredientName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div className="flex items-center space-x-3 py-1">
          <div className="w-8 h-8 rounded-xl bg-sushi-surface border border-sushi-border text-sushi-primary flex items-center justify-center shrink-0 shadow-sm">
            <CookingPot size={17} weight="fill" />
          </div>
          <Text strong className="text-sushi-text block text-sm font-sans truncate">
            {name}
          </Text>
        </div>
      ),
    },
    {
      title: t('dashboard.ingredientUnit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (unit: string) => (
        <span className="text-xs text-sushi-text-muted font-medium px-2 py-0.5 rounded bg-sushi-surface/80 border border-sushi-border/60">
          {unit}
        </span>
      ),
    },
    {
      title: t('dashboard.currentStock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 150,
      render: (stock: number, record: Ingredient) => {
        let colorClass = 'text-emerald-400';
        if (record.status === 'OUT_OF_STOCK') colorClass = 'text-red-400 font-extrabold';
        else if (record.status === 'LOW_STOCK') colorClass = 'text-amber-400 font-bold';

        return (
          <div className="flex items-baseline space-x-1.5 font-mono">
            <span className={`text-base ${colorClass}`}>{stock}</span>
            <span className="text-2xs text-sushi-text-dim">{record.unit}</span>
          </div>
        );
      },
    },
    {
      title: t('dashboard.minStock'),
      dataIndex: 'minStock',
      key: 'minStock',
      width: 140,
      render: (min: number, record: Ingredient) => (
        <span className="text-xs text-sushi-text-dim font-mono">
          {min} {record.unit}
        </span>
      ),
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 150,
      render: (_: unknown, record: Ingredient) => {
        if (record.status === 'OUT_OF_STOCK') {
          return (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 border border-red-500/35 text-red-400 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>{t('dashboard.alertOut')}</span>
            </span>
          );
        }

        if (record.status === 'LOW_STOCK') {
          return (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/35 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{t('dashboard.alertLow')}</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{t('dashboard.alertSafe')}</span>
          </span>
        );
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 130,
      align: 'right' as const,
      render: (_: unknown, record: Ingredient) => (
        <div className="flex items-center justify-end space-x-1.5">
          <Tooltip title={t('dashboard.quickStockIn')}>
            <button
              type="button"
              onClick={() => onStockIn?.(record)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer border border-emerald-500/20"
              aria-label={t('dashboard.quickStockIn')}
            >
              <Plus size={15} weight="bold" />
            </button>
          </Tooltip>

          <Tooltip title={t('dashboard.quickStockOut')}>
            <button
              type="button"
              onClick={() => onStockOut?.(record)}
              disabled={record.currentStock <= 0}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
                record.currentStock <= 0
                  ? 'opacity-40 cursor-not-allowed text-zinc-500 border-zinc-700'
                  : 'text-amber-400 hover:bg-amber-500/15 cursor-pointer border-amber-500/20'
              }`}
              aria-label={t('dashboard.quickStockOut')}
            >
              <ArrowRight size={15} weight="bold" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={ingredients}
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
              <CookingPot size={26} />
            </div>
            <p className="text-sm font-semibold text-sushi-text">
              {t('dashboard.noDataTitle')}
            </p>
            <p className="text-xs text-sushi-text-dim mt-1 max-w-sm leading-relaxed">
              {t('dashboard.noIngredientsDesc')}
            </p>
          </div>
        ),
      }}
    />
  );
}
