import { z } from 'zod';
import type { TranslationKey } from '@/lib/i18n';

export const createIngredientSchemaFactory = (t: (key: TranslationKey) => string) =>
  z.object({
    code: z
      .string({ error: t('validation.ingredientCodeRequired') })
      .trim()
      .min(2, t('validation.ingredientCodeMin'))
      .max(50, t('validation.ingredientCodeMax'))
      .toUpperCase(),
    name: z
      .string({ error: t('validation.ingredientNameRequired') })
      .trim()
      .min(2, t('validation.ingredientNameMin'))
      .max(160, t('validation.ingredientNameMax')),
    unit: z
      .string({ error: t('validation.ingredientUnitRequired') })
      .trim()
      .min(1, t('validation.ingredientUnitRequired')),
    costPrice: z.coerce
      .number({ error: t('validation.costPriceMin') })
      .min(0, t('validation.costPriceMin')),
    minStock: z.coerce
      .number({ error: t('validation.minStockMin') })
      .min(0, t('validation.minStockMin')),
    initialStock: z.coerce
      .number({ error: t('validation.initialStockMin') })
      .min(0, t('validation.initialStockMin'))
      .optional(),
  });

export const createIngredientSchema = z.object({
  code: z
    .string({ error: 'Vui lòng nhập mã nguyên liệu' })
    .trim()
    .min(2, 'Mã nguyên liệu tối thiểu 2 ký tự')
    .max(50, 'Mã nguyên liệu không vượt quá 50 ký tự')
    .toUpperCase(),
  name: z
    .string({ error: 'Vui lòng nhập tên nguyên liệu' })
    .trim()
    .min(2, 'Tên nguyên liệu tối thiểu 2 ký tự')
    .max(160, 'Tên nguyên liệu không vượt quá 160 ký tự'),
  unit: z
    .string({ error: 'Đơn vị tính không được để trống' })
    .trim()
    .min(1, 'Đơn vị tính không được để trống'),
  costPrice: z.coerce
    .number({ error: 'Giá nhập tham chiếu phải lớn hơn hoặc bằng 0' })
    .min(0, 'Giá nhập tham chiếu phải lớn hơn hoặc bằng 0'),
  minStock: z.coerce
    .number({ error: 'Định mức tồn tối thiểu phải lớn hơn hoặc bằng 0' })
    .min(0, 'Định mức tồn tối thiểu phải lớn hơn hoặc bằng 0'),
  initialStock: z.coerce
    .number({ error: 'Tồn đầu kỳ phải lớn hơn hoặc bằng 0' })
    .min(0, 'Tồn đầu kỳ phải lớn hơn hoặc bằng 0')
    .optional(),
});

export const createTransactionSchemaFactory = (t: (key: TranslationKey) => string) =>
  z.object({
    type: z.enum(['IN', 'OUT'], { error: t('validation.transactionTypeRequired') }),
    reason: z.enum(
      ['INITIAL_STOCK', 'PURCHASE', 'KITCHEN_USAGE', 'DISCARD_WASTE', 'ADJUSTMENT'],
      { error: t('validation.transactionReasonRequired') }
    ),
    ingredientId: z
      .string({ error: t('validation.selectIngredientRequired') })
      .uuid(t('validation.selectIngredientRequired')),
    quantity: z.coerce
      .number({ error: t('validation.quantityRequired') })
      .positive(t('validation.quantityPositive')),
    unitPrice: z.coerce
      .number({ error: t('validation.unitPriceMin') })
      .min(0, t('validation.unitPriceMin'))
      .optional(),
    note: z.string().max(500, t('validation.noteMax')).optional(),
  });

export const createTransactionSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  reason: z.enum(
    ['INITIAL_STOCK', 'PURCHASE', 'KITCHEN_USAGE', 'DISCARD_WASTE', 'ADJUSTMENT'],
    { error: 'Vui lòng chọn lý do giao dịch' }
  ),
  ingredientId: z
    .string({ error: 'Vui lòng chọn nguyên liệu hợp lệ' })
    .uuid('Vui lòng chọn nguyên liệu hợp lệ'),
  quantity: z.coerce
    .number({ error: 'Vui lòng nhập số lượng' })
    .positive('Số lượng xuất/nhập phải lớn hơn 0'),
  unitPrice: z.coerce
    .number({ error: 'Đơn giá không được âm' })
    .min(0, 'Đơn giá không được âm')
    .optional(),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});
