import { ShippingManagementView } from '@/features/shipping/components/shipping-management-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cấu Hình Phí Giao Hàng | Sushi Platform Admin',
  description: 'Quản lý bảng giá giao hàng và phân bổ chi nhánh phục vụ theo từng Xã/Phường TP.HCM',
};

export default function ShippingPage() {
  return <ShippingManagementView />;
}
