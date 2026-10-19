export type { CreateCategoryInput, CreateProductInput, ProductType } from './schemas/catalog.schema';

export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  type: 'SINGLE' | 'COMBO';
  categoryId?: string | null;
  category?: Category | null;
  sellingPrice: number | string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
