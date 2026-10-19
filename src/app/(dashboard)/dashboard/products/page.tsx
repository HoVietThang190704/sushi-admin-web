'use client';

import { useState } from 'react';
import { Button, Plus, SushiPageHeader, Select, Space } from '@/components/ui';
import {
  ProductTable,
  CreateProductModal,
  useProducts,
  useCreateProduct,
  useCategories,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TanStack Query Hooks
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useProducts(selectedCategoryId);
  const createProductMutation = useCreateProduct();

  return (
    <div>
      <SushiPageHeader
        title={t('dashboard.productsTitle')}
        subtitle={t('dashboard.productsSubtitle')}
        extra={
          <Button
            type="primary"
            icon={<Plus size={16} weight="bold" />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('dashboard.addProduct')}
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <Space>
          <span className="text-xs text-sushi-text-muted font-medium">
            Lọc theo danh mục:
          </span>
          <Select
            style={{ width: 220 }}
            placeholder={t('dashboard.allCategoriesFilter')}
            allowClear
            value={selectedCategoryId}
            onChange={(val) => setSelectedCategoryId(val)}
            options={[
              { value: '', label: t('dashboard.allCategoriesFilter') },
              ...categories.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />
        </Space>

        <span className="text-xs font-mono text-sushi-text-dim">
          {products.length} {t('common.itemsCount')}
        </span>
      </div>

      {/* Product Table */}
      <ProductTable products={products} loading={isLoading} />

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
