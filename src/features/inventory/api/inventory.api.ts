import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
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
  getIngredients: () => fetchApi<Ingredient[]>(API_ENDPOINTS.INVENTORY.INGREDIENTS),
  getAlerts: () => fetchApi<Ingredient[]>(API_ENDPOINTS.INVENTORY.ALERTS),
  createIngredient: (dto: CreateIngredientInput) =>
    fetchApi<Ingredient>(API_ENDPOINTS.INVENTORY.INGREDIENTS, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  getTransactions: (type?: TransactionType, ingredientId?: string) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (ingredientId) params.set('ingredientId', ingredientId);
    const qs = params.toString();
    return fetchApi<InventoryTransaction[]>(
      `${API_ENDPOINTS.INVENTORY.TRANSACTIONS}${qs ? `?${qs}` : ''}`,
    );
  },
  createTransaction: (dto: CreateTransactionInput) =>
    fetchApi<InventoryTransaction>(API_ENDPOINTS.INVENTORY.TRANSACTIONS, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  // Warehouses & Stocks
  getWarehouses: () => fetchApi<Warehouse[]>(API_ENDPOINTS.INVENTORY.WAREHOUSES),
  getWarehouseStocks: (warehouseId: string) =>
    fetchApi<WarehouseStock[]>(API_ENDPOINTS.INVENTORY.WAREHOUSE_STOCKS(warehouseId)),
  adjustWarehouseStock: (
    warehouseId: string,
    ingredientId: string,
    dto: AdjustWarehouseStockInput,
  ) =>
    fetchApi<{ transaction: InventoryTransaction; stock: WarehouseStock }>(
      API_ENDPOINTS.INVENTORY.ADJUST_WAREHOUSE_STOCK(warehouseId, ingredientId),
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    ),

  // Recipes (BOM)
  getRecipes: () => fetchApi<Recipe[]>(API_ENDPOINTS.INVENTORY.RECIPES),
  getRecipeByProduct: (productId: string) =>
    fetchApi<Recipe | null>(API_ENDPOINTS.INVENTORY.RECIPE_BY_PRODUCT(productId)),
  upsertRecipe: (dto: UpsertRecipeInput) =>
    fetchApi<Recipe>(API_ENDPOINTS.INVENTORY.RECIPES, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  deleteRecipe: (id: string) =>
    fetchApi<{ id: string }>(API_ENDPOINTS.INVENTORY.RECIPE_BY_ID(id), {
      method: 'DELETE',
    }),
};
