/**
 * Centralized API Endpoints Dictionary for Sushi Platform
 * Single Source of Truth for all Network Contracts & Routing
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  CATALOG: {
    CATEGORIES: '/api/catalog/categories',
    CATEGORY_BY_ID: (id: string) => `/api/catalog/categories/${id}`,
    PRODUCTS: '/api/catalog/products',
    PRODUCT_BY_ID: (id: string) => `/api/catalog/products/${id}`,
    UPLOAD: '/api/catalog/upload',
  },
  ORDERS: {
    ROOT: '/api/orders',
    BY_ID: (id: string) => `/api/orders/${id}`,
  },
  INVENTORY: {
    BALANCES: '/api/inventory/balances',
    MOVEMENTS: '/api/inventory/movements',
  },
} as const;
