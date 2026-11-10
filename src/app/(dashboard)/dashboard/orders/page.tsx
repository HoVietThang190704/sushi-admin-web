'use client';

import React, { useState, useMemo } from 'react';
import {
  SushiPageHeader,
  Button,
  Input,
  Tabs,
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
} from '@phosphor-icons/react';
import dayjs from 'dayjs';
import {
  useOrders,
  OrderTable,
  OrderStatus,
  OrderDateFilterDrawer,
} from '@/features/orders';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const filterStatus = activeTab === 'ALL' ? undefined : (activeTab as OrderStatus);
  const hasDateFilter = Boolean(
    filterDateRange.startDate || filterDateRange.endDate,
  );

  const queryFilter = useMemo(
    () => ({
      status: filterStatus,
      startDate: filterDateRange.startDate,
      endDate: filterDateRange.endDate,
    }),
    [filterStatus, filterDateRange],
  );

  const { data: orders = [], isLoading, refetch, isFetching } = useOrders(queryFilter);

  // Tính số lượng đơn theo từng trạng thái để hiển thị count trên Tabs
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      ALL: orders.length,
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
  }, [orders]);

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
          Tất cả {counts.ALL > 0 && `(${counts.ALL})`}
        </span>
      ),
    },
    {
      key: 'PENDING',
      label: (
        <span className="flex items-center gap-1.5 text-amber-400">
          <Receipt size={16} />
          Chờ xác nhận {counts.PENDING > 0 && `(${counts.PENDING})`}
        </span>
      ),
    },
    {
      key: 'CONFIRMED',
      label: (
        <span className="flex items-center gap-1.5 text-blue-400">
          <CheckCircle size={16} />
          Đã nhận {counts.CONFIRMED > 0 && `(${counts.CONFIRMED})`}
        </span>
      ),
    },
    {
      key: 'PREPARING',
      label: (
        <span className="flex items-center gap-1.5 text-orange-400">
          <CookingPot size={16} />
          Đang làm món {counts.PREPARING > 0 && `(${counts.PREPARING})`}
        </span>
      ),
    },
    {
      key: 'READY_FOR_PICKUP',
      label: (
        <span className="flex items-center gap-1.5 text-purple-400">
          <Package size={16} />
          Chờ lấy {counts.READY_FOR_PICKUP > 0 && `(${counts.READY_FOR_PICKUP})`}
        </span>
      ),
    },
    {
      key: 'COMPLETED',
      label: (
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle size={16} />
          Đã xong {counts.COMPLETED > 0 && `(${counts.COMPLETED})`}
        </span>
      ),
    },
    {
      key: 'CANCELLED',
      label: (
        <span className="flex items-center gap-1.5 text-rose-400">
          <WarningCircle size={16} />
          Đã hủy {counts.CANCELLED > 0 && `(${counts.CANCELLED})`}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SushiPageHeader
        title="Quản Lý Đơn Hàng (Take Away)"
        subtitle="Theo dõi vòng đời đơn hàng, điều phối bếp và cập nhật trạng thái theo thời gian thực"
        extra={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-64 min-w-0">
              <Input
                placeholder="Tìm mã đơn, tên, SĐT..."
                prefix={<MagnifyingGlass size={16} className="text-sushi-text-muted shrink-0" />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                className="w-full h-10 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                icon={
                  <Funnel
                    size={16}
                    weight={hasDateFilter ? 'fill' : 'regular'}
                    className={hasDateFilter ? 'text-sushi-gold' : ''}
                  />
                }
                onClick={() => setIsFilterDrawerOpen(true)}
                className={`h-10 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm flex items-center justify-center shrink-0 ${
                  hasDateFilter ? 'border-sushi-gold/60 bg-sushi-gold/10' : ''
                }`}
                title="Lọc đơn hàng theo ngày"
              >
                <span className="hidden sm:inline">Lọc ngày</span>
                {hasDateFilter && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sushi-gold ml-0.5 sm:ml-1 inline-block" />
                )}
              </Button>
              <Button
                icon={<ArrowsClockwise size={16} className={isFetching ? 'animate-spin' : ''} />}
                onClick={() => refetch()}
                loading={isFetching}
                className="h-10 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm flex items-center justify-center shrink-0"
                title="Làm mới danh sách đơn hàng"
              >
                <span className="hidden sm:inline">Làm mới</span>
              </Button>
            </div>
          </div>
        }
      />

      {/* Thanh thông báo bộ lọc ngày đang kích hoạt */}
      {hasDateFilter && (
        <div className="flex items-center gap-2 text-xs bg-sushi-gold/10 text-sushi-gold border border-sushi-gold/30 px-3 py-1.5 rounded-xl w-fit">
          <span>
            Lọc ngày:{' '}
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
            onClick={() => setFilterDateRange({})}
            className="hover:text-white p-0.5 cursor-pointer ml-1 inline-flex items-center"
            title="Xóa bộ lọc ngày"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="bg-sushi-card border border-sushi-border rounded-xl p-2.5 sm:p-4 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="border-b-0 overflow-x-auto"
        />
        <OrderTable orders={filteredOrders} isLoading={isLoading} />
      </div>

      <OrderDateFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        startDate={filterDateRange.startDate}
        endDate={filterDateRange.endDate}
        onApply={(filter) => setFilterDateRange(filter)}
        onReset={() => setFilterDateRange({})}
      />
    </div>
  );
}
