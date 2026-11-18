import { Metadata } from 'next';
import { StaffManagementView } from '@/features/staff';

export const metadata: Metadata = {
  title: 'Quản Lý Nhân Sự & Phân Quyền | Sushi Admin',
  description: 'Quản lý danh sách nhân sự, phân quyền vai trò và phạm vi chi nhánh',
};

export default function StaffPage() {
  return <StaffManagementView />;
}
