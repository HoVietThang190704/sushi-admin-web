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
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  STAFF: {
    ROOT: '/api/staff',
    BY_ID: (id: string) => `/api/staff/${id}`,
    STATUS: (id: string) => `/api/staff/${id}/status`,
    RESET_PASSWORD: (id: string) => `/api/staff/${id}/reset-password`,
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
    STAFF: '/api/orders/staff',
    BY_ID: (id: string) => `/api/orders/${id}`,
    STATUS: (id: string) => `/api/orders/${id}/status`,
    PAYMENT: (id: string) => `/api/orders/${id}/payment`,
    PAYMENT_CONFIG: '/api/orders/payment-config',
    STORE_CONFIG: '/api/orders/store-config',
  },
  INVENTORY: {
    INGREDIENTS: '/api/inventory/ingredients',
    ALERTS: '/api/inventory/alerts',
    TRANSACTIONS: '/api/inventory/transactions',
    WAREHOUSES: '/api/inventory/warehouses',
    WAREHOUSE_BY_ID: (id: string) => `/api/inventory/warehouses/${id}`,
    WAREHOUSE_STOCKS: (warehouseId: string) =>
      `/api/inventory/warehouses/${warehouseId}/stocks`,
    ADJUST_WAREHOUSE_STOCK: (warehouseId: string, ingredientId: string) =>
      `/api/inventory/warehouses/${warehouseId}/stocks/${ingredientId}`,
    RECIPES: '/api/inventory/recipes',
    RECIPE_BY_ID: (id: string) => `/api/inventory/recipes/${id}`,
    RECIPE_BY_PRODUCT: (productId: string) =>
      `/api/inventory/recipes/product/${productId}`,
  },
  SHIPPING: {
    BRANCHES: '/api/shipping/branches',
    BRANCHES_MANAGE: '/api/shipping/branches/manage',
    BRANCH_BY_ID: (id: string) => `/api/shipping/branches/${id}`,
    RULES: '/api/shipping/rules',
    RULE_BY_ID: (id: string) => `/api/shipping/rules/${id}`,
    LOCATIONS: '/api/shipping/locations',
    CALCULATE: '/api/shipping/calculate',
  },
} as const;
