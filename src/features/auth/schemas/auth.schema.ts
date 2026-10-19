import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email của bạn')
    .email('Định dạng email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email của bạn')
    .email('Định dạng email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
