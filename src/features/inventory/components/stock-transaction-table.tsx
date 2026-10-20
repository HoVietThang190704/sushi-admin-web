'use client';

import React from 'react';
import { Table, Tag, Typography, Receipt } from '@/components/ui';
import { InventoryTransaction } from '../types';
import { useTranslation } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

const { Text } = Typography;

interface StockTransactionTableProps {
  transactions: InventoryTransaction[];
  loading?: boolean;
}

export function StockTransactionTable({
  transactions,
  loading,
}: StockTransactionTableProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatCurrency();

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'PURCHASE':
        return t('dashboard.reasonPurchase');
      case 'KITCHEN_USAGE':
        return t('dashboard.reasonKitchenUsage');
      case 'DISCARD_WASTE':
        return t('dashboard.reasonDiscardWaste');
      case 'INITIAL_STOCK':
        return t('dashboard.reasonInitialStock');
      default:
        return t('dashboard.reasonAdjustment');
    }
  };

  const columns = [
    {
      title: t('dashboard.transactionCode'),
      dataIndex: 'code',
      key: 'code',
      width: 170,
      render: (code: string) => (
        <span className="px-2.5 py-1 rounded-md bg-sushi-surface border border-sushi-border text-sushi-text-muted text-xs font-mono font-semibold">
          {code}
        </span>
      ),
    },
    {
      title: t('dashboard.transactionType'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag
          color={type === 'IN' ? 'success' : 'warning'}
          className="text-2xs font-mono font-semibold"
        >
          {type === 'IN' ? t('dashboard.stockIn') : t('dashboard.stockOut')}
        </Tag>
      ),
    },
    {
      title: t('dashboard.ingredientName'),
      key: 'ingredient',
      render: (_: unknown, record: InventoryTransaction) => (
        <div>
          <Text strong className="text-sushi-text block text-sm font-sans">
            {record.ingredient?.name || 'N/A'}
          </Text>
          <span className="text-2xs text-sushi-text-dim font-mono">
            {record.ingredient?.code}
          </span>
        </div>
      ),
    },
    {
      title: t('dashboard.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      render: (qty: number, record: InventoryTransaction) => (
        <span
          className={`font-mono text-sm font-bold ${
            record.type === 'IN' ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {record.type === 'IN' ? '+' : '-'}
          {qty} {record.ingredient?.unit}
        </span>
      ),
    },
    {
      title: t('dashboard.totalAmount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      render: (amount: number) => (
        <span className="text-sushi-text font-bold font-mono text-xs">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: t('dashboard.reason'),
      dataIndex: 'reason',
      key: 'reason',
      width: 170,
      render: (reason: string) => (
        <span className="text-xs text-sushi-text-muted font-medium">
          {getReasonLabel(reason)}
        </span>
      ),
    },
    {
      title: t('dashboard.transactionDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (dateStr: string) => {
        const date = new Date(dateStr);
        return (
          <span className="text-2xs text-sushi-text-dim font-mono">
            {date.toLocaleString()}
          </span>
        );
      },
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={transactions}
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
              <Receipt size={26} />
            </div>
            <p className="text-sm font-semibold text-sushi-text">
              {t('dashboard.noDataTitle')}
            </p>
            <p className="text-xs text-sushi-text-dim mt-1 max-w-sm leading-relaxed">
              {t('dashboard.noTransactionsDesc')}
            </p>
          </div>
        ),
      }}
    />
  );
}
