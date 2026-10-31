import { z } from 'zod';
import type { TranslationKey } from '@/lib/i18n';

export type ProductType = 'SINGLE' | 'COMBO';

export const createCategorySchemaFactory = (t: (key: TranslationKey) => string) =>
  z.object({
    name: z
      .string({ error: t('validation.categoryNameRequired') })
      .trim()
      .min(1, t('validation.categoryNameRequired'))
      .min(2, t('validation.categoryNameMin'))
      .max(100, t('validation.categoryNameMax')),
    parentId: z.string().uuid(t('validation.parentIdInvalid')).optional(),
  });

export const createCategorySchema = z.object({
  name: z
    .string({ error: 'Vui lòng nhập tên danh mục!' })
    .trim()
    .min(1, 'Vui lòng nhập tên danh mục!')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự'),
  parentId: z.string().uuid('Parent ID phải là UUID hợp lệ').optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createProductSchemaFactory = (t: (key: TranslationKey) => string) =>
  z.object({
    sku: z
      .string({ error: t('validation.productSkuRequired') })
      .trim()
      .min(1, t('validation.productSkuRequired'))
      .max(60, t('validation.productSkuMax')),
    barcode: z.string().max(100).optional(),
    name: z
      .string({ error: t('validation.productNameRequired') })
      .trim()
      .min(2, t('validation.productNameMin'))
      .max(160, t('validation.productNameMax')),
    type: z.enum(['SINGLE', 'COMBO']).default('SINGLE'),
    categoryId: z.string().uuid().optional(),
    sellingPrice: z.coerce
      .number({ error: t('validation.productPriceRequired') })
      .positive(t('validation.productPricePositive')),
    imageUrl: z.string().url(t('validation.productImageInvalid')).optional().or(z.literal('')),
  });

export const createProductSchema = z.object({
  sku: z
    .string({ error: 'SKU không được để trống' })
    .trim()
    .min(1, 'SKU không được để trống')
    .max(60, 'SKU không được vượt quá 60 ký tự'),
  barcode: z.string().max(100).optional(),
  name: z
    .string({ error: 'Vui lòng nhập tên món ăn' })
    .trim()
    .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự')
    .max(160, 'Tên sản phẩm không được vượt quá 160 ký tự'),
  type: z.enum(['SINGLE', 'COMBO']).default('SINGLE'),
  categoryId: z.string().uuid('Category ID phải là UUID hợp lệ').optional(),
  sellingPrice: z.coerce
    .number({ error: 'Vui lòng nhập giá bán' })
    .positive('Giá bán phải lớn hơn 0'),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').optional().or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
