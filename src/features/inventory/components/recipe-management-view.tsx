'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  ResponsiveModalDrawer,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  Empty,
  Popconfirm,
  CookingPot,
  Plus,
  Trash,
  PencilSimple,
  MagnifyingGlass,
  CheckCircle,
  WarningCircle,
  SushiMobileCardList,
  SushiCardItem,
  SushiEmptyState,
} from '@/components/ui';
import { useProducts } from '@/features/catalog';
import {
  useRecipes,
  useIngredients,
  useUpsertRecipe,
  useDeleteRecipe,
  Recipe,
} from '@/features/inventory';
import { useTranslation } from '@/lib/i18n';

export interface RecipeManagementViewProps {
  search?: string;
  filterStatus?: 'ALL' | 'CONFIGURED' | 'MISSING';
  hideToolbar?: boolean;
}

export function RecipeManagementView({
  search: externalSearch,
  filterStatus: externalFilterStatus,
  hideToolbar = false,
}: RecipeManagementViewProps = {}) {
  const { t } = useTranslation();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: recipes = [], isLoading: recipesLoading } = useRecipes();
  const { data: ingredients = [] } = useIngredients();

  const upsertMutation = useUpsertRecipe();
  const deleteMutation = useDeleteRecipe();

  const [internalSearch, setInternalSearch] = useState('');
  const [internalFilterStatus, setInternalFilterStatus] = useState<'ALL' | 'CONFIGURED' | 'MISSING'>('ALL');

  const search = externalSearch !== undefined ? externalSearch : internalSearch;
  const filterStatus = externalFilterStatus !== undefined ? externalFilterStatus : internalFilterStatus;

  const [editingProduct, setEditingProduct] = useState<{ id: string; name: string; sku: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const watchedItems = Form.useWatch('items', form);

  // Map product id -> recipe
  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    for (const r of recipes) {
      map.set(r.productId, r);
    }
    return map;
  }, [recipes]);

  // Chỉ quản lý công thức cho món đơn (SINGLE)
  const singleProducts = useMemo(() => {
    return products.filter((p) => p.type === 'SINGLE');
  }, [products]);

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return singleProducts.filter((p) => {
      const recipe = recipeMap.get(p.id);
      const isConfigured = Boolean(recipe && recipe.items && recipe.items.length > 0);

      if (filterStatus === 'CONFIGURED' && !isConfigured) return false;
      if (filterStatus === 'MISSING' && isConfigured) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      }
      return true;
    });
  }, [singleProducts, recipeMap, filterStatus, search]);

  const handleOpenConfig = (productId: string, productName: string, productSku: string) => {
    const existing = recipeMap.get(productId);
    setEditingProduct({ id: productId, name: productName, sku: productSku });

    if (existing && existing.items && existing.items.length > 0) {
      form.setFieldsValue({
        notes: existing.notes || '',
        items: existing.items.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: Number(i.quantity),
        })),
      });
    } else {
      form.setFieldsValue({
        notes: '',
        items: [{ ingredientId: undefined, quantity: 1 }],
      });
    }

    setIsModalOpen(true);
  };

  const handleSaveRecipe = async () => {
    try {
      const values = await form.validateFields();
      if (!editingProduct) return;

      await upsertMutation.mutateAsync({
        productId: editingProduct.id,
        notes: values.notes,
        items: values.items.map((item: { ingredientId: string; quantity: number }) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        })),
      });

      setIsModalOpen(false);
    } catch {
      // Form validation error handled by AntD
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteMutation.mutateAsync(recipeId);
    } catch {
      // Handled by hook
    }
  };

  const columns = [
    {
      title: t('recipeView.colProduct'),
      key: 'product',
      render: (_: unknown, record: { id: string; name: string; sku: string }) => (
        <div>
          <div className="font-semibold text-sushi-text">{record.name}</div>
          <div className="text-xs text-sushi-text-muted font-mono">{record.sku}</div>
        </div>
      ),
    },
    {
      title: t('recipeView.colStatus'),
      key: 'status',
      width: 220,
      render: (_: unknown, record: { id: string }) => {
        const recipe = recipeMap.get(record.id);
        const hasRecipe = Boolean(recipe && recipe.items && recipe.items.length > 0);

        if (hasRecipe) {
          return (
            <Tag color="success" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
              <CheckCircle size={14} weight="fill" />
              <span>{t('recipeView.statusConfigured')} ({recipe?.items?.length} {t('recipeView.ingredientsShort')})</span>
            </Tag>
          );
        }
        return (
          <Tag color="error" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
            <WarningCircle size={14} weight="fill" />
            <span>{t('recipeView.statusMissing')}</span>
          </Tag>
        );
      },
    },
    {
      title: t('recipeView.colItems'),
      key: 'items',
      render: (_: unknown, record: { id: string }) => {
        const recipe = recipeMap.get(record.id);
        if (!recipe || !recipe.items || recipe.items.length === 0) {
          return <span className="text-xs text-zinc-500 italic">{t('recipeView.notDeclared')}</span>;
        }

        return (
          <div className="flex flex-wrap gap-1.5">
            {recipe.items.map((it) => (
              <span
                key={it.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300"
              >
                <span>{it.ingredient?.name || it.ingredientId}:</span>
                <strong className="text-sushi-gold font-mono">
                  {Number(it.quantity)} {it.ingredient?.unit}
                </strong>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: t('recipeView.colActions'),
      key: 'actions',
      width: 140,
      render: (_: unknown, record: { id: string; name: string; sku: string }) => {
        const recipe = recipeMap.get(record.id);
        return (
          <Space>
            <Button
              type="text"
              size="small"
              icon={<PencilSimple size={16} className="text-sushi-gold" />}
              onClick={() => handleOpenConfig(record.id, record.name, record.sku)}
              className="text-sushi-gold hover:bg-sushi-gold/10"
            >
              {t('recipeView.configBtn')}
            </Button>
            {recipe && (
              <Popconfirm
                title={t('recipeView.deleteConfirmTitle')}
                description={t('recipeView.deleteConfirmDesc')}
                onConfirm={() => handleDeleteRecipe(recipe.id)}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash size={16} />}
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Thanh công cụ lọc */}
      {!hideToolbar && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-sushi-card/60 border border-sushi-border/80 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder={t('dashboard.searchRecipePlaceholder')}
              prefix={<MagnifyingGlass size={16} className="text-zinc-500" />}
              value={search}
              onChange={(e) => setInternalSearch(e.target.value)}
              allowClear
              className="rounded-xl bg-zinc-900 border-zinc-700 h-10 sm:h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filterStatus}
              onChange={setInternalFilterStatus}
              className="w-full sm:w-48 h-10 sm:h-9"
              options={[
                { value: 'ALL', label: t('dashboard.recipeFilterAll') },
                { value: 'CONFIGURED', label: t('dashboard.recipeFilterConfigured') },
                { value: 'MISSING', label: t('dashboard.recipeFilterMissing') },
              ]}
            />
          </div>
        </div>
      )}

      {/* 1. Giao diện Mobile Card List (< md) */}
      <SushiMobileCardList
        items={filteredProducts}
        pageSize={8}
        loading={productsLoading || recipesLoading}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<CookingPot size={24} />}
            title={t('recipeView.emptyTitle')}
            description={t('recipeView.emptyDesc')}
          />
        }
        renderItem={(item) => {
          const recipe = recipeMap.get(item.id);
          const hasRecipe = Boolean(recipe && recipe.items && recipe.items.length > 0);

          return (
            <SushiCardItem>
              {/* Header card: Tên món, SKU & nút Cấu hình */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-sushi-text truncate">
                    {item.name}
                  </h4>
                  <div className="text-2xs text-sushi-text-dim font-mono mt-0.5">
                    SKU: {item.sku}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="small"
                    icon={<PencilSimple size={14} className="text-sushi-gold" />}
                    onClick={() => handleOpenConfig(item.id, item.name, item.sku)}
                    className="h-8 px-2.5 rounded-lg text-xs text-sushi-gold border-sushi-gold/30 hover:bg-sushi-gold/10 font-medium"
                  >
                    {t('recipeView.configBtn')}
                  </Button>

                  {recipe && (
                    <Popconfirm
                      title={t('recipeView.deleteConfirmTitle')}
                      description={t('recipeView.deleteConfirmDesc')}
                      onConfirm={() => handleDeleteRecipe(recipe.id)}
                      okText={t('common.delete')}
                      cancelText={t('common.cancel')}
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash size={15} />}
                        className="h-8 w-8 flex items-center justify-center p-0 rounded-lg hover:bg-red-500/10"
                      />
                    </Popconfirm>
                  )}
                </div>
              </div>

              {/* Trạng thái định mức */}
              <div className="mt-2.5 flex items-center">
                {hasRecipe ? (
                  <Tag
                    color="success"
                    className="px-2 py-0.5 text-3xs rounded-full font-medium inline-flex items-center gap-1"
                  >
                    <CheckCircle size={12} weight="fill" />
                    <span>{t('recipeView.statusConfigured')} ({recipe?.items?.length} {t('recipeView.ingredientsShort')})</span>
                  </Tag>
                ) : (
                  <Tag
                    color="error"
                    className="px-2 py-0.5 text-3xs rounded-full font-medium inline-flex items-center gap-1"
                  >
                    <WarningCircle size={12} weight="fill" />
                    <span>{t('recipeView.statusMissing')}</span>
                  </Tag>
                )}
              </div>

              {/* Danh sách định mức nguyên liệu */}
              <div className="mt-2.5 pt-2 border-t border-sushi-border/60">
                <div className="text-3xs text-sushi-text-dim uppercase tracking-wider font-mono mb-1.5">
                  {t('recipeView.colItems')}:
                </div>
                {hasRecipe ? (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe?.items?.map((it) => (
                      <span
                        key={it.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700/60 text-2xs text-zinc-300"
                      >
                        <span className="truncate max-w-[130px]">{it.ingredient?.name || it.ingredientId}:</span>
                        <strong className="text-sushi-gold font-mono shrink-0">
                          {Number(it.quantity)} {it.ingredient?.unit}
                        </strong>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-2xs text-zinc-500 italic">
                    {t('recipeView.notDeclared')}
                  </span>
                )}
              </div>
            </SushiCardItem>
          );
        }}
      />

      {/* 2. Giao diện Desktop Table (>= md) */}
      <div className="hidden md:block bg-sushi-card border border-sushi-border/80 rounded-2xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={productsLoading || recipesLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: <Empty description={t('recipeView.emptyTitle')} />,
          }}
        />
      </div>

      {/* Bottom Sheet / Modal Cấu hình công thức BOM */}
      <ResponsiveModalDrawer
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        destroyOnHidden
        title={
          <span className="truncate font-semibold text-sushi-text text-sm sm:text-base">
            {t('recipeView.modalTitle')}: {editingProduct?.name}
          </span>
        }
        width={640}
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl flex-1 h-11 border-sushi-border text-sushi-text-muted hover:text-white"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              onClick={handleSaveRecipe}
              loading={upsertMutation.isPending}
              className="rounded-xl flex-1 h-11 bg-sushi-gold hover:bg-sushi-gold/90 text-black font-semibold border-none flex items-center justify-center gap-1.5"
            >
              <span>{t('recipeView.saveRecipe')}</span>
            </Button>
          </div>
        }
      >
        <div className="py-1 space-y-4">
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 leading-relaxed">
            {t('recipeView.bomNotice')}
          </div>

          <Form form={form} layout="vertical">
            <Form.Item
              name="notes"
              label={<span className="text-xs font-medium text-zinc-400">{t('recipeView.notesLabel')}</span>}
            >
              <Input.TextArea
                placeholder={t('recipeView.notesPlaceholder')}
                rows={2}
                className="rounded-xl"
              />
            </Form.Item>

            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sushi-text-muted block">
                {t('recipeView.ingredientsListLabel')}
              </span>

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map(({ key, name, ...restField }, index) => {
                      const selectedIngId = watchedItems?.[name]?.ingredientId;
                      const selectedIng = ingredients.find((i) => i.id === selectedIngId);

                      return (
                        <div
                          key={key}
                          className="p-3 sm:p-3.5 rounded-xl bg-sushi-surface/40 border border-sushi-border/80 space-y-2.5 transition-colors"
                        >
                          {/* Header của thẻ nguyên liệu: Thứ tự + Tên & Nút xóa */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-sushi-gold/15 text-sushi-gold font-mono font-bold text-3xs flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-xs font-semibold text-sushi-text">
                                {t('recipeView.ingredientItem')} #{index + 1}
                              </span>
                            </div>

                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(name)}
                                className="text-2xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer font-medium"
                                title={t('common.delete')}
                              >
                                <Trash size={13} />
                                <span>{t('common.delete')}</span>
                              </button>
                            )}
                          </div>

                          {/* Lưới nhập liệu: Chọn nguyên liệu & Nhập định mức */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
                            <div className="sm:col-span-7">
                              <Form.Item
                                {...restField}
                                name={[name, 'ingredientId']}
                                rules={[{ required: true, message: t('recipeView.selectIngredientPlaceholder') }]}
                                className="mb-0"
                              >
                                <Select
                                  placeholder={t('recipeView.selectIngredientPlaceholder')}
                                  showSearch
                                  optionFilterProp="label"
                                  className="w-full h-10"
                                  options={ingredients.map((ing) => ({
                                    value: ing.id,
                                    label: `${ing.name} (${ing.code}) - ${ing.unit}`,
                                  }))}
                                />
                              </Form.Item>
                            </div>

                            <div className="sm:col-span-5">
                              <Form.Item
                                {...restField}
                                name={[name, 'quantity']}
                                rules={[
                                  { required: true, message: t('recipeView.quantityPlaceholder') },
                                  { type: 'number', min: 0.001, message: '> 0' },
                                ]}
                                className="mb-0"
                              >
                                <InputNumber
                                  placeholder={t('recipeView.quantityPlaceholder')}
                                  className="w-full h-10 rounded-xl"
                                  suffix={
                                    <span className="text-xs font-semibold text-sushi-gold">
                                      {selectedIng?.unit || 'ĐVT'}
                                    </span>
                                  }
                                  step={1}
                                  precision={3}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<Plus size={16} />}
                      className="border-dashed border-sushi-border hover:border-sushi-gold text-sushi-text hover:text-sushi-gold bg-sushi-surface/20 hover:bg-sushi-gold/5 h-11 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-colors"
                    >
                      {t('recipeView.addIngredientBtn')}
                    </Button>
                  </div>
                )}
              </Form.List>
            </div>
          </Form>
        </div>
      </ResponsiveModalDrawer>
    </div>
  );
}
