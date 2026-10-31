'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

export function MobileHeader() {
  const { t } = useTranslation();

  return (
    <div className="relative w-full pt-10 pb-12 px-6 bg-gradient-to-b from-sushi-primary-dark via-red-950 to-sushi-bg overflow-hidden lg:hidden flex flex-col items-center text-center">
      {/* Decorative Wave Glow Overlay */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,rgba(255,255,255,0.15),transparent)]" 
      />
      
      {/* Subtle Japanese Kanji Watermark */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -right-4 -bottom-4 text-8xl font-black text-white/5 select-none font-serif leading-none"
      >
        寿司
      </div>

      {/* Brand Logo & Station Badge */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-sushi-border flex items-center justify-center bg-sushi-surface shadow-2xl mb-3">
          <Image
            src="/logo.png"
            alt="Sushi Platform Logo"
            width={56}
            height={56}
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
            priority
          />
        </div>
        
        <h1 className="text-sushi-text font-extrabold text-base sm:text-lg tracking-wider font-sans">
          SUSHI PLATFORM
        </h1>
        
        <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sushi-surface/80 border border-sushi-border text-sushi-text-muted text-2xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('brandShowcase.badge')}</span>
        </div>
      </div>
    </div>
  );
}
