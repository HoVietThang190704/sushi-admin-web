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
  source?: 'STOREFRONT' | 'STAFF';
  paymentQrUrl?: string | null;
  paymentBankInfo?: string | null;
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
  page?: number;
  limit?: number;
}

export interface PagedOrders {
  items: Order[];
  page: number;
  limit: number;
  total: number;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  reason?: string;
}

export interface UpdatePaymentStatusInput {
  paymentStatus: PaymentStatus;
}

export interface PaymentConfig {
  id: string;
  key: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  qrImageUrl?: string | null;
  transferSyntax?: string | null;
  note?: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface UpdatePaymentConfigInput {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrImageUrl?: string;
  transferSyntax?: string;
  note?: string;
  isActive?: boolean;
}

export interface StoreConfig {
  id: string;
  key: string;
  customerOrderingEnabled: boolean;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStoreConfigInput {
  customerOrderingEnabled?: boolean;
  contactPhone?: string;
}

export interface CreateStaffOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateStaffOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  province?: string;
  district: string;
  ward: string;
  branchId: string;
  note?: string;
  paymentMethod?: string;
  items: CreateStaffOrderItemInput[];
}
