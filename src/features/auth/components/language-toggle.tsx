'use client';

import { useTranslation } from '@/lib/i18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-sushi-surface/90 border border-sushi-border/80 backdrop-blur-md shadow-lg text-xs ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLocale('vi')}
        className={`px-3 py-1 rounded-full font-semibold text-xs transition-all cursor-pointer ${
          locale === 'vi'
            ? 'bg-sushi-primary text-white shadow-sm'
            : 'text-sushi-text-muted hover:text-sushi-text'
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded-full font-semibold text-xs transition-all cursor-pointer ${
          locale === 'en'
            ? 'bg-sushi-primary text-white shadow-sm'
            : 'text-sushi-text-muted hover:text-sushi-text'
        }`}
      >
        EN
      </button>
    </div>
  );
}
