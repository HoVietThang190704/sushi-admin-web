import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Category, CreateCategoryInput, Product, CreateProductInput } from '../types';

export const catalogApi = {
  /**
   * Lấy danh sách danh mục thực đơn (Kèm số lượng món ăn)
   */
  getCategories: async (): Promise<Category[]> => {
    return fetchApi<Category[]>(API_ENDPOINTS.CATALOG.CATEGORIES);
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
   * Lấy danh sách sản phẩm (có thể lọc theo categoryId)
   */
  getProducts: async (categoryId?: string): Promise<Product[]> => {
    const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
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
};
