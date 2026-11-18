import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  ListStaffParams,
  ListStaffResponse,
  CreateStaffDto,
  CreateStaffResponse,
  UpdateStaffDto,
  StaffItem,
  ResetPasswordResponse,
} from '../types';

export const staffApi = {
  getStaffList: async (params?: ListStaffParams): Promise<ListStaffResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.branchId) searchParams.append('branchId', params.branchId);
    if (params?.role) searchParams.append('role', params.role);
    if (typeof params?.isActive === 'boolean') {
      searchParams.append('isActive', String(params.isActive));
    }
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const qs = searchParams.toString();
    const url = qs ? `${API_ENDPOINTS.STAFF.ROOT}?${qs}` : API_ENDPOINTS.STAFF.ROOT;
    return fetchApi<ListStaffResponse>(url);
  },

  createStaff: async (dto: CreateStaffDto): Promise<CreateStaffResponse> => {
    return fetchApi<CreateStaffResponse>(API_ENDPOINTS.STAFF.ROOT, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  updateStaff: async (id: string, dto: UpdateStaffDto): Promise<StaffItem> => {
    return fetchApi<StaffItem>(API_ENDPOINTS.STAFF.BY_ID(id), {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  setStaffStatus: async (id: string, isActive: boolean): Promise<StaffItem> => {
    return fetchApi<StaffItem>(API_ENDPOINTS.STAFF.STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  resetStaffPassword: async (id: string): Promise<ResetPasswordResponse> => {
    return fetchApi<ResetPasswordResponse>(API_ENDPOINTS.STAFF.RESET_PASSWORD(id), {
      method: 'POST',
    });
  },
};
