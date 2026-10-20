'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layout,
  Space,
  Typography,
} from '@/components/ui';
import { SUSHICOLORS } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/features/auth';
import { useTranslation } from '@/lib/i18n';
import { AdminSidebar, AdminHeader, AdminBottomNav } from '@/components/layout';
import { NAV_ITEMS, getNavIndex } from '@/config/navigation.config';

const { Content } = Layout;
const { Text } = Typography;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Xác định hướng trượt (slide direction) dựa trên thứ tự tab cũ và mới
  const currentIndex = getNavIndex(pathname);
  const prevIndexRef = useRef(currentIndex);
  const directionRef = useRef<'slide-right' | 'slide-left'>('slide-right');

  if (currentIndex !== prevIndexRef.current) {
    directionRef.current = currentIndex > prevIndexRef.current ? 'slide-right' : 'slide-left';
    prevIndexRef.current = currentIndex;
  }

  // Nhận diện cử chỉ vuốt chạm trên Mobile (Touch Swipe Gestures)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Bỏ qua nếu là cuộn dọc hoặc lực vuốt ngang quá ngắn (< 60px)
    if (Math.abs(deltaY) > 50 || Math.abs(deltaX) < 60) return;

    // Không can thiệp nếu đang chạm trên input, bảng cuộn ngang, modal hoặc drawer
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, .ant-table-content, .ant-modal, .ant-drawer')) {
      return;
    }

    if (deltaX < 0 && currentIndex < NAV_ITEMS.length - 1) {
      // Vuốt sang trái -> Chuyển sang Tab tiếp theo bên phải
      router.push(NAV_ITEMS[currentIndex + 1].path);
    } else if (deltaX > 0 && currentIndex > 0) {
      // Vuốt sang phải -> Chuyển về Tab trước đó bên trái
      router.push(NAV_ITEMS[currentIndex - 1].path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sushi-bg text-sushi-text">
        <Space orientation="vertical" align="center" size="middle">
          <div className="w-12 h-12 rounded-2xl bg-sushi-surface border border-sushi-border flex items-center justify-center shadow-lg">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
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

        {/* Content Area với hiệu ứng trượt Mobile và hỗ trợ cử chỉ vuốt ngón tay */}
        <Content
          key={pathname}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`m-3 sm:m-6 pb-20 md:pb-6 min-h-[320px] will-change-transform ${directionRef.current}`}
        >
          {children}
        </Content>

        {/* Thanh Điều Hướng Đáy Màn Hình Cho Mobile (1-Click Bottom Bar) */}
        <AdminBottomNav />
      </Layout>
    </Layout>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}
