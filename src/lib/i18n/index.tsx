'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';
import { Select } from 'antd';
import { Globe } from '@phosphor-icons/react';

export type Locale = 'vi' | 'en';

const translations: Record<Locale, typeof vi> = {
  vi,
  en,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof vi>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'sushi_admin_locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === 'vi' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const keys = key.split('.');
      let result: Record<string, unknown> | string | undefined =
        translations[locale];

      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = (result as Record<string, unknown>)[k] as
            | Record<string, unknown>
            | string
            | undefined;
        } else {
          return key; // Fallback to key if not found
        }
      }

      return typeof result === 'string' ? result : key;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

/**
 * Component chuyển đổi ngôn ngữ chuẩn Ant Design
 */
export function LanguageSwitcher({ size = 'middle' }: { size?: 'small' | 'middle' | 'large' }) {
  const { locale, setLocale } = useTranslation();

  return (
    <Select
      value={locale}
      onChange={(val) => setLocale(val as Locale)}
      size={size}
      style={{ width: 130 }}
      suffixIcon={<Globe size={16} className="text-sushi-text-muted" />}
      options={[
        { value: 'vi', label: '🇻🇳 Tiếng Việt' },
        { value: 'en', label: '🇬🇧 English' },
      ]}
    />
  );
}
