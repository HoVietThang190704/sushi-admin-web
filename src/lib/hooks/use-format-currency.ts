'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';

/**
 * Hook format tiền tệ tập trung, tự động nhận diện ngôn ngữ
 */
export function useFormatCurrency() {
  const { locale } = useTranslation();

  const formatCurrency = useCallback(
    (amount: number | string | null | undefined): string => {
      if (amount === null || amount === undefined) return '0 ₫';
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num)) return '0 ₫';

      return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(num);
    },
    [locale],
  );

  return { formatCurrency };
}
