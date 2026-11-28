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

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('IN');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const [activeTab, setActiveTab] = useState<string>('balance');
  const [search, setSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'ALERTS'>('ALL');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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

  const { data: ingredients = [], isLoading: ingredientsLoading } = useIngredients();
  const { data: stockInTransactions = [], isLoading: inLoading } = useInventoryTransactions('IN');
  const { data: stockOutTransactions = [], isLoading: outLoading } = useInventoryTransactions('OUT');
  const { data: products = [] } = useProducts();
  const { data: recipes = [] } = useRecipes();

  const singleProducts = useMemo(() => {
    return products;
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

  const createIngredientMutation = useCreateIngredient();
  const createTransactionMutation = useCreateTransaction();

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) => {
      if (alertFilter === 'ALERTS' && !item.isAlert) {
        return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(query);
        const matchName = item.name.toLowerCase().includes(query);
        return matchCode || matchName;
      }

      return true;
    });
  }, [ingredients, alertFilter, search]);

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
    <div className="space-y-4">
      {/* 1. Header & Action Bar */}
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('dashboard.inventoryTitle')}
          subtitle={t('dashboard.inventorySubtitle')}
          extra={
            <div className="grid grid-cols-3 gap-1.5 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
              <Button
                icon={<ArrowRight size={14} className="shrink-0" />}
                onClick={() => handleOpenStockOut()}
                className="h-9 rounded-lg px-2.5 text-xs font-medium flex items-center justify-center"
              >
                <span className="truncate">{t('dashboard.stockOut')}</span>
              </Button>

              <Button
                icon={<CookingPot size={14} className="shrink-0" />}
                onClick={() => setIsIngredientModalOpen(true)}
                className="h-9 rounded-lg px-2.5 text-xs font-medium flex items-center justify-center"
              >
                <span className="truncate sm:hidden">{t('dashboard.addIngredientShort')}</span>
                <span className="hidden sm:inline">{t('dashboard.addIngredient')}</span>
              </Button>

              <SushiButton
                type="primary"
                icon={<Plus size={14} weight="bold" className="shrink-0" />}
                onClick={() => handleOpenStockIn()}
                className="h-9 rounded-lg px-3 text-xs font-semibold flex items-center justify-center"
              >
                <span className="truncate">{t('dashboard.stockIn')}</span>
              </SushiButton>
            </div>
          }
        />
      </div>

      {/* 2. Architectural Metric Ledger Grid (1px Divided - No Skittles Icons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sushi-border border border-sushi-border rounded-xl overflow-hidden">
        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('dashboard.totalIngredients')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
              {ingredients.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              SKU
            </span>
          </div>
        </div>

        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
              {t('dashboard.alertItemsCount')}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                alertCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-xl sm:text-2xl font-semibold font-mono tracking-tight ${
                alertCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {alertCount}
            </span>
            <span className="text-2xs font-mono text-sushi-text-dim truncate">
              {alertCount > 0 ? t('dashboard.alertNeedRestock') : t('dashboard.alertSafe')}
            </span>
          </div>
        </div>

        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('dashboard.totalStockInCount')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
              {stockInTransactions.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {t('dashboard.stockInSlips')}
            </span>
          </div>
        </div>

        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('dashboard.totalStockOutCount')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text tracking-tight">
              {stockOutTransactions.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {t('dashboard.stockOutSlips')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Unified Inventory Workspace (Tabs + Contextual Toolbar) */}
      <div className="rounded-xl bg-sushi-card border border-sushi-border p-3 sm:p-4 space-y-3">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          animated={{ inkBar: true, tabPane: false }}
          items={[
            {
              key: 'warehouse-stocks',
              label: (
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <Package size={15} />
                  <span>{t('dashboard.tabBranchStock')}</span>
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
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <CookingPot size={15} />
                  <span>{t('dashboard.tabRecipesBom')}</span>
                </span>
              ),
              children: (
                <div className="pt-2 space-y-3">
                  {/* Inline BOM Search & Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-sushi-border">
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <div className="flex-1 sm:w-72 min-w-0">
                        <Input
                          id="recipe-search-input"
                          name="recipeSearch"
                          prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim mr-1 shrink-0" />}
                          placeholder={t('dashboard.searchRecipePlaceholder')}
                          allowClear
                          value={recipeSearch}
                          onChange={(e) => setRecipeSearch(e.target.value)}
                          className="rounded-lg h-9 w-full text-xs"
                        />
                      </div>

                      <Button
                        icon={
                          <Funnel
                            size={15}
                            weight={hasActiveRecipeFilters ? 'fill' : 'regular'}
                          />
                        }
                        onClick={() => setIsRecipeFilterDrawerOpen(true)}
                        className="h-9 rounded-lg px-2.5 flex items-center justify-center shrink-0 sm:hidden"
                      />

                      <div className="hidden sm:block sm:w-52">
                        <Select
                          className="w-full h-9"
                          value={recipeFilterStatus}
                          onChange={(val) => setRecipeFilterStatus(val)}
                          options={[
                            { value: 'ALL', label: t('dashboard.recipeFilterAll') },
                            { value: 'CONFIGURED', label: t('dashboard.recipeFilterConfigured') },
                            { value: 'MISSING', label: t('dashboard.recipeFilterMissing') },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 text-2xs font-mono text-sushi-text-dim shrink-0">
                      {hasActiveRecipeFilters && (
                        <button
                          type="button"
                          onClick={handleResetRecipeFilters}
                          className="sm:hidden text-2xs text-sushi-text hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <X size={12} />
                          <span>{t('dashboard.clearFilter')}</span>
                        </button>
                      )}
                      <span>
                        {filteredRecipeProducts.length}/{singleProducts.length} {t('common.itemsCount')}
                      </span>
                    </div>
                  </div>

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
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span>{t('dashboard.tabStockBalance')} {t('dashboard.tabTotalSuffix')}</span>
                  {alertCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-3xs font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      {alertCount}
                    </span>
                  )}
                </span>
              ),
              children: (
                <div className="pt-2 space-y-3">
                  {/* Inline Stock Balance Search & Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-sushi-border">
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <div className="flex-1 sm:w-72 min-w-0">
                        <Input
                          id="inventory-search-input"
                          name="search"
                          prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim mr-1 shrink-0" />}
                          placeholder={t('dashboard.searchIngredientPlaceholder')}
                          allowClear
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="rounded-lg h-9 w-full text-xs"
                        />
                      </div>

                      <Button
                        icon={
                          <Funnel
                            size={15}
                            weight={hasActiveFilters ? 'fill' : 'regular'}
                          />
                        }
                        onClick={() => setIsFilterDrawerOpen(true)}
                        className="h-9 rounded-lg px-2.5 flex items-center justify-center shrink-0 sm:hidden"
                      />

                      <div className="hidden sm:block sm:w-44">
                        <Select
                          className="w-full h-9"
                          value={alertFilter}
                          onChange={(val) => setAlertFilter(val)}
                          options={[
                            { value: 'ALL', label: t('dashboard.filterAlertAll') },
                            { value: 'ALERTS', label: t('dashboard.filterAlertOnly') },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 text-2xs font-mono text-sushi-text-dim shrink-0">
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="sm:hidden text-2xs text-sushi-text hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <X size={12} />
                          <span>{t('dashboard.clearFilter')}</span>
                        </button>
                      )}
                      <span>
                        {filteredIngredients.length}/{ingredients.length} {t('common.itemsCount')}
                      </span>
                    </div>
                  </div>

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
              label: <span className="text-xs font-medium">{t('dashboard.tabStockInHistory')}</span>,
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
              label: <span className="text-xs font-medium">{t('dashboard.tabStockOutHistory')}</span>,
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

      <IngredientFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        alertFilter={alertFilter}
        onSelectAlertFilter={(val) => setAlertFilter(val)}
        onReset={handleResetFilters}
        totalFilteredCount={filteredIngredients.length}
        alertCount={alertCount}
      />

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
