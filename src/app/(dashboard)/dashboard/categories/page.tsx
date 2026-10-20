'use client';

import { useState, useMemo } from 'react';
import {
  SushiButton,
  Plus,
  SushiPageHeader,
  Input,
  MagnifyingGlass,
} from '@/components/ui';
import {
  CategoryTable,
  CreateCategoryModal,
  useCategories,
  useCreateCategory,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Lọc danh mục theo từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const lower = search.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(lower));
  }, [categories, search]);

  return (
    <div className="space-y-5">
      <SushiPageHeader
        title={t('dashboard.categoriesTitle')}
        subtitle={t('dashboard.categoriesSubtitle')}
        extra={
          <SushiButton
            type="primary"
            icon={<Plus size={16} weight="bold" />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('dashboard.addCategory')}
          </SushiButton>
        }
      />

      {/* Toolbar Tìm Kiếm & Thống Kê */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5" />}
            placeholder={t('dashboard.searchCategoryPlaceholder')}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="text-xs font-mono text-sushi-text-dim flex items-center space-x-2">
          <span>
            {filteredCategories.length} / {categories.length} {t('common.itemsCount')}
          </span>
        </div>
      </div>

      {/* Bảng Dữ Liệu Danh Mục */}
      <CategoryTable
        categories={filteredCategories}
        loading={isLoading}
      />

      {/* Modal Tạo Danh Mục Mới */}
      <CreateCategoryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (dto) => {
          await createMutation.mutateAsync(dto);
        }}
      />
    </div>
  );
}
