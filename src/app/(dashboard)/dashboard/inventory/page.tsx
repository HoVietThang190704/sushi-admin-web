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
  Funnel,
} from '@/components/ui';
import { X } from '@phosphor-icons/react';
import {
  Ingredient,
  TransactionType,
  Recipe,
  useIngredients,
  useRecipes,
  useInventoryTransactions,
  useCreateIngredient,
  useCreateTransaction,
  StockBalanceTable,
  StockTransactionTable,
  CreateIngredientModal,
  CreateTransactionModal,
  RecipeManagementView,
  WarehouseStockView,
  IngredientFilterDrawer,
  RecipeFilterDrawer,
} from '@/features/inventory';
import { useProducts } from '@/features/catalog';
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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filter States cho Tab Công Thức Món (BOM)
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeFilterStatus, setRecipeFilterStatus] = useState<'ALL' | 'CONFIGURED' | 'MISSING'>('ALL');
  const [isRecipeFilterDrawerOpen, setIsRecipeFilterDrawerOpen] = useState(false);

  const hasActiveFilters = alertFilter !== 'ALL';
  const handleResetFilters = () => {
    setAlertFilter('ALL');
  };

  const hasActiveRecipeFilters = recipeFilterStatus !== 'ALL';
  const handleResetRecipeFilters = () => {
    setRecipeFilterStatus('ALL');
  };

  // TanStack Query Hooks
  const { data: ingredients = [], isLoading: ingredientsLoading } = useIngredients();
  const { data: stockInTransactions = [], isLoading: inLoading } = useInventoryTransactions('IN');
  const { data: stockOutTransactions = [], isLoading: outLoading } = useInventoryTransactions('OUT');
  const { data: products = [] } = useProducts();
  const { data: recipes = [] } = useRecipes();

  // Recipe (BOM) Data Memo
  const singleProducts = useMemo(() => {
    return products.filter((p) => p.type === 'SINGLE');
  }, [products]);

  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    for (const r of recipes) {
      map.set(r.productId, r);
    }
    return map;
  }, [recipes]);

  const filteredRecipeProducts = useMemo(() => {
    return singleProducts.filter((p) => {
      const recipe = recipeMap.get(p.id);
      const isConfigured = Boolean(recipe && recipe.items && recipe.items.length > 0);

      if (recipeFilterStatus === 'CONFIGURED' && !isConfigured) return false;
      if (recipeFilterStatus === 'MISSING' && isConfigured) return false;

      if (recipeSearch.trim()) {
        const q = recipeSearch.toLowerCase().trim();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      }
      return true;
    });
  }, [singleProducts, recipeMap, recipeFilterStatus, recipeSearch]);

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
          <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:gap-2.5">
            <Button
              icon={<ArrowRight size={15} className="text-amber-400 shrink-0" />}
              onClick={() => handleOpenStockOut()}
              className="h-10 sm:h-9 rounded-xl border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2 sm:px-3 text-xs sm:text-sm flex items-center justify-center"
            >
              <span className="truncate">{t('dashboard.stockOut')}</span>
            </Button>

            <SushiButton
              type="primary"
              icon={<Plus size={15} weight="bold" className="shrink-0" />}
              onClick={() => handleOpenStockIn()}
              className="h-10 sm:h-9 rounded-xl px-2 sm:px-3.5 text-xs sm:text-sm font-semibold flex items-center justify-center shadow-md shadow-emerald-500/15"
            >
              <span className="truncate">{t('dashboard.stockIn')}</span>
            </SushiButton>

            <Button
              icon={<CookingPot size={15} className="shrink-0" />}
              onClick={() => setIsIngredientModalOpen(true)}
              className="h-10 sm:h-9 rounded-xl px-2 sm:px-3 text-xs sm:text-sm flex items-center justify-center"
            >
              <span className="truncate sm:hidden">Thêm NL</span>
              <span className="hidden sm:inline">{t('dashboard.addIngredient')}</span>
            </Button>
          </div>
        }
      />

      {/* =========================================================================
          2. KPI Bento Cards (4 Thẻ Thống Kê Tổng Quan Kho)
          - Mobile: 2x2 grid compact giúp tiết kiệm 70% chiều cao
          - Desktop: 4 cột chuẩn
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Tổng Nguyên Liệu */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm sm:shadow-md">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('dashboard.totalIngredients')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <CookingPot size={15} className="sm:hidden" weight="fill" />
              <CookingPot size={20} className="hidden sm:block" weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {ingredients.length}
            </span>
            <span className="text-3xs sm:text-2xs text-sushi-text-dim font-mono truncate">
              F&B items
            </span>
          </div>
        </div>

        {/* Metric 2: Cảnh Báo Tồn (Hết Hàng / Gần Hết) */}
        <div
          className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border shadow-sm sm:shadow-md transition-colors ${
            alertCount > 0
              ? 'border-red-500/50 bg-gradient-to-br from-sushi-card to-red-500/5'
              : 'border-sushi-border/90'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('dashboard.alertItemsCount')}
            </span>
            <div
              className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 ${
                alertCount > 0
                  ? 'bg-red-500/15 border-red-500/35 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <Package size={15} className="sm:hidden" weight="fill" />
              <Package size={20} className="hidden sm:block" weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between gap-1">
            <span
              className={`text-xl sm:text-3xl font-bold tracking-tight font-sans ${
                alertCount > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {alertCount}
            </span>
            <span className="text-3xs sm:text-2xs font-mono text-sushi-text-dim truncate">
              {alertCount > 0 ? 'Cần nhập' : 'An toàn'}
            </span>
          </div>
        </div>

        {/* Metric 3: Lượt Phiếu Nhập Kho */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm sm:shadow-md">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('dashboard.totalStockInCount')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Receipt size={15} className="sm:hidden" weight="fill" />
              <Receipt size={20} className="hidden sm:block" weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {stockInTransactions.length}
            </span>
            <span className="text-3xs sm:text-2xs text-emerald-400 font-mono">Phiếu PNK</span>
          </div>
        </div>

        {/* Metric 4: Lượt Phiếu Xuất Kho */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm sm:shadow-md">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('dashboard.totalStockOutCount')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Receipt size={15} className="sm:hidden" weight="fill" />
              <Receipt size={20} className="hidden sm:block" weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between gap-1">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text tracking-tight font-sans">
              {stockOutTransactions.length}
            </span>
            <span className="text-3xs sm:text-2xs text-amber-400 font-mono">Phiếu PXK</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. Toolbar Tìm Kiếm & Lọc Nhanh (Chỉ áp dụng khi ở Tab Tồn Kho)
         ========================================================================= */}
      {activeTab === 'balance' && (
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center sm:flex-wrap gap-2 sm:gap-3 flex-1 w-full">
            {/* Ô tìm kiếm theo mã, tên */}
            <div className="flex-1 sm:w-80 min-w-0">
              <Input
                id="inventory-search-input"
                name="search"
                prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5 shrink-0" />}
                placeholder={t('dashboard.searchIngredientPlaceholder')}
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl h-10 w-full"
              />
            </div>

            {/* Nút Lọc Mobile (< sm) */}
            <Button
              icon={
                <Funnel
                  size={16}
                  weight={hasActiveFilters ? 'fill' : 'regular'}
                  className={hasActiveFilters ? 'text-sushi-gold' : ''}
                />
              }
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`h-10 rounded-xl px-3 flex items-center justify-center shrink-0 sm:hidden ${
                hasActiveFilters ? 'border-sushi-gold/60 bg-sushi-gold/10' : ''
              }`}
              title="Lọc trạng thái nguyên liệu"
            >
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-sushi-gold ml-0.5 inline-block" />
              )}
            </Button>

            {/* Dropdown desktop (>= sm) */}
            <div className="hidden sm:block sm:w-48">
              <Select
                className="w-full h-10"
                value={alertFilter}
                onChange={(val) => setAlertFilter(val)}
                options={[
                  { value: 'ALL', label: t('dashboard.filterAlertAll') },
                  { value: 'ALERTS', label: t('dashboard.filterAlertOnly') },
                ]}
              />
            </div>
          </div>

          {/* Đếm số lượng & Xóa bộ lọc nhanh trên mobile */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-2xs sm:text-xs font-mono text-sushi-text-dim shrink-0">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="sm:hidden text-2xs text-sushi-gold hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                <X size={12} />
                <span>Xóa bộ lọc</span>
              </button>
            )}
            <span>
              {filteredIngredients.length} / {ingredients.length} {t('common.itemsCount')}
            </span>
          </div>
        </div>
      )}

      {/* Toolbar Tìm Kiếm & Lọc Nhanh (Tab Công Thức Món BOM) */}
      {activeTab === 'recipes' && (
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center sm:flex-wrap gap-2 sm:gap-3 flex-1 w-full">
            {/* Ô tìm kiếm theo tên món hoặc mã SKU */}
            <div className="flex-1 sm:w-80 min-w-0">
              <Input
                id="recipe-search-input"
                name="recipeSearch"
                prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5 shrink-0" />}
                placeholder="Tìm theo tên món hoặc mã SKU..."
                allowClear
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="rounded-xl h-10 w-full"
              />
            </div>

            {/* Nút Lọc Mobile (< sm) */}
            <Button
              icon={
                <Funnel
                  size={16}
                  weight={hasActiveRecipeFilters ? 'fill' : 'regular'}
                  className={hasActiveRecipeFilters ? 'text-sushi-gold' : ''}
                />
              }
              onClick={() => setIsRecipeFilterDrawerOpen(true)}
              className={`h-10 rounded-xl px-3 flex items-center justify-center shrink-0 sm:hidden ${
                hasActiveRecipeFilters ? 'border-sushi-gold/60 bg-sushi-gold/10' : ''
              }`}
              title="Lọc trạng thái công thức món"
            >
              {hasActiveRecipeFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-sushi-gold ml-0.5 inline-block" />
              )}
            </Button>

            {/* Dropdown desktop (>= sm) */}
            <div className="hidden sm:block sm:w-56">
              <Select
                className="w-full h-10"
                value={recipeFilterStatus}
                onChange={(val) => setRecipeFilterStatus(val)}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'CONFIGURED', label: 'Đã có công thức' },
                  { value: 'MISSING', label: 'Chưa có công thức' },
                ]}
              />
            </div>
          </div>

          {/* Đếm số lượng & Xóa bộ lọc nhanh trên mobile */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-2xs sm:text-xs font-mono text-sushi-text-dim shrink-0">
            {hasActiveRecipeFilters && (
              <button
                type="button"
                onClick={handleResetRecipeFilters}
                className="sm:hidden text-2xs text-sushi-gold hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                <X size={12} />
                <span>Xóa bộ lọc</span>
              </button>
            )}
            <span>
              {filteredRecipeProducts.length} / {singleProducts.length} món
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. Tabs Giao Diện: Tồn Kho & Cảnh Báo / Lịch Sử Nhập / Lịch Sử Xuất
         ========================================================================= */}
      <div className="rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/80 p-3 sm:p-4 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          animated={{ inkBar: true, tabPane: true }}
          items={[
            {
              key: 'warehouse-stocks',
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <Package size={16} />
                  <span>Tồn kho Chi Nhánh</span>
                </span>
              ),
              children: (
                <div className="pt-2">
                  <WarehouseStockView />
                </div>
              ),
            },
            {
              key: 'recipes',
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <CookingPot size={16} />
                  <span>Công thức món (BOM)</span>
                </span>
              ),
              children: (
                <div className="pt-2">
                  <RecipeManagementView
                    search={recipeSearch}
                    filterStatus={recipeFilterStatus}
                    hideToolbar={true}
                  />
                </div>
              ),
            },
            {
              key: 'balance',
              label: (
                <span className="flex items-center space-x-2">
                  <span>{t('dashboard.tabStockBalance')} (Tổng)</span>
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

      {/* Bottom Sheet Lọc Trạng Thái Nguyên Liệu Cho Mobile */}
      <IngredientFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        alertFilter={alertFilter}
        onSelectAlertFilter={(val) => setAlertFilter(val)}
        onReset={handleResetFilters}
        totalFilteredCount={filteredIngredients.length}
        alertCount={alertCount}
      />

      {/* Bottom Sheet Lọc Trạng Thái Công Thức Cho Mobile */}
      <RecipeFilterDrawer
        open={isRecipeFilterDrawerOpen}
        onClose={() => setIsRecipeFilterDrawerOpen(false)}
        filterStatus={recipeFilterStatus}
        onSelectFilterStatus={(val) => setRecipeFilterStatus(val)}
        onReset={handleResetRecipeFilters}
        totalFilteredCount={filteredRecipeProducts.length}
      />
    </div>
  );
}
