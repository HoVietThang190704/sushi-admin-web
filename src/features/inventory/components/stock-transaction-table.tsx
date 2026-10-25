'use client';

import React from 'react';
import {
  Table,
  Tag,
  Typography,
  Receipt,
  Plus,
  ArrowRight,
  SushiMobileCardList,
  SushiCardItem,
  SushiEmptyState,
} from '@/components/ui';
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
    <>
      {/* 1. Giao diện Mobile Card List (< md) */}
      <SushiMobileCardList
        items={transactions}
        loading={loading}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<Receipt size={24} />}
            title={t('dashboard.noDataTitle')}
            description={t('dashboard.noTransactionsDesc')}
          />
        }
        renderItem={(tx) => {
          const isStockIn = tx.type === 'IN';
          const date = new Date(tx.createdAt);

          return (
            <SushiCardItem>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      isStockIn
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    }`}
                  >
                    {isStockIn ? (
                      <Plus size={16} weight="bold" />
                    ) : (
                      <ArrowRight size={16} weight="bold" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-sushi-text truncate">
                      {tx.ingredient?.name || 'N/A'}
                    </h4>
                    <div className="text-2xs text-sushi-text-dim font-mono">
                      {tx.ingredient?.code} · {getReasonLabel(tx.reason)}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono text-sm font-bold ${
                      isStockIn ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isStockIn ? '+' : '-'}
                    {tx.quantity} {tx.ingredient?.unit}
                  </div>
                  <div className="text-2xs text-sushi-text font-mono font-medium">
                    {formatCurrency(tx.totalAmount)}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-sushi-border/60 flex items-center justify-between text-3xs text-sushi-text-dim font-mono">
                <span>Mã: {tx.id.slice(0, 8)}...</span>
                <span>
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </SushiCardItem>
          );
        }}
      />

      {/* 2. Giao diện Desktop Table (>= md) */}
      <div className="hidden md:block">
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
              <SushiEmptyState
                icon={<Receipt size={26} />}
                title={t('dashboard.noDataTitle')}
                description={t('dashboard.noTransactionsDesc')}
              />
            ),
          }}
        />
      </div>
    </>
  );
}
