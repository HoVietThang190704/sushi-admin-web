'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
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

export function RecipeManagementView() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: recipes = [], isLoading: recipesLoading } = useRecipes();
  const { data: ingredients = [] } = useIngredients();

  const upsertMutation = useUpsertRecipe();
  const deleteMutation = useDeleteRecipe();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIGURED' | 'MISSING'>('ALL');
  const [editingProduct, setEditingProduct] = useState<{ id: string; name: string; sku: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

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
      title: 'Món ăn / SKU',
      key: 'product',
      render: (_: unknown, record: { id: string; name: string; sku: string }) => (
        <div>
          <div className="font-semibold text-sushi-text">{record.name}</div>
          <div className="text-xs text-sushi-text-muted font-mono">{record.sku}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái định mức',
      key: 'status',
      width: 220,
      render: (_: unknown, record: { id: string }) => {
        const recipe = recipeMap.get(record.id);
        const hasRecipe = Boolean(recipe && recipe.items && recipe.items.length > 0);

        if (hasRecipe) {
          return (
            <Tag color="success" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
              <CheckCircle size={14} weight="fill" />
              <span>Đã có công thức ({recipe?.items?.length} NL)</span>
            </Tag>
          );
        }
        return (
          <Tag color="error" className="px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5">
            <WarningCircle size={14} weight="fill" />
            <span>Chưa có (Chặn bếp)</span>
          </Tag>
        );
      },
    },
    {
      title: 'Định mức nguyên vật liệu (1 phần)',
      key: 'items',
      render: (_: unknown, record: { id: string }) => {
        const recipe = recipeMap.get(record.id);
        if (!recipe || !recipe.items || recipe.items.length === 0) {
          return <span className="text-xs text-zinc-500 italic">Chưa khai báo</span>;
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
      title: 'Hành động',
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
              Cấu hình
            </Button>
            {recipe && (
              <Popconfirm
                title="Xác nhận xóa công thức?"
                description="Khi xóa, bếp sẽ bị chặn chế biến món này cho đến khi có công thức mới."
                onConfirm={() => handleDeleteRecipe(recipe.id)}
                okText="Xóa"
                cancelText="Hủy"
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-sushi-card/60 border border-sushi-border/80 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Tìm theo tên món hoặc mã SKU..."
            prefix={<MagnifyingGlass size={16} className="text-zinc-500" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="rounded-xl bg-zinc-900 border-zinc-700 h-10 sm:h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-full sm:w-48 h-10 sm:h-9"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'CONFIGURED', label: 'Đã có công thức' },
              { value: 'MISSING', label: 'Chưa có công thức' },
            ]}
          />
        </div>
      </div>

      {/* 1. Giao diện Mobile Card List (< md) */}
      <SushiMobileCardList
        items={filteredProducts}
        loading={productsLoading || recipesLoading}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<CookingPot size={24} />}
            title="Không tìm thấy món ăn phù hợp"
            description="Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc trạng thái."
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
                    Cấu hình
                  </Button>

                  {recipe && (
                    <Popconfirm
                      title="Xác nhận xóa công thức?"
                      description="Khi xóa, bếp sẽ bị chặn chế biến món này cho đến khi có công thức mới."
                      onConfirm={() => handleDeleteRecipe(recipe.id)}
                      okText="Xóa"
                      cancelText="Hủy"
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
                    <span>Đã có công thức ({recipe?.items?.length} NL)</span>
                  </Tag>
                ) : (
                  <Tag
                    color="error"
                    className="px-2 py-0.5 text-3xs rounded-full font-medium inline-flex items-center gap-1"
                  >
                    <WarningCircle size={12} weight="fill" />
                    <span>Chưa có (Chặn bếp)</span>
                  </Tag>
                )}
              </div>

              {/* Danh sách định mức nguyên liệu */}
              <div className="mt-2.5 pt-2 border-t border-sushi-border/60">
                <div className="text-3xs text-sushi-text-dim uppercase tracking-wider font-mono mb-1.5">
                  Định mức cho 1 phần:
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
                    Chưa khai báo nguyên vật liệu
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
            emptyText: <Empty description="Không tìm thấy món ăn nào phù hợp" />,
          }}
        />
      </div>

      {/* Modal Cấu hình công thức */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sushi-text text-sm sm:text-base">
            <CookingPot size={20} className="text-sushi-gold shrink-0" />
            <span className="truncate">Cấu hình BOM: {editingProduct?.name}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSaveRecipe}
        confirmLoading={upsertMutation.isPending}
        okText="Lưu công thức"
        cancelText="Hủy"
        width={680}
        className="max-w-[calc(100vw-24px)]"
        styles={{
          body: { maxHeight: '75vh', overflowY: 'auto' },
        }}
      >
        <div className="py-2 space-y-4">
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300">
            💡 Định mức được tính cho <strong>1 phần phục vụ chuẩn</strong>. Khi khách đặt món (hoặc gọi combo chứa món này), kho của chi nhánh sẽ tự động nhân số lượng để trừ tồn khi bếp bấm <strong>Bắt đầu chế biến</strong>.
          </div>

          <Form form={form} layout="vertical">
            <Form.Item name="notes" label={<span className="text-xs text-zinc-400">Ghi chú kỹ thuật chế biến (tùy chọn)</span>}>
              <Input.TextArea placeholder="Ví dụ: Cắt phi lê 6 miếng đều tay, ăn kèm wasabi tươi..." rows={2} />
            </Form.Item>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-sushi-text block">Danh sách nguyên vật liệu tiêu hao:</span>

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div className="space-y-2.5">
                    {fields.map(({ key, name, ...restField }) => {
                      const selectedIngId = form.getFieldValue(['items', name, 'ingredientId']);
                      const selectedIng = ingredients.find((i) => i.id === selectedIngId);

                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'ingredientId']}
                            rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
                            className="flex-1 mb-0"
                          >
                            <Select
                              placeholder="Chọn nguyên liệu..."
                              showSearch
                              optionFilterProp="label"
                              options={ingredients.map((ing) => ({
                                value: ing.id,
                                label: `${ing.name} (${ing.code}) - ĐVT: ${ing.unit}`,
                              }))}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'quantity']}
                            rules={[
                              { required: true, message: 'Nhập số lượng' },
                              { type: 'number', min: 0.001, message: 'Phải > 0' },
                            ]}
                            className="w-28 sm:w-36 mb-0"
                          >
                            <InputNumber
                              placeholder="Định mức"
                              className="w-full"
                              suffix={selectedIng?.unit || 'ĐVT'}
                              step={1}
                              precision={3}
                            />
                          </Form.Item>

                          <Button
                            type="text"
                            danger
                            icon={<Trash size={18} />}
                            onClick={() => remove(name)}
                            disabled={fields.length === 1}
                            className="shrink-0"
                          />
                        </div>
                      );
                    })}

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<Plus size={16} />}
                      className="border-zinc-700 text-sushi-gold hover:text-amber-400 h-10 rounded-xl"
                    >
                      Thêm nguyên liệu
                    </Button>
                  </div>
                )}
              </Form.List>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
