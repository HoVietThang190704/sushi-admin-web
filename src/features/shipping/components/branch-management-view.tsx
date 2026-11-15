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
  Select,
  Switch,
  Space,
  Tag,
  App,
  Plus,
  PencilSimple,
  Trash,
  MapPin,
  Storefront,
  Database,
  Truck,
  MagnifyingGlass,
  CheckCircle,
  WarningCircle,
} from '@/components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBranchesForAdmin,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../api/shipping.api';
import { Branch, CreateBranchInput, UpdateBranchInput } from '../types';
import { useWarehouses, inventoryKeys } from '@/features/inventory';
import { useTranslation } from '@/lib/i18n';

export function BranchManagementView() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm();

  // Queries
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches', 'all'],
    queryFn: () => fetchBranchesForAdmin(),
  });

  const { data: warehouses = [], isLoading: loadingWarehouses } = useWarehouses();

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: CreateBranchInput) => createBranch(dto),
    onSuccess: (created) => {
      message.success(`Đã tạo chi nhánh "${created.name}" (${created.code}) thành công!`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses() });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: Error) => {
      message.error(err.message || 'Không thể tạo chi nhánh');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBranchInput }) =>
      updateBranch(id, dto),
    onSuccess: (updated) => {
      message.success(`Đã cập nhật chi nhánh "${updated.name}" thành công!`);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['shipping-rules'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses() });
      setIsModalOpen(false);
      setEditingBranch(null);
      form.resetFields();
    },
    onError: (err: Error) => {
      message.error(err.message || 'Không thể cập nhật chi nhánh');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses() });
      if (res.deactivated) {
        message.info('Chi nhánh đã phát sinh đơn hàng nên được chuyển sang trạng thái Tạm ngừng.');
      } else {
        message.success('Đã xóa chi nhánh thành công!');
      }
    },
    onError: (err: Error) => {
      message.error(err.message || 'Không thể xóa chi nhánh');
    },
  });

  const filteredBranches = useMemo(() => {
    if (!search.trim()) return branches;
    const q = search.toLowerCase().trim();
    return branches.filter(
      (b) =>
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q),
    );
  }, [branches, search]);

  const unlinkedCount = useMemo(() => {
    return branches.filter((b) => !b.warehouseId).length;
  }, [branches]);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    form.resetFields();
    form.setFieldsValue({
      code: '',
      name: '',
      phone: '',
      address: '',
      warehouseId: warehouses[0]?.id || undefined,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.setFieldsValue({
      code: branch.code,
      name: branch.name,
      phone: branch.phone,
      address: branch.address,
      warehouseId: branch.warehouseId || undefined,
      isActive: branch.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (branch: Branch) => {
    modal.confirm({
      title: t('branchesPage.deleteConfirmTitle'),
      content: `${branch.name} (${branch.code})`,
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: async () => {
        await deleteMutation.mutateAsync(branch.id);
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        warehouseId: values.warehouseId || null,
        isActive: values.isActive ?? true,
      };

      if (editingBranch) {
        await updateMutation.mutateAsync({
          id: editingBranch.id,
          dto: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch {
      // Handled by form validation or mutation onError
    }
  };

  const columns = [
    {
      title: t('branchesPage.colCode'),
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code: string) => (
        <Tag color="gold" className="font-mono font-bold text-xs px-2.5 py-0.5">
          {code}
        </Tag>
      ),
    },
    {
      title: t('branchesPage.colName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Branch) => (
        <div>
          <div className="font-semibold text-sushi-text text-sm">{name}</div>
          <div className="text-xs text-sushi-text-muted flex items-center gap-1 mt-0.5">
            <MapPin size={13} className="text-sushi-text-dim shrink-0" />
            <span>{record.address}</span>
          </div>
          <div className="text-2xs text-sushi-text-dim font-mono mt-0.5">
            Hotline: {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: t('branchesPage.colWarehouse'),
      key: 'warehouse',
      width: 240,
      render: (_: unknown, record: Branch) => {
        if (!record.warehouse && !record.warehouseId) {
          return (
            <Tag
              color="warning"
              className="inline-flex items-center gap-1 text-2xs font-medium"
            >
              <WarningCircle size={13} weight="fill" />
              <span>{t('branchesPage.noWarehouseWarning')}</span>
            </Tag>
          );
        }
        return (
          <div>
            <span className="font-semibold text-sushi-gold text-xs block">
              {record.warehouse?.name || record.warehouseId}
            </span>
            {record.warehouse?.code && (
              <span className="text-2xs text-sushi-text-dim font-mono">
                {record.warehouse.code}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: t('branchesPage.colStats'),
      key: 'stats',
      width: 180,
      render: (_: unknown, record: Branch) => (
        <div className="text-xs space-y-0.5 font-mono">
          <div>
            <span className="text-sushi-text-muted">Phường/Xã: </span>
            <strong className="text-sushi-text">
              {record._count?.shippingRules ?? 0}
            </strong>
          </div>
          <div>
            <span className="text-sushi-text-muted">Đơn hàng: </span>
            <strong className="text-sushi-text">
              {record._count?.orders ?? 0}
            </strong>
          </div>
        </div>
      ),
    },
    {
      title: t('branchesPage.colStatus'),
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
      title: t('branchesPage.colActions'),
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: Branch) => (
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
        title={t('branchesPage.title')}
        subtitle={t('branchesPage.subtitle')}
        extra={
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/shipping">
              <Button
                icon={<Truck size={16} />}
                className="rounded-xl h-10 px-3.5 text-xs sm:text-sm font-medium"
              >
                {t('branchesPage.shippingRulesBtn')}
              </Button>
            </Link>
            <div className="hidden md:block">
              <SushiButton
                type="primary"
                icon={<Plus size={16} weight="bold" />}
                onClick={handleOpenCreate}
                className="h-10 rounded-xl px-4 font-semibold"
              >
                {t('branchesPage.addBtn')}
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
              {t('branchesPage.kpiTotal')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Storefront size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text font-sans">
              {branches.length}
            </span>
            <span className="text-3xs sm:text-2xs text-sushi-text-dim font-mono">
              branches
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('branchesPage.kpiActive')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-bold text-emerald-400 font-sans">
              {branches.filter((b) => b.isActive).length}
            </span>
            <span className="text-3xs sm:text-2xs text-sushi-text-dim font-mono">
              {t('common.active')}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/90 shadow-sm">
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('branchesPage.kpiLinkedWarehouse')}
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Database size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-bold text-sushi-text font-sans">
              {branches.filter((b) => Boolean(b.warehouseId)).length}
            </span>
            <Link
              href="/dashboard/warehouses"
              className="text-3xs sm:text-2xs text-sushi-gold hover:underline font-mono"
            >
              {t('warehousesPage.manageBtn')} →
            </Link>
          </div>
        </div>

        <div
          className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-sushi-card border shadow-sm ${unlinkedCount > 0
              ? 'border-amber-500/50 bg-gradient-to-br from-sushi-card to-amber-500/5'
              : 'border-sushi-border/90'
            }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-2xs sm:text-xs font-medium text-sushi-text-muted truncate">
              {t('branchesPage.kpiUnlinkedWarehouse')}
            </span>
            <div
              className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 ${unlinkedCount > 0
                  ? 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
            >
              <WarningCircle size={18} weight="fill" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-baseline justify-between">
            <span
              className={`text-xl sm:text-3xl font-bold font-sans ${unlinkedCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
            >
              {unlinkedCount}
            </span>
            <span className="text-3xs sm:text-2xs text-sushi-text-dim font-mono">
              {unlinkedCount > 0 ? t('branchesPage.needWarehouse') : t('dashboard.alertSafe')}
            </span>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-96">
          <Input
            prefix={<MagnifyingGlass size={16} className="text-sushi-text-dim mr-1.5" />}
            placeholder={t('branchesPage.searchPlaceholder')}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl h-10"
          />
        </div>
        <div className="text-2xs sm:text-xs font-mono text-sushi-text-dim">
          {filteredBranches.length} / {branches.length} {t('branchesPage.branchesUnit')}
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <SushiMobileCardList
        items={filteredBranches}
        pageSize={8}
        loading={loadingBranches}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<Storefront size={28} />}
            title={t('branchesPage.emptyTitle')}
            description={t('branchesPage.emptyDesc')}
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
                  <span>{item.address}</span>
                </p>
                <p className="text-2xs text-sushi-text-dim font-mono mt-1">
                  SĐT: {item.phone}
                </p>
              </div>
              <SushiCardActions
                onEdit={() => handleOpenEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            </div>

            <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between text-2xs">
              <div className="truncate">
                <span className="text-sushi-text-muted">{t('branchesPage.colWarehouse')}: </span>
                {item.warehouse ? (
                  <strong className="text-sushi-gold">
                    {item.warehouse.name} ({item.warehouse.code})
                  </strong>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    {t('branchesPage.noWarehouseWarning')}
                  </span>
                )}
              </div>
              <span className="text-sushi-text-dim font-mono shrink-0 ml-2">
                {item._count?.orders ?? 0} đơn
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
          dataSource={filteredBranches}
          loading={loadingBranches}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>

      {/* Mobile FAB */}
      <SushiFloatingButton
        onClick={handleOpenCreate}
        // label={t('branchesPage.addBtn')}
      />

      {/* Modal Tạo / Sửa Chi Nhánh */}
      <ResponsiveModalDrawer
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        title={
          editingBranch
            ? t('branchesPage.modalEditTitle')
            : t('branchesPage.modalCreateTitle')
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingBranch(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <SushiButton
              type="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {editingBranch ? t('dashboard.saveChanges') : t('common.create')}
            </SushiButton>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="code"
              label={t('branchesPage.formCodeLabel')}
              rules={[
                { required: true, message: t('branchesPage.formCodeRequired') },
                { max: 50, message: t('branchesPage.formCodeMax') },
              ]}
            >
              <Input
                placeholder={t('branchesPage.formCodePlaceholder')}
                className="uppercase font-mono"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={t('branchesPage.formPhoneLabel')}
              rules={[
                { required: true, message: t('branchesPage.formPhoneRequired') },
                { max: 30, message: t('branchesPage.formPhoneMax') },
              ]}
            >
              <Input
                placeholder={t('branchesPage.formPhonePlaceholder')}
                className="font-mono"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label={t('branchesPage.formNameLabel')}
            rules={[
              { required: true, message: t('branchesPage.formNameRequired') },
              { max: 160, message: t('branchesPage.formNameMax') },
            ]}
          >
            <Input placeholder={t('branchesPage.formNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="address"
            label={t('branchesPage.formAddressLabel')}
            rules={[
              { required: true, message: t('branchesPage.formAddressRequired') },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder={t('branchesPage.formAddressPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="warehouseId"
            label={t('branchesPage.formWarehouseLabel')}
            extra={
              <span className="text-2xs text-sushi-text-dim">
                {t('branchesPage.formWarehouseHint')}{' '}
                <Link
                  href="/dashboard/warehouses"
                  className="text-sushi-gold hover:underline"
                >
                  {t('warehousesPage.addBtn')}
                </Link>
              </span>
            }
          >
            <Select
              allowClear
              loading={loadingWarehouses}
              placeholder={t('branchesPage.formWarehousePlaceholder')}
              options={warehouses.map((w) => ({
                value: w.id,
                label: `${w.name} (${w.code})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label={t('branchesPage.formActiveLabel')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </ResponsiveModalDrawer>
    </div>
  );
}
