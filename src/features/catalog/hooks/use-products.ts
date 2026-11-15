'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog.api';
import { Product, CreateProductInput, UpdateProductInput } from '../types';
import { catalogKeys } from './use-categories';
import { message } from '@/components/ui';

/**
 * Hook lấy danh sách món ăn với Caching tự động (TanStack Query v5)
 */
export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: catalogKeys.products(categoryId),
    queryFn: () => catalogApi.getProducts(categoryId, true),
  });
}

/**
 * Hook lấy chi tiết 1 món ăn (bao gồm danh sách món con nếu là COMBO)
 */
export function useProductDetail(productId?: string) {
  return useQuery({
    queryKey: [...catalogKeys.all, 'product-detail', productId] as const,
    queryFn: () => (productId ? catalogApi.getProductById(productId) : Promise.resolve(null)),
    enabled: Boolean(productId),
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

/**
 * Hook cập nhật món ăn
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductInput }) =>
      catalogApi.updateProduct(id, dto),
    onSuccess: (updatedProduct: Product) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success(`Cập nhật món "${updatedProduct.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật món ăn';
      message.error(msg);
    },
  });
}

/**
 * Hook xóa món ăn
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success('Đã xóa món ăn thành công!');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể xóa món ăn';
      message.error(msg);
    },
  });
}
