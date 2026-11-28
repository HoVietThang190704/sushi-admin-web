'use client';

import React, { useState, useMemo } from 'react';
import {
  SushiPageHeader,
  SushiButton,
  SushiFloatingButton,
  Button,
  Input,
  Tabs,
} from '@/components/ui';
import {
  ArrowsClockwise,
  MagnifyingGlass,
  Funnel,
  X,
  PhoneCall,
} from '@phosphor-icons/react';
import dayjs from 'dayjs';
import {
  useOrders,
  OrderTable,
  OrderStatus,
  OrderDateFilterDrawer,
  CreateStaffOrderModal,
} from '@/features/orders';
import { useTranslation } from '@/lib/i18n';

export default function OrdersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [page, setPage] = useState<number>(1);
  const limit = 50;
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isCreateStaffOrderModalOpen, setIsCreateStaffOrderModalOpen] = useState(false);

  const filterStatus = activeTab === 'ALL' ? undefined : (activeTab as OrderStatus);
  const hasDateFilter = Boolean(
    filterDateRange.startDate || filterDateRange.endDate,
  );

  const queryFilter = useMemo(
    () => ({
      status: filterStatus,
      startDate: filterDateRange.startDate,
      endDate: filterDateRange.endDate,
      page,
      limit,
    }),
    [filterStatus, filterDateRange, page, limit],
  );

  const { data: ordersPage, isLoading, refetch, isFetching } = useOrders(queryFilter);
  const orders = useMemo(() => ordersPage?.items ?? [], [ordersPage]);
  const totalOrders = ordersPage?.total ?? orders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / limit));

  const counts = useMemo(() => {
    const res: Record<string, number> = {
      ALL: activeTab === 'ALL' ? totalOrders : orders.length,
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY_FOR_PICKUP: 0,
      DELIVERING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      if (res[o.status] !== undefined) {
        res[o.status]++;
      }
    });
    return res;
  }, [orders, activeTab, totalOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchKeyword.trim()) return orders;
    const kw = searchKeyword.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.code.toLowerCase().includes(kw) ||
        o.customerName.toLowerCase().includes(kw) ||
        o.customerPhone.includes(kw),
    );
  }, [orders, searchKeyword]);

  const renderTabLabel = (label: string, count: number, isPending = false) => (
    <span className="inline-flex items-center gap-1.5 text-xs">
      {isPending && count > 0 && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      )}
      <span>{label}</span>
      {count > 0 && (
        <span className="px-1.5 py-0.2 rounded bg-sushi-surface border border-sushi-border text-3xs font-mono text-sushi-text-muted">
          {count}
        </span>
      )}
    </span>
  );

  const tabItems = [
    {
      key: 'ALL',
      label: renderTabLabel(t('ordersPage.tabAll'), counts.ALL),
    },
    {
      key: 'PENDING',
      label: renderTabLabel(t('ordersPage.tabPending'), counts.PENDING, true),
    },
    {
      key: 'CONFIRMED',
      label: renderTabLabel(t('ordersPage.tabConfirmed'), counts.CONFIRMED),
    },
    {
      key: 'PREPARING',
      label: renderTabLabel(t('ordersPage.tabPreparing'), counts.PREPARING),
    },
    {
      key: 'READY_FOR_PICKUP',
      label: renderTabLabel(t('ordersPage.tabReady'), counts.READY_FOR_PICKUP),
    },
    {
      key: 'COMPLETED',
      label: renderTabLabel(t('ordersPage.tabCompleted'), counts.COMPLETED),
    },
    {
      key: 'CANCELLED',
      label: renderTabLabel(t('ordersPage.tabCancelled'), counts.CANCELLED),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('ordersPage.title')}
          subtitle={t('ordersPage.subtitle')}
          extra={
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:w-64 min-w-0">
                <Input
                  placeholder={t('ordersPage.searchPlaceholder')}
                  prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim mr-1 shrink-0" />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  allowClear
                  className="w-full h-9 rounded-lg !bg-sushi-surface !border-sushi-border text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  title={t('ordersPage.filterDate')}
                  aria-label={t('ordersPage.filterDate')}
                  className={`relative h-9 w-9 sm:w-auto sm:px-3 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                    hasDateFilter
                      ? 'border-sushi-text/40 bg-sushi-surface text-white'
                      : 'border-sushi-border bg-sushi-card text-sushi-text-muted hover:text-white hover:bg-sushi-surface'
                  }`}
                >
                  <Funnel
                    size={15}
                    weight={hasDateFilter ? 'fill' : 'regular'}
                    className="shrink-0"
                  />
                  <span className="hidden sm:inline">{t('ordersPage.filterDate')}</span>
                  {hasDateFilter && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sushi-primary absolute top-1.5 right-1.5 sm:static" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  title={t('ordersPage.refresh')}
                  aria-label={t('ordersPage.refresh')}
                  className="h-9 w-9 sm:w-auto sm:px-3 rounded-lg border border-sushi-border bg-sushi-card text-sushi-text-muted hover:text-white hover:bg-sushi-surface text-xs font-medium inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <ArrowsClockwise
                    size={15}
                    className={`shrink-0 ${isFetching ? 'animate-spin' : ''}`}
                  />
                  <span className="hidden sm:inline">{t('ordersPage.refresh')}</span>
                </button>

                <SushiButton
                  type="primary"
                  icon={<PhoneCall size={15} weight="fill" />}
                  onClick={() => setIsCreateStaffOrderModalOpen(true)}
                  className="!hidden md:!inline-flex h-9 rounded-lg px-3.5 text-xs font-semibold items-center justify-center shrink-0"
                >
                  {t('ordersPage.createOrderBtn')}
                </SushiButton>
              </div>
            </div>
          }
        />
      </div>

      {hasDateFilter && (
        <div className="flex items-center gap-2 text-2xs font-mono bg-sushi-surface text-sushi-text border border-sushi-border px-3 py-1.5 rounded-lg w-fit">
          <span>
            {t('ordersPage.filterDate')}:{' '}
            {filterDateRange.startDate
              ? dayjs(filterDateRange.startDate).format('DD/MM/YYYY')
              : '...'}
            {' → '}
            {filterDateRange.endDate
              ? dayjs(filterDateRange.endDate).format('DD/MM/YYYY')
              : '...'}
          </span>
          <button
            type="button"
            onClick={() => {
              setFilterDateRange({});
              setPage(1);
            }}
            className="hover:text-white p-0.5 rounded cursor-pointer text-sushi-text-dim"
            title={t('ordersPage.clearDateFilter')}
          >
            <X size={13} weight="bold" />
          </button>
        </div>
      )}

      <div className="bg-sushi-card border border-sushi-border rounded-xl p-3 sm:p-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1);
          }}
          items={tabItems}
          className="mb-2"
        />

        <OrderTable orders={filteredOrders} isLoading={isLoading} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-sushi-border text-xs text-sushi-text-muted">
            <span className="font-mono text-2xs">
              {t('ordersPage.pageLabel')} {page}/{totalPages} ({totalOrders}{' '}
              {t('ordersPage.ordersUnit')})
            </span>
            <div className="flex gap-1.5">
              <Button
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('ordersPage.prevPage')}
              </Button>
              <Button
                size="small"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t('ordersPage.nextPage')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <OrderDateFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        startDate={filterDateRange.startDate}
        endDate={filterDateRange.endDate}
        onApply={(range) => {
          setFilterDateRange(range);
          setPage(1);
        }}
        onReset={() => {
          setFilterDateRange({});
          setPage(1);
        }}
      />

      <SushiFloatingButton
        onClick={() => setIsCreateStaffOrderModalOpen(true)}
        ariaLabel={t('ordersPage.createOrderBtn')}
      />

      <CreateStaffOrderModal
        open={isCreateStaffOrderModalOpen}
        onCancel={() => setIsCreateStaffOrderModalOpen(false)}
      />
    </div>
  );
}
