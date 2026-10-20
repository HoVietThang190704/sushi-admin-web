import { fetchApi } from '@/lib/api';
import {
  Ingredient,
  InventoryTransaction,
  CreateIngredientInput,
  CreateTransactionInput,
  TransactionType,
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
};
