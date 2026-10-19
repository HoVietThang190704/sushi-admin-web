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
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && (saved === 'vi' || saved === 'en')) {
        setLocaleState((prev) => (prev !== saved ? saved : prev));
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Ignore storage write errors
    }
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
 * Component chuyển đổi ngôn ngữ 1-Click Toggle [VI | EN] (Linear / Vercel dark style)
 */
export function LanguageSwitcher({
  className,
}: {
  size?: 'small' | 'middle' | 'large';
  className?: string;
  style?: React.CSSProperties;
}) {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-sushi-surface/90 border border-sushi-border/80 shadow-sm ${className || ''}`}
      role="group"
      aria-label="Language selector"
    >
      <Globe size={14} className="text-sushi-text-dim ml-1.5 mr-1 hidden sm:inline" />
      <button
        type="button"
        onClick={() => setLocale('vi')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
          locale === 'vi'
            ? 'bg-gradient-to-r from-sushi-primary to-sushi-primary-dark text-white shadow-sm'
            : 'text-sushi-text-muted hover:text-white hover:bg-white/5'
        }`}
        aria-pressed={locale === 'vi'}
        title="Tiếng Việt"
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
          locale === 'en'
            ? 'bg-gradient-to-r from-sushi-primary to-sushi-primary-dark text-white shadow-sm'
            : 'text-sushi-text-muted hover:text-white hover:bg-white/5'
        }`}
        aria-pressed={locale === 'en'}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
