import { WarehouseManagementView } from '@/features/inventory';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Kho Nguyên Liệu | Sushi Platform Admin',
  description: 'Tạo mới và quản lý danh sách kho nguyên vật liệu trong chuỗi nhà hàng',
};

export default function WarehousesPage() {
  return <WarehouseManagementView />;
}
