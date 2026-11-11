import { PaymentSettingsView } from '@/features/orders';
import { SushiPageHeader } from '@/components/ui';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cấu Hình Thanh Toán QR | Sushi Platform Admin',
  description: 'Quản lý mã QR chuyển khoản và thông tin tài khoản ngân hàng của cửa hàng',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SushiPageHeader
        title="Cấu Hình Thanh Toán QR"
        subtitle="Quản lý ảnh mã QR ngân hàng và nội dung chuyển khoản tự động cho toàn hệ thống"
      />
      <PaymentSettingsView />
    </div>
  );
}
