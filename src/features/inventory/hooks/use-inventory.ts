'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { CreateIngredientInput, CreateTransactionInput, TransactionType } from '../types';
import { message } from '@/components/ui';

export const inventoryKeys = {
  all: ['inventory'] as const,
  ingredients: () => [...inventoryKeys.all, 'ingredients'] as const,
  alerts: () => [...inventoryKeys.all, 'alerts'] as const,
  transactions: (type?: TransactionType) => [...inventoryKeys.all, 'transactions', type] as const,
};

export function useIngredients() {
  return useQuery({
    queryKey: inventoryKeys.ingredients(),
    queryFn: () => inventoryApi.getIngredients(),
  });
}

export function useInventoryAlerts() {
  return useQuery({
    queryKey: inventoryKeys.alerts(),
    queryFn: () => inventoryApi.getAlerts(),
  });
}

export function useInventoryTransactions(type?: TransactionType) {
  return useQuery({
    queryKey: inventoryKeys.transactions(type),
    queryFn: () => inventoryApi.getTransactions(type),
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateIngredientInput) => inventoryApi.createIngredient(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      message.success(`Thêm nguyên liệu "${data.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể tạo nguyên liệu';
      message.error(msg);
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTransactionInput) => inventoryApi.createTransaction(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      const actionLabel = data.type === 'IN' ? 'Nhập kho' : 'Xuất kho';
      message.success(`${actionLabel} thành công! Mã phiếu: ${data.code}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Giao dịch kho thất bại';
      message.error(msg);
    },
  });
}
