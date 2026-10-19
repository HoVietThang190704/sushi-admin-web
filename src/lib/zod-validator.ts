import { z } from 'zod';
import type { RuleObject } from 'antd/es/form';

/**
 * Helper gắn Zod Schema trực tiếp vào Ant Design Form.Item rules
 * 100% Type-safe, Autocomplete tên field, Zero `any`
 */
export function createZodRule<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  field: keyof T,
) {
  return {
    validator(_: RuleObject, value: unknown) {
      const fieldValidator = schema.shape[field] as unknown as z.ZodType;
      if (!fieldValidator) return Promise.resolve();

      const result = fieldValidator.safeParse(value);
      if (result.success) {
        return Promise.resolve();
      }

      const firstError = result.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      return Promise.reject(new Error(firstError));
    },
  };
}
