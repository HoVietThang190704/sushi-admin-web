export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
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
