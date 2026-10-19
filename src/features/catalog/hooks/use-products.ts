'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog.api';
import { Product, CreateProductInput } from '../types';
import { catalogKeys } from './use-categories';
import { message } from '@/components/ui';

/**
 * Hook lấy danh sách món ăn với Caching tự động (TanStack Query v5)
 */
export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: catalogKeys.products(categoryId),
    queryFn: () => catalogApi.getProducts(categoryId),
  });
}

/**
 * Hook tạo món ăn mới với tự động làm mới Cache
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductInput) => catalogApi.createProduct(dto),
    onSuccess: (newProduct: Product) => {
      // Làm mới toàn bộ cache liên quan tới catalog
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success(`Thêm món "${newProduct.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể tạo món ăn';
      message.error(msg);
    },
  });
}
