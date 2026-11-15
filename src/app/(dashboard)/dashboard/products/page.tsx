'use client';

import { useState, useMemo } from 'react';
import {
  SushiButton,
  SushiFloatingButton,
  Plus,
  SushiPageHeader,
  Select,
  Input,
  MagnifyingGlass,
  Button,
  Funnel,
  App,
} from '@/components/ui';
import { X } from '@phosphor-icons/react';
import {
  Product,
  ProductTable,
  CreateProductModal,
  ProductFilterDrawer,
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategoryOptions,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    modal.confirm({
      title: `${t('dashboard.deleteProductConfirmTitle')} (${product.name})`,
      content: t('dashboard.deleteProductConfirmDesc'),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      centered: true,
      onOk: async () => {
        await deleteProductMutation.mutateAsync(product.id);
      },
    });
  };

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
          <div className="hidden md:block">
            <SushiButton
              type="primary"
              icon={<Plus size={16} weight="bold" />}
              onClick={handleOpenCreate}
            >
              {t('dashboard.addProduct')}
            </SushiButton>
          </div>
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
              <span>{t('dashboard.clearFilter')}</span>
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
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
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

      {/* Nút Floating Action Button trên Mobile */}
      <SushiFloatingButton
        onClick={handleOpenCreate}
        ariaLabel={t('dashboard.addProduct')}
      />

      {/* Modal Thêm / Chỉnh Sửa Món Ăn */}
      <CreateProductModal
        open={isModalOpen}
        initialData={editingProduct}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={async (dto) => {
          if (editingProduct) {
            await updateProductMutation.mutateAsync({
              id: editingProduct.id,
              dto: {
                ...dto,
                categoryId: dto.categoryId || null,
              },
            });
          } else {
            await createProductMutation.mutateAsync(dto);
          }
        }}
      />
    </div>
  );
}
