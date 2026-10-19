export type UserRole =
  | 'SUPER_ADMIN'
  | 'BRANCH_MANAGER'
  | 'CASHIER'
  | 'KITCHEN_STAFF'
  | 'CUSTOMER';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: UserProfile;
  tokens: AuthTokens;
}
