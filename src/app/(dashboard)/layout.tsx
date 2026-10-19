'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Layout,
  Menu,
  Button,
  Tag,
  Space,
  Typography,
  ChartBar,
  ForkKnife,
  Package,
  SignOut,
  User,
} from '@/components/ui';
import { SUSHICOLORS } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/features/auth';
import { useTranslation, LanguageSwitcher } from '@/lib/i18n';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const getSelectedKey = () => {
    if (pathname.includes('/categories') || pathname.includes('/products')) {
      return 'catalog';
    }
    if (pathname.includes('/orders')) {
      return 'orders';
    }
    return 'overview';
  };

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'overview':
        router.push('/dashboard');
        break;
      case 'catalog':
        router.push('/dashboard/categories');
        break;
      case 'orders':
        router.push('/dashboard/orders');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sushi-bg text-sushi-text">
        <Space direction="vertical" align="center">
          <div className="text-4xl animate-bounce">🍣</div>
          <Text className="text-sushi-text-muted">{t('common.loading')}</Text>
        </Space>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-sushi-bg">
      {/* Sider Menu Ant Design with Phosphor Icons */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="bg-sushi-card border-r border-sushi-border"
        style={{ background: SUSHICOLORS.card }}
      >
        <div className="h-16 flex items-center justify-center space-x-2 border-b border-sushi-border px-4">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-red-500/30 flex items-center justify-center shrink-0 bg-sushi-surface shadow-sm">
            <Image
              src="/logo.png"
              alt="Sushi Platform Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          {!collapsed && (
            <span className="font-bold text-sushi-text tracking-wider text-sm font-mono truncate">
              SUSHI ADMIN
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[getSelectedKey()]}
          mode="inline"
          onClick={({ key }) => handleMenuClick(key)}
          className="mt-3 bg-transparent border-r-0"
          items={[
            {
              key: 'overview',
              icon: <ChartBar size={18} />,
              label: t('dashboard.overview'),
            },
            {
              key: 'catalog',
              icon: <ForkKnife size={18} />,
              label: t('dashboard.catalog'),
            },
            {
              key: 'orders',
              icon: <Package size={18} />,
              label: t('dashboard.orders'),
            },
          ]}
        />
      </Sider>

      {/* Main Layout Area */}
      <Layout className="bg-sushi-bg" style={{ background: SUSHICOLORS.bg }}>
        {/* Header cố định */}
        <Header
          className="border-b border-sushi-border px-6 flex items-center justify-between"
          style={{ background: SUSHICOLORS.card }}
        >
          <div className="flex items-center space-x-3">
            <Title level={4} style={{ margin: 0 }} className="text-sushi-text">
              {t('dashboard.headerTitle')}
            </Title>
            <Tag color="red">Microservices</Tag>
          </div>

          <Space size="middle">
            {/* Language Switcher */}
            <LanguageSwitcher size="middle" />

            <Space>
              <User size={18} className="text-sushi-primary" />
              <Text className="text-sushi-text font-medium hidden sm:inline">
                {user?.fullName}
              </Text>
              <Tag color="gold" className="font-semibold">
                {user?.role}
              </Tag>
            </Space>

            <Button
              icon={<SignOut size={16} />}
              onClick={logout}
              danger
              size="middle"
            >
              {t('common.logout')}
            </Button>
          </Space>
        </Header>

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
