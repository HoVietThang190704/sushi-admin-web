import { z } from 'zod';
import type { TranslationKey } from '@/lib/i18n';

export const createLoginSchema = (t: (key: TranslationKey) => string) =>
  z.object({
    email: z
      .string({ error: t('auth.emailRequired') })
      .trim()
      .min(1, t('auth.emailRequired'))
      .email(t('auth.emailInvalid')),
    password: z
      .string({ error: t('auth.passwordRequired') })
      .min(1, t('auth.passwordRequired'))
      .min(6, t('auth.passwordMinLength')),
  });

export const loginSchema = z.object({
  email: z
    .string({ error: 'Vui lòng nhập email của bạn' })
    .trim()
    .min(1, 'Vui lòng nhập email của bạn')
    .email('Định dạng email không hợp lệ'),
  password: z
    .string({ error: 'Vui lòng nhập mật khẩu' })
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createRegisterSchema = (t: (key: TranslationKey) => string) =>
  z.object({
    email: z
      .string({ error: t('auth.emailRequired') })
      .trim()
      .min(1, t('auth.emailRequired'))
      .email(t('auth.emailInvalid')),
    password: z
      .string({ error: t('auth.passwordRequired') })
      .min(6, t('auth.passwordMinLength')),
    fullName: z
      .string({ error: t('auth.fullNameRequired') })
      .trim()
      .min(2, t('auth.fullNameMin'))
      .max(100, t('auth.fullNameMax')),
  });

export const registerSchema = z.object({
  email: z
    .string({ error: 'Vui lòng nhập email của bạn' })
    .trim()
    .min(1, 'Vui lòng nhập email của bạn')
    .email('Định dạng email không hợp lệ'),
  password: z
    .string({ error: 'Vui lòng nhập mật khẩu' })
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z
    .string({ error: 'Vui lòng nhập họ và tên' })
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
