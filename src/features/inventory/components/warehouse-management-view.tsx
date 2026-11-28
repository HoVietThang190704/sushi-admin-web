'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  Button,
  SushiButton,
  SushiFloatingButton,
  SushiPageHeader,
  SushiMobileCardList,
  SushiCardItem,
  SushiCardActions,
  SushiEmptyState,
  ResponsiveModalDrawer,
  Form,
  Input,
  Switch,
  Space,
  Tag,
  App,
  Plus,
  PencilSimple,
  Trash,
  MapPin,
  Package,
  Storefront,
  MagnifyingGlass,
  Database,
} from '@/components/ui';
import {
  Warehouse,
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
} from '@/features/inventory';
import { useTranslation } from '@/lib/i18n';

export function WarehouseManagementView() {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const { data: warehouses = [], isLoading } = useWarehouses();
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  const filteredWarehouses = useMemo(() => {
    if (!search.trim()) return warehouses;
    const q = search.toLowerCase().trim();
    return warehouses.filter(
      (w) =>
        w.code.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        (w.address && w.address.toLowerCase().includes(q)),
    );
  }, [warehouses, search]);

  const totalLinkedBranches = useMemo(() => {
    return warehouses.reduce(
      (sum, w) => sum + (w._count?.branches ?? w.branches?.length ?? 0),
      0,
    );
  }, [warehouses]);

  const totalStockItems = useMemo(() => {
    return warehouses.reduce((sum, w) => sum + (w._count?.stocks ?? 0), 0);
  }, [warehouses]);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    form.resetFields();
    form.setFieldsValue({
      code: '',
      name: '',
      address: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    form.setFieldsValue({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address || '',
      isActive: warehouse.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (warehouse: Warehouse) => {
    modal.confirm({
      title: t('warehousesPage.deleteConfirmTitle'),
      content: `${warehouse.name} (${warehouse.code})`,
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(warehouse.id);
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingWarehouse) {
        await updateMutation.mutateAsync({
          id: editingWarehouse.id,
          dto: {
            code: values.code.trim().toUpperCase(),
            name: values.name.trim(),
            address: values.address?.trim() || null,
            isActive: values.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          code: values.code.trim().toUpperCase(),
          name: values.name.trim(),
          address: values.address?.trim() || undefined,
        });
      }
      setIsModalOpen(false);
      setEditingWarehouse(null);
      form.resetFields();
    } catch {
      // Handled by form validation or mutation onError
    }
  };

  const columns = [
    {
      title: t('warehousesPage.colCode'),
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code: string) => (
        <span className="px-2 py-0.5 rounded bg-sushi-surface border border-sushi-border font-mono font-semibold text-xs text-sushi-text">
          {code}
        </span>
      ),
    },
    {
      title: t('warehousesPage.colName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Warehouse) => (
        <div>
          <div className="font-semibold text-sushi-text text-sm">{name}</div>
          <div className="text-xs text-sushi-text-dim flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="shrink-0" />
            <span>{record.address || t('warehousesPage.noAddress')}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('warehousesPage.colBranches'),
      key: 'branches',
      width: 240,
      render: (_: unknown, record: Warehouse) => {
        const list = record.branches || [];
        const count = record._count?.branches ?? list.length;
        if (count === 0) {
          return (
            <span className="text-xs text-sushi-text-dim">
              {t('warehousesPage.noLinkedBranches')}
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {list.length > 0 ? (
              list.map((b) => (
                <span
                  key={b.id}
                  className="px-2 py-0.5 rounded bg-sushi-surface border border-sushi-border text-2xs font-mono text-sushi-text-muted"
                >
                  {b.name} ({b.code})
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 rounded bg-sushi-surface border border-sushi-border text-xs font-mono text-sushi-text-muted">
                {count} {t('warehousesPage.branchesUnit')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: t('warehousesPage.colStocksCount'),
      key: 'stocksCount',
      width: 150,
      align: 'center' as const,
      render: (_: unknown, record: Warehouse) => (
        <span className="font-mono font-medium text-xs text-sushi-text">
          {record._count?.stocks ?? 0} {t('warehousesPage.ingredientsUnit')}
        </span>
      ),
    },
    {
      title: t('warehousesPage.colStatus'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      align: 'center' as const,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-2xs font-medium ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-zinc-500/10 text-zinc-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-emerald-500' : 'bg-zinc-500'
            }`}
          />
          <span>{isActive ? t('common.active') : t('common.inactive')}</span>
        </span>
      ),
    },
    {
      title: t('warehousesPage.colActions'),
      key: 'actions',
      width: 110,
      align: 'right' as const,
      render: (_: unknown, record: Warehouse) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<PencilSimple size={15} />}
            onClick={() => handleOpenEdit(record)}
            className="text-sushi-text-muted hover:text-white"
            title={t('dashboard.edit')}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash size={15} />}
            onClick={() => handleDelete(record)}
            title={t('dashboard.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('warehousesPage.title')}
          subtitle={t('warehousesPage.subtitle')}
          extra={
            <div className="flex items-center gap-2">
              <Link href="/dashboard/inventory">
                <Button
                  icon={<Package size={15} />}
                  className="rounded-lg h-9 px-3 text-xs font-medium"
                >
                  {t('warehousesPage.viewStockBtn')}
                </Button>
              </Link>
              <div className="hidden md:block">
                <SushiButton
                  type="primary"
                  icon={<Plus size={15} weight="bold" />}
                  onClick={handleOpenCreate}
                  className="h-9 rounded-lg px-3.5 text-xs font-semibold"
                >
                  {t('warehousesPage.addBtn')}
                </SushiButton>
              </div>
            </div>
          }
        />
      </div>

      {/* Architectural Metric Ledger Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sushi-border border border-sushi-border rounded-xl overflow-hidden">
        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('warehousesPage.kpiTotal')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text">
              {warehouses.length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {t('warehousesPage.warehousesUnit')}
            </span>
          </div>
        </div>

        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('warehousesPage.kpiActive')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-emerald-400">
              {warehouses.filter((w) => w.isActive).length}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              {t('common.active')}
            </span>
          </div>
        </div>

        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('warehousesPage.kpiLinkedBranches')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text">
              {totalLinkedBranches}
            </span>
            <Link
              href="/dashboard/branches"
              className="text-2xs text-sushi-text-muted hover:text-white hover:underline font-mono"
            >
              {t('warehousesPage.manageBranchesLink')} →
            </Link>
          </div>
        </div>

        <div className="bg-sushi-card p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-sushi-text-muted">
            {t('warehousesPage.kpiTrackedStocks')}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-semibold font-mono text-sushi-text">
              {totalStockItems}
            </span>
            <span className="text-2xs text-sushi-text-dim font-mono">
              SKU
            </span>
          </div>
        </div>
      </div>

      {/* Unified Panel: Search + List / Table */}
      <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
        <div className="p-3 sm:px-4 border-b border-sushi-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="w-full sm:w-80">
            <Input
              prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim mr-1" />}
              placeholder={t('warehousesPage.searchPlaceholder')}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg h-9 text-xs"
            />
          </div>
          <div className="text-2xs font-mono text-sushi-text-dim">
            {filteredWarehouses.length}/{warehouses.length} {t('warehousesPage.warehousesUnit')}
          </div>
        </div>

        <div className="p-3 md:hidden">
          <SushiMobileCardList
            items={filteredWarehouses}
            pageSize={8}
            loading={isLoading}
            emptyState={
              <SushiEmptyState
                icon={<Database size={22} />}
                title={t('warehousesPage.emptyTitle')}
                description={t('warehousesPage.emptyDesc')}
              />
            }
            renderItem={(item) => (
              <SushiCardItem>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-sushi-surface border border-sushi-border font-mono font-semibold text-2xs text-sushi-text">
                        {item.code}
                      </span>
                      <Tag
                        color={item.isActive ? 'green' : 'default'}
                        className="text-3xs m-0"
                      >
                        {item.isActive ? t('common.active') : t('common.inactive')}
                      </Tag>
                    </div>
                    <h4 className="text-sm font-semibold text-sushi-text mt-1.5 truncate">
                      {item.name}
                    </h4>
                    <div className="text-xs text-sushi-text-dim flex items-center gap-1 mt-1">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">
                        {item.address || t('warehousesPage.noAddress')}
                      </span>
                    </div>
                  </div>

                  <SushiCardActions
                    onEdit={() => handleOpenEdit(item)}
                    onDelete={() => handleDelete(item)}
                    editLabel={t('dashboard.edit')}
                    deleteLabel={t('dashboard.delete')}
                  />
                </div>

                <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between text-2xs font-mono text-sushi-text-dim">
                  <span className="flex items-center gap-1">
                    <Storefront size={13} />
                    <span>
                      {item._count?.branches ?? item.branches?.length ?? 0}{' '}
                      {t('warehousesPage.branchesUnit')}
                    </span>
                  </span>
                  <span className="text-sushi-text font-medium">
                    {item._count?.stocks ?? 0} {t('warehousesPage.ingredientsUnit')}
                  </span>
                </div>
              </SushiCardItem>
            )}
          />
        </div>

        <div className="hidden md:block">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredWarehouses}
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>

      <SushiFloatingButton
        onClick={handleOpenCreate}
        ariaLabel={t('warehousesPage.addBtn')}
      />

      <ResponsiveModalDrawer
        title={
          editingWarehouse
            ? t('warehousesPage.modalEditTitle')
            : t('warehousesPage.modalCreateTitle')
        }
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
          form.resetFields();
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingWarehouse(null);
                form.resetFields();
              }}
            >
              {t('common.cancel')}
            </Button>
            <SushiButton
              type="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {editingWarehouse ? t('dashboard.saveChanges') : t('common.create')}
            </SushiButton>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item
            name="code"
            label={t('warehousesPage.formCodeLabel')}
            rules={[
              { required: true, message: t('warehousesPage.formCodeRequired') },
            ]}
          >
            <Input
              placeholder={t('warehousesPage.formCodePlaceholder')}
              className="font-mono uppercase"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={t('warehousesPage.formNameLabel')}
            rules={[
              { required: true, message: t('warehousesPage.formNameRequired') },
            ]}
          >
            <Input placeholder={t('warehousesPage.formNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="address"
            label={t('warehousesPage.formAddressLabel')}
          >
            <Input placeholder={t('warehousesPage.formAddressPlaceholder')} />
          </Form.Item>

          {editingWarehouse && (
            <Form.Item
              name="isActive"
              label={t('warehousesPage.formActiveLabel')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
        </Form>
      </ResponsiveModalDrawer>
    </div>
  );
}
