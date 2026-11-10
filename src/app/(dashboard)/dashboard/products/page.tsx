'use client';

import { useState, useMemo } from 'react';
import {
  SushiButton,
  Plus,
  SushiPageHeader,
  Select,
  Input,
  MagnifyingGlass,
  Button,
  Funnel,
} from '@/components/ui';
import { X } from '@phosphor-icons/react';
import {
  ProductTable,
  CreateProductModal,
  ProductFilterDrawer,
  useProducts,
  useCreateProduct,
  useCategoryOptions,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const hasActiveFilters = Boolean(selectedCategoryId || (selectedType && selectedType !== 'ALL'));

  const handleResetFilters = () => {
    setSelectedCategoryId(undefined);
    setSelectedType('ALL');
  };

  // TanStack Query Hooks
  const { options: categoryOptions } = useCategoryOptions();
  const { data: products = [], isLoading } = useProducts(selectedCategoryId);
  const createProductMutation = useCreateProduct();

  // Bộ lọc kết hợp: Từ khóa + Phân loại (SINGLE / COMBO)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Lọc theo Type
      if (selectedType !== 'ALL' && product.type !== selectedType) {
        return false;
      }

      // 2. Lọc theo từ khóa tìm kiếm (tên, SKU, barcode)
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchSku = product.sku.toLowerCase().includes(query);
        const matchBarcode = product.barcode?.toLowerCase().includes(query);
        return matchName || matchSku || matchBarcode;
      }

      return true;
    });
  }, [products, selectedType, search]);

  return (
    <div className="space-y-5">
      <SushiPageHeader
        title={t('dashboard.productsTitle')}
        subtitle={t('dashboard.productsSubtitle')}
        extra={
          <SushiButton
            type="primary"
            icon={<Plus size={16} weight="bold" />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('dashboard.addProduct')}
          </SushiButton>
        }
      />

      {/* Toolbar Tìm Kiếm & Bộ Lọc Đa Năng */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center sm:flex-wrap gap-2.5 sm:gap-3 flex-1 w-full">
          {/* Ô tìm kiếm theo tên / SKU */}
          <div className="flex-1 sm:w-64 min-w-0">
            <Input
              prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5 shrink-0" />}
              placeholder={t('dashboard.searchProductPlaceholder')}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl h-10 w-full"
            />
          </div>

          {/* Nút Lọc Bottom Sheet (Chỉ trên Mobile < sm) */}
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
            title="Mở bộ lọc danh mục & loại món"
          >
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-sushi-gold ml-0.5 inline-block" />
            )}
          </Button>

          {/* Bộ lọc danh mục (Chỉ hiển thị trên Desktop >= sm) */}
          <div className="hidden sm:block sm:w-56">
            <Select
              className="w-full h-10"
              placeholder={t('dashboard.allCategoriesFilter')}
              allowClear
              value={selectedCategoryId || undefined}
              onChange={(val) => setSelectedCategoryId(val)}
              options={[
                { value: '', label: t('dashboard.allCategoriesFilter') },
                ...categoryOptions,
              ]}
            />
          </div>

          {/* Bộ lọc phân loại Single / Combo dạng Dropdown (Chỉ hiển thị trên Desktop >= sm) */}
          <div className="hidden sm:block sm:w-40">
            <Select
              className="w-full h-10"
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              options={[
                { value: 'ALL', label: t('dashboard.allTypes') },
                { value: 'SINGLE', label: 'Single' },
                { value: 'COMBO', label: 'Combo' },
              ]}
            />
          </div>
        </div>

        {/* Số lượng món hiển thị & chip reset nhanh trên mobile */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-sushi-text-dim shrink-0">
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
            {filteredProducts.length} / {products.length} {t('common.itemsCount')}
          </span>
        </div>
      </div>

      {/* Bảng Danh Sách Món Ăn */}
      <ProductTable
        products={filteredProducts}
        loading={isLoading}
      />

      {/* Bottom Sheet Lọc Món Ăn Cho Mobile */}
      <ProductFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(catId) => setSelectedCategoryId(catId)}
        selectedType={selectedType}
        onSelectType={(type) => setSelectedType(type)}
        categoryOptions={categoryOptions}
        onReset={handleResetFilters}
        totalFilteredCount={filteredProducts.length}
      />

      {/* Modal Thêm Sản Phẩm Mới */}
      <CreateProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (dto) => {
          await createProductMutation.mutateAsync(dto);
        }}
      />
    </div>
  );
}
