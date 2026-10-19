'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog.api';
import { Category, CreateCategoryInput } from '../types';
import { message } from '@/components/ui';

// Query Keys Factory Pattern chuẩn công nghiệp
export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (categoryId?: string) =>
    [...catalogKeys.all, 'products', { categoryId }] as const,
  productDetail: (id: string) => [...catalogKeys.all, 'product', id] as const,
};

/**
 * Hook tải danh mục với Caching tự động (TanStack Query v5)
 */
export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.getCategories(),
  });
}

/**
 * Hook trích xuất danh sách options cho thẻ Select danh mục (DRY)
 */
export function useCategoryOptions() {
  const { data: categories = [], isLoading } = useCategories();
  const options = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  return { options, categories, isLoading };
}

/**
 * Hook tạo danh mục với tự động làm mới Cache toàn hệ thống
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCategoryInput) => catalogApi.createCategory(dto),
    onSuccess: (newCat: Category) => {
      // Làm mới cache danh mục ngay lập tức trên mọi màn hình
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
      message.success(`Tạo danh mục "${newCat.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể tạo danh mục';
      message.error(msg);
    },
  });
}
