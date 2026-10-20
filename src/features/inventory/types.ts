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
  quantity: number;
  unitPrice?: number;
  note?: string;
}
