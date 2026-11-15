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
  CheckCircle,
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
      width: 170,
      render: (code: string) => (
        <Tag color="gold" className="font-mono font-bold text-xs px-2.5 py-0.5">
          {code}
        </Tag>
      ),
    },
    {
      title: t('warehousesPage.colName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Warehouse) => (
        <div>
          <div className="font-semibold text-sushi-text text-sm">{name}</div>
          <div className="text-xs text-sushi-text-muted flex items-center gap-1 mt-0.5">
            <MapPin size={13} className="text-sushi-text-dim shrink-0" />
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
            <span className="text-xs text-sushi-text-dim italic">
              {t('warehousesPage.noLinkedBranches')}
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {list.length > 0 ? (
              list.map((b) => (
                <Tag
                  key={b.id}
                  color="blue"
                  className="text-2xs font-medium m-0"
                >
                  {b.name} ({b.code})
                </Tag>
              ))
            ) : (
              <Tag color="blue" className="text-xs font-mono">
                {count} {t('warehousesPage.branchesUnit')}
              </Tag>
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
        <span className="font-mono font-semibold text-sushi-text">
          {record._count?.stocks ?? 0} {t('warehousesPage.ingredientsUnit')}
        </span>
      ),
    },
    {
      title: t('warehousesPage.colStatus'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('warehousesPage.colActions'),
      key: 'actions',
      width: 130,
      align: 'center' as const,
      render: (_: unknown, record: Warehouse) => (
        <Space size="small">
          <Button
            type="text"
            icon={<PencilSimple size={16} />}
            onClick={() => handleOpenEdit(record)}
            className="text-sushi-gold hover:text-sushi-gold"
            title={t('dashboard.edit')}
          />
          <Button
            type="text"
            danger
            icon={<Trash size={16} />}
            onClick={() => handleDelete(record)}
            title={t('dashboard.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <SushiPageHeader
        title={t('warehousesPage.title')}
        subtitle={t('warehousesPage.subtitle')}
        extra={
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/inventory">
              <Button
                icon={<Package size={16} />}
                className="rounded-xl h-10 px-3.5 text-xs sm:text-sm font-medium"
              >
                {t('warehousesPage.viewStockBtn')}
              </Button>
            </Link>
            <div className="hidden md:block">
              <SushiButton
                type="primary"
                icon={<Plus size={16} weight="bold" />}
                onClick={handleOpenCreate}
                className="h-10 rounded-xl px-4 font-semibold"
              >
                {t('warehousesPage.addBtn')}
              </SushiButton>
            </div>
          </div>
        }
      />

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('warehousesPage.kpiTotal')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Database size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text font-sans">
              {warehouses.length}
            </span>
            <span className="text-3xs sm:text-2xs text-sushi-text-dim font-mono">
              warehouses
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('warehousesPage.kpiActive')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-bold text-emerald-400 font-sans">
              {warehouses.filter((w) => w.isActive).length}
            </span>
            <span className="text-3xs sm:text-2xs text-sushi-text-dim font-mono">
              {t('common.active')}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('warehousesPage.kpiLinkedBranches')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Storefront size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text font-sans">
              {totalLinkedBranches}
            </span>
            <Link
              href="/dashboard/branches"
              className="text-3xs sm:text-2xs text-sushi-gold hover:underline font-mono"
            >
              {t('warehousesPage.manageBranchesLink')} →
            </Link>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('warehousesPage.kpiTrackedStocks')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Package size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text font-sans">
              {totalStockItems}
            </span>
            <span className="text-3xs sm:text-2xs text-sushi-text-dim font-mono">
              SKU records
            </span>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-96">
          <Input
            prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5" />}
            placeholder={t('warehousesPage.searchPlaceholder')}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl h-10"
          />
        </div>
        <div className="text-2xs sm:text-xs font-mono text-sushi-text-dim">
          {filteredWarehouses.length} / {warehouses.length} {t('warehousesPage.warehousesUnit')}
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <SushiMobileCardList
        items={filteredWarehouses}
        pageSize={8}
        loading={isLoading}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<Database size={28} />}
            title={t('warehousesPage.emptyTitle')}
            description={t('warehousesPage.emptyDesc')}
          />
        }
        renderItem={(item) => (
          <SushiCardItem>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag color="gold" className="font-mono font-bold text-2xs m-0">
                    {item.code}
                  </Tag>
                  <Tag
                    color={item.isActive ? 'green' : 'default'}
                    className="text-3xs m-0"
                  >
                    {item.isActive ? t('common.active') : t('common.inactive')}
                  </Tag>
                </div>
                <h4 className="text-sm font-bold text-sushi-text mt-1.5 truncate">
                  {item.name}
                </h4>
                <p className="text-xs text-sushi-text-muted mt-1 flex items-start gap-1">
                  <MapPin size={14} className="shrink-0 mt-0.5 text-sushi-text-dim" />
                  <span>{item.address || t('warehousesPage.noAddress')}</span>
                </p>
              </div>
              <SushiCardActions
                onEdit={() => handleOpenEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            </div>

            <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between text-2xs text-sushi-text-muted">
              <span>
                {t('warehousesPage.colBranches')}:{' '}
                <strong className="text-sushi-text">
                  {item._count?.branches ?? item.branches?.length ?? 0}
                </strong>
              </span>
              <span>
                {t('warehousesPage.colStocksCount')}:{' '}
                <strong className="text-sushi-text font-mono">
                  {item._count?.stocks ?? 0}
                </strong>
              </span>
            </div>
          </SushiCardItem>
        )}
      />

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block rounded-2xl bg-sushi-card border border-sushi-border/80 p-4 shadow-sm">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredWarehouses}
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      {/* Mobile FAB */}
      <SushiFloatingButton
        onClick={handleOpenCreate}
        // label={t('warehousesPage.addBtn')}
      />

      {/* Modal Tạo / Sửa Kho */}
      <ResponsiveModalDrawer
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
        }}
        title={
          editingWarehouse
            ? t('warehousesPage.modalEditTitle')
            : t('warehousesPage.modalCreateTitle')
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingWarehouse(null);
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
              { max: 50, message: t('warehousesPage.formCodeMax') },
            ]}
          >
            <Input
              placeholder={t('warehousesPage.formCodePlaceholder')}
              className="uppercase font-mono"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={t('warehousesPage.formNameLabel')}
            rules={[
              { required: true, message: t('warehousesPage.formNameRequired') },
              { max: 160, message: t('warehousesPage.formNameMax') },
            ]}
          >
            <Input placeholder={t('warehousesPage.formNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="address"
            label={t('warehousesPage.formAddressLabel')}
          >
            <Input.TextArea
              rows={3}
              placeholder={t('warehousesPage.formAddressPlaceholder')}
            />
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
