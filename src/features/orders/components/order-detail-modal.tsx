'use client';

import React, { useState } from 'react';
import {
  Modal,
  Drawer,
  Button,
  Table,
  Space,
  App,
} from '@/components/ui';
import {
  CookingPot,
  CheckCircle,
  Package,
  Receipt,
  User,
  Phone,
  FileText,
  X,
  CreditCard,
  Truck,
  MapPin,
  WarningCircle,
} from '@phosphor-icons/react';
import { Order, OrderItem, OrderStatus } from '../types';
import { OrderStatusBadge } from './order-status-badge';
import { OrderPaymentBadge } from './order-payment-badge';
import { OrderLifecycleTimeline } from './order-lifecycle-timeline';
import { OrderCancelForm } from './order-cancel-form';
import { getOrderStatusLabel } from '../utils';
import {
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from '../hooks/use-orders';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { SUSHICOLORS } from '@/lib/theme';

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailModal({
  order,
  open,
  onClose,
}: OrderDetailModalProps) {
  const { message } = App.useApp();
  const { formatCurrency } = useFormatCurrency();
  const isMobile = useIsMobile();

  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentMutation = useUpdatePaymentStatus();

  if (!order) return null;

  const totalItemsCount =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ||
    order.items?.length ||
    0;

  const isTransferMethod =
    order.paymentMethod?.toUpperCase() === 'VIETQR' ||
    order.paymentMethod?.toUpperCase() === 'BANK_TRANSFER';
  const isTransferUnpaid = isTransferMethod && order.paymentStatus !== 'PAID';

  const handleUpdateStatus = async (toStatus: OrderStatus, reason?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        input: { status: toStatus, reason },
      });
      message.success(`Đã cập nhật trạng thái đơn sang "${getOrderStatusLabel(toStatus)}"`);
      setShowCancelInput(false);
      setCancelReason('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại';
      message.error(msg, 7);
    }
  };

  const handleTogglePayment = async () => {
    const nextStatus = order.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      await updatePaymentMutation.mutateAsync({
        orderId: order.id,
        input: { paymentStatus: nextStatus },
      });
      message.success(
        `Đã cập nhật thanh toán sang "${nextStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}"`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thanh toán thất bại';
      message.error(msg);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. GIAO DIỆN MOBILE BOTTOM SHEET (< 768px)
  // ---------------------------------------------------------------------------
  if (isMobile) {
    const hasActiveWorkflow =
      order.status === 'PENDING' ||
      order.status === 'CONFIRMED' ||
      order.status === 'PREPARING' ||
      order.status === 'READY_FOR_PICKUP' ||
      order.status === 'DELIVERING';

    return (
      <Drawer
        open={open}
        onClose={onClose}
        placement="bottom"
        closable={false}
        size="auto"
        styles={{
          wrapper: { maxHeight: '92vh' },
          section: {
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            overflow: 'hidden',
            maxHeight: '92vh',
            backgroundColor: SUSHICOLORS.card,
          },
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '92vh',
            backgroundColor: SUSHICOLORS.card,
          },
        }}
        className="rounded-t-3xl overflow-hidden [&_.ant-drawer-content]:bg-sushi-card [&_.ant-drawer-section]:bg-sushi-card [&_.ant-drawer-body]:bg-sushi-card"
      >
        {/* Sticky Mobile Header */}
        <div className="sticky top-0 z-20 bg-sushi-card/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-sushi-border/80 shrink-0">
          <div className="w-10 h-1 bg-zinc-600/80 rounded-full mx-auto mb-2.5" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-sushi-gold shrink-0" weight="fill" />
                <span className="font-mono font-bold text-base text-sushi-text tracking-wide break-all">
                  {order.code}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <OrderStatusBadge status={order.status} />
                <span className="text-xs text-sushi-text-muted">
                  {new Date(order.createdAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 mt-0.5"
              aria-label="Đóng chi tiết"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Mobile Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5">
          {/* Card Thông tin khách hàng & Thanh toán */}
          <div className="p-3.5 rounded-2xl bg-sushi-surface/70 border border-sushi-border/70 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sushi-gold/15 text-sushi-gold flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xs text-sushi-text-muted uppercase tracking-wider font-semibold">Khách hàng</div>
                  <div className="font-bold text-sm text-sushi-text truncate">{order.customerName}</div>
                </div>
              </div>
              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sushi-gold/10 hover:bg-sushi-gold/20 text-sushi-gold font-semibold text-xs border border-sushi-gold/30 shrink-0 transition-colors"
              >
                <Phone size={13} weight="fill" />
                <span>{order.customerPhone}</span>
              </a>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-sushi-border/50">
              <div className="min-w-0">
                <div className="text-2xs text-sushi-text-muted uppercase tracking-wider font-semibold mb-1">Thanh toán</div>
                <div className="flex items-center gap-1.5">
                  <OrderPaymentBadge status={order.paymentStatus} />
                  <span className="text-2xs text-sushi-text-muted">({order.paymentMethod})</span>
                </div>
              </div>
              <Button
                size="small"
                onClick={handleTogglePayment}
                loading={updatePaymentMutation.isPending}
                className="text-xs rounded-lg border-sushi-border/80 text-sushi-gold hover:border-sushi-gold hover:text-sushi-gold shrink-0 h-8 px-2.5"
              >
                {order.paymentStatus === 'PAID' ? 'Đổi sang Chưa TT' : 'Đổi sang Đã TT'}
              </Button>
            </div>

            {isTransferUnpaid && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <WarningCircle size={16} className="text-amber-400 shrink-0 mt-0.5" weight="fill" />
                <div className="min-w-0 flex-1 leading-relaxed text-2xs">
                  <span className="font-semibold text-amber-300 block">Đơn chuyển khoản chưa thanh toán:</span>
                  <span>Kiểm tra tài khoản ngân hàng và bấm <strong>&quot;Đổi sang Đã TT&quot;</strong> để mở khóa duyệt đơn/chế biến.</span>
                </div>
              </div>
            )}

            {order.paymentQrUrl && (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-sushi-border/60 flex items-center gap-3">
                <img
                  src={order.paymentQrUrl}
                  alt="QR thanh toán của đơn"
                  className="w-12 h-12 object-contain rounded-lg border border-sushi-border/80 bg-zinc-950 p-1 shrink-0"
                />
                <div className="min-w-0 flex-1 text-2xs">
                  <span className="text-sushi-text-muted block">Mã QR đính kèm đơn:</span>
                  <span className="font-semibold text-sushi-gold">Đã lưu ảnh QR tại thời điểm đặt hàng</span>
                </div>
              </div>
            )}

            {order.note && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2">
                <FileText size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-amber-400">Ghi chú: </span>
                  <span className="text-amber-200/90 italic leading-relaxed">{order.note}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form hủy đơn nếu đang kích hoạt */}
          {showCancelInput && (
            <OrderCancelForm
              reason={cancelReason}
              onChangeReason={setCancelReason}
              onCancel={() => setShowCancelInput(false)}
              onConfirm={() => handleUpdateStatus('CANCELLED', cancelReason)}
              isPending={updateStatusMutation.isPending}
              isMobile
            />
          )}

          {/* Phiếu Danh sách Món ăn & Tổng tiền liền khối */}
          <div className="rounded-2xl border border-sushi-border/70 bg-sushi-surface/50 overflow-hidden shadow-xs">
            <div className="px-3.5 py-2.5 bg-zinc-900/60 border-b border-sushi-border/60 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-sushi-text-muted">
              <span>Món ăn đã đặt</span>
              <span className="text-sushi-gold font-mono">{totalItemsCount} món</span>
            </div>

            <div className="divide-y divide-sushi-border/40 px-3.5">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-sushi-text leading-snug">
                      {item.productName}
                    </div>
                    {item.note && (
                      <div className="text-xs text-sushi-text-muted italic mt-0.5">
                        Ghi chú: {item.note}
                      </div>
                    )}
                    <div className="text-xs text-sushi-text-muted mt-1 font-mono">
                      {item.quantity > 1 ? (
                        <span>
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </span>
                      ) : (
                        formatCurrency(item.unitPrice)
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-sushi-text font-mono">
                      {formatCurrency(item.subtotal)}
                    </div>
                    {item.quantity > 1 && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-sushi-gold/15 text-sushi-gold text-2xs font-bold font-mono">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3.5 py-3 bg-zinc-900/70 border-t border-sushi-border/70 flex items-center justify-between">
              <span className="text-sm font-semibold text-sushi-text-muted">
                Tổng thanh toán:
              </span>
              <span className="text-lg font-bold font-mono text-sushi-gold">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Lịch sử vòng đời đơn (Thu gọn) */}
          <OrderLifecycleTimeline histories={order.statusHistories} collapsible />

          {/* Nút đóng nội dung nếu đơn đã hoàn tất/đã hủy */}
          {!hasActiveWorkflow && (
            <div className="pt-1">
              <Button
                onClick={onClose}
                className="w-full h-11 rounded-xl text-sm font-semibold border-sushi-border text-sushi-text hover:bg-zinc-800"
              >
                Đóng
              </Button>
            </div>
          )}
        </div>

        {/* Sticky Mobile Action Footer */}
        {hasActiveWorkflow && (
          <div className="sticky bottom-0 z-20 bg-sushi-card/95 backdrop-blur-md px-4 py-3 border-t border-sushi-border/80 shrink-0 space-y-2">
            {order.status === 'PENDING' && (
              <div className="flex items-center gap-2">
                <Button
                  danger
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="h-12 px-4 rounded-xl text-xs font-semibold shrink-0"
                >
                  Hủy đơn
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircle size={20} />}
                  onClick={() => handleUpdateStatus('CONFIRMED', 'Xác nhận đơn hàng')}
                  loading={updateStatusMutation.isPending}
                  disabled={isTransferUnpaid}
                  className={`flex-1 h-12 rounded-xl font-bold border-none shadow-md text-white cursor-pointer ${
                    isTransferUnpaid
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-60'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                  title={isTransferUnpaid ? 'Cần xác nhận thanh toán trước khi duyệt đơn' : undefined}
                >
                  {isTransferUnpaid ? 'Chờ thanh toán' : 'Xác nhận đơn'}
                </Button>
              </div>
            )}

            {order.status === 'CONFIRMED' && (
              <div className="flex items-center gap-2">
                <Button
                  danger
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="h-12 px-4 rounded-xl text-xs font-semibold shrink-0"
                >
                  Hủy đơn
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<CookingPot size={20} />}
                  onClick={() => handleUpdateStatus('PREPARING', 'Bắt đầu chế biến')}
                  loading={updateStatusMutation.isPending}
                  disabled={isTransferUnpaid}
                  className={`flex-1 h-12 rounded-xl font-bold border-none shadow-md text-white cursor-pointer ${
                    isTransferUnpaid
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-60'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                  title={isTransferUnpaid ? 'Cần xác nhận thanh toán trước khi chế biến' : undefined}
                >
                  {isTransferUnpaid ? 'Chờ thanh toán' : 'Bắt đầu chế biến'}
                </Button>
              </div>
            )}

            {order.status === 'PREPARING' && (
              <Button
                type="primary"
                size="large"
                icon={<Package size={20} />}
                onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
                loading={updateStatusMutation.isPending}
                className="w-full h-12 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 border-none shadow-md text-white cursor-pointer"
              >
                Sẵn sàng lấy món
              </Button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <Button
                type="primary"
                size="large"
                icon={<Truck size={20} />}
                onClick={() => handleUpdateStatus('DELIVERING')}
                loading={updateStatusMutation.isPending}
                className="w-full h-12 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 border-none shadow-md text-white cursor-pointer"
              >
                Bắt đầu giao hàng (Shipper lấy)
              </Button>
            )}

            {order.status === 'DELIVERING' && (
              <Button
                type="primary"
                size="large"
                icon={<CheckCircle size={20} />}
                onClick={() => handleUpdateStatus('COMPLETED')}
                loading={updateStatusMutation.isPending}
                className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 border-none shadow-md text-white cursor-pointer"
              >
                Xác nhận đã giao thành công
              </Button>
            )}
          </div>
        )}
      </Drawer>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. GIAO DIỆN DESKTOP MODAL (>= 768px)
  // ---------------------------------------------------------------------------
  const itemColumns = [
    {
      title: 'MÓN ĂN',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, item: OrderItem) => (
        <div>
          <div className="font-semibold text-sushi-text">{name}</div>
          {item.note && (
            <div className="text-xs text-sushi-text-muted italic mt-0.5">
              Ghi chú: {item.note}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'ĐƠN GIÁ',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      width: 140,
      render: (price: number) => (
        <span className="font-mono text-sushi-text-muted">{formatCurrency(price)}</span>
      ),
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      width: 100,
      render: (qty: number) => (
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-sushi-gold/15 text-sushi-gold font-bold font-mono text-xs">
          x{qty}
        </span>
      ),
    },
    {
      title: 'THÀNH TIỀN',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right' as const,
      width: 150,
      render: (subtotal: number) => (
        <span className="font-semibold font-mono text-sushi-text">
          {formatCurrency(subtotal)}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={780}
      centered
      title={
        <div className="flex items-center gap-3 pr-8 py-0.5">
          <div className="w-10 h-10 rounded-xl bg-sushi-gold/15 text-sushi-gold flex items-center justify-center border border-sushi-gold/30 shrink-0">
            <Receipt size={22} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-lg text-sushi-text tracking-wide">
                {order.code}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="text-xs text-sushi-text-muted mt-0.5 font-sans">
              Thời gian đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between pt-2">
          <Button
            onClick={onClose}
            className="border-sushi-border text-sushi-text hover:bg-zinc-800"
          >
            Đóng
          </Button>

          <Space size="middle">
            {order.status === 'PENDING' && (
              <>
                <Button
                  danger
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="font-semibold"
                >
                  Hủy đơn
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircle size={18} />}
                  onClick={() => handleUpdateStatus('CONFIRMED', 'Xác nhận đơn hàng')}
                  loading={updateStatusMutation.isPending}
                  disabled={isTransferUnpaid}
                  className={`font-semibold h-9 px-4 border-none shadow-sm ${
                    isTransferUnpaid
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-60'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                  title={isTransferUnpaid ? 'Cần bấm "Đổi sang Đã TT" trước khi duyệt đơn' : undefined}
                >
                  {isTransferUnpaid ? 'Chờ thanh toán' : 'Xác nhận đơn'}
                </Button>
              </>
            )}

            {order.status === 'CONFIRMED' && (
              <>
                <Button
                  danger
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="font-semibold"
                >
                  Hủy đơn
                </Button>
                <Button
                  type="primary"
                  icon={<CookingPot size={18} />}
                  onClick={() => handleUpdateStatus('PREPARING', 'Bắt đầu chế biến')}
                  loading={updateStatusMutation.isPending}
                  disabled={isTransferUnpaid}
                  className={`font-semibold h-9 px-4 border-none shadow-sm ${
                    isTransferUnpaid
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-60'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                  title={isTransferUnpaid ? 'Cần bấm "Đổi sang Đã TT" trước khi chế biến' : undefined}
                >
                  {isTransferUnpaid ? 'Chờ thanh toán' : 'Bắt đầu chế biến'}
                </Button>
              </>
            )}

            {order.status === 'PREPARING' && (
              <Button
                type="primary"
                icon={<Package size={18} />}
                onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
                loading={updateStatusMutation.isPending}
                className="bg-purple-600 hover:bg-purple-500 font-semibold h-9 px-4 border-none shadow-sm"
              >
                Sẵn sàng lấy món
              </Button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <Button
                type="primary"
                icon={<Truck size={18} />}
                onClick={() => handleUpdateStatus('DELIVERING')}
                loading={updateStatusMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-500 font-semibold h-9 px-4 border-none shadow-sm"
              >
                Bắt đầu giao hàng
              </Button>
            )}

            {order.status === 'DELIVERING' && (
              <Button
                type="primary"
                icon={<CheckCircle size={18} />}
                onClick={() => handleUpdateStatus('COMPLETED')}
                loading={updateStatusMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 font-semibold h-9 px-4 border-none shadow-sm"
              >
                Xác nhận đã giao
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Form nhập lý do hủy đơn nếu được bật */}
        {showCancelInput && (
          <OrderCancelForm
            reason={cancelReason}
            onChangeReason={setCancelReason}
            onCancel={() => setShowCancelInput(false)}
            onConfirm={() => handleUpdateStatus('CANCELLED', cancelReason)}
            isPending={updateStatusMutation.isPending}
          />
        )}

        {/* 1. Thông tin Khách hàng & Thanh toán */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-sushi-surface/80 border border-sushi-border/80 flex items-start justify-between">
            <div className="space-y-1 min-w-0">
              <span className="text-2xs uppercase tracking-wider font-semibold text-sushi-text-muted flex items-center gap-1.5">
                <User size={14} className="text-sushi-gold" /> Khách hàng
              </span>
              <div className="font-bold text-sm text-sushi-text truncate">
                {order.customerName}
              </div>
              <div className="pt-0.5">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="inline-flex items-center gap-1.5 text-xs text-sushi-gold font-semibold hover:underline"
                >
                  <Phone size={13} weight="fill" />
                  <span>{order.customerPhone}</span>
                </a>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xs text-sushi-text-muted block mb-1">Loại hình</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1">
                <Truck size={12} />
                <span>Giao tận nơi</span>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sushi-surface/80 border border-sushi-border/80 flex items-start justify-between">
            <div className="space-y-1.5 min-w-0">
              <span className="text-2xs uppercase tracking-wider font-semibold text-sushi-text-muted flex items-center gap-1.5">
                <CreditCard size={14} className="text-sushi-gold" /> Thanh toán
              </span>
              <div className="flex items-center gap-2">
                <OrderPaymentBadge status={order.paymentStatus} />
                <span className="text-xs text-sushi-text-muted">({order.paymentMethod})</span>
              </div>
            </div>
            <Button
              size="small"
              onClick={handleTogglePayment}
              loading={updatePaymentMutation.isPending}
              className="text-xs rounded-lg border-sushi-border/80 text-sushi-gold hover:border-sushi-gold hover:text-sushi-gold shrink-0 mt-0.5"
            >
              {order.paymentStatus === 'PAID' ? 'Hủy đánh dấu Đã TT' : 'Đánh dấu Đã TT'}
            </Button>
          </div>
        </div>

        {isTransferUnpaid && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <WarningCircle size={18} className="text-amber-400 shrink-0 mt-0.5" weight="fill" />
            <div className="min-w-0 flex-1 leading-relaxed">
              <strong className="text-amber-300 block mb-0.5">Đơn hàng thanh toán chuyển khoản cần xác nhận:</strong>
              <span>Vui lòng kiểm tra tài khoản ngân hàng. Sau khi nhận được tiền, hãy bấm <strong>&quot;Đánh dấu Đã TT&quot;</strong> để mở khóa duyệt đơn hoặc chế biến.</span>
            </div>
          </div>
        )}

        {order.paymentQrUrl && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-sushi-border/60 flex items-center gap-3 text-xs">
            <img
              src={order.paymentQrUrl}
              alt="Mã QR thanh toán của đơn"
              className="w-14 h-14 object-contain rounded-lg border border-sushi-border/80 bg-zinc-950 p-1 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-2xs text-sushi-text-muted block">Mã QR đính kèm đơn:</span>
              <span className="font-semibold text-sushi-gold text-xs">Ảnh mã QR được chụp tại thời điểm khách đặt hàng</span>
            </div>
          </div>
        )}

        {/* Địa chỉ giao hàng tận nơi */}
        {order.address && (
          <div className="p-3.5 rounded-xl bg-sushi-surface/80 border border-sushi-border/80 flex items-start gap-2.5 text-xs">
            <MapPin size={18} className="text-sushi-gold shrink-0 mt-0.5" weight="fill" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-sushi-text-muted block text-2xs uppercase tracking-wider mb-0.5">
                Địa chỉ giao hàng:
              </span>
              <span className="text-sushi-text font-medium leading-relaxed block text-sm">
                {order.address}
              </span>
            </div>
          </div>
        )}

        {/* 2. Ghi chú từ khách hàng (nếu có) */}
        {order.note && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs flex items-start gap-2.5">
            <FileText size={17} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-amber-400">Ghi chú từ khách: </span>
              <span className="text-amber-200/90 italic leading-relaxed">{order.note}</span>
            </div>
          </div>
        )}

        {/* 3. Bảng danh sách món ăn & Hóa đơn tổng tiền gắn liền */}
        <div className="rounded-xl border border-sushi-border/80 overflow-hidden bg-sushi-surface/40">
          <div className="px-4 py-2.5 bg-zinc-900/70 border-b border-sushi-border/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sushi-text">
              Danh sách món ăn ({order.items?.length || 0})
            </span>
            <span className="text-xs text-sushi-gold font-semibold">
              {totalItemsCount} phần
            </span>
          </div>

          <Table
            dataSource={order.items || []}
            columns={itemColumns}
            rowKey="id"
            pagination={false}
            size="small"
            className="[&_.ant-table]:bg-transparent [&_.ant-table-thead_th]:bg-zinc-900/90 [&_.ant-table-thead_th]:text-sushi-text-muted [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-semibold [&_.ant-table-thead_th]:border-b-sushi-border/70"
          />

          <div className="px-4 py-3 bg-zinc-900/50 border-t border-sushi-border/80 flex items-center justify-between">
            <span className="text-sm font-semibold text-sushi-text-muted">
              Tổng tiền thanh toán:
            </span>
            <span className="text-xl font-bold font-mono text-sushi-gold">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* 4. Lịch sử vòng đời đơn (Dùng chung component OrderLifecycleTimeline) */}
        <OrderLifecycleTimeline histories={order.statusHistories} />
      </div>
    </Modal>
  );
}
