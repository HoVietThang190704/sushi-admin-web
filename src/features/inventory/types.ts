export type TransactionType = 'IN' | 'OUT';

export type TransactionReason =
  | 'INITIAL_STOCK'
  | 'PURCHASE'
  | 'KITCHEN_USAGE'
  | 'DISCARD_WASTE'
  | 'ADJUSTMENT';

export type StockAlertStatus = 'SAFE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  status: StockAlertStatus;
  isAlert: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
  };
}

export interface InventoryTransaction {
  id: string;
  code: string;
  type: TransactionType;
  reason: TransactionReason;
  ingredientId: string;
  ingredient?: {
    code: string;
    name: string;
    unit: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  note?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface CreateIngredientInput {
  code: string;
  name: string;
  unit: string;
  costPrice: number;
  minStock: number;
  initialStock?: number;
}

export interface CreateTransactionInput {
  type: TransactionType;
  reason: TransactionReason;
  ingredientId: string;
  warehouseId?: string;
  quantity: number;
  unitPrice?: number;
  note?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branches?: Array<{
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  }>;
  _count?: {
    stocks: number;
    branches: number;
  };
}

export interface CreateWarehouseInput {
  code: string;
  name: string;
  address?: string;
}

export interface UpdateWarehouseInput {
  code?: string;
  name?: string;
  address?: string | null;
  isActive?: boolean;
}

export interface DeleteWarehouseResult {
  id: string;
  deleted: boolean;
  deactivated: boolean;
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  ingredientId: string;
  currentStock: number;
  minStock: number;
  status: StockAlertStatus;
  isAlert: boolean;
  ingredient: {
    id: string;
    code: string;
    name: string;
    unit: string;
    costPrice: number;
    isActive: boolean;
  };
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  ingredient: {
    id: string;
    code: string;
    name: string;
    unit: string;
    costPrice: number;
  };
}

export interface Recipe {
  id: string;
  productId: string;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    sku: string;
    name: string;
    sellingPrice: number;
    imageUrl?: string | null;
    type: 'SINGLE' | 'COMBO';
  };
  items: RecipeItem[];
}

export interface UpsertRecipeInput {
  productId: string;
  notes?: string;
  items: Array<{
    ingredientId: string;
    quantity: number;
  }>;
}

export interface AdjustWarehouseStockInput {
  type: TransactionType;
  reason: TransactionReason;
  quantity: number;
  unitPrice?: number;
  note?: string;
}
