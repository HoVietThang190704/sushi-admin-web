export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  warehouseId?: string | null;
  warehouse?: {
    id: string;
    code: string;
    name: string;
    address?: string | null;
  } | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    orders: number;
    shippingRules: number;
  };
}

export interface CreateBranchInput {
  code: string;
  name: string;
  address: string;
  phone: string;
  warehouseId?: string | null;
  isActive?: boolean;
}

export interface UpdateBranchInput {
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  warehouseId?: string | null;
  isActive?: boolean;
}

export interface DeleteBranchResult {
  id: string;
  deleted: boolean;
  deactivated: boolean;
}

export interface ShippingRule {
  id: string;
  branchId: string;
  province: string;
  district: string;
  ward: string;
  fee: number;
  isDefault: boolean;
  isActive: boolean;
  branch?: {
    id: string;
    code: string;
    name: string;
    address: string;
  };
}

export interface UpsertShippingRuleInput {
  branchId: string;
  district: string;
  ward: string;
  fee: number;
  isDefault?: boolean;
  isActive?: boolean;
}
