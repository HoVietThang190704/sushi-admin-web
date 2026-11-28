'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  SushiButton,
  SushiFloatingButton,
  SushiPageHeader,
  SushiMobileCardList,
  SushiCardItem,
  SushiEmptyState,
  ResponsiveModalDrawer,
  Form,
  Input,
  Select,
  Space,
  Tag,
  App,
  Modal,
  Plus,
  PencilSimple,
  Key,
  LockSimple,
  LockSimpleOpen,
  Users,
  Storefront,
  MagnifyingGlass,
  CheckCircle,
  Copy,
  Check,
} from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from '@/features/auth';
import { fetchBranchesForAdmin } from '@/features/shipping/api/shipping.api';
import {
  useStaffList,
  useCreateStaff,
  useUpdateStaff,
  useSetStaffStatus,
  useResetStaffPassword,
  StaffItem,
  CreateStaffDto,
  UpdateStaffDto,
} from '@/features/staff';
import { UserRole } from '@/types/auth';

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: 'magenta',
  BRANCH_MANAGER: 'gold',
  CASHIER: 'blue',
  KITCHEN_STAFF: 'cyan',
  CUSTOMER: 'default',
};

export function StaffManagementView() {
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const [branchFilter, setBranchFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [form] = Form.useForm();

  // Dialog hiển thị mật khẩu tạm
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    password: string;
  }>({
    open: false,
    title: '',
    description: '',
    password: '',
  });
  const [copied, setCopied] = useState(false);

  // Queries
  const { data: branches = [] } = useQuery({
    queryKey: ['branches', 'all'],
    queryFn: () => fetchBranchesForAdmin(),
  });

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of branches) {
      map.set(b.id, b.name);
    }
    return map;
  }, [branches]);

  const { data: staffData, isLoading } = useStaffList({
    search: search.trim() || undefined,
    role: roleFilter,
    branchId: branchFilter,
    isActive: statusFilter,
    page,
    limit,
  });

  const staffList = staffData?.items || [];
  const totalItems = staffData?.total || 0;

  // Mutations
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const statusMutation = useSetStaffStatus();
  const resetPasswordMutation = useResetStaffPassword();

  // Danh sách các vai trò được phép gán
  const assignableRoles: UserRole[] = useMemo(() => {
    if (isSuperAdmin) {
      return ['SUPER_ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'KITCHEN_STAFF'];
    }
    // BRANCH_MANAGER chỉ được tạo/quản lý CASHIER và KITCHEN_STAFF
    return ['CASHIER', 'KITCHEN_STAFF'];
  }, [isSuperAdmin]);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    form.resetFields();
    if (!isSuperAdmin && currentUser?.branchId) {
      form.setFieldsValue({
        role: 'CASHIER',
        branchId: currentUser.branchId,
      });
    } else {
      form.setFieldsValue({
        role: 'CASHIER',
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffItem) => {
    setEditingStaff(staff);
    form.resetFields();
    form.setFieldsValue({
      fullName: staff.fullName,
      phone: staff.phone || '',
      role: staff.role,
      branchId: staff.branchId || undefined,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingStaff) {
        const updatePayload: UpdateStaffDto = {
          fullName: values.fullName,
          phone: values.phone || undefined,
          role: values.role,
          branchId: values.role === 'SUPER_ADMIN' ? undefined : values.branchId,
        };
        await updateMutation.mutateAsync({
          id: editingStaff.id,
          dto: updatePayload,
        });
        message.success(`Cập nhật nhân viên "${values.fullName}" thành công!`);
        setIsModalOpen(false);
      } else {
        const createPayload: CreateStaffDto = {
          email: values.email,
          fullName: values.fullName,
          phone: values.phone || undefined,
          role: values.role,
          branchId: values.role === 'SUPER_ADMIN' ? undefined : values.branchId,
        };
        const res = await createMutation.mutateAsync(createPayload);
        setIsModalOpen(false);
        setTempPasswordModal({
          open: true,
          title: t('staffPage.tempPasswordNoticeTitle'),
          description: t('staffPage.tempPasswordNoticeDesc'),
          password: res.temporaryPassword,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác không thành công';
      message.error(msg);
    }
  };

  const handleToggleStatus = (staff: StaffItem) => {
    if (staff.id === currentUser?.id) {
      message.warning(t('staffPage.selfActionForbidden'));
      return;
    }

    const nextActive = !staff.isActive;
    modal.confirm({
      title: nextActive
        ? t('staffPage.activateConfirm')
        : t('staffPage.deactivateConfirm'),
      okText: nextActive ? t('staffPage.activateBtn') : t('staffPage.deactivateBtn'),
      okType: nextActive ? 'primary' : 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await statusMutation.mutateAsync({ id: staff.id, isActive: nextActive });
          message.success(
            nextActive
              ? `Đã kích hoạt lại tài khoản ${staff.fullName}!`
              : `Đã khóa tài khoản ${staff.fullName}!`,
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Thao tác thất bại';
          message.error(msg);
        }
      },
    });
  };

  const handleResetPassword = (staff: StaffItem) => {
    if (staff.id === currentUser?.id) {
      message.warning(t('staffPage.selfActionForbidden'));
      return;
    }

    modal.confirm({
      title: t('staffPage.resetPasswordBtn'),
      content: t('staffPage.resetPasswordConfirm'),
      okText: t('staffPage.resetPasswordBtn'),
      okType: 'primary',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          const res = await resetPasswordMutation.mutateAsync(staff.id);
          setTempPasswordModal({
            open: true,
            title: t('staffPage.resetPasswordSuccessTitle'),
            description: t('staffPage.resetPasswordSuccessDesc'),
            password: res.temporaryPassword,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại';
          message.error(msg);
        }
      },
    });
  };

  const handleCopyPassword = () => {
    if (!tempPasswordModal.password) return;
    navigator.clipboard.writeText(tempPasswordModal.password);
    setCopied(true);
    message.success(t('staffPage.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedRoleInForm = Form.useWatch('role', form);
  const isSelectedRoleSuperAdmin = selectedRoleInForm === 'SUPER_ADMIN';

  // Desktop Table Columns
  const columns = [
    {
      title: t('staffPage.colName'),
      key: 'fullName',
      render: (_: unknown, record: StaffItem) => (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sushi-text text-sm">
              {record.fullName}
            </span>
            {record.id === currentUser?.id && (
              <Tag color="cyan" className="text-3xs font-mono mr-0">
                Bạn
              </Tag>
            )}
            {record.mustChangePassword && (
              <Tag color="warning" className="text-3xs mr-0">
                {t('staffPage.passwordMustChangeNotice')}
              </Tag>
            )}
          </div>
          <span className="text-2xs text-sushi-text-dim font-mono">{record.email}</span>
          {record.phone && (
            <span className="text-3xs text-sushi-text-muted mt-0.5">📞 {record.phone}</span>
          )}
        </div>
      ),
    },
    {
      title: t('staffPage.colRole'),
      dataIndex: 'role',
      key: 'role',
      width: 170,
      render: (role: UserRole) => (
        <Tag color={ROLE_COLORS[role] || 'default'} className="font-semibold text-2xs uppercase">
          {role}
        </Tag>
      ),
    },
    {
      title: t('staffPage.colBranch'),
      dataIndex: 'branchId',
      key: 'branchId',
      width: 220,
      render: (branchId: string | null) => {
        if (!branchId) {
          return (
            <span className="text-xs text-sushi-text-dim italic">
              {t('staffPage.formBranchSystemWide')}
            </span>
          );
        }
        const bName = branchMap.get(branchId);
        return (
          <div className="flex items-center space-x-1.5 text-xs text-sushi-text">
            <Storefront size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">{bName || branchId.slice(0, 8)}</span>
          </div>
        );
      },
    },
    {
      title: t('staffPage.colStatus'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} className="font-medium text-2xs mr-0">
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('staffPage.colLastLogin'),
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 160,
      render: (dateStr: string | null) => (
        <span className="text-2xs text-sushi-text-dim font-mono">
          {dateStr ? new Date(dateStr).toLocaleString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      title: t('staffPage.colActions'),
      key: 'actions',
      width: 150,
      render: (_: unknown, record: StaffItem) => {
        const isSelf = record.id === currentUser?.id;
        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<PencilSimple size={15} />}
              onClick={() => handleOpenEdit(record)}
              className="text-sushi-text-muted hover:text-white"
            />
            <Button
              type="text"
              size="small"
              icon={<Key size={15} />}
              disabled={isSelf}
              onClick={() => handleResetPassword(record)}
              title={t('staffPage.resetPasswordBtn')}
              className="text-amber-400 hover:text-amber-300 disabled:opacity-30"
            />
            <Button
              type="text"
              size="small"
              icon={record.isActive ? <LockSimple size={15} /> : <LockSimpleOpen size={15} />}
              disabled={isSelf}
              onClick={() => handleToggleStatus(record)}
              title={record.isActive ? t('staffPage.deactivateBtn') : t('staffPage.activateBtn')}
              className={
                record.isActive
                  ? 'text-rose-400 hover:text-rose-300 disabled:opacity-30'
                  : 'text-emerald-400 hover:text-emerald-300 disabled:opacity-30'
              }
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('staffPage.title')}
          subtitle={t('staffPage.subtitle')}
          extra={
            <div className="hidden md:block">
              <SushiButton
                type="primary"
                icon={<Plus size={15} weight="bold" />}
                onClick={handleOpenCreate}
                className="h-9 rounded-lg px-3.5 text-xs font-semibold"
              >
                {t('staffPage.addStaffBtn')}
              </SushiButton>
            </div>
          }
        />
      </div>

      {/* Unified Panel: Filter Bar + Staff List / Table */}
      <div className="rounded-xl bg-sushi-card border border-sushi-border overflow-hidden">
        <div className="p-3 sm:px-4 border-b border-sushi-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <Input
              prefix={<MagnifyingGlass size={15} className="text-sushi-text-dim" />}
              placeholder={t('staffPage.searchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-9 rounded-lg text-xs"
            />

            <Select
              placeholder={t('staffPage.filterRole')}
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
              allowClear
              className="w-full h-9 text-xs"
              options={[
                { label: 'SUPER_ADMIN', value: 'SUPER_ADMIN' },
                { label: 'BRANCH_MANAGER', value: 'BRANCH_MANAGER' },
                { label: 'CASHIER', value: 'CASHIER' },
                { label: 'KITCHEN_STAFF', value: 'KITCHEN_STAFF' },
              ]}
            />

            {isSuperAdmin && (
              <Select
                placeholder={t('staffPage.filterBranch')}
                value={branchFilter}
                onChange={(val) => {
                  setBranchFilter(val);
                  setPage(1);
                }}
                allowClear
                className="w-full h-9 text-xs"
                options={branches.map((b) => ({
                  label: b.name,
                  value: b.id,
                }))}
              />
            )}

            <Select
              placeholder={t('staffPage.filterStatus')}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              allowClear
              className="w-full h-9 text-xs"
              options={[
                { label: t('common.active'), value: true },
                { label: t('common.inactive'), value: false },
              ]}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="p-3 block lg:hidden">
          <SushiMobileCardList
            items={staffList}
            pageSize={10}
            loading={isLoading}
            emptyState={
              <SushiEmptyState
                icon={<Users size={22} />}
                title={t('staffPage.emptyTitle')}
                description={t('staffPage.emptyDesc')}
              />
            }
            renderItem={(item: StaffItem) => {
              const isSelf = item.id === currentUser?.id;
              const bName = item.branchId ? branchMap.get(item.branchId) : null;

              return (
                <SushiCardItem key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag
                          color={ROLE_COLORS[item.role] || 'default'}
                          className="text-3xs font-semibold uppercase m-0"
                        >
                          {item.role}
                        </Tag>
                        <Tag
                          color={item.isActive ? 'green' : 'default'}
                          className="text-3xs m-0"
                        >
                          {item.isActive ? t('common.active') : t('common.inactive')}
                        </Tag>
                        {isSelf && (
                          <Tag color="cyan" className="text-3xs font-mono m-0">
                            Bạn
                          </Tag>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-sushi-text mt-1.5 truncate">
                        {item.fullName}
                      </h4>
                      <p className="text-xs text-sushi-text-muted mt-0.5 font-mono truncate">
                        {item.email}
                      </p>
                      {item.phone && (
                        <p className="text-2xs text-sushi-text-dim mt-0.5 font-mono">
                          {item.phone}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <Button
                        type="text"
                        size="small"
                        icon={<PencilSimple size={15} />}
                        onClick={() => handleOpenEdit(item)}
                        className="text-sushi-text-muted"
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<Key size={15} />}
                        disabled={isSelf}
                        onClick={() => handleResetPassword(item)}
                        className="text-amber-400 disabled:opacity-30"
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={item.isActive ? <LockSimple size={15} /> : <LockSimpleOpen size={15} />}
                        disabled={isSelf}
                        onClick={() => handleToggleStatus(item)}
                        className={item.isActive ? 'text-rose-400 disabled:opacity-30' : 'text-emerald-400 disabled:opacity-30'}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-sushi-border/60 flex items-center justify-between text-2xs">
                    <div className="truncate">
                      <span className="text-sushi-text-muted">{t('staffPage.colBranch')}: </span>
                      {bName ? (
                        <strong className="text-sushi-text font-medium">{bName}</strong>
                      ) : (
                        <span className="text-sushi-text-dim">
                          {t('staffPage.formBranchSystemWide')}
                        </span>
                      )}
                    </div>
                    {item.lastLoginAt && (
                      <span className="text-sushi-text-dim font-mono shrink-0 ml-2">
                        {new Date(item.lastLoginAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </SushiCardItem>
              );
            }}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table
            columns={columns}
            dataSource={staffList}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalItems,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              className: 'p-4',
            }}
          />
        </div>
      </div>

      {/* Mobile Floating Add Button */}
      <SushiFloatingButton
        icon={<Plus size={22} weight="bold" />}
        onClick={handleOpenCreate}
        aria-label={t('staffPage.addStaffBtn')}
      />

      {/* 4. Modal / Drawer Tạo & Chỉnh Sửa Nhân Viên */}
      <ResponsiveModalDrawer
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingStaff
            ? t('staffPage.modalEditTitle')
            : t('staffPage.modalCreateTitle')
        }
        footer={
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button onClick={() => setIsModalOpen(false)} className="sushi-button-secondary">
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={handleFormSubmit}
              className="sushi-button-primary"
            >
              {editingStaff ? t('common.actions') : t('common.create')}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" requiredMark={false} className="space-y-2">
          {!editingStaff && (
            <Form.Item
              name="email"
              label={
                <span className="text-xs font-semibold text-sushi-text">
                  {t('staffPage.formEmail')}
                </span>
              }
              rules={[
                { required: true, message: t('staffPage.formEmailRequired') },
                { type: 'email', message: t('auth.emailInvalid') },
              ]}
            >
              <Input
                placeholder={t('staffPage.formEmailPlaceholder')}
                className="sushi-input text-xs"
              />
            </Form.Item>
          )}

          <Form.Item
            name="fullName"
            label={
              <span className="text-xs font-semibold text-sushi-text">
                {t('staffPage.formFullName')}
              </span>
            }
            rules={[
              { required: true, message: t('staffPage.formFullNameRequired') },
            ]}
          >
            <Input
              placeholder={t('staffPage.formFullNamePlaceholder')}
              className="sushi-input text-xs"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label={
              <span className="text-xs font-semibold text-sushi-text">
                {t('staffPage.formPhone')}
              </span>
            }
          >
            <Input
              placeholder={t('staffPage.formPhonePlaceholder')}
              className="sushi-input text-xs"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label={
              <span className="text-xs font-semibold text-sushi-text">
                {t('staffPage.formRole')}
              </span>
            }
            rules={[{ required: true, message: t('staffPage.formRoleRequired') }]}
          >
            <Select
              className="w-full text-xs"
              options={assignableRoles.map((r) => ({
                label: r,
                value: r,
              }))}
            />
          </Form.Item>

          {/* Chọn chi nhánh: SUPER_ADMIN không cần chi nhánh, các role khác bắt buộc */}
          {!isSelectedRoleSuperAdmin && (
            <Form.Item
              name="branchId"
              label={
                <span className="text-xs font-semibold text-sushi-text">
                  {t('staffPage.formBranch')}
                </span>
              }
              rules={[
                {
                  required: !isSelectedRoleSuperAdmin,
                  message: t('staffPage.formBranchRequired'),
                },
              ]}
            >
              <Select
                placeholder={t('staffPage.formBranch')}
                disabled={!isSuperAdmin} // Manager bị gán cứng vào chi nhánh của mình
                className="w-full text-xs"
                options={branches.map((b) => ({
                  label: b.name,
                  value: b.id,
                }))}
              />
            </Form.Item>
          )}
        </Form>
      </ResponsiveModalDrawer>

      {/* 5. Modal Thông Báo Mật Khẩu Tạm Thời (Chỉ hiển thị 1 lần) */}
      <Modal
        open={tempPasswordModal.open}
        title={
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle size={22} weight="fill" />
            <span className="font-bold text-base text-sushi-text">
              {tempPasswordModal.title}
            </span>
          </div>
        }
        onCancel={() => setTempPasswordModal((p) => ({ ...p, open: false }))}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setTempPasswordModal((p) => ({ ...p, open: false }))}
            className="sushi-button-primary"
          >
            Đã Lưu Mật Khẩu
          </Button>,
        ]}
        destroyOnHidden
      >
        <div className="py-3 space-y-4">
          <p className="text-xs text-sushi-text-muted leading-relaxed">
            {tempPasswordModal.description}
          </p>

          <div className="p-3 rounded-xl bg-sushi-surface border border-emerald-500/30 flex items-center justify-between">
            <span className="text-base font-mono font-bold text-emerald-400 tracking-wider select-all">
              {tempPasswordModal.password}
            </span>
            <Button
              type="primary"
              size="small"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopyPassword}
              className="sushi-button-secondary ml-3 shrink-0"
            >
              {copied ? t('staffPage.copied') : t('staffPage.copyPassword')}
            </Button>
          </div>

          <p className="text-2xs text-amber-400/90 italic">
            * Nhân viên sẽ được yêu cầu thiết lập mật khẩu mới ngay trong lần đầu tiên đăng nhập.
          </p>
        </div>
      </Modal>
    </div>
  );
}
