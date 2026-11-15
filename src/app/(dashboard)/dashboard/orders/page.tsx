'use client';

import React, { useState, useMemo } from 'react';
import {
  SushiPageHeader,
  SushiButton,
  SushiFloatingButton,
  Button,
  Input,
  Tabs,
  Plus,
} from '@/components/ui';
import {
  ArrowsClockwise,
  MagnifyingGlass,
  Receipt,
  CookingPot,
  Package,
  CheckCircle,
  WarningCircle,
  List as ListIcon,
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

  // Tính số lượng đơn theo từng trạng thái để hiển thị count trên Tabs
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

  // Lọc theo từ khóa tìm kiếm (mã đơn, tên, sđt)
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

  const tabItems = [
    {
      key: 'ALL',
      label: (
        <span className="flex items-center gap-1.5">
          <ListIcon size={16} />
          {t('ordersPage.tabAll')} {counts.ALL > 0 && `(${counts.ALL})`}
        </span>
      ),
    },
    {
      key: 'PENDING',
      label: (
        <span className="flex items-center gap-1.5 text-amber-400">
          <Receipt size={16} />
          {t('ordersPage.tabPending')} {counts.PENDING > 0 && `(${counts.PENDING})`}
        </span>
      ),
    },
    {
      key: 'CONFIRMED',
      label: (
        <span className="flex items-center gap-1.5 text-blue-400">
          <CheckCircle size={16} />
          {t('ordersPage.tabConfirmed')} {counts.CONFIRMED > 0 && `(${counts.CONFIRMED})`}
        </span>
      ),
    },
    {
      key: 'PREPARING',
      label: (
        <span className="flex items-center gap-1.5 text-orange-400">
          <CookingPot size={16} />
          {t('ordersPage.tabPreparing')} {counts.PREPARING > 0 && `(${counts.PREPARING})`}
        </span>
      ),
    },
    {
      key: 'READY_FOR_PICKUP',
      label: (
        <span className="flex items-center gap-1.5 text-purple-400">
          <Package size={16} />
          {t('ordersPage.tabReady')} {counts.READY_FOR_PICKUP > 0 && `(${counts.READY_FOR_PICKUP})`}
        </span>
      ),
    },
    {
      key: 'COMPLETED',
      label: (
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle size={16} />
          {t('ordersPage.tabCompleted')} {counts.COMPLETED > 0 && `(${counts.COMPLETED})`}
        </span>
      ),
    },
    {
      key: 'CANCELLED',
      label: (
        <span className="flex items-center gap-1.5 text-rose-400">
          <WarningCircle size={16} />
          {t('ordersPage.tabCancelled')} {counts.CANCELLED > 0 && `(${counts.CANCELLED})`}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SushiPageHeader
        title={t('ordersPage.title')}
        subtitle={t('ordersPage.subtitle')}
        extra={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-64 min-w-0">
              <Input
                placeholder={t('ordersPage.searchPlaceholder')}
                prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1 shrink-0" />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                className="w-full h-10 rounded-xl !bg-sushi-surface !border-sushi-border"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                title={t('ordersPage.filterDate')}
                aria-label={t('ordersPage.filterDate')}
                className={`relative h-10 w-10 sm:w-auto sm:px-3.5 rounded-xl border text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1.5 shrink-0 transition-all duration-200 cursor-pointer ${
                  hasDateFilter
                    ? 'border-sushi-gold/60 bg-sushi-gold/10 text-sushi-gold hover:bg-sushi-gold/15'
                    : 'border-sushi-border bg-sushi-surface text-sushi-text-muted hover:text-white hover:border-sushi-text-dim/50 hover:bg-sushi-card-hover'
                }`}
              >
                <Funnel
                  size={17}
                  weight={hasDateFilter ? 'fill' : 'regular'}
                  className={hasDateFilter ? 'text-sushi-gold shrink-0' : 'shrink-0'}
                />
                <span className="hidden sm:inline">{t('ordersPage.filterDate')}</span>
                {hasDateFilter && (
                  <span className="w-2 h-2 rounded-full bg-sushi-gold absolute top-1.5 right-1.5 sm:static sm:w-1.5 sm:h-1.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title={t('ordersPage.refresh')}
                aria-label={t('ordersPage.refresh')}
                className="h-10 w-10 sm:w-auto sm:px-3.5 rounded-xl border border-sushi-border bg-sushi-surface text-sushi-text-muted hover:text-white hover:border-sushi-text-dim/50 hover:bg-sushi-card-hover text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1.5 shrink-0 transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                <ArrowsClockwise
                  size={17}
                  className={`shrink-0 ${isFetching ? 'animate-spin text-sushi-primary' : ''}`}
                />
                <span className="hidden sm:inline">{t('ordersPage.refresh')}</span>
              </button>

              <SushiButton
                type="primary"
                icon={<PhoneCall size={16} weight="fill" />}
                onClick={() => setIsCreateStaffOrderModalOpen(true)}
                className="!hidden md:!inline-flex h-10 rounded-xl px-4 text-sm font-semibold items-center justify-center shrink-0"
              >
                {t('ordersPage.createOrderBtn')}
              </SushiButton>
            </div>
          </div>
        }
      />

      {/* Thanh thông báo bộ lọc ngày đang kích hoạt */}
      {hasDateFilter && (
        <div className="flex items-center gap-2 text-xs bg-sushi-gold/10 text-sushi-gold border border-sushi-gold/30 px-3 py-1.5 rounded-xl w-fit">
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
            className="hover:text-white p-0.5 cursor-pointer ml-1 inline-flex items-center"
            title={t('ordersPage.clearDateFilter')}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="bg-sushi-card border border-sushi-border rounded-xl p-2.5 sm:p-4 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setPage(1);
          }}
          items={tabItems}
          className="border-b-0 overflow-x-auto"
        />
        <OrderTable orders={filteredOrders} isLoading={isLoading} />

        {totalOrders > 0 && (
          <div className="mt-4 pt-3 border-t border-sushi-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sushi-text-muted">
            <span>
              {t('ordersPage.showingSummary')} {orders.length} / {totalOrders} {t('ordersPage.ordersUnit')} ({t('ordersPage.pageLabel')} {page}/{totalPages})
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="small"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                {t('ordersPage.prevPage')}
              </Button>
              <Button
                size="small"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
        onApply={(filter) => {
          setFilterDateRange(filter);
          setPage(1);
        }}
        onReset={() => {
          setFilterDateRange({});
          setPage(1);
        }}
      />

      <CreateStaffOrderModal
        open={isCreateStaffOrderModalOpen}
        onCancel={() => setIsCreateStaffOrderModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <SushiFloatingButton
        onClick={() => setIsCreateStaffOrderModalOpen(true)}
        label="Đơn mới"
        ariaLabel="Tạo đơn qua điện thoại"
        icon={
          <span className="flex items-center">
            <PhoneCall size={18} weight="fill" />
          </span>
        }
      />
    </div>
  );
}
