'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layout,
  Space,
  Typography,
} from '@/components/ui';
import { SUSHICOLORS } from '@/lib/theme';
import { AuthProvider, useAuth, authApi } from '@/features/auth';
import { RealtimeProvider } from '@/providers/realtime-provider';
import { useTranslation } from '@/lib/i18n';
import {
  AdminSidebar,
  AdminHeader,
  AdminBottomNav,
  useDashboardSwipe,
} from '@/components/layout';

const { Content } = Layout;
const { Text } = Typography;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tách biệt logic cử chỉ vuốt và chuyển hướng vào hook chuyên biệt
  const { contentRef, direction, handlers } = useDashboardSwipe();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Dọn dẹp cookie không hợp lệ/hết hạn qua API logout để tránh proxy.ts redirect lặp (307)
      authApi.logout().finally(() => {
        router.replace('/');
      });
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sushi-bg text-sushi-text">
        <Space orientation="vertical" align="center" size="middle">
          <div className="w-12 h-12 rounded-2xl bg-sushi-surface border border-sushi-border flex items-center justify-center shadow-lg">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain animate-pulse"
            />
          </div>
          <Text className="text-sushi-text-muted text-xs font-mono">{t('common.loading')}</Text>
        </Space>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-sushi-bg">
      {/* Sidebar Menu tách biệt component, hỗ trợ Desktop Sider và Mobile Drawer */}
      <AdminSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Layout Area */}
      <Layout className="bg-sushi-bg flex flex-col min-w-0" style={{ background: SUSHICOLORS.bg }}>
        {/* Header điều hướng chuẩn mực, breadcrumb động và mobile hamburger */}
        <AdminHeader onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* Vùng Content bao bọc hỗ trợ chuyển trang mượt mà & cử chỉ vuốt chạm theo ngón tay */}
        <div
          className="relative w-full flex-1 overflow-x-hidden min-h-[320px] touch-pan-y"
          {...handlers}
        >
          {/* Trang hiện tại lướt êm với phần cứng GPU tăng tốc */}
          <div
            ref={contentRef}
            key={pathname}
            className={`w-full min-h-[320px] will-change-transform ${
              direction === 'forward' ? 'mobile-slide-in-right' : 'mobile-slide-in-left'
            }`}
          >
            <Content className="m-3 sm:m-6 pb-20 md:pb-6 min-h-[320px]">
              {children}
            </Content>
          </div>
        </div>

        {/* Thanh Điều Hướng Đáy Màn Hình Cho Mobile (1-Click Bottom Bar) */}
        <AdminBottomNav />
      </Layout>
    </Layout>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </RealtimeProvider>
    </AuthProvider>
  );
}
