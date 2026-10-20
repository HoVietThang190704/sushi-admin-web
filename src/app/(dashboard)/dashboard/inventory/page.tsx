'use client';

import React, { useState, useMemo } from 'react';
import {
  SushiPageHeader,
  SushiButton,
  Button,
  Plus,
  ArrowRight,
  CookingPot,
  Package,
  Receipt,
  Input,
  MagnifyingGlass,
  Tabs,
  Select,
} from '@/components/ui';
import {
  Ingredient,
  TransactionType,
  useIngredients,
  useInventoryTransactions,
  useCreateIngredient,
  useCreateTransaction,
  StockBalanceTable,
  StockTransactionTable,
  CreateIngredientModal,
  CreateTransactionModal,
} from '@/features/inventory';
import { useTranslation } from '@/lib/i18n';

export default function InventoryPage() {
  const { t } = useTranslation();

  // Dialog & Modal States
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('IN');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Filter States
  const [activeTab, setActiveTab] = useState<string>('balance');
  const [search, setSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'ALERTS'>('ALL');

  // TanStack Query Hooks
  const { data: ingredients = [], isLoading: ingredientsLoading } = useIngredients();
  const { data: stockInTransactions = [], isLoading: inLoading } = useInventoryTransactions('IN');
  const { data: stockOutTransactions = [], isLoading: outLoading } = useInventoryTransactions('OUT');

  // Mutation Hooks
  const createIngredientMutation = useCreateIngredient();
  const createTransactionMutation = useCreateTransaction();

  // Danh sách nguyên liệu sau lọc
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      // 1. Lọc theo trạng thái cảnh báo
      if (alertFilter === 'ALERTS' && !item.isAlert) {
        return false;
      }

      // 2. Lọc theo từ khóa tìm kiếm (mã, tên)
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(query);
        const matchName = item.name.toLowerCase().includes(query);
        return matchCode || matchName;
      }

      return true;
    });
  }, [ingredients, alertFilter, search]);

  // Thống kê cảnh báo
  const alertCount = useMemo(() => {
    return ingredients.filter((item) => item.isAlert).length;
  }, [ingredients]);

  const handleOpenStockIn = (ingredient?: Ingredient) => {
    setSelectedIngredient(ingredient || null);
    setTransactionType('IN');
    setIsTransactionModalOpen(true);
  };

  const handleOpenStockOut = (ingredient?: Ingredient) => {
    setSelectedIngredient(ingredient || null);
    setTransactionType('OUT');
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. Header & Nút Hành Động Nhanh
         ========================================================================= */}
      <SushiPageHeader
        title={t('dashboard.inventoryTitle')}
        subtitle={t('dashboard.inventorySubtitle')}
        extra={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              icon={<ArrowRight size={15} className="text-amber-400" />}
              onClick={() => handleOpenStockOut()}
              className="rounded-xl border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            >
              {t('dashboard.stockOut')}
            </Button>

            <SushiButton
              type="primary"
              icon={<Plus size={16} weight="bold" />}
              onClick={() => handleOpenStockIn()}
            >
              {t('dashboard.stockIn')}
            </SushiButton>

            <Button
              icon={<CookingPot size={16} />}
              onClick={() => setIsIngredientModalOpen(true)}
              className="rounded-xl"
            >
              {t('dashboard.addIngredient')}
            </Button>
          </div>
        }
      />

      {/* =========================================================================
          2. KPI Bento Cards (4 Thẻ Thống Kê Tổng Quan Kho)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tổng Nguyên Liệu */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.totalIngredients')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CookingPot size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {ingredients.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              Nguyên vật liệu F&B
            </span>
          </div>
        </div>

        {/* Metric 2: Cảnh Báo Tồn (Hết Hàng / Gần Hết) */}
        <div
          className={`p-5 rounded-2xl bg-sushi-card border shadow-md transition-colors ${
            alertCount > 0
              ? 'border-red-500/50 bg-gradient-to-br from-sushi-card to-red-500/5'
              : 'border-sushi-border/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.alertItemsCount')}
            </span>
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                alertCount > 0
                  ? 'bg-red-500/15 border-red-500/35 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <Package size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span
              className={`text-3xl font-bold tracking-tight font-sans ${
                alertCount > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {alertCount}
            </span>
            <span className="text-2xs font-mono text-sushi-text-dim">
              {alertCount > 0 ? 'Cần nhập bổ sung' : 'Mức tồn an toàn'}
            </span>
          </div>
        </div>

        {/* Metric 3: Lượt Phiếu Nhập Kho */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.totalStockInCount')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Receipt size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {stockInTransactions.length}
            </span>
            <span className="text-2xs text-emerald-400 font-mono">Phiếu PNK</span>
          </div>
        </div>

        {/* Metric 4: Lượt Phiếu Xuất Kho */}
        <div className="p-5 rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sushi-text-muted">
              {t('dashboard.totalStockOutCount')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Receipt size={20} weight="fill" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {stockOutTransactions.length}
            </span>
            <span className="text-2xs text-amber-400 font-mono">Phiếu PXK</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Toolbar Tìm Kiếm & Lọc Nhanh (Chỉ áp dụng khi ở Tab Tồn Kho)
         ========================================================================= */}
      {activeTab === 'balance' && (
        <div className="p-4 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="w-full sm:w-80">
              <Input
                prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5" />}
                placeholder={t('dashboard.searchIngredientPlaceholder')}
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                className="w-full"
                value={alertFilter}
                onChange={(val) => setAlertFilter(val)}
                options={[
                  { value: 'ALL', label: t('dashboard.filterAlertAll') },
                  { value: 'ALERTS', label: t('dashboard.filterAlertOnly') },
                ]}
              />
            </div>
          </div>

          <div className="text-xs font-mono text-sushi-text-dim shrink-0">
            <span>
              {filteredIngredients.length} / {ingredients.length} {t('common.itemsCount')}
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. Tabs Giao Diện: Tồn Kho & Cảnh Báo / Lịch Sử Nhập / Lịch Sử Xuất
         ========================================================================= */}
      <div className="rounded-2xl bg-sushi-card border border-sushi-border/80 p-4 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          animated={{ inkBar: true, tabPane: true }}
          items={[
            {
              key: 'balance',
              label: (
                <span className="flex items-center space-x-2">
                  <span>{t('dashboard.tabStockBalance')}</span>
                  {alertCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-2xs font-mono font-bold bg-red-500 text-white">
                      {alertCount}
                    </span>
                  )}
                </span>
              ),
              children: (
                <div className="pt-2">
                  <StockBalanceTable
                    ingredients={filteredIngredients}
                    loading={ingredientsLoading}
                    onStockIn={(item) => handleOpenStockIn(item)}
                    onStockOut={(item) => handleOpenStockOut(item)}
                  />
                </div>
              ),
            },
            {
              key: 'in',
              label: t('dashboard.tabStockInHistory'),
              children: (
                <div className="pt-2">
                  <StockTransactionTable
                    transactions={stockInTransactions}
                    loading={inLoading}
                  />
                </div>
              ),
            },
            {
              key: 'out',
              label: t('dashboard.tabStockOutHistory'),
              children: (
                <div className="pt-2">
                  <StockTransactionTable
                    transactions={stockOutTransactions}
                    loading={outLoading}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* =========================================================================
          5. Các Modal Nhập Liệu
         ========================================================================= */}
      <CreateIngredientModal
        open={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSubmit={async (dto) => {
          await createIngredientMutation.mutateAsync(dto);
        }}
      />

      <CreateTransactionModal
        open={isTransactionModalOpen}
        defaultType={transactionType}
        selectedIngredient={selectedIngredient}
        ingredients={ingredients}
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={async (dto) => {
          await createTransactionMutation.mutateAsync(dto);
        }}
      />
    </div>
  );
}
