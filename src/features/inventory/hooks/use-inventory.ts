'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import {
  CreateIngredientInput,
  CreateTransactionInput,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  TransactionType,
  UpsertRecipeInput,
  AdjustWarehouseStockInput,
} from '../types';
import { message } from '@/components/ui';

export const inventoryKeys = {
  all: ['inventory'] as const,
  ingredients: () => [...inventoryKeys.all, 'ingredients'] as const,
  alerts: () => [...inventoryKeys.all, 'alerts'] as const,
  transactions: (type?: TransactionType) => [...inventoryKeys.all, 'transactions', type] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  warehouseStocks: (warehouseId?: string) =>
    [...inventoryKeys.all, 'warehouse-stocks', warehouseId] as const,
  recipes: () => [...inventoryKeys.all, 'recipes'] as const,
  recipeByProduct: (productId?: string) =>
    [...inventoryKeys.all, 'recipes', 'product', productId] as const,
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

// ------------------------------------------
// Warehouses & Stocks Hooks
// ------------------------------------------

export function useWarehouses() {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: () => inventoryApi.getWarehouses(),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWarehouseInput) => inventoryApi.createWarehouse(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      message.success(`Đã tạo kho "${data.name}" (${data.code}) thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể tạo kho nguyên liệu';
      message.error(msg);
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWarehouseInput }) =>
      inventoryApi.updateWarehouse(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      message.success(`Cập nhật kho "${data.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật kho nguyên liệu';
      message.error(msg);
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteWarehouse(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      if (res.deactivated) {
        message.info('Kho đã có lịch sử giao dịch nên được chuyển sang trạng thái Tạm ngừng.');
      } else {
        message.success('Đã xóa kho nguyên liệu thành công!');
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể xóa kho nguyên liệu';
      message.error(msg);
    },
  });
}

export function useWarehouseStocks(warehouseId?: string) {
  return useQuery({
    queryKey: inventoryKeys.warehouseStocks(warehouseId),
    queryFn: () => (warehouseId ? inventoryApi.getWarehouseStocks(warehouseId) : Promise.resolve([])),
    enabled: Boolean(warehouseId),
  });
}

export function useAdjustWarehouseStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      warehouseId,
      ingredientId,
      dto,
    }: {
      warehouseId: string;
      ingredientId: string;
      dto: AdjustWarehouseStockInput;
    }) => inventoryApi.adjustWarehouseStock(warehouseId, ingredientId, dto),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      const actionLabel = res.transaction.type === 'IN' ? 'Nhập kho' : 'Xuất kho';
      message.success(`${actionLabel} thành công! Mã phiếu: ${res.transaction.code}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Điều chỉnh kho thất bại';
      message.error(msg);
    },
  });
}

// ------------------------------------------
// Recipe (BOM) Hooks
// ------------------------------------------

export function useRecipes() {
  return useQuery({
    queryKey: inventoryKeys.recipes(),
    queryFn: () => inventoryApi.getRecipes(),
  });
}

export function useRecipeByProduct(productId?: string) {
  return useQuery({
    queryKey: inventoryKeys.recipeByProduct(productId),
    queryFn: () => (productId ? inventoryApi.getRecipeByProduct(productId) : Promise.resolve(null)),
    enabled: Boolean(productId),
  });
}

export function useUpsertRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpsertRecipeInput) => inventoryApi.upsertRecipe(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      message.success('Lưu công thức món ăn thành công!');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Lưu công thức thất bại';
      message.error(msg);
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      message.success('Đã xóa công thức thành công!');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Xóa công thức thất bại';
      message.error(msg);
    },
  });
}
