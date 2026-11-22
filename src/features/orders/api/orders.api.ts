import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  Order,
  GetOrdersFilter,
  PagedOrders,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  CreateStaffOrderInput,
} from '../types';

export const ordersApi = {
  getOrders: async (filters?: GetOrdersFilter): Promise<PagedOrders> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
    if (filters?.branchId) params.set('branchId', filters.branchId);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.page !== undefined) params.set('page', String(filters.page));
    if (filters?.limit !== undefined) params.set('limit', String(filters.limit));

    const qs = params.toString();
    const res = await fetchApi<PagedOrders | Order[]>(
      `${API_ENDPOINTS.ORDERS.ROOT}${qs ? `?${qs}` : ''}`,
    );

    if (Array.isArray(res)) {
      return {
        items: res,
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 50,
        total: res.length,
      };
    }

    return res;
  },

  updateOrderStatus: (orderId: string, input: UpdateOrderStatusInput) =>
    fetchApi<Order>(API_ENDPOINTS.ORDERS.STATUS(orderId), {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  updatePaymentStatus: (orderId: string, input: UpdatePaymentStatusInput) =>
    fetchApi<Order>(API_ENDPOINTS.ORDERS.PAYMENT(orderId), {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  createStaffOrder: (input: CreateStaffOrderInput) =>
    fetchApi<{ order: Order; trackingToken: string | null; isDuplicate: boolean }>(
      API_ENDPOINTS.ORDERS.STAFF,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    ),
};
