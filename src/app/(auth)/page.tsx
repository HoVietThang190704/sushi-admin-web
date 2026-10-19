import { BrandShowcase, LoginForm } from '@/features/auth';
import { MobileHeader } from '@/features/auth/components/mobile-header';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-sushi-bg flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden">
      <MobileHeader />

      <div className="hidden lg:flex lg:col-span-7 flex-col">
        <BrandShowcase />
      </div>

      <div className="w-full lg:col-span-5 flex flex-col justify-center px-0 sm:px-6 lg:px-10 xl:px-14 py-0 sm:py-8 lg:py-12 -mt-6 lg:mt-0 relative z-20">
        <LoginForm />
      </div>
    </main>
  );
}
