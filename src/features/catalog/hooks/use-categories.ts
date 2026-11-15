'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog.api';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types';
import { message } from '@/components/ui';

// Query Keys Factory Pattern chuẩn công nghiệp
export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  categoryDetail: (id: string) => [...catalogKeys.all, 'category-detail', id] as const,
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
 * Hook lấy chi tiết 1 danh mục kèm danh sách món ăn bên trong
 */
export function useCategoryDetail(categoryId?: string) {
  return useQuery({
    queryKey: [...catalogKeys.all, 'category-detail', categoryId] as const,
    queryFn: () => (categoryId ? catalogApi.getCategoryById(categoryId) : Promise.resolve(null)),
    enabled: Boolean(categoryId),
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
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success(`Tạo danh mục "${newCat.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể tạo danh mục';
      message.error(msg);
    },
  });
}

/**
 * Hook cập nhật danh mục thực đơn
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryInput }) =>
      catalogApi.updateCategory(id, dto),
    onSuccess: (updatedCat: Category) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success(`Cập nhật danh mục "${updatedCat.name}" thành công!`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật danh mục';
      message.error(msg);
    },
  });
}

/**
 * Hook xóa danh mục thực đơn
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      message.success('Đã xóa danh mục thành công!');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể xóa danh mục';
      message.error(msg);
    },
  });
}
