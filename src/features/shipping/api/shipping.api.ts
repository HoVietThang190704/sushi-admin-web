import { fetchApi } from '@/lib/api';
import { Branch, ShippingRule, UpsertShippingRuleInput } from '../types';

export async function fetchBranches(): Promise<Branch[]> {
  const res = await fetchApi<Branch[]>('/api/shipping/branches');
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
    `/api/shipping/rules${query.toString() ? `?${query.toString()}` : ''}`
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
  >('/api/shipping/locations');
  return res || [];
}

export async function upsertShippingRule(
  input: UpsertShippingRuleInput
): Promise<ShippingRule> {
  return fetchApi<ShippingRule>('/api/shipping/rules', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteShippingRule(id: string): Promise<void> {
  await fetchApi(`/api/shipping/rules/${id}`, {
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

  return fetchApi(`/api/shipping/calculate?${query.toString()}`);
}
