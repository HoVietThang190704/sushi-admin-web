import { fetchApi } from '@/lib/api';
import {
  Order,
  GetOrdersFilter,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  PaymentConfig,
  UpdatePaymentConfigInput,
  StoreConfig,
  UpdateStoreConfigInput,
  CreateStaffOrderInput,
} from '../types';

export const ordersApi = {
  getOrders: (filters?: GetOrdersFilter) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters?.branchId) params.set('branchId', filters.branchId);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);

    const qs = params.toString();
    return fetchApi<Order[]>(`/api/orders${qs ? `?${qs}` : ''}`);
  },

  updateOrderStatus: (orderId: string, input: UpdateOrderStatusInput) =>
    fetchApi<Order>(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  updatePaymentStatus: (orderId: string, input: UpdatePaymentStatusInput) =>
    fetchApi<Order>(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  getPaymentConfig: () =>
    fetchApi<PaymentConfig>('/api/orders/payment-config'),

  updatePaymentConfig: (input: UpdatePaymentConfigInput) =>
    fetchApi<PaymentConfig>('/api/orders/payment-config', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  getStoreConfig: () =>
    fetchApi<StoreConfig>('/api/orders/store-config'),

  updateStoreConfig: (input: UpdateStoreConfigInput) =>
    fetchApi<StoreConfig>('/api/orders/store-config', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  createStaffOrder: (input: CreateStaffOrderInput) =>
    fetchApi<{ order: Order; trackingToken: string | null; isDuplicate: boolean }>(
      '/api/orders/staff',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    ),
};
