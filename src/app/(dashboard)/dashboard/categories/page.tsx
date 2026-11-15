'use client';

import { useState, useMemo } from 'react';
import {
  SushiButton,
  SushiFloatingButton,
  Plus,
  SushiPageHeader,
  Input,
  MagnifyingGlass,
  App,
} from '@/components/ui';
import {
  Category,
  CategoryTable,
  CreateCategoryModal,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');

  // Lọc danh mục theo từ khóa tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const lower = search.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(lower));
  }, [categories, search]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    modal.confirm({
      title: `${t('dashboard.deleteCategoryConfirmTitle')} (${category.name})`,
      content: t('dashboard.deleteCategoryConfirmDesc'),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      centered: true,
      onOk: async () => {
        await deleteMutation.mutateAsync(category.id);
      },
    });
  };

  return (
    <div className="space-y-5">
      <SushiPageHeader
        title={t('dashboard.categoriesTitle')}
        subtitle={t('dashboard.categoriesSubtitle')}
        extra={
          <div className="hidden md:block">
            <SushiButton
              type="primary"
              icon={<Plus size={16} weight="bold" />}
              onClick={handleOpenCreate}
            >
              {t('dashboard.addCategory')}
            </SushiButton>
          </div>
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
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Nút Floating Action Button trên Mobile */}
      <SushiFloatingButton
        onClick={handleOpenCreate}
        ariaLabel={t('dashboard.addCategory')}
      />

      {/* Modal Tạo / Chỉnh Sửa Danh Mục */}
      <CreateCategoryModal
        open={isModalOpen}
        initialData={editingCategory}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={async (dto) => {
          if (editingCategory) {
            await updateMutation.mutateAsync({ id: editingCategory.id, dto });
          } else {
            await createMutation.mutateAsync(dto);
          }
        }}
      />
    </div>
  );
}
