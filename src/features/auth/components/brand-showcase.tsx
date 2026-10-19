'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

export function BrandShowcase() {
  const { t } = useTranslation();

  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-stone-900 via-sushi-bg to-stone-950 overflow-hidden border-r border-sushi-border min-h-screen">
      {/* Background Decorative Gradients & Warm Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(229,57,53,0.2),rgba(255,255,255,0))]" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[radial-gradient(ellipse_70%_60%_at_20%_100%,rgba(245,158,11,0.06),transparent)]" />
      
      {/* Subtle Japanese Kanji Watermark using Theme Token */}
      <div 
        aria-hidden="true" 
        className="absolute -right-12 bottom-10 select-none pointer-events-none text-watermark font-black text-sushi-card/40 leading-none tracking-tighter"
      >
        寿司
      </div>

      {/* Top Header / Brand Logo */}
      <div className="relative z-10 flex items-center space-x-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-xl border border-red-500/40 flex items-center justify-center bg-sushi-surface">
          <Image
            src="/logo.png"
            alt="Sushi Platform Logo"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <span className="text-sushi-text font-bold text-lg tracking-wider block leading-tight font-sans">
            SUSHI PLATFORM
          </span>
          <span className="text-2xs font-mono tracking-widest uppercase text-sushi-text-muted">
            {t('brandShowcase.enterpriseSuite')}
          </span>
        </div>
      </div>

      {/* Middle: Brand Core Statement */}
      <div className="relative z-10 my-auto py-12 max-w-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sushi-card border border-sushi-border text-sushi-text-muted text-xs font-medium mb-6 font-mono shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-sushi-primary animate-pulse"></span>
          <span className="tracking-wide">{t('brandShowcase.badge')}</span>
        </div>

        <h1 className="text-3xl xl:text-4xl font-extrabold text-sushi-text tracking-tight leading-snug mb-5 font-sans">
          {t('brandShowcase.headlinePart1')}
          <br />
          <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
            {t('brandShowcase.headlinePart2')}
          </span>
        </h1>

        <p className="text-sm xl:text-base text-sushi-text-muted leading-relaxed font-normal font-sans min-h-[72px]">
          {t('brandShowcase.description')}
        </p>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-sushi-text-dim border-t border-sushi-border pt-6 font-sans">
        <span>{t('brandShowcase.copyright')}</span>
        <span className="font-mono text-sushi-text-dim">{t('brandShowcase.version')}</span>
      </div>
    </div>
  );
}
