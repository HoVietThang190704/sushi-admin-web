'use client';

import React, { useState, useMemo } from 'react';
import {
  SushiPageHeader,
  Button,
  Input,
  Space,
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
} from '@phosphor-icons/react';
import { useOrders, OrderTable, OrderStatus } from '@/features/orders';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filterStatus = activeTab === 'ALL' ? undefined : (activeTab as OrderStatus);

  const { data: orders = [], isLoading, refetch, isFetching } = useOrders(
    filterStatus ? { status: filterStatus } : undefined,
  );

  // Tính số lượng đơn theo từng trạng thái để hiển thị count trên Tabs
  const counts = useMemo(() => {
    const res = {
      ALL: orders.length,
      PENDING: 0,
      PREPARING: 0,
      READY_FOR_PICKUP: 0,
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
      key: 'PREPARING',
      label: (
        <span className="flex items-center gap-1.5 text-blue-400">
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
          <Space>
            <Input
              placeholder="Tìm theo mã đơn, tên, SĐT..."
              prefix={<MagnifyingGlass size={16} className="text-sushi-text-muted" />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              className="w-64"
            />
            <Button
              icon={<ArrowsClockwise size={16} className={isFetching ? 'animate-spin' : ''} />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Làm mới
            </Button>
          </Space>
        }
      />

      <div className="bg-sushi-card border border-sushi-border rounded-xl p-3 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="border-b-0"
        />
        <OrderTable orders={filteredOrders} isLoading={isLoading} />
      </div>
    </div>
  );
}
