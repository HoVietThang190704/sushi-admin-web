'use client';

import { useState } from 'react';
import { Button, Plus, SushiPageHeader } from '@/components/ui';
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

  return (
    <div>
      <SushiPageHeader
        title={t('dashboard.categoriesTitle')}
        subtitle={t('dashboard.categoriesSubtitle')}
        extra={
          <Button
            type="primary"
            icon={<Plus size={16} weight="bold" />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('dashboard.addCategory')}
          </Button>
        }
      />

      <CategoryTable categories={categories} loading={isLoading} />

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
