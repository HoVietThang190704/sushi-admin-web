'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import {
  SushiPageHeader,
  Select,
  Table,
  Spin,
  Tooltip,
  SushiMobileCardList,
  SushiEmptyState,
  Receipt,
  ForkKnife,
  ArrowsClockwise,
} from '@/components/ui';
import {
  TrendUp,
  TrendDown,
  DownloadSimple,
  CalendarBlank,
  ArrowUpRight,
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
    return Math.round((summary.cogs / summary.revenue) * 1000) / 10;
  }, [summary]);

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
        <span className="font-mono font-medium text-sushi-text text-xs">
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: t('accountingPage.colCompletedOrders'),
      key: 'orders',
      align: 'center' as const,
      render: (_: unknown, row: AnalyticsDailyPoint) => (
        <span className="font-mono text-xs text-sushi-text-muted">
          <strong className="text-sushi-text">{row.completedOrders}</strong>/{row.orders}
        </span>
      ),
    },
    {
      title: t('accountingPage.colNetRevenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right' as const,
      render: (rev: number) => (
        <span className="font-mono font-semibold text-sushi-text text-xs">
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
        <span className="font-mono text-sushi-text-muted text-xs">
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
            className={`font-mono font-semibold text-xs ${
              gp >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono font-medium ${
              pct >= 50
                ? 'bg-emerald-500/10 text-emerald-400'
                : pct >= 30
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-rose-500/10 text-rose-400'
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
    <div className="space-y-4">
      {/* 1. Header & Unified Filter Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('accountingPage.title')}
          subtitle={t('accountingPage.subtitle')}
        />

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {/* Segmented Time Presets */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-sushi-surface border border-sushi-border">
            {(
              [
                { key: 'today', label: t('ordersPage.quickToday') },
                { key: '7days', label: '7D' },
                { key: '30days', label: '30D' },
                { key: 'thisMonth', label: t('accountingPage.presetThisMonth') },
              ] as const
            ).map((item) => {
              const active = preset === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectPreset(item.key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-sushi-card text-white shadow-2xs border border-sushi-border'
                      : 'text-sushi-text-dim hover:text-sushi-text border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Date Picker Trigger */}
          <button
            type="button"
            onClick={() => setIsDateDrawerOpen(true)}
            className={`h-8 px-2.5 rounded-lg border text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              preset === 'custom'
                ? 'border-sushi-text/40 bg-sushi-surface text-white'
                : 'border-sushi-border bg-sushi-card text-sushi-text-muted hover:text-white'
            }`}
          >
            <CalendarBlank size={13} className="text-sushi-text-dim" />
            <span>
              {dayjs(startDate).format('DD/MM')} – {dayjs(endDate).format('DD/MM/YY')}
            </span>
          </button>

          {/* Action Buttons: Refresh & CSV Export */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title={t('ordersPage.refresh')}
              className="w-8 h-8 rounded-lg border border-sushi-border bg-sushi-card text-sushi-text-muted hover:text-white hover:bg-sushi-surface inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowsClockwise size={14} className={isFetching ? 'animate-spin' : ''} />
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!report || report.daily.length === 0}
              className="h-8 px-3 rounded-lg bg-sushi-text text-zinc-950 hover:bg-zinc-200 disabled:opacity-40 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <DownloadSimple size={14} weight="bold" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-toolbar: Branch Filter & BOM Coverage Status Strip */}
      {(isSuperAdmin || missingBomOrdersCount > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {isSuperAdmin ? (
            <div className="w-full sm:w-60">
              <Select
                className="w-full h-8.5 text-xs"
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
          ) : (
            <div />
          )}

          {missingBomOrdersCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-sushi-card border border-sushi-border border-l-2 border-l-amber-500 flex items-center justify-between gap-3 text-2xs text-sushi-text-muted">
              <span>
                <strong className="text-amber-400 font-mono">
                  {summary?.completedOrdersWithCost ?? 0}/{summary?.completedOrders ?? 0}
                </strong>{' '}
                đơn hoàn thành đã gắn định mức giá vốn (BOM).
              </span>
              <Link
                href="/dashboard/inventory"
                className="text-sushi-text hover:underline font-medium inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Cấu hình BOM</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5">
          <Spin />
          <span className="text-2xs text-sushi-text-dim font-mono">
            {t('common.loading')}
          </span>
        </div>
      ) : summary ? (
        <>
          {/* 3. Financial Ledger Strip (1px Divided Architectural Grid - No Skittles Icons) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sushi-border border border-sushi-border rounded-xl overflow-hidden">
            {/* Metric 1: Net Revenue */}
            <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
                  {t('accountingPage.colNetRevenue')}
                </span>
                {previous?.revenueChangePct !== null &&
                  previous?.revenueChangePct !== undefined && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-3xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                        previous.revenueChangePct >= 0
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {previous.revenueChangePct >= 0 ? (
                        <TrendUp size={10} weight="bold" />
                      ) : (
                        <TrendDown size={10} weight="bold" />
                      )}
                      <span>
                        {previous.revenueChangePct > 0 ? '+' : ''}
                        {previous.revenueChangePct}%
                      </span>
                    </span>
                  )}
              </div>

              <div className="mt-2 text-lg sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
                {formatCurrency(summary.revenue)}
              </div>

              <div className="mt-1.5 text-[11px] font-mono text-sushi-text-dim">
                {summary.completedOrders} {t('accountingPage.completedOrdersUnit')}
              </div>
            </div>

            {/* Metric 2: COGS */}
            <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
                  {t('accountingPage.colCogs')}
                </span>
                <span className="text-3xs font-mono text-sushi-text-dim">
                  BOM
                </span>
              </div>

              <div className="mt-2 text-lg sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
                {formatCurrency(summary.cogs)}
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-sushi-text-dim">
                <span>Food Cost</span>
                <span className="text-sushi-text-muted font-medium">
                  {foodCostPct !== null ? `${foodCostPct}%` : '0%'}
                </span>
              </div>
            </div>

            {/* Metric 3: Gross Profit */}
            <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
                  {t('accountingPage.kpiGrossProfit')}
                </span>
                {summary.marginPct !== null && (
                  <span className="text-3xs font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    {summary.marginPct}%
                  </span>
                )}
              </div>

              <div
                className={`mt-2 text-lg sm:text-2xl font-semibold font-mono tracking-tight ${
                  summary.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(summary.grossProfit)}
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-sushi-text-dim">
                <span>{t('accountingPage.grossMarginLabel')}</span>
                <span className="text-sushi-text-muted">
                  {summary.marginPct !== null ? `${summary.marginPct}%` : '—'}
                </span>
              </div>
            </div>

            {/* Metric 4: Shipping & AOV */}
            <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
                  PHÍ SHIP & AOV
                </span>
              </div>

              <div className="mt-2 text-lg sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
                {formatCurrency(summary.shippingRevenue)}
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-sushi-text-dim">
                <span>AOV: {formatCurrency(summary.avgOrderValue)}</span>
                {summary.cancelledAfterPrepCost > 0 && (
                  <Tooltip title={t('accountingPage.cancelledWasteTooltip')}>
                    <span className="text-rose-400">
                      -{formatCurrency(summary.cancelledAfterPrepCost)}
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* 4. Daily Revenue vs COGS Chart */}
          {report && report.daily.length > 0 && (
            <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
              <div className="px-4 py-3 border-b border-sushi-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-sushi-text font-mono">
                    {t('accountingPage.dailyChartTitle')}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-2xs font-mono text-sushi-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-sushi-text inline-block" />
                    <span>{t('accountingPage.colNetRevenue')}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-xs bg-zinc-600 inline-block" />
                    <span>{t('accountingPage.colCogs')}</span>
                  </span>
                </div>
              </div>

              <div className="p-4 overflow-x-auto">
                <div
                  className="flex items-end gap-2 sm:gap-3 h-40 pt-4 px-1"
                  style={{ minWidth: Math.max(report.daily.length * 46, 280) }}
                >
                  {report.daily.map((d) => {
                    const revHeight = Math.max(
                      d.revenue > 0 ? 6 : 2,
                      Math.round((d.revenue / maxDailyRevenue) * 116),
                    );
                    const cogsHeight = Math.max(
                      d.cogs > 0 ? 4 : 2,
                      Math.round((d.cogs / maxDailyRevenue) * 116),
                    );
                    const gp = d.revenue - d.cogs;

                    return (
                      <Tooltip
                        key={d.date}
                        title={
                          <div className="text-2xs font-mono space-y-1 p-0.5">
                            <div className="font-semibold text-white border-b border-zinc-700 pb-1">
                              {dayjs(d.date).format('DD/MM/YYYY')} ({d.completedOrders} đơn)
                            </div>
                            <div className="text-zinc-200">
                              {t('accountingPage.colNetRevenue')}: {formatCurrency(d.revenue)}
                            </div>
                            <div className="text-zinc-400">
                              {t('accountingPage.colCogs')}: {formatCurrency(d.cogs)}
                            </div>
                            <div className="text-emerald-400 font-semibold">
                              {t('accountingPage.colGrossProfit')}: {formatCurrency(gp)}
                            </div>
                          </div>
                        }
                      >
                        <div className="flex-1 min-w-[34px] flex flex-col items-center group cursor-pointer">
                          <div className="w-full flex items-end justify-center gap-1 h-29 border-b border-sushi-border px-1 group-hover:bg-sushi-surface/60 transition-colors">
                            <div
                              style={{ height: `${revHeight}px` }}
                              className="w-2.5 sm:w-3 rounded-t-xs bg-sushi-text group-hover:bg-white transition-all"
                            />
                            <div
                              style={{ height: `${cogsHeight}px` }}
                              className="w-2.5 sm:w-3 rounded-t-xs bg-zinc-600 group-hover:bg-zinc-500 transition-all"
                            />
                          </div>
                          <span className="mt-2 text-3xs font-mono text-sushi-text-dim group-hover:text-sushi-text">
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

          {/* 5. Two-Column Split: Top Products & Branch / Order Reconciliation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left (7 cols): Top Products by Revenue (Flush Editorial List) */}
            <div className="lg:col-span-7 rounded-xl bg-sushi-card border border-sushi-border overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-sushi-border flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sushi-text font-mono">
                  {t('accountingPage.topProductsTitle')}
                </h3>
                <span className="text-2xs font-mono text-sushi-text-dim">
                  TOP {report?.topProducts.length ?? 0}
                </span>
              </div>

              {!report?.topProducts || report.topProducts.length === 0 ? (
                <SushiEmptyState
                  icon={<ForkKnife size={20} />}
                  title={t('dashboard.noDataTitle')}
                  description={t('accountingPage.emptyPeriodDesc')}
                />
              ) : (
                <div className="divide-y divide-sushi-border/60">
                  {report.topProducts.map((prod, idx) => {
                    const widthPct = Math.max(
                      3,
                      Math.round((prod.revenue / maxProductRevenue) * 100),
                    );
                    return (
                      <div
                        key={prod.productId}
                        className="px-4 py-2.5 hover:bg-sushi-surface/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 text-2xs font-mono text-sushi-text-dim shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-medium text-sushi-text truncate">
                              {prod.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                            <span className="text-2xs text-sushi-text-dim">
                              ×{prod.quantity}
                            </span>
                            <span className="font-semibold text-sushi-text w-24 text-right">
                              {formatCurrency(prod.revenue)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-1.5 ml-7.5 w-[calc(100%-1.875rem)] h-1 rounded-full bg-sushi-surface overflow-hidden">
                          <div
                            style={{ width: `${widthPct}%` }}
                            className="h-full bg-zinc-400"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right (5 cols): Branch P&L & Order Status Reconciliation */}
            <div className="lg:col-span-5 space-y-4">
              {report && report.byBranch.length > 0 && (
                <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-sushi-border">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-sushi-text font-mono">
                      {t('accountingPage.byBranchTitle')}
                    </h3>
                  </div>

                  <div className="divide-y divide-sushi-border/60">
                    {report.byBranch.map((b) => {
                      const gp = b.revenue - b.cogs;
                      const margin =
                        b.revenue > 0 ? Math.round((gp / b.revenue) * 1000) / 10 : 0;
                      return (
                        <div key={b.branchId} className="px-4 py-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-sushi-text truncate">
                              {b.name}
                            </span>
                            <span className="text-2xs font-mono text-sushi-text-dim">
                              {b.completedOrders} {t('dashboard.ordersCountUnit')}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-2xs font-mono">
                            <div>
                              <span className="text-3xs text-sushi-text-dim block uppercase">
                                {t('accountingPage.colNetRevenue')}
                              </span>
                              <span className="font-semibold text-sushi-text">
                                {formatCurrency(b.revenue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-3xs text-sushi-text-dim block uppercase">
                                {t('accountingPage.colCogs')}
                              </span>
                              <span className="text-sushi-text-muted">
                                {formatCurrency(b.cogs)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-3xs text-sushi-text-dim block uppercase">
                                {t('accountingPage.colGrossProfit')}
                              </span>
                              <span className="font-semibold text-emerald-400">
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

              {/* Reconciliation Summary */}
              <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
                <div className="px-4 py-3 border-b border-sushi-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-sushi-text font-mono">
                    {t('accountingPage.reconciliationSummaryTitle')}
                  </h3>
                </div>

                <div className="divide-y divide-sushi-border/60 text-xs px-4">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('accountingPage.totalOrdersInPeriod')}
                    </span>
                    <span className="font-mono font-semibold text-sushi-text">
                      {summary.totalOrders}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('ordersPage.statusCompleted')}
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {summary.completedOrders}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('accountingPage.inProgressOrdersLabel')}
                    </span>
                    <span className="font-mono text-sushi-text">
                      {summary.inProgressOrders}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('ordersPage.statusCancelled')}
                    </span>
                    <span className="font-mono text-rose-400">
                      {summary.cancelledOrders}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-sushi-text-muted">
                      {t('accountingPage.cancelledWasteCostLabel')}
                    </span>
                    <span className="font-mono font-semibold text-rose-400">
                      {formatCurrency(summary.cancelledAfterPrepCost)}
                    </span>
                  </div>

                  {previous && (
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-sushi-text-muted">
                        {t('accountingPage.previousPeriodRevenueLabel')} (
                        {dayjs(previous.startDate).format('DD/MM')}–
                        {dayjs(previous.endDate).format('DD/MM')})
                      </span>
                      <span className="font-mono text-sushi-text-muted">
                        {formatCurrency(previous.revenue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Daily P&L Ledger Table */}
          <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
            <div className="px-4 py-3 border-b border-sushi-border flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sushi-text font-mono">
                {t('accountingPage.dailyLedgerTitle')}
              </h3>
              <span className="text-2xs font-mono text-sushi-text-dim">
                {dailyList.length} {t('accountingPage.daysUnit')}
              </span>
            </div>

            {/* Mobile Flush List (< md) */}
            <div className="md:hidden">
              <SushiMobileCardList
                items={dailyList}
                pageSize={7}
                keyExtractor={(item) => item.date}
                className="p-3"
                emptyState={
                  <SushiEmptyState
                    icon={<Receipt size={20} />}
                    title={t('dashboard.noDataTitle')}
                    description={t('accountingPage.emptyPeriodDesc')}
                  />
                }
                renderItem={(row) => {
                  const gp = row.revenue - row.cogs;
                  const pct =
                    row.revenue > 0 ? Math.round((gp / row.revenue) * 1000) / 10 : null;
                  return (
                    <div className="p-3 rounded-lg bg-sushi-surface/50 border border-sushi-border">
                      <div className="flex items-center justify-between pb-2 border-b border-sushi-border/60">
                        <span className="font-mono font-semibold text-xs text-sushi-text">
                          {dayjs(row.date).format('DD/MM/YYYY')}
                        </span>
                        <span className="text-2xs font-mono text-sushi-text-dim">
                          {row.completedOrders}/{row.orders} {t('dashboard.ordersCountUnit')}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-2xs font-mono">
                        <div>
                          <span className="text-3xs text-sushi-text-dim block uppercase">
                            {t('accountingPage.colNetRevenue')}
                          </span>
                          <span className="font-semibold text-sushi-text">
                            {formatCurrency(row.revenue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-3xs text-sushi-text-dim block uppercase">
                            {t('accountingPage.colCogs')}
                          </span>
                          <span className="text-sushi-text-muted">
                            {formatCurrency(row.cogs)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-3xs text-sushi-text-dim block uppercase">
                            {t('accountingPage.colGrossProfit')}
                          </span>
                          <span className="font-semibold text-emerald-400">
                            {formatCurrency(gp)} {pct !== null ? `(${pct}%)` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block">
              <Table
                dataSource={dailyList}
                columns={dailyColumns}
                rowKey="date"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 'max-content' }}
              />
            </div>
          </div>
        </>
      ) : null}

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
