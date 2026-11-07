export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PAID';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  note?: string | null;
  createdAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  reason?: string | null;
  changedBy: string;
  createdAt: string;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  branchId?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingFee?: number;
  totalAmount: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  statusHistories?: OrderStatusHistory[];
}

export interface GetOrdersFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  reason?: string;
}

export interface UpdatePaymentStatusInput {
  paymentStatus: PaymentStatus;
}
