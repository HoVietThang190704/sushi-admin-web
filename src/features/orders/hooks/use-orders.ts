import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { inventoryKeys } from '@/features/inventory/hooks/use-inventory';
import {
  GetOrdersFilter,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  UpdatePaymentConfigInput,
  UpdateStoreConfigInput,
  CreateStaffOrderInput,
} from '../types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: GetOrdersFilter) => [...orderKeys.lists(), filters] as const,
  paymentConfig: ['payment-config'] as const,
  storeConfig: ['store-config'] as const,
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

export function usePaymentConfig() {
  return useQuery({
    queryKey: orderKeys.paymentConfig,
    queryFn: () => ordersApi.getPaymentConfig(),
  });
}

export function useUpdatePaymentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePaymentConfigInput) =>
      ordersApi.updatePaymentConfig(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.paymentConfig });
    },
  });
}

export function useStoreConfig() {
  return useQuery({
    queryKey: orderKeys.storeConfig,
    queryFn: () => ordersApi.getStoreConfig(),
  });
}

export function useUpdateStoreConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStoreConfigInput) =>
      ordersApi.updateStoreConfig(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.storeConfig });
    },
  });
}

export function useCreateStaffOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStaffOrderInput) =>
      ordersApi.createStaffOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
