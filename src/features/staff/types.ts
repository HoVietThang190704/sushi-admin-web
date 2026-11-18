import { UserRole, UserProfile } from '@/types/auth';

export interface StaffItem extends UserProfile {
  tokenVersion?: number;
  updatedAt?: string;
}

export interface ListStaffParams {
  branchId?: string;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListStaffResponse {
  items: StaffItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateStaffDto {
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
}

export interface CreateStaffResponse {
  user: StaffItem;
  temporaryPassword: string;
}

export interface UpdateStaffDto {
  fullName?: string;
  phone?: string;
  role?: UserRole;
  branchId?: string;
}

export interface ResetPasswordResponse {
  temporaryPassword: string;
}
