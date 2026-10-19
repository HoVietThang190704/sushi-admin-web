import { z } from 'zod';

export type ProductType = 'SINGLE' | 'COMBO';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập tên danh mục!')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự'),
  parentId: z.string().uuid('Parent ID phải là UUID hợp lệ').optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU không được để trống')
    .max(60, 'SKU không được vượt quá 60 ký tự'),
  barcode: z.string().max(100).optional(),
  name: z
    .string()
    .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự')
    .max(160, 'Tên sản phẩm không được vượt quá 160 ký tự'),
  type: z.enum(['SINGLE', 'COMBO']).default('SINGLE'),
  categoryId: z.string().uuid('Category ID phải là UUID hợp lệ').optional(),
  sellingPrice: z.coerce
    .number()
    .positive('Giá bán phải lớn hơn 0'),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').optional().or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
