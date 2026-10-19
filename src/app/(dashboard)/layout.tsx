'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Layout,
  Space,
  Typography,
} from '@/components/ui';
import { SUSHICOLORS } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/features/auth';
import { useTranslation } from '@/lib/i18n';
import { AdminSidebar, AdminHeader } from '@/components/layout';

const { Content } = Layout;
const { Text } = Typography;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

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
      {/* Sidebar Menu tách biệt component, dùng navigation config tập trung */}
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Main Layout Area */}
      <Layout className="bg-sushi-bg flex flex-col min-w-0" style={{ background: SUSHICOLORS.bg }}>
        {/* Header điều hướng chuẩn mực, breadcrumb động và profile badge */}
        <AdminHeader />

        {/* Content Area */}
        <Content className="m-6 min-h-[320px]">
          {children}
        </Content>
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
