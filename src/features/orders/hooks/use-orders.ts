import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { inventoryKeys } from '@/features/inventory/hooks/use-inventory';
import {
  GetOrdersFilter,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
} from '../types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: GetOrdersFilter) => [...orderKeys.lists(), filters] as const,
};

export function useOrders(filters?: GetOrdersFilter) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => ordersApi.getOrders(filters),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: UpdateOrderStatusInput;
    }) => ordersApi.updateOrderStatus(orderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: UpdatePaymentStatusInput;
    }) => ordersApi.updatePaymentStatus(orderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
