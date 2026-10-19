import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { antdThemeConfig } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sushi Platform - Quản Trị Hệ Thống',
  description: 'Trang quản trị chuỗi nhà hàng Sushi & Bếp trung tâm',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-sushi-bg text-sushi-text antialiased font-sans">
        <AntdRegistry>
          <ConfigProvider theme={antdThemeConfig}>
            <I18nProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
            </I18nProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
