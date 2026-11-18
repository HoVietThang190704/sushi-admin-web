'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

export function MobileHeader() {
  const { t } = useTranslation();

  return (
    <div className="w-full pt-8 pb-5 px-4 flex flex-col items-center text-center lg:hidden relative z-10">
      {/* Brand Logo with ambient red glow */}
      <div className="relative mb-3">
        <div 
          aria-hidden="true" 
          className="absolute -inset-1.5 bg-gradient-to-r from-red-600/30 to-amber-600/30 rounded-2xl blur-md opacity-80 pointer-events-none" 
        />
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-red-500/40 flex items-center justify-center bg-sushi-surface shadow-2xl">
          <Image
            src="/logo.png"
            alt="Sushi Platform Logo"
            width={48}
            height={48}
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="text-sushi-text font-black text-xl tracking-wider font-sans">
        SUSHI PLATFORM
      </h1>

      {/* Subtle Station Status Badge */}
      <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sushi-surface/90 border border-sushi-border text-sushi-text-muted text-2xs font-sans shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{t('brandShowcase.badge')}</span>
      </div>
    </div>
  );
}
