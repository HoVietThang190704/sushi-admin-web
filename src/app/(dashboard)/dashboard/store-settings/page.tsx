import { StoreSettingsView } from '@/features/orders';
import { SushiPageHeader } from '@/components/ui';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cấu Hình Cửa Hàng | Sushi Platform Admin',
  description: 'Quản lý trạng thái nhận đơn trực tuyến và hotline liên hệ Storefront',
};

export default function StoreSettingsPage() {
  return (
    <div className="space-y-6">
      <SushiPageHeader
        title="Cấu Hình Cửa Hàng"
        subtitle="Quản lý chế độ đặt món trực tuyến và số điện thoại hotline nhận đơn của toàn chuỗi"
      />
      <StoreSettingsView />
    </div>
  );
}
