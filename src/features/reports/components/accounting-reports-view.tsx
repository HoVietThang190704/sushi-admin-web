'use client';

import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import {
  SushiPageHeader,
  Button,
  Select,
  Table,
  Tag,
  Spin,
  Tooltip,
  SushiMobileCardList,
  SushiCardItem,
  SushiEmptyState,
  Receipt,
  ChartBar,
  CookingPot,
  ForkKnife,
  Storefront,
  Truck,
  WarningCircle,
  CheckCircle,
  ArrowsClockwise,
  Funnel,
} from '@/components/ui';
import {
  TrendUp,
  TrendDown,
  DownloadSimple,
  CalendarBlank,
  Coins,
  Wallet,
} from '@phosphor-icons/react';
import { useAnalyticsReport } from '../hooks/use-reports';
import { AnalyticsDailyPoint } from '../types';
import { fetchBranches } from '@/features/shipping/api/shipping.api';
import { OrderDateFilterDrawer } from '@/features/orders/components/order-date-filter-drawer';
import { useAuth } from '@/features/auth';
import { useTranslation } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

type QuickRangePreset = 'today' | '7days' | '30days' | 'thisMonth' | 'custom';

export function AccountingReportsView() {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatCurrency();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Mặc định: 7 ngày gần nhất
  const [preset, setPreset] = useState<QuickRangePreset>('7days');
  const [startDate, setStartDate] = useState<string>(() =>
    dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
  );
  const [endDate, setEndDate] = useState<string>(() =>
    dayjs().format('YYYY-MM-DD'),
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(
    undefined,
  );
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);

  const { data: branches = [] } = useQuery({
    queryKey: ['shipping', 'branches', 'public'],
    queryFn: fetchBranches,
    enabled: isSuperAdmin,
  });

  const {
    data: report,
    isLoading,
    isFetching,
    refetch,
  } = useAnalyticsReport({
    startDate,
    endDate,
    branchId: isSuperAdmin ? selectedBranchId : undefined,
  });

  const handleSelectPreset = (nextPreset: QuickRangePreset) => {
    const now = dayjs();
    setPreset(nextPreset);
    if (nextPreset === 'today') {
      const d = now.format('YYYY-MM-DD');
      setStartDate(d);
      setEndDate(d);
    } else if (nextPreset === '7days') {
      setStartDate(now.subtract(6, 'day').format('YYYY-MM-DD'));
      setEndDate(now.format('YYYY-MM-DD'));
    } else if (nextPreset === '30days') {
      setStartDate(now.subtract(29, 'day').format('YYYY-MM-DD'));
      setEndDate(now.format('YYYY-MM-DD'));
    } else if (nextPreset === 'thisMonth') {
      setStartDate(now.startOf('month').format('YYYY-MM-DD'));
      setEndDate(now.format('YYYY-MM-DD'));
    }
  };

  const summary = report?.summary;
  const previous = report?.previous;
  const dailyList = useMemo(() => {
    if (!report?.daily) return [];
    return [...report.daily].reverse();
  }, [report]);

  const maxDailyRevenue = useMemo(() => {
    if (!report?.daily || report.daily.length === 0) return 1;
    return Math.max(...report.daily.map((d) => Math.max(d.revenue, d.cogs)), 1);
  }, [report]);

  const maxProductRevenue = useMemo(() => {
    if (!report?.topProducts || report.topProducts.length === 0) return 1;
    return Math.max(...report.topProducts.map((p) => p.revenue), 1);
  }, [report]);

  const foodCostPct = useMemo(() => {
    if (!summary || summary.revenue <= 0) return null;
    return Math.round((summary.cogs / summary.revenue) * 10000) / 100;
  }, [summary]);

  // Xuất file CSV Đối soát Kế toán (chuẩn UTF-8 BOM cho Excel tiếng Việt)
  const handleExportCsv = () => {
    if (!report) return;
    const headers = [
      t('accountingPage.colDate'),
      t('accountingPage.colTotalOrders'),
      t('accountingPage.colCompletedOrders'),
      t('accountingPage.colNetRevenue'),
      t('accountingPage.colCogs'),
      t('accountingPage.colGrossProfit'),
      t('accountingPage.colMarginPct'),
    ];

    const rows = report.daily.map((d) => {
      const gp = d.revenue - d.cogs;
      const margin = d.revenue > 0 ? ((gp / d.revenue) * 100).toFixed(2) : '0.00';
      return [
        d.date,
        d.orders,
        d.completedOrders,
        d.revenue,
        d.cogs,
        gp,
        `${margin}%`,
      ];
    });

    // Dòng tổng cộng cuối bảng
    if (summary) {
      rows.push([
        'TOTAL',
        summary.totalOrders,
        summary.completedOrders,
        summary.revenue,
        summary.cogs,
        summary.grossProfit,
        summary.marginPct !== null ? `${summary.marginPct}%` : '0%',
      ]);
    }

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-ke-toan-${report.range.startDate}-den-${report.range.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dailyColumns = [
    {
      title: t('accountingPage.colDate'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <span className="font-mono font-semibold text-sushi-text text-xs">
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: t('accountingPage.colCompletedOrders'),
      key: 'orders',
      align: 'center' as const,
      render: (_: unknown, row: AnalyticsDailyPoint) => (
        <span className="font-mono text-xs text-sushi-text">
          <strong className="text-emerald-400">{row.completedOrders}</strong> / {row.orders}
        </span>
      ),
    },
    {
      title: t('accountingPage.colNetRevenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right' as const,
      render: (rev: number) => (
        <span className="font-mono font-bold text-sushi-gold text-xs">
          {formatCurrency(rev)}
        </span>
      ),
    },
    {
      title: t('accountingPage.colCogs'),
      dataIndex: 'cogs',
      key: 'cogs',
      align: 'right' as const,
      render: (cogs: number) => (
        <span className="font-mono text-sky-400 text-xs">
          {formatCurrency(cogs)}
        </span>
      ),
    },
    {
      title: t('accountingPage.colGrossProfit'),
      key: 'grossProfit',
      align: 'right' as const,
      render: (_: unknown, row: AnalyticsDailyPoint) => {
        const gp = row.revenue - row.cogs;
        return (
          <span
            className={`font-mono font-bold text-xs ${
              gp >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(gp)}
          </span>
        );
      },
    },
    {
      title: t('accountingPage.colMarginPct'),
      key: 'margin',
      align: 'right' as const,
      render: (_: unknown, row: AnalyticsDailyPoint) => {
        if (row.revenue <= 0) {
          return <span className="text-2xs font-mono text-sushi-text-dim">—</span>;
        }
        const gp = row.revenue - row.cogs;
        const pct = Math.round((gp / row.revenue) * 1000) / 10;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-mono font-semibold border ${
              pct >= 50
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : pct >= 30
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {pct}%
          </span>
        );
      },
    },
  ];

  const missingBomOrdersCount =
    summary ? Math.max(0, summary.completedOrders - summary.completedOrdersWithCost) : 0;

  return (
    <div className="space-y-5">
      {/* =========================================================================
          1. Header & Cụm Nút Xuất CSV / Làm Mới
         ========================================================================= */}
      <SushiPageHeader
        title={t('accountingPage.title')}
        subtitle={t('accountingPage.subtitle')}
        extra={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              icon={<ArrowsClockwise size={15} className={isFetching ? 'animate-spin' : ''} />}
              onClick={() => refetch()}
              className="h-10 sm:h-9 rounded-xl px-3 text-xs font-medium flex-1 sm:flex-none"
            >
              {t('ordersPage.refresh')}
            </Button>
            <Button
              type="primary"
              icon={<DownloadSimple size={16} weight="bold" />}
              onClick={handleExportCsv}
              disabled={!report || report.daily.length === 0}
              className="h-10 sm:h-9 rounded-xl px-3.5 text-xs font-semibold bg-sushi-gold hover:bg-sushi-gold/90 text-black border-none flex-1 sm:flex-none"
            >
              {t('accountingPage.exportCsvBtn')}
            </Button>
          </div>
        }
      />

      {/* =========================================================================
          2. Thanh Bộ Lọc Kỳ Kế Toán & Chi Nhánh
         ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {(
            [
              { key: 'today', label: t('ordersPage.quickToday') },
              { key: '7days', label: t('ordersPage.quick7Days') },
              { key: '30days', label: t('ordersPage.quick30Days') },
              { key: 'thisMonth', label: t('accountingPage.presetThisMonth') },
            ] as const
          ).map((item) => {
            const active = preset === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelectPreset(item.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-sushi-primary text-white border-sushi-primary shadow-sm'
                    : 'bg-sushi-surface/60 text-sushi-text-muted border-sushi-border hover:text-white hover:bg-sushi-surface'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <Button
            icon={<CalendarBlank size={15} className="text-sushi-gold" />}
            onClick={() => setIsDateDrawerOpen(true)}
            className={`h-8.5 rounded-xl text-xs font-mono ${
              preset === 'custom'
                ? 'border-sushi-gold bg-sushi-gold/10 text-sushi-gold'
                : 'border-sushi-border text-sushi-text'
            }`}
          >
            {dayjs(startDate).format('DD/MM/YYYY')} → {dayjs(endDate).format('DD/MM/YYYY')}
          </Button>
        </div>

        {/* Lọc theo chi nhánh (Dành cho SUPER_ADMIN) */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {isSuperAdmin && (
            <div className="w-full sm:w-56">
              <Select
                className="w-full h-9.5"
                placeholder={t('accountingPage.allBranches')}
                allowClear
                value={selectedBranchId || ''}
                onChange={(val) => setSelectedBranchId(val ? String(val) : undefined)}
                options={[
                  { value: '', label: t('accountingPage.allBranches') },
                  ...branches.map((b) => ({
                    value: b.id,
                    label: `${b.name} (${b.code})`,
                  })),
                ]}
              />
            </div>
          )}

          {report && (
            <span className="hidden xl:inline-flex items-center gap-1 text-2xs font-mono text-sushi-text-dim shrink-0">
              <Funnel size={12} />
              <span>
                {report.range.days} {t('accountingPage.daysUnit')}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. Cảnh Báo Nếu Có Đơn Hoàn Thành Chưa Khấu Trừ Giá Vốn BOM
         ========================================================================= */}
      {missingBomOrdersCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
          <WarningCircle size={18} weight="fill" className="text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">
              {t('accountingPage.bomCoverageNoticeTitle')}:
            </strong>{' '}
            {t('accountingPage.bomCoverageNoticeDesc')
              .replace('{withCost}', String(summary?.completedOrdersWithCost ?? 0))
              .replace('{total}', String(summary?.completedOrders ?? 0))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-xs text-sushi-text-dim font-mono">
            {t('common.loading')}
          </span>
        </div>
      ) : summary ? (
        <>
          {/* =====================================================================
              4. 4 Thẻ KPI Tài Chính & Kế Toán Cốt Lõi (Bento 2x2 Mobile / 4 Cột Desktop)
             ===================================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Doanh Thu Thuần Món Ăn */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
                  {t('accountingPage.kpiNetRevenue')}
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-sushi-gold shrink-0">
                  <Coins size={18} weight="fill" />
                </div>
              </div>

              <div className="mt-2.5 sm:mt-4">
                <div className="text-lg sm:text-2xl font-extrabold text-sushi-gold font-mono tracking-tight truncate">
                  {formatCurrency(summary.revenue)}
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-1 flex-wrap text-3xs sm:text-2xs font-mono">
                  <span className="text-sushi-text-dim">
                    {summary.completedOrders} {t('accountingPage.completedOrdersUnit')}
                  </span>

                  {previous?.revenueChangePct !== null &&
                    previous?.revenueChangePct !== undefined && (
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold ${
                          previous.revenueChangePct >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {previous.revenueChangePct >= 0 ? (
                          <TrendUp size={12} weight="bold" />
                        ) : (
                          <TrendDown size={12} weight="bold" />
                        )}
                        <span>
                          {previous.revenueChangePct > 0 ? '+' : ''}
                          {previous.revenueChangePct}%
                        </span>
                      </span>
                    )}
                </div>
              </div>
            </div>

            {/* KPI 2: Giá Vốn Nguyên Liệu (COGS) */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
                  {t('accountingPage.kpiCogs')}
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
                  <CookingPot size={18} weight="fill" />
                </div>
              </div>

              <div className="mt-2.5 sm:mt-4">
                <div className="text-lg sm:text-2xl font-extrabold text-sky-400 font-mono tracking-tight truncate">
                  {formatCurrency(summary.cogs)}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1 text-3xs sm:text-2xs font-mono text-sushi-text-dim">
                  <span>Food Cost:</span>
                  <span className="font-semibold text-sushi-text">
                    {foodCostPct !== null ? `${foodCostPct}%` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 3: Lợi Nhuận Gộp & Biên Lợi Nhuận */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
                  {t('accountingPage.kpiGrossProfit')}
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wallet size={18} weight="fill" />
                </div>
              </div>

              <div className="mt-2.5 sm:mt-4">
                <div
                  className={`text-lg sm:text-2xl font-extrabold font-mono tracking-tight truncate ${
                    summary.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(summary.grossProfit)}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1 text-3xs sm:text-2xs font-mono text-sushi-text-dim">
                  <span>{t('accountingPage.grossMarginLabel')}:</span>
                  <span className="font-bold text-emerald-400">
                    {summary.marginPct !== null ? `${summary.marginPct}%` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 4: Phí Giao Hàng Thu Hộ, AOV & Hao Hụt Đơn Hủy */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
                  {t('accountingPage.kpiShippingAndAov')}
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                  <Truck size={18} weight="fill" />
                </div>
              </div>

              <div className="mt-2.5 sm:mt-4">
                <div className="text-lg sm:text-2xl font-extrabold text-sushi-text font-mono tracking-tight truncate">
                  {formatCurrency(summary.shippingRevenue)}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1 text-3xs sm:text-2xs font-mono text-sushi-text-dim">
                  <span>AOV: {formatCurrency(summary.avgOrderValue)}</span>
                  {summary.cancelledAfterPrepCost > 0 && (
                    <Tooltip title={t('accountingPage.cancelledWasteTooltip')}>
                      <span className="text-rose-400 font-semibold">
                        -{formatCurrency(summary.cancelledAfterPrepCost)}
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              5. Biểu Đồ Trực Quan Doanh Thu Thuần vs Giá Vốn Theo Ngày
             ===================================================================== */}
          {report && report.daily.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-sushi-border/70">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-sushi-text flex items-center gap-2">
                    <ChartBar size={18} className="text-sushi-gold" weight="fill" />
                    <span>{t('accountingPage.dailyChartTitle')}</span>
                  </h3>
                  <p className="text-2xs text-sushi-text-dim mt-0.5">
                    {t('accountingPage.dailyChartSubtitle')}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-2xs font-mono">
                  <span className="inline-flex items-center gap-1.5 text-sushi-gold">
                    <span className="w-2.5 h-2.5 rounded-xs bg-sushi-gold inline-block" />
                    <span>{t('accountingPage.colNetRevenue')}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block" />
                    <span>{t('accountingPage.colCogs')}</span>
                  </span>
                </div>
              </div>

              {/* Thanh biểu đồ cuộn ngang mượt mà */}
              <div className="overflow-x-auto pb-2">
                <div
                  className="flex items-end gap-2.5 sm:gap-4 h-44 pt-6 px-2"
                  style={{ minWidth: Math.max(report.daily.length * 52, 300) }}
                >
                  {report.daily.map((d) => {
                    const revHeight = Math.max(
                      d.revenue > 0 ? 8 : 2,
                      Math.round((d.revenue / maxDailyRevenue) * 128),
                    );
                    const cogsHeight = Math.max(
                      d.cogs > 0 ? 6 : 2,
                      Math.round((d.cogs / maxDailyRevenue) * 128),
                    );
                    const gp = d.revenue - d.cogs;

                    return (
                      <Tooltip
                        key={d.date}
                        title={
                          <div className="text-2xs font-mono space-y-1 p-0.5">
                            <div className="font-bold text-white border-b border-zinc-700 pb-1">
                              {dayjs(d.date).format('DD/MM/YYYY')} ({d.completedOrders} đơn)
                            </div>
                            <div className="text-amber-300">
                              {t('accountingPage.colNetRevenue')}: {formatCurrency(d.revenue)}
                            </div>
                            <div className="text-sky-300">
                              {t('accountingPage.colCogs')}: {formatCurrency(d.cogs)}
                            </div>
                            <div className="text-emerald-300 font-semibold">
                              {t('accountingPage.colGrossProfit')}: {formatCurrency(gp)}
                            </div>
                          </div>
                        }
                      >
                        <div className="flex-1 min-w-[38px] flex flex-col items-center group cursor-pointer">
                          <div className="w-full flex items-end justify-center gap-1 h-32 border-b border-sushi-border/70 px-1 group-hover:bg-sushi-surface/40 rounded-t-lg transition-colors">
                            <div
                              style={{ height: `${revHeight}px` }}
                              className="w-3 sm:w-4 rounded-t-md bg-gradient-to-t from-amber-600 to-sushi-gold transition-all duration-300 group-hover:brightness-110"
                            />
                            <div
                              style={{ height: `${cogsHeight}px` }}
                              className="w-3 sm:w-4 rounded-t-md bg-gradient-to-t from-sky-600 to-sky-400 transition-all duration-300 group-hover:brightness-110"
                            />
                          </div>
                          <span className="mt-2 text-3xs sm:text-2xs font-mono text-sushi-text-muted group-hover:text-white">
                            {dayjs(d.date).format('DD/MM')}
                          </span>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              6. Lưới 2 Cột: Top Món Mang Lại Doanh Thu & Đối Soát Theo Chi Nhánh
             ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Cột Trái (7 phần): Top 10 Món Ăn Doanh Thu Cao Nhất */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sushi-border/70">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-sushi-text flex items-center gap-2">
                    <ForkKnife size={18} className="text-sushi-gold" weight="fill" />
                    <span>{t('accountingPage.topProductsTitle')}</span>
                  </h3>
                  <p className="text-2xs text-sushi-text-dim mt-0.5">
                    {t('accountingPage.topProductsSubtitle')}
                  </p>
                </div>
                <span className="text-2xs font-mono text-sushi-text-dim">
                  Top {report?.topProducts.length ?? 0}
                </span>
              </div>

              {!report?.topProducts || report.topProducts.length === 0 ? (
                <SushiEmptyState
                  icon={<ForkKnife size={24} />}
                  title={t('dashboard.noDataTitle')}
                  description={t('accountingPage.emptyPeriodDesc')}
                />
              ) : (
                <div className="space-y-3">
                  {report.topProducts.map((prod, idx) => {
                    const widthPct = Math.max(
                      4,
                      Math.round((prod.revenue / maxProductRevenue) * 100),
                    );
                    return (
                      <div
                        key={prod.productId}
                        className="p-3 rounded-xl bg-sushi-surface/40 border border-sushi-border/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-md font-mono font-bold text-3xs flex items-center justify-center shrink-0 ${
                                idx < 3
                                  ? 'bg-sushi-gold/20 text-sushi-gold border border-sushi-gold/40'
                                  : 'bg-sushi-card text-sushi-text-dim border border-sushi-border'
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-sushi-text truncate">
                              {prod.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0 font-mono">
                            <span className="text-2xs text-sushi-text-muted">
                              {prod.quantity} {t('common.itemsCount')}
                            </span>
                            <span className="font-bold text-sushi-gold">
                              {formatCurrency(prod.revenue)}
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-sushi-card overflow-hidden">
                          <div
                            style={{ width: `${widthPct}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-sushi-primary to-sushi-gold"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cột Phải (5 phần): Đối Soát Theo Chi Nhánh & Thống Kê Đơn */}
            <div className="lg:col-span-5 space-y-5">
              {/* Khối 1: Đối soát theo chi nhánh (Nếu xem toàn chuỗi) */}
              {report && report.byBranch.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm space-y-3.5">
                  <div className="pb-3 border-b border-sushi-border/70">
                    <h3 className="text-sm sm:text-base font-bold text-sushi-text flex items-center gap-2">
                      <Storefront size={18} className="text-sushi-gold" weight="fill" />
                      <span>{t('accountingPage.byBranchTitle')}</span>
                    </h3>
                    <p className="text-2xs text-sushi-text-dim mt-0.5">
                      {t('accountingPage.byBranchSubtitle')}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {report.byBranch.map((b) => {
                      const gp = b.revenue - b.cogs;
                      const margin =
                        b.revenue > 0 ? Math.round((gp / b.revenue) * 1000) / 10 : 0;
                      return (
                        <div
                          key={b.branchId}
                          className="p-3 rounded-xl bg-sushi-surface/50 border border-sushi-border/70 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-sushi-text truncate">
                              {b.name}
                            </span>
                            <Tag color="gold" className="font-mono text-3xs mr-0">
                              {b.completedOrders} {t('dashboard.ordersCountUnit')}
                            </Tag>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-sushi-border/50 text-2xs font-mono">
                            <div>
                              <span className="text-3xs text-sushi-text-dim block">
                                {t('accountingPage.colNetRevenue')}
                              </span>
                              <span className="font-bold text-sushi-gold">
                                {formatCurrency(b.revenue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-3xs text-sushi-text-dim block">
                                {t('accountingPage.colCogs')}
                              </span>
                              <span className="text-sky-400">
                                {formatCurrency(b.cogs)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-3xs text-sushi-text-dim block">
                                {t('accountingPage.colGrossProfit')}
                              </span>
                              <span className="font-bold text-emerald-400">
                                {formatCurrency(gp)} ({margin}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Khối 2: Bảng Cân Đối Trạng Thái Đơn Hàng & Kỳ Trước */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm space-y-3.5">
                <div className="pb-3 border-b border-sushi-border/70">
                  <h3 className="text-sm sm:text-base font-bold text-sushi-text flex items-center gap-2">
                    <Receipt size={18} className="text-sushi-gold" weight="fill" />
                    <span>{t('accountingPage.reconciliationSummaryTitle')}</span>
                  </h3>
                  <p className="text-2xs text-sushi-text-dim mt-0.5">
                    {t('accountingPage.reconciliationSummarySubtitle')}
                  </p>
                </div>

                <div className="divide-y divide-sushi-border/50 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('accountingPage.totalOrdersInPeriod')}
                    </span>
                    <span className="font-mono font-bold text-sushi-text">
                      {summary.totalOrders} {t('dashboard.ordersCountUnit')}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted flex items-center gap-1.5">
                      <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                      <span>{t('ordersPage.statusCompleted')}</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {summary.completedOrders} {t('dashboard.ordersCountUnit')}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('accountingPage.inProgressOrdersLabel')}
                    </span>
                    <span className="font-mono font-semibold text-amber-400">
                      {summary.inProgressOrders} {t('dashboard.ordersCountUnit')}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('ordersPage.statusCancelled')}
                    </span>
                    <span className="font-mono font-semibold text-rose-400">
                      {summary.cancelledOrders} {t('dashboard.ordersCountUnit')}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('accountingPage.cancelledWasteCostLabel')}
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      {formatCurrency(summary.cancelledAfterPrepCost)}
                    </span>
                  </div>

                  {previous && (
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-sushi-text-muted">
                        {t('accountingPage.previousPeriodRevenueLabel')} (
                        {dayjs(previous.startDate).format('DD/MM')} -{' '}
                        {dayjs(previous.endDate).format('DD/MM')})
                      </span>
                      <span className="font-mono font-semibold text-sushi-text">
                        {formatCurrency(previous.revenue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              7. Bảng Sổ Cái Đối Soát Doanh Thu - Giá Vốn - Lợi Nhuận Theo Ngày
             ===================================================================== */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sushi-border/70">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-sushi-text">
                  {t('accountingPage.dailyLedgerTitle')}
                </h3>
                <p className="text-2xs text-sushi-text-dim mt-0.5">
                  {t('accountingPage.dailyLedgerSubtitle')}
                </p>
              </div>
            </div>

            {/* Mobile Card List (< md) */}
            <SushiMobileCardList
              items={dailyList}
              pageSize={7}
              keyExtractor={(item) => item.date}
              emptyState={
                <SushiEmptyState
                  icon={<Receipt size={24} />}
                  title={t('dashboard.noDataTitle')}
                  description={t('accountingPage.emptyPeriodDesc')}
                />
              }
              renderItem={(row) => {
                const gp = row.revenue - row.cogs;
                const pct =
                  row.revenue > 0 ? Math.round((gp / row.revenue) * 1000) / 10 : null;
                return (
                  <SushiCardItem>
                    <div className="flex items-center justify-between pb-2 border-b border-sushi-border/60">
                      <span className="font-mono font-bold text-xs text-sushi-text">
                        {dayjs(row.date).format('DD/MM/YYYY')}
                      </span>
                      <span className="text-2xs font-mono text-sushi-text-muted">
                        {row.completedOrders}/{row.orders} {t('dashboard.ordersCountUnit')}
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-2xs font-mono">
                      <div>
                        <span className="text-3xs text-sushi-text-dim block">
                          {t('accountingPage.colNetRevenue')}
                        </span>
                        <span className="font-bold text-sushi-gold">
                          {formatCurrency(row.revenue)}
                        </span>
                      </div>
                      <div>
                        <span className="text-3xs text-sushi-text-dim block">
                          {t('accountingPage.colCogs')}
                        </span>
                        <span className="text-sky-400">
                          {formatCurrency(row.cogs)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xs text-sushi-text-dim block">
                          {t('accountingPage.colGrossProfit')}
                        </span>
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(gp)} {pct !== null ? `(${pct}%)` : ''}
                        </span>
                      </div>
                    </div>
                  </SushiCardItem>
                );
              }}
            />

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block">
              <Table
                dataSource={dailyList}
                columns={dailyColumns}
                rowKey="date"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 'max-content' }}
                className="border border-sushi-border rounded-xl overflow-hidden"
              />
            </div>
          </div>
        </>
      ) : null}

      {/* Modal / Bottom Sheet Chọn Khoảng Ngày Tùy Chỉnh */}
      <OrderDateFilterDrawer
        open={isDateDrawerOpen}
        onClose={() => setIsDateDrawerOpen(false)}
        startDate={startDate}
        endDate={endDate}
        onApply={({ startDate: s, endDate: e }) => {
          if (s && e) {
            setPreset('custom');
            setStartDate(s);
            setEndDate(e);
          }
        }}
        onReset={() => handleSelectPreset('7days')}
      />
    </div>
  );
}
