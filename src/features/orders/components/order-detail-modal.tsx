'use client';

import React, { useState } from 'react';
import {
  Modal,
  Drawer,
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
  XCircle,
  CreditCard,
  Truck,
  MapPin,
  WarningCircle,
  CircleNotch,
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
import { useTranslation } from '@/lib/i18n';
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
  const { t } = useTranslation();

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
                {order.source === 'STAFF' ? (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    Nhân viên tạo
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Website
                  </span>
                )}
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
              aria-label={t('ordersPage.modalCloseBtn')}
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
                  <div className="text-2xs text-sushi-text-muted uppercase tracking-wider font-semibold">{t('ordersPage.modalCustomer')}</div>
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
                <div className="text-2xs text-sushi-text-muted uppercase tracking-wider font-semibold mb-1">{t('ordersPage.modalPayment')}</div>
                <div className="flex items-center gap-1.5">
                  <OrderPaymentBadge status={order.paymentStatus} />
                  <span className="text-2xs text-sushi-text-muted">({order.paymentMethod})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTogglePayment}
                disabled={updatePaymentMutation.isPending}
                className="h-8 px-3 rounded-lg border border-sushi-gold/35 bg-sushi-gold/10 hover:bg-sushi-gold/20 text-sushi-gold font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {updatePaymentMutation.isPending && (
                  <CircleNotch size={13} className="animate-spin" />
                )}
                <span>{order.paymentStatus === 'PAID' ? t('ordersPage.modalToggleUnpaid') : t('ordersPage.modalTogglePaid')}</span>
              </button>
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
              <span>{t('ordersPage.modalItemsList')}</span>
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
                {t('ordersPage.modalTotalPayment')}:
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
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-xl text-sm font-semibold border border-sushi-border bg-sushi-surface/80 text-sushi-text hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}
        </div>

        {/* Sticky Mobile Action Footer */}
        {hasActiveWorkflow && (
          <div className="sticky bottom-0 z-20 bg-sushi-card/95 backdrop-blur-md px-4 py-3 border-t border-sushi-border/80 shrink-0 space-y-2">
            {order.status === 'PENDING' && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="h-11 px-4 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <XCircle size={16} weight="bold" />
                  <span>{t('ordersPage.modalCancelOrderBtn')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('CONFIRMED', t('ordersPage.modalConfirmOrderBtn'))}
                  disabled={isTransferUnpaid || updateStatusMutation.isPending}
                  className={`flex-1 h-11 px-4 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                    isTransferUnpaid
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : 'bg-linear-to-r from-[#e53935] to-[#f43f5e] hover:brightness-110 text-white shadow-lg shadow-red-950/40 cursor-pointer disabled:opacity-60'
                  }`}
                  title={isTransferUnpaid ? 'Cần xác nhận thanh toán trước khi duyệt đơn' : undefined}
                >
                  {updateStatusMutation.isPending ? (
                    <CircleNotch size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} weight="bold" />
                  )}
                  <span>{isTransferUnpaid ? t('ordersPage.modalWaitingPayment') : t('ordersPage.modalConfirmOrderBtn')}</span>
                </button>
              </div>
            )}

            {order.status === 'CONFIRMED' && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="h-11 px-4 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <XCircle size={16} weight="bold" />
                  <span>{t('ordersPage.modalCancelOrderBtn')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('PREPARING', t('ordersPage.modalStartCookingBtn'))}
                  disabled={isTransferUnpaid || updateStatusMutation.isPending}
                  className={`flex-1 h-11 px-4 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                    isTransferUnpaid
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-60'
                  }`}
                  title={isTransferUnpaid ? 'Cần xác nhận thanh toán trước khi chế biến' : undefined}
                >
                  {updateStatusMutation.isPending ? (
                    <CircleNotch size={18} className="animate-spin" />
                  ) : (
                    <CookingPot size={18} weight="bold" />
                  )}
                  <span>{isTransferUnpaid ? t('ordersPage.modalWaitingPayment') : t('ordersPage.modalStartCookingBtn')}</span>
                </button>
              </div>
            )}

            {order.status === 'PREPARING' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
                disabled={updateStatusMutation.isPending}
                className="w-full h-11 px-4 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/40 inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {updateStatusMutation.isPending ? (
                  <CircleNotch size={18} className="animate-spin" />
                ) : (
                  <Package size={18} weight="bold" />
                )}
                <span>{t('ordersPage.modalReadyPickupBtn')}</span>
              </button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('DELIVERING')}
                disabled={updateStatusMutation.isPending}
                className="w-full h-11 px-4 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40 inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {updateStatusMutation.isPending ? (
                  <CircleNotch size={18} className="animate-spin" />
                ) : (
                  <Truck size={18} weight="bold" />
                )}
                <span>{t('ordersPage.modalDeliveringBtn')}</span>
              </button>
            )}

            {order.status === 'DELIVERING' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={updateStatusMutation.isPending}
                className="w-full h-11 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {updateStatusMutation.isPending ? (
                  <CircleNotch size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} weight="bold" />
                )}
                <span>{t('ordersPage.modalCompletedBtn')}</span>
              </button>
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
              {order.source === 'STAFF' ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  Nhân viên tạo qua điện thoại
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Khách đặt trực tuyến
                </span>
              )}
            </div>
            <div className="text-xs text-sushi-text-muted mt-0.5 font-sans">
              Thời gian đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-sushi-border bg-sushi-surface/80 text-sushi-text hover:bg-zinc-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <Space size="small">
            {order.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="h-10 px-4 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle size={16} weight="bold" />
                  <span>{t('ordersPage.modalCancelOrderBtn')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('CONFIRMED', t('ordersPage.modalConfirmOrderBtn'))}
                  disabled={isTransferUnpaid || updateStatusMutation.isPending}
                  className={`h-10 px-5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition-all ${
                    isTransferUnpaid
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : 'bg-linear-to-r from-[#e53935] to-[#f43f5e] hover:brightness-110 text-white shadow-lg shadow-red-950/40 cursor-pointer disabled:opacity-60'
                  }`}
                  title={isTransferUnpaid ? 'Cần bấm "Đánh dấu Đã TT" trước khi duyệt đơn' : undefined}
                >
                  {updateStatusMutation.isPending ? (
                    <CircleNotch size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} weight="bold" />
                  )}
                  <span>{isTransferUnpaid ? 'Chờ thanh toán' : 'Xác nhận đơn'}</span>
                </button>
              </>
            )}

            {order.status === 'CONFIRMED' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCancelInput(!showCancelInput)}
                  className="h-10 px-4 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle size={16} weight="bold" />
                  <span>{t('ordersPage.modalCancelOrderBtn')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('PREPARING', t('ordersPage.modalStartCookingBtn'))}
                  disabled={isTransferUnpaid || updateStatusMutation.isPending}
                  className={`h-10 px-5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition-all ${
                    isTransferUnpaid
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-60'
                  }`}
                  title={isTransferUnpaid ? 'Cần bấm "Đánh dấu Đã TT" trước khi chế biến' : undefined}
                >
                  {updateStatusMutation.isPending ? (
                    <CircleNotch size={18} className="animate-spin" />
                  ) : (
                    <CookingPot size={18} weight="bold" />
                  )}
                  <span>{isTransferUnpaid ? 'Chờ thanh toán' : 'Bắt đầu chế biến'}</span>
                </button>
              </>
            )}

            {order.status === 'PREPARING' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
                disabled={updateStatusMutation.isPending}
                className="h-10 px-5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/40 inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {updateStatusMutation.isPending ? (
                  <CircleNotch size={18} className="animate-spin" />
                ) : (
                  <Package size={18} weight="bold" />
                )}
                <span>Sẵn sàng lấy món</span>
              </button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('DELIVERING')}
                disabled={updateStatusMutation.isPending}
                className="h-10 px-5 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40 inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {updateStatusMutation.isPending ? (
                  <CircleNotch size={18} className="animate-spin" />
                ) : (
                  <Truck size={18} weight="bold" />
                )}
                <span>{t('ordersPage.modalDeliveringBtn')}</span>
              </button>
            )}

            {order.status === 'DELIVERING' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={updateStatusMutation.isPending}
                className="h-10 px-5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {updateStatusMutation.isPending ? (
                  <CircleNotch size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} weight="bold" />
                )}
                <span>{t('ordersPage.modalCompletedBtn')}</span>
              </button>
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
                <User size={14} className="text-sushi-gold" /> {t('ordersPage.modalCustomer')}
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
                <span>{t('ordersPage.modalDeliveryVal')}</span>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sushi-surface/80 border border-sushi-border/80 flex items-start justify-between">
            <div className="space-y-1.5 min-w-0">
              <span className="text-2xs uppercase tracking-wider font-semibold text-sushi-text-muted flex items-center gap-1.5">
                <CreditCard size={14} className="text-sushi-gold" /> {t('ordersPage.modalPayment')}
              </span>
              <div className="flex items-center gap-2">
                <OrderPaymentBadge status={order.paymentStatus} />
                <span className="text-xs text-sushi-text-muted">({order.paymentMethod})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTogglePayment}
              disabled={updatePaymentMutation.isPending}
              className="h-8 px-3 rounded-lg border border-sushi-gold/35 bg-sushi-gold/10 hover:bg-sushi-gold/20 text-sushi-gold font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 mt-0.5 disabled:opacity-50"
            >
              {updatePaymentMutation.isPending && (
                <CircleNotch size={13} className="animate-spin" />
              )}
              <span>{order.paymentStatus === 'PAID' ? t('ordersPage.modalUnmarkPaid') : t('ordersPage.modalMarkPaid')}</span>
            </button>
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
                {t('ordersPage.modalAddress')}:
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
              <span className="font-semibold text-amber-400">{t('ordersPage.modalCustomerNote')}: </span>
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
              {t('ordersPage.modalTotalPayment')}:
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
