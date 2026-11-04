'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Tooltip, message, Popconfirm } from '@/components/ui';
import {
  Eye,
  CookingPot,
  Package,
  CheckCircle,
} from '@phosphor-icons/react';
import { Order, OrderStatus } from '../types';
import { OrderStatusBadge } from './order-status-badge';
import { OrderPaymentBadge } from './order-payment-badge';
import { OrderDetailModal } from './order-detail-modal';
import { useUpdateOrderStatus } from '../hooks/use-orders';

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleQuickStatusChange = async (
    order: Order,
    toStatus: OrderStatus,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        input: { status: toStatus },
      });
      message.success(`Đơn ${order.code} đã chuyển sang "${toStatus}"`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại';
      message.error(msg);
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      render: (code: string, record: Order) => (
        <span
          className="font-mono font-bold text-sushi-gold cursor-pointer hover:underline"
          onClick={() => setSelectedOrder(record)}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, record: Order) => (
        <div>
          <div className="font-semibold text-sushi-text-primary">
            {record.customerName}
          </div>
          <div className="text-xs text-sushi-text-muted">
            {record.customerPhone}
          </div>
        </div>
      ),
    },
    {
      title: 'Số món',
      key: 'itemsCount',
      align: 'center' as const,
      render: (_: unknown, record: Order) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
          {record.items?.reduce((sum, item) => sum + item.quantity, 0) ||
            record.items?.length ||
            0}{' '}
          món
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <span className="font-bold text-sushi-text-primary">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(amount)}
        </span>
      ),
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => <OrderStatusBadge status={status} />,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (paymentStatus: Order['paymentStatus']) => (
        <OrderPaymentBadge status={paymentStatus} />
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-xs text-sushi-text-muted">
          {new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' - '}
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, record: Order) => (
        <Space onClick={(e) => e.stopPropagation()}>
          {/* Quick status progress buttons */}
          {record.status === 'PENDING' && (
            <Tooltip title="Bắt đầu chế biến món">
              <Button
                size="small"
                type="primary"
                className="bg-blue-600 hover:bg-blue-500 text-xs px-2"
                icon={<CookingPot size={15} />}
                loading={updateStatusMutation.isPending}
                onClick={(e) => handleQuickStatusChange(record, 'PREPARING', e)}
              >
                Làm món
              </Button>
            </Tooltip>
          )}

          {record.status === 'PREPARING' && (
            <Tooltip title="Món đã xong, chờ khách lấy">
              <Button
                size="small"
                type="primary"
                className="bg-purple-600 hover:bg-purple-500 text-xs px-2"
                icon={<Package size={15} />}
                loading={updateStatusMutation.isPending}
                onClick={(e) =>
                  handleQuickStatusChange(record, 'READY_FOR_PICKUP', e)
                }
              >
                Xong món
              </Button>
            </Tooltip>
          )}

          {record.status === 'READY_FOR_PICKUP' && (
            <Popconfirm
              title="Khách đã lấy món và thanh toán xong?"
              onConfirm={(e) =>
                handleQuickStatusChange(
                  record,
                  'COMPLETED',
                  e as unknown as React.MouseEvent,
                )
              }
              okText="Đã giao"
              cancelText="Chưa"
            >
              <Button
                size="small"
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-xs px-2"
                icon={<CheckCircle size={15} />}
                loading={updateStatusMutation.isPending}
              >
                Giao khách
              </Button>
            </Popconfirm>
          )}

          <Tooltip title="Xem chi tiết đơn">
            <Button
              size="small"
              icon={<Eye size={16} />}
              onClick={() => setSelectedOrder(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => setSelectedOrder(record),
          className: 'cursor-pointer hover:bg-zinc-900/60 transition-colors',
        })}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: ['15', '30', '50'],
        }}
        className="bg-sushi-card border border-sushi-border rounded-xl overflow-hidden shadow-sm"
      />

      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
