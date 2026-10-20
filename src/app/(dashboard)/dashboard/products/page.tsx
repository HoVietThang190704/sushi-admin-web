'use client';

import { useState, useMemo } from 'react';
import {
  SushiButton,
  Plus,
  SushiPageHeader,
  Select,
  Input,
  MagnifyingGlass,
} from '@/components/ui';
import {
  ProductTable,
  CreateProductModal,
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
      <div className="p-4 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Ô tìm kiếm theo tên / SKU */}
          <div className="w-full sm:w-64">
            <Input
              prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5" />}
              placeholder={t('dashboard.searchProductPlaceholder')}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Bộ lọc danh mục */}
          <div className="w-full sm:w-56">
            <Select
              className="w-full"
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

          {/* Bộ lọc phân loại Single / Combo dạng Dropdown */}
          <div className="w-full sm:w-40">
            <Select
              className="w-full"
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

        {/* Số lượng món hiển thị */}
        <div className="text-xs font-mono text-sushi-text-dim shrink-0">
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
