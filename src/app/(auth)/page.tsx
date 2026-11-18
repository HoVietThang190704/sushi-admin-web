import { BrandShowcase, LoginForm } from '@/features/auth';
import { MobileHeader } from '@/features/auth/components/mobile-header';
import { LanguageToggle } from '@/features/auth/components/language-toggle';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-sushi-bg relative flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden selection:bg-red-500/20 selection:text-white">
      {/* Floating Language Switcher in top right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Ambient background glows for the whole page */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(229,57,53,0.18),transparent)]" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed bottom-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(245,158,11,0.05),transparent)]" 
      />

      {/* Subtle Japanese Kanji Watermark on mobile background */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed right-2 bottom-4 text-8xl sm:text-9xl font-black text-white/[0.03] select-none font-serif leading-none lg:hidden"
      >
        寿司
      </div>

      {/* Left side on desktop: Brand Showcase */}
      <div className="hidden lg:flex lg:col-span-7 flex-col relative z-10">
        <BrandShowcase />
      </div>

      {/* Right side on desktop / Centered content on mobile */}
      <div className="w-full lg:col-span-5 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-10 xl:px-14 py-8 sm:py-12 relative z-20 min-h-screen lg:min-h-auto my-auto">
        <MobileHeader />
        <LoginForm />
      </div>
    </main>
  );
}
