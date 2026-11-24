import type { CreateCategoryInput, CreateProductInput, ProductType } from './schemas/catalog.schema';

export type { CreateCategoryInput, CreateProductInput, ProductType };

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
export type UpdateProductInput = Partial<CreateProductInput> & { isActive?: boolean };

export interface Category {
  id: string;
  name: string;
  sortOrder?: number;
  parentId?: string | null;
  createdAt: string;
  products?: Product[];
  _count?: {
    products: number;
  };
}

export interface ComboItem {
  id: string;
  parentProductId: string;
  childProductId: string;
  quantity: number;
  childProduct?: Product;
}

export interface Product {
  id: string;
  sku: string;
  slug?: string;
  barcode?: string | null;
  name: string;
  type: 'SINGLE' | 'COMBO';
  categoryId?: string | null;
  category?: Category | null;
  sellingPrice: number | string;
  imageUrl?: string | null;
  description?: string | null;
  accompaniments?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  comboItemsAsParent?: ComboItem[];
}
