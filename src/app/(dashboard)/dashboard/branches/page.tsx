import { BranchManagementView } from '@/features/shipping/components/branch-management-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản Lý Chi Nhánh | Sushi Platform Admin',
  description: 'Tạo mới, chỉnh sửa chi nhánh nhà hàng và liên kết kho nguyên vật liệu phục vụ',
};

export default function BranchesPage() {
  return <BranchManagementView />;
}
