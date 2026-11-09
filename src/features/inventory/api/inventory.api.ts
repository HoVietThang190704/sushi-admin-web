import { fetchApi } from '@/lib/api';
import {
  Ingredient,
  InventoryTransaction,
  CreateIngredientInput,
  CreateTransactionInput,
  TransactionType,
  Warehouse,
  WarehouseStock,
  Recipe,
  UpsertRecipeInput,
  AdjustWarehouseStockInput,
} from '../types';

export const inventoryApi = {
  getIngredients: () => fetchApi<Ingredient[]>('/api/inventory/ingredients'),
  getAlerts: () => fetchApi<Ingredient[]>('/api/inventory/alerts'),
  createIngredient: (dto: CreateIngredientInput) =>
    fetchApi<Ingredient>('/api/inventory/ingredients', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  getTransactions: (type?: TransactionType, ingredientId?: string) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (ingredientId) params.set('ingredientId', ingredientId);
    const qs = params.toString();
    return fetchApi<InventoryTransaction[]>(`/api/inventory/transactions${qs ? `?${qs}` : ''}`);
  },
  createTransaction: (dto: CreateTransactionInput) =>
    fetchApi<InventoryTransaction>('/api/inventory/transactions', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  // Warehouses & Stocks
  getWarehouses: () => fetchApi<Warehouse[]>('/api/inventory/warehouses'),
  getWarehouseStocks: (warehouseId: string) =>
    fetchApi<WarehouseStock[]>(`/api/inventory/warehouses/${warehouseId}/stocks`),
  adjustWarehouseStock: (
    warehouseId: string,
    ingredientId: string,
    dto: AdjustWarehouseStockInput,
  ) =>
    fetchApi<{ transaction: InventoryTransaction; stock: WarehouseStock }>(
      `/api/inventory/warehouses/${warehouseId}/stocks/${ingredientId}`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    ),

  // Recipes (BOM)
  getRecipes: () => fetchApi<Recipe[]>('/api/inventory/recipes'),
  getRecipeByProduct: (productId: string) =>
    fetchApi<Recipe | null>(`/api/inventory/recipes/product/${productId}`),
  upsertRecipe: (dto: UpsertRecipeInput) =>
    fetchApi<Recipe>('/api/inventory/recipes', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  deleteRecipe: (id: string) =>
    fetchApi<{ id: string }>(`/api/inventory/recipes/${id}`, {
      method: 'DELETE',
    }),
};
