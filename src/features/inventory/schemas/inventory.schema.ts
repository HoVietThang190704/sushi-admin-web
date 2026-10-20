import { z } from 'zod';

export const createIngredientSchema = z.object({
  code: z
    .string()
    .min(2, 'Mã nguyên liệu tối thiểu 2 ký tự')
    .max(50, 'Mã nguyên liệu không vượt quá 50 ký tự')
    .toUpperCase(),
  name: z
    .string()
    .min(2, 'Tên nguyên liệu tối thiểu 2 ký tự')
    .max(160, 'Tên nguyên liệu không vượt quá 160 ký tự'),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  costPrice: z.number().min(0, 'Giá nhập tham chiếu phải lớn hơn hoặc bằng 0'),
  minStock: z.number().min(0, 'Định mức tồn tối thiểu phải lớn hơn hoặc bằng 0'),
  initialStock: z.number().min(0, 'Tồn đầu kỳ phải lớn hơn hoặc bằng 0').optional(),
});

export const createTransactionSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  reason: z.enum(['INITIAL_STOCK', 'PURCHASE', 'KITCHEN_USAGE', 'DISCARD_WASTE', 'ADJUSTMENT']),
  ingredientId: z.string().uuid('Vui lòng chọn nguyên liệu hợp lệ'),
  quantity: z.number().positive('Số lượng xuất/nhập phải lớn hơn 0'),
  unitPrice: z.number().min(0, 'Đơn giá không được âm').optional(),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});
