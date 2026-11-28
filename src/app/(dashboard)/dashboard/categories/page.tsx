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
  message,
} from '@/components/ui';
import {
  Category,
  CategoryTable,
  CreateCategoryModal,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
} from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');

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

  const handleReorder = async (reorderedList: Category[]) => {
    const payload = reorderedList.map((cat, idx) => ({
      id: cat.id,
      sortOrder: idx + 1,
    }));
    await reorderMutation.mutateAsync(payload);
    message.success(t('dashboard.categoryOrderSaved'));
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('dashboard.categoriesTitle')}
          subtitle={t('dashboard.categoriesSubtitle')}
          extra={
            <div className="hidden md:block">
              <SushiButton
                type="primary"
                icon={<Plus size={15} weight="bold" />}
                onClick={handleOpenCreate}
                className="h-9 rounded-lg px-3.5 text-xs font-semibold"
              >
                {t('dashboard.addCategory')}
              </SushiButton>
            </div>
          }
        />
      </div>

      <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
        <div className="p-3 sm:px-4 border-b border-sushi-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="w-full sm:w-72">
            <Input
              prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim mr-1" />}
              placeholder={t('dashboard.searchCategoryPlaceholder')}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg h-9 text-xs"
            />
          </div>

          <div className="text-2xs font-mono text-sushi-text-dim">
            {filteredCategories.length}/{categories.length} {t('common.itemsCount')}
          </div>
        </div>

        <div className="p-3 md:p-0">
          <CategoryTable
            categories={filteredCategories}
            loading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onReorder={!search.trim() ? handleReorder : undefined}
          />
        </div>
      </div>

      <SushiFloatingButton
        onClick={handleOpenCreate}
        ariaLabel={t('dashboard.addCategory')}
      />

      <CreateCategoryModal
        open={isModalOpen}
        initialData={editingCategory}
        defaultSortOrder={categories.length + 1}
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
