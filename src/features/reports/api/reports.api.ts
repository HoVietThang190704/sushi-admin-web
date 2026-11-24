import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { AnalyticsQueryFilter, AnalyticsReportResponse } from '../types';

export const reportsApi = {
  getAnalytics: (filter?: AnalyticsQueryFilter) => {
    const params = new URLSearchParams();
    if (filter?.startDate) params.set('startDate', filter.startDate);
    if (filter?.endDate) params.set('endDate', filter.endDate);
    if (filter?.branchId) params.set('branchId', filter.branchId);

    const qs = params.toString();
    return fetchApi<AnalyticsReportResponse>(
      `${API_ENDPOINTS.ORDERS.ANALYTICS}${qs ? `?${qs}` : ''}`,
    );
  },
};
