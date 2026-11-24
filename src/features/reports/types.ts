export interface AnalyticsQueryFilter {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export interface AnalyticsSummary {
  totalOrders: number;
  completedOrders: number;
  completedOrdersWithCost: number;
  cancelledOrders: number;
  inProgressOrders: number;
  revenue: number;
  shippingRevenue: number;
  cogs: number;
  grossProfit: number;
  marginPct: number | null;
  avgOrderValue: number;
  cancelledAfterPrepCost: number;
}

export interface AnalyticsPreviousPeriod {
  startDate: string;
  endDate: string;
  completedOrders: number;
  revenue: number;
  revenueChangePct: number | null;
}

export interface AnalyticsDailyPoint {
  date: string;
  orders: number;
  completedOrders: number;
  revenue: number;
  cogs: number;
}

export interface AnalyticsTopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface AnalyticsBranchRow {
  branchId: string;
  name: string;
  completedOrders: number;
  revenue: number;
  cogs: number;
}

export interface AnalyticsReportResponse {
  range: {
    startDate: string;
    endDate: string;
    days: number;
  };
  branchId: string | null;
  summary: AnalyticsSummary;
  previous: AnalyticsPreviousPeriod;
  statusBreakdown: Record<string, number>;
  daily: AnalyticsDailyPoint[];
  topProducts: AnalyticsTopProduct[];
  byBranch: AnalyticsBranchRow[];
  meta: {
    revenueBasis: string;
    cogsBasis: string;
    timezone: string;
  };
}
