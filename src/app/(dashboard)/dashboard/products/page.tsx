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
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const hasActiveFilters = Boolean(selectedCategoryId);

  const handleResetFilters = () => {
    setSelectedCategoryId(undefined);
  };

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchSku = product.sku.toLowerCase().includes(query);
        const matchBarcode = product.barcode?.toLowerCase().includes(query);
        return matchName || matchSku || matchBarcode;
      }

      return true;
    });
  }, [products, search]);

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('dashboard.productsTitle')}
          subtitle={t('dashboard.productsSubtitle')}
          extra={
            <div className="hidden md:block">
              <SushiButton
                type="primary"
                icon={<Plus size={15} weight="bold" />}
                onClick={handleOpenCreate}
                className="h-9 rounded-lg px-3.5 text-xs font-semibold"
              >
                {t('dashboard.addProduct')}
              </SushiButton>
            </div>
          }
        />
      </div>

      {/* Unified Toolbar & Table Panel */}
      <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
        <div className="p-3 sm:px-4 border-b border-sushi-border flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1 w-full">
            <div className="flex-1 sm:w-72 min-w-0">
              <Input
                prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim mr-1 shrink-0" />}
                placeholder={t('dashboard.searchProductPlaceholder')}
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
              title="Mở bộ lọc danh mục"
            />

            <div className="hidden sm:block sm:w-56">
              <Select
                className="w-full h-9"
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
              {filteredProducts.length}/{products.length} {t('common.itemsCount')}
            </span>
          </div>
        </div>

        <div className="p-3 md:p-0">
          <ProductTable
            products={filteredProducts}
            loading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <ProductFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(catId) => setSelectedCategoryId(catId)}
        categoryOptions={categoryOptions}
        onReset={handleResetFilters}
        totalFilteredCount={filteredProducts.length}
      />

      <SushiFloatingButton
        onClick={handleOpenCreate}
        ariaLabel={t('dashboard.addProduct')}
      />

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
