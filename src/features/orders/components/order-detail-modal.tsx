'use client';

import React, { useState } from 'react';
import {
  Modal,
  Button,
  Descriptions,
  Table,
  Space,
  Input,
  message,
  Popconfirm,
  Divider,
} from '@/components/ui';
import {
  CookingPot,
  CheckCircle,
  Package,
  WarningCircle,
  Receipt,
  User,
  Phone,
  FileText,
} from '@phosphor-icons/react';
import { Order, OrderItem, OrderStatus } from '../types';
import { OrderStatusBadge } from './order-status-badge';
import { OrderPaymentBadge } from './order-payment-badge';
import {
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from '../hooks/use-orders';

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
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentMutation = useUpdatePaymentStatus();

  if (!order) return null;

  const handleUpdateStatus = async (toStatus: OrderStatus, reason?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        input: { status: toStatus, reason },
      });
      message.success(`Đã cập nhật trạng thái đơn sang "${toStatus}"`);
      setShowCancelInput(false);
      setCancelReason('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại';
      message.error(msg);
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
        `Đã cập nhật trạng thái thanh toán sang "${nextStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}"`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thanh toán thất bại';
      message.error(msg);
    }
  };

  const itemColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, item: OrderItem) => (
        <div>
          <div className="font-medium text-sushi-text-primary">{name}</div>
          {item.note && (
            <div className="text-xs text-sushi-text-muted italic">
              Ghi chú: {item.note}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(price),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number) => (
        <span className="font-semibold text-sushi-gold">x{qty}</span>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right' as const,
      render: (subtotal: number) => (
        <span className="font-medium text-sushi-text-primary">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(subtotal)}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={750}
      title={
        <div className="flex items-center gap-3">
          <Receipt size={24} className="text-sushi-gold" />
          <span className="font-serif text-lg font-bold text-sushi-text-primary">
            Chi tiết đơn hàng {order.code}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-2 pt-2">
          {/* Nút hành động thanh toán */}
          <Button
            onClick={handleTogglePayment}
            loading={updatePaymentMutation.isPending}
            className="border-sushi-border"
          >
            {order.paymentStatus === 'PAID'
              ? 'Đánh dấu Chưa thanh toán'
              : 'Đánh dấu Đã thanh toán'}
          </Button>

          {/* Các nút chuyển trạng thái quy trình */}
          <Space>
            {order.status === 'PENDING' && (
              <>
                <Button
                  danger
                  onClick={() => setShowCancelInput(!showCancelInput)}
                >
                  Hủy đơn
                </Button>
                <Button
                  type="primary"
                  icon={<CookingPot size={18} />}
                  onClick={() => handleUpdateStatus('PREPARING')}
                  loading={updateStatusMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  Bắt đầu chế biến
                </Button>
              </>
            )}

            {order.status === 'PREPARING' && (
              <Button
                type="primary"
                icon={<Package size={18} />}
                onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
                loading={updateStatusMutation.isPending}
                className="bg-purple-600 hover:bg-purple-500"
              >
                Sẵn sàng lấy món
              </Button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <Button
                type="primary"
                icon={<CheckCircle size={18} />}
                onClick={() => handleUpdateStatus('COMPLETED')}
                loading={updateStatusMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Hoàn thành giao khách
              </Button>
            )}

            <Button onClick={onClose}>Đóng</Button>
          </Space>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Form nhập lý do hủy đơn nếu được bật */}
        {showCancelInput && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-2">
            <div className="text-sm font-medium text-rose-400 flex items-center gap-1.5">
              <WarningCircle size={18} />
              Xác nhận hủy đơn hàng này
            </div>
            <Input
              placeholder="Nhập lý do hủy đơn (ví dụ: Hết nguyên liệu, Khách đổi ý...)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="small" onClick={() => setShowCancelInput(false)}>
                Hủy bỏ
              </Button>
              <Popconfirm
                title="Bạn có chắc chắn muốn hủy đơn hàng này?"
                onConfirm={() => handleUpdateStatus('CANCELLED', cancelReason)}
                okText="Đồng ý hủy"
                cancelText="Quay lại"
              >
                <Button
                  size="small"
                  danger
                  type="primary"
                  loading={updateStatusMutation.isPending}
                >
                  Xác nhận Hủy
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}

        {/* Thông tin khách hàng & đơn hàng */}
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          className="bg-sushi-card/50"
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1 text-sushi-text-muted">
                <User size={16} /> Khách hàng
              </span>
            }
          >
            <span className="font-semibold text-sushi-text-primary">
              {order.customerName}
            </span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-1 text-sushi-text-muted">
                <Phone size={16} /> Số điện thoại
              </span>
            }
          >
            <a
              href={`tel:${order.customerPhone}`}
              className="text-sushi-gold font-medium hover:underline"
            >
              {order.customerPhone}
            </a>
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian đặt">
            {new Date(order.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>

          <Descriptions.Item label="Thanh toán">
            <div className="flex items-center gap-2">
              <OrderPaymentBadge status={order.paymentStatus} />
              <span className="text-xs text-sushi-text-muted">
                ({order.paymentMethod})
              </span>
            </div>
          </Descriptions.Item>

          {order.note && (
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1 text-sushi-text-muted">
                  <FileText size={16} /> Ghi chú
                </span>
              }
              span={2}
            >
              <span className="text-sushi-text-secondary italic">
                {order.note}
              </span>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Danh sách món ăn */}
        <div>
          <div className="text-sm font-semibold text-sushi-text-primary mb-2">
            Danh sách món ăn ({order.items?.length || 0})
          </div>
          <Table
            dataSource={order.items || []}
            columns={itemColumns}
            rowKey="id"
            pagination={false}
            size="small"
            className="border border-sushi-border rounded-lg overflow-hidden"
          />
        </div>

        {/* Tổng tiền */}
        <div className="flex justify-end items-center gap-3 pr-2">
          <span className="text-sm text-sushi-text-muted">Tổng thanh toán:</span>
          <span className="text-xl font-bold font-serif text-sushi-gold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(order.totalAmount)}
          </span>
        </div>

        {/* Lịch sử trạng thái */}
        {order.statusHistories && order.statusHistories.length > 0 && (
          <div>
            <Divider style={{ margin: '12px 0' }} />
            <div className="text-xs font-semibold text-sushi-text-muted uppercase tracking-wider mb-2">
              Lịch sử vòng đời đơn
            </div>
            <div className="space-y-1.5 text-xs text-sushi-text-secondary">
              {order.statusHistories.map((h) => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="text-sushi-text-muted">
                    {new Date(h.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="font-medium text-sushi-text-primary">
                    {h.fromStatus ? `${h.fromStatus} → ` : ''}
                    {h.toStatus}
                  </span>
                  <span className="text-sushi-text-muted">bởi {h.changedBy}</span>
                  {h.reason && (
                    <span className="italic text-amber-400/90">
                      ({h.reason})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
