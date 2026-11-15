import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Branch, ShippingRule, UpsertShippingRuleInput } from '../types';

export async function fetchBranches(): Promise<Branch[]> {
  const res = await fetchApi<Branch[]>(API_ENDPOINTS.SHIPPING.BRANCHES);
  return res || [];
}

export async function fetchShippingRules(params?: {
  district?: string;
  branchId?: string;
}): Promise<ShippingRule[]> {
  const query = new URLSearchParams();
  if (params?.district) query.set('district', params.district);
  if (params?.branchId) query.set('branchId', params.branchId);

  const res = await fetchApi<ShippingRule[]>(
    `${API_ENDPOINTS.SHIPPING.RULES}${query.toString() ? `?${query.toString()}` : ''}`
  );
  return res || [];
}

export async function fetchShippingLocations(): Promise<
  Array<{
    district: string;
    ward: string;
    wardCode?: string;
    formerWards?: string;
    isSupported: boolean;
  }>
> {
  const res = await fetchApi<
    Array<{
      district: string;
      ward: string;
      wardCode?: string;
      formerWards?: string;
      isSupported: boolean;
    }>
  >(API_ENDPOINTS.SHIPPING.LOCATIONS);
  return res || [];
}

export async function upsertShippingRule(
  input: UpsertShippingRuleInput
): Promise<ShippingRule> {
  return fetchApi<ShippingRule>(API_ENDPOINTS.SHIPPING.RULES, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteShippingRule(id: string): Promise<void> {
  await fetchApi(API_ENDPOINTS.SHIPPING.RULE_BY_ID(id), {
    method: 'DELETE',
  });
}

export async function calculateShippingFee(params: {
  district?: string;
  ward: string;
  branchId?: string;
}): Promise<{
  district: string;
  ward: string;
  fee: number;
  branch?: { id: string; code: string; name: string; address: string };
}> {
  const query = new URLSearchParams();
  if (params.district) query.set('district', params.district);
  if (params.ward) query.set('ward', params.ward);
  if (params.branchId) query.set('branchId', params.branchId);

  return fetchApi(`${API_ENDPOINTS.SHIPPING.CALCULATE}?${query.toString()}`);
}
