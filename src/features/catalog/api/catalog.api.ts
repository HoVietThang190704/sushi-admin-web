import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

export const catalogApi = {
  /**
   * Lấy danh sách danh mục thực đơn (Kèm số lượng món ăn)
   */
  getCategories: async (): Promise<Category[]> => {
    return fetchApi<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES);
  },

  /**
   * Lấy chi tiết 1 danh mục kèm danh sách món ăn bên trong
   */
  getCategoryById: async (id: string): Promise<Category> => {
    return fetchApi<Category>(API_ENDPOINTS.CATALOG.CATEGORY_BY_ID(id));
  },

  /**
   * Tạo danh mục mới (Yêu cầu quyền SUPER_ADMIN hoặc BRANCH_MANAGER)
   */
  createCategory: async (dto: CreateCategoryInput): Promise<Category> => {
    return fetchApi<Category>(API_ENDPOINTS.CATALOG.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Cập nhật danh mục thực đơn
   */
  updateCategory: async (id: string, dto: UpdateCategoryInput): Promise<Category> => {
    return fetchApi<Category>(API_ENDPOINTS.CATALOG.CATEGORY_BY_ID(id), {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Xóa danh mục thực đơn
   */
  deleteCategory: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    return fetchApi<{ id: string; deleted: boolean }>(API_ENDPOINTS.CATALOG.CATEGORY_BY_ID(id), {
      method: 'DELETE',
    });
  },

  /**
   * Lấy danh sách sản phẩm (có thể lọc theo categoryId, mặc định bao gồm cả món tạm ngừng cho Admin)
   */
  getProducts: async (categoryId?: string, includeInactive = true): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (includeInactive) params.set('includeInactive', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Product[]>(`${API_ENDPOINTS.CATALOG.PRODUCTS}${query}`);
  },

  /**
   * Lấy chi tiết 1 sản phẩm theo ID (kèm thông tin combo nếu có)
   */
  getProductById: async (id: string): Promise<Product> => {
    return fetchApi<Product>(API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(id));
  },

  /**
   * Tạo sản phẩm mới
   */
  createProduct: async (dto: CreateProductInput): Promise<Product> => {
    return fetchApi<Product>(API_ENDPOINTS.CATALOG.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Cập nhật sản phẩm / món ăn
   */
  updateProduct: async (id: string, dto: UpdateProductInput): Promise<Product> => {
    return fetchApi<Product>(API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(id), {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Xóa sản phẩm / món ăn
   */
  deleteProduct: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    return fetchApi<{ id: string; deleted: boolean }>(API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(id), {
      method: 'DELETE',
    });
  },

  /**
   * Tải ảnh lên Cloudinary qua Catalog Service
   */
  uploadImage: async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchApi<{ url: string; publicId: string }>(API_ENDPOINTS.CATALOG.UPLOAD, {
      method: 'POST',
      body: formData,
    });
  },
};
