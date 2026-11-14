'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Tooltip,
  App,
  Pagination,
  ResponsiveModalDrawer,
  SushiMobileCardList,
  SushiCardItem,
  SushiEmptyState,
} from '@/components/ui';
import {
  Eye,
  CookingPot,
  Package,
  CheckCircle,
  Receipt,
  User,
  Phone,
  Clock,
  CreditCard,
  QrCode,
} from '@phosphor-icons/react';
import { Order, OrderStatus } from '../types';
import { OrderStatusBadge } from './order-status-badge';
import { OrderPaymentBadge } from './order-payment-badge';
import { OrderDetailModal } from './order-detail-modal';
import { useUpdateOrderStatus, useUpdatePaymentStatus } from '../hooks/use-orders';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const { message } = App.useApp();
  const { formatCurrency } = useFormatCurrency();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentConfirmOrder, setPaymentConfirmOrder] = useState<Order | null>(null);
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);
  const [mobilePage, setMobilePage] = useState(1);
  const mobilePageSize = 10;

  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentMutation = useUpdatePaymentStatus();

  const isTransferUnpaid = (order: Order) => {
    const isTransfer =
      order.paymentMethod?.toUpperCase() === 'VIETQR' ||
      order.paymentMethod?.toUpperCase() === 'BANK_TRANSFER';
    return isTransfer && order.paymentStatus !== 'PAID';
  };

  const handleQuickPaymentConfirm = async (
    order: Order,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    try {
      await updatePaymentMutation.mutateAsync({
        orderId: order.id,
        input: { paymentStatus: 'PAID' },
      });
      message.success(`Đơn ${order.code} đã xác nhận thanh toán thành công!`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Xác nhận thanh toán thất bại';
      message.error(msg);
    }
  };

  // Đảm bảo trang hiển thị hợp lệ khi danh sách thay đổi mà không cần effect
  const totalPages = Math.max(1, Math.ceil(orders.length / mobilePageSize));
  const validMobilePage = mobilePage > totalPages ? 1 : mobilePage;

  const paginatedMobileOrders = useMemo(() => {
    const start = (validMobilePage - 1) * mobilePageSize;
    return orders.slice(start, start + mobilePageSize);
  }, [orders, validMobilePage]);

  const handleQuickStatusChange = async (
    order: Order,
    toStatus: OrderStatus,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
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
        <div className="flex flex-col gap-1 items-start">
          <span
            className="font-mono font-bold text-sushi-gold cursor-pointer hover:underline"
            onClick={() => setSelectedOrder(record)}
          >
            {code}
          </span>
          {record.source === 'STAFF' ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              Nhân viên
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Website
            </span>
          )}
        </div>
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
          {formatCurrency(amount)}
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
      render: (paymentStatus: Order['paymentStatus'], record: Order) => {
        const isTransfer =
          record.paymentMethod?.toUpperCase() === 'VIETQR' ||
          record.paymentMethod?.toUpperCase() === 'BANK_TRANSFER';

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <OrderPaymentBadge status={paymentStatus} />
            <span
              className={`px-1.5 py-0.5 rounded text-3xs font-semibold border ${
                isTransfer
                  ? 'bg-sushi-gold/15 text-sushi-gold border-sushi-gold/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
              }`}
            >
              {isTransfer ? 'QR' : 'COD'}
            </span>
          </div>
        );
      },
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
            isTransferUnpaid(record) ? (
              <Button
                size="small"
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 border-none font-semibold shadow-sm flex items-center gap-1"
                icon={<CreditCard size={15} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentConfirmOrder(record);
                }}
              >
                Xác nhận TT
              </Button>
            ) : (
              <Tooltip title="Xác nhận tiếp nhận đơn hàng">
                <Button
                  size="small"
                  type="primary"
                  className="bg-blue-600 hover:bg-blue-500 text-xs px-2"
                  icon={<CheckCircle size={15} />}
                  loading={updateStatusMutation.isPending}
                  onClick={(e) => handleQuickStatusChange(record, 'CONFIRMED', e)}
                >
                  Nhận đơn
                </Button>
              </Tooltip>
            )
          )}

          {record.status === 'CONFIRMED' && (
            isTransferUnpaid(record) ? (
              <Button
                size="small"
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 border-none font-semibold shadow-sm flex items-center gap-1"
                icon={<CreditCard size={15} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentConfirmOrder(record);
                }}
              >
                Xác nhận TT
              </Button>
            ) : (
              <Tooltip title="Bắt đầu chế biến món (Khấu trừ kho)">
                <Button
                  size="small"
                  type="primary"
                  className="bg-amber-600 hover:bg-amber-500 text-xs px-2"
                  icon={<CookingPot size={15} />}
                  loading={updateStatusMutation.isPending}
                  onClick={(e) => handleQuickStatusChange(record, 'PREPARING', e)}
                >
                  Làm món
                </Button>
              </Tooltip>
            )
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
            <Tooltip title="Xác nhận hoàn tất giao đơn hàng">
              <Button
                size="small"
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-xs px-2.5 font-semibold border-none shadow-sm flex items-center gap-1"
                icon={<CheckCircle size={15} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setCompletingOrder(record);
                }}
              >
                Giao khách
              </Button>
            </Tooltip>
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
      {/* 1. Giao diện Mobile Card List (< md) */}
      <div className="block md:hidden">
        <SushiMobileCardList
          items={paginatedMobileOrders}
          loading={isLoading}
          emptyState={
            <SushiEmptyState
              isCard
              icon={<Receipt size={26} />}
              title="Không có đơn hàng nào"
              description="Hiện chưa có đơn hàng nào phù hợp với bộ lọc đã chọn."
            />
          }
          renderItem={(order) => {
            const itemsCount =
              order.items?.reduce((sum, item) => sum + item.quantity, 0) ||
              order.items?.length ||
              0;

            return (
              <SushiCardItem className="cursor-pointer hover:border-sushi-gold/50 transition-all active:scale-[0.99] border-sushi-border/90">
                <div onClick={() => setSelectedOrder(order)} className="space-y-2.5">
                  {/* Hàng 1: Mã đơn & Huy hiệu trạng thái */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Receipt size={17} className="text-sushi-gold shrink-0" />
                      <span className="font-mono font-bold text-sushi-gold text-sm truncate">
                        {order.code}
                      </span>
                      {order.source === 'STAFF' ? (
                        <span className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0">
                          Nhân viên
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-3xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                          Website
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                      {order.paymentMethod?.toUpperCase() === 'VIETQR' ||
                      order.paymentMethod?.toUpperCase() === 'BANK_TRANSFER' ? (
                        <span className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 flex items-center gap-1">
                          <QrCode size={11} />
                          <span>QR</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-3xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          COD
                        </span>
                      )}
                      <OrderStatusBadge status={order.status} />
                      <OrderPaymentBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  {/* Hàng 2: Tên khách hàng & Số điện thoại */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User size={15} className="text-sushi-text-muted shrink-0" />
                      <span className="font-semibold text-sushi-text-primary truncate">
                        {order.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-sushi-text-muted font-mono">
                      <Phone size={14} className="text-sushi-text-muted shrink-0" />
                      <a
                        href={`tel:${order.customerPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sushi-gold hover:underline"
                      >
                        {order.customerPhone}
                      </a>
                    </div>
                  </div>

                  {/* Hàng 3: Số món & Tổng tiền */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-sushi-border/40">
                    <div className="flex items-center gap-1.5 text-sushi-text-muted">
                      <Package size={15} className="shrink-0" />
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium text-3xs">
                        {itemsCount} món
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-sushi-text-primary font-mono">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Hàng 4: Thời gian tạo đơn */}
                  <div className="flex items-center gap-1 text-3xs text-sushi-text-muted">
                    <Clock size={13} className="shrink-0" />
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      - {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Hàng 5: Nút thao tác nhanh */}
                <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between gap-2">
                  <Button
                    size="small"
                    icon={<Eye size={15} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="text-xs"
                  >
                    Chi tiết
                  </Button>

                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.status === 'PENDING' && (
                      isTransferUnpaid(order) ? (
                        <Button
                          size="small"
                          type="primary"
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 font-semibold border-none shadow-sm flex items-center gap-1"
                          icon={<CreditCard size={15} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentConfirmOrder(order);
                          }}
                        >
                          Xác nhận TT
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          type="primary"
                          className="bg-blue-600 hover:bg-blue-500 text-xs px-2.5"
                          icon={<CheckCircle size={15} />}
                          loading={updateStatusMutation.isPending}
                          onClick={(e) =>
                            handleQuickStatusChange(order, 'CONFIRMED', e)
                          }
                        >
                          Nhận đơn
                        </Button>
                      )
                    )}

                    {order.status === 'CONFIRMED' && (
                      isTransferUnpaid(order) ? (
                        <Button
                          size="small"
                          type="primary"
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 font-semibold border-none shadow-sm flex items-center gap-1"
                          icon={<CreditCard size={15} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentConfirmOrder(order);
                          }}
                        >
                          Xác nhận TT
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          type="primary"
                          className="bg-amber-600 hover:bg-amber-500 text-xs px-2.5"
                          icon={<CookingPot size={15} />}
                          loading={updateStatusMutation.isPending}
                          onClick={(e) =>
                            handleQuickStatusChange(order, 'PREPARING', e)
                          }
                        >
                          Làm món
                        </Button>
                      )
                    )}

                    {order.status === 'PREPARING' && (
                      <Button
                        size="small"
                        type="primary"
                        className="bg-purple-600 hover:bg-purple-500 text-xs px-2.5"
                        icon={<Package size={15} />}
                        loading={updateStatusMutation.isPending}
                        onClick={(e) =>
                          handleQuickStatusChange(order, 'READY_FOR_PICKUP', e)
                        }
                      >
                        Xong món
                      </Button>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && (
                      <Button
                        size="small"
                        type="primary"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 font-semibold border-none shadow-sm flex items-center gap-1"
                        icon={<CheckCircle size={15} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompletingOrder(order);
                        }}
                      >
                        Giao khách
                      </Button>
                    )}
                  </div>
                </div>
              </SushiCardItem>
            );
          }}
        />

        {/* Phân trang Mobile nếu số lượng đơn vượt quá kích thước 1 trang */}
        {orders.length > mobilePageSize && (
          <div className="flex justify-center pt-3 pb-1">
            <Pagination
              simple
              current={validMobilePage}
              total={orders.length}
              pageSize={mobilePageSize}
              onChange={setMobilePage}
              size="small"
            />
          </div>
        )}
      </div>

      {/* 2. Giao diện Desktop Table (>= md) */}
      <div className="hidden md:block">
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
      </div>

      {/* Modal / Bottom Sheet Xác nhận đã nhận tiền chuyển khoản */}
      <ResponsiveModalDrawer
        open={Boolean(paymentConfirmOrder)}
        onClose={() => setPaymentConfirmOrder(null)}
        destroyOnHidden
        title={
          <span className="font-semibold text-sushi-text text-sm sm:text-base">
            Xác Nhận Đã Nhận Tiền
          </span>
        }
        width={460}
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button
              onClick={() => setPaymentConfirmOrder(null)}
              className="rounded-xl flex-1 h-11 border-sushi-border text-sushi-text-muted hover:text-white"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                if (paymentConfirmOrder) {
                  await handleQuickPaymentConfirm(paymentConfirmOrder);
                  setPaymentConfirmOrder(null);
                }
              }}
              loading={updatePaymentMutation.isPending}
              className="rounded-xl flex-1 h-11 bg-sushi-gold hover:bg-sushi-gold/90 text-black font-semibold border-none flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <CheckCircle size={18} weight="bold" />
              <span>Đã nhận tiền</span>
            </Button>
          </div>
        }
      >
        {paymentConfirmOrder && (
          <div className="py-1 space-y-4">
            <div className="p-4 rounded-xl bg-sushi-surface/60 border border-sushi-border/80 space-y-2.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-sushi-border/60">
                <span className="text-2xs uppercase tracking-wider font-semibold text-sushi-text-muted">
                  Mã đơn hàng:
                </span>
                <span className="font-mono font-bold text-sushi-gold text-sm">
                  {paymentConfirmOrder.code}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-sushi-text-muted">Khách hàng:</span>
                <span className="font-semibold text-sushi-text">
                  {paymentConfirmOrder.customerName} ({paymentConfirmOrder.customerPhone})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-sushi-text-muted">Phương thức:</span>
                <span className="font-semibold text-sushi-gold flex items-center gap-1">
                  <QrCode size={13} />
                  <span>Chuyển khoản QR</span>
                </span>
              </div>

              <div className="pt-2 border-t border-sushi-border/60 flex items-center justify-between">
                <span className="text-xs font-medium text-sushi-text-muted">
                  Số tiền cần đối soát:
                </span>
                <span className="text-lg font-bold font-mono text-sushi-gold">
                  {formatCurrency(paymentConfirmOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </ResponsiveModalDrawer>

      {/* Modal / Bottom Sheet Xác nhận hoàn tất đơn hàng (Giao khách) */}
      <ResponsiveModalDrawer
        open={Boolean(completingOrder)}
        onClose={() => setCompletingOrder(null)}
        destroyOnHidden
        title={
          <span className="font-semibold text-sushi-text text-sm sm:text-base">
            Xác Nhận Hoàn Tất Đơn Hàng
          </span>
        }
        width={460}
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button
              onClick={() => setCompletingOrder(null)}
              className="rounded-xl flex-1 h-11 border-sushi-border text-sushi-text-muted hover:text-white"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                if (completingOrder) {
                  await handleQuickStatusChange(completingOrder, 'COMPLETED');
                  setCompletingOrder(null);
                }
              }}
              loading={updateStatusMutation.isPending}
              className="rounded-xl flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold border-none flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <CheckCircle size={18} weight="bold" />
              <span>Xác nhận đã giao</span>
            </Button>
          </div>
        }
      >
        {completingOrder && (
          <div className="py-1 space-y-4">
            <div className="p-4 rounded-xl bg-sushi-surface/60 border border-sushi-border/80 space-y-2.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-sushi-border/60">
                <span className="text-2xs uppercase tracking-wider font-semibold text-sushi-text-muted">
                  Mã đơn hàng:
                </span>
                <span className="font-mono font-bold text-sushi-gold text-sm">
                  {completingOrder.code}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-sushi-text-muted">Khách hàng:</span>
                <span className="font-semibold text-sushi-text">
                  {completingOrder.customerName} ({completingOrder.customerPhone})
                </span>
              </div>

              {completingOrder.address && (
                <div className="flex items-start justify-between text-xs gap-3">
                  <span className="text-sushi-text-muted shrink-0">Địa chỉ:</span>
                  <span className="font-medium text-sushi-text text-right leading-relaxed">
                    {completingOrder.address}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-sushi-text-muted">Hình thức:</span>
                <span className="font-semibold text-sushi-text">
                  {completingOrder.paymentMethod === 'VIETQR' || completingOrder.paymentMethod === 'BANK_TRANSFER'
                    ? 'Chuyển khoản QR'
                    : 'Tiền mặt khi nhận hàng (COD)'}
                </span>
              </div>

              <div className="pt-2 border-t border-sushi-border/60 flex items-center justify-between">
                <span className="text-xs font-medium text-sushi-text-muted">
                  Trạng thái thanh toán:
                </span>
                {completingOrder.paymentStatus === 'PAID' ? (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Đã thanh toán ({formatCurrency(completingOrder.totalAmount)})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Thu tiền mặt COD: {formatCurrency(completingOrder.totalAmount)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-sushi-text-muted leading-relaxed px-1">
              Bạn có chắc chắn muốn xác nhận đã bàn giao thành công toàn bộ món ăn của đơn hàng này cho khách không?
            </p>
          </div>
        )}
      </ResponsiveModalDrawer>

      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
