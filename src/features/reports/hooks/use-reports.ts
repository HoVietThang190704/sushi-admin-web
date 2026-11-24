import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import { AnalyticsQueryFilter } from '../types';

export const REPORTS_KEYS = {
  all: ['reports'] as const,
  analytics: (filter?: AnalyticsQueryFilter) =>
    [...REPORTS_KEYS.all, 'analytics', filter ?? {}] as const,
};

export function useAnalyticsReport(filter?: AnalyticsQueryFilter) {
  return useQuery({
    queryKey: REPORTS_KEYS.analytics(filter),
    queryFn: () => reportsApi.getAnalytics(filter),
  });
}
