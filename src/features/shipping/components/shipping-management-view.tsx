'use client';

import React, { useState } from 'react';
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
  InputNumber,
  Select,
  Switch,
  Space,
  Tag,
  App,
  Card,
  Row,
  Col,
  Truck,
  Plus,
  PencilSimple,
  Trash,
  MapPin,
  Storefront,
} from '@/components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBranches,
  fetchShippingRules,
  fetchShippingLocations,
  upsertShippingRule,
  deleteShippingRule,
} from '../api/shipping.api';
import { ShippingRule } from '../types';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';
import { useTranslation } from '@/lib/i18n';

export function ShippingManagementView() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const { formatCurrency } = useFormatCurrency();
  const { t } = useTranslation();

  const [districtFilter] = useState<string>('');
  const [branchFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ShippingRule | null>(null);

  const [form] = Form.useForm();

  // Queries
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => fetchBranches(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['shipping-locations'],
    queryFn: fetchShippingLocations,
  });

  const { data: rules = [], isLoading: loadingRules } = useQuery({
    queryKey: ['shipping-rules', districtFilter, branchFilter],
    queryFn: () =>
      fetchShippingRules({
        district: districtFilter || undefined,
        branchId: branchFilter || undefined,
      }),
  });

  // Mutations
  const upsertMutation = useMutation({
    mutationFn: upsertShippingRule,
    onSuccess: () => {
      message.success('Lưu cấu hình phí ship thành công!');
      setIsModalOpen(false);
      form.resetFields();
      setEditingRule(null);
      queryClient.invalidateQueries({ queryKey: ['shipping-rules'] });
    },
    onError: (err: Error) => {
      message.error(err.message || 'Lỗi khi lưu cấu hình');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShippingRule,
    onSuccess: () => {
      message.success('Đã xóa cấu hình phí ship');
      queryClient.invalidateQueries({ queryKey: ['shipping-rules'] });
    },
    onError: (err: Error) => {
      message.error(err.message || 'Không thể xóa cấu hình');
    },
  });

  const handleOpenCreate = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({
      fee: undefined,
      isDefault: true,
      isActive: true,
      branchId: branches[0]?.id,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: ShippingRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      branchId: rule.branchId,
      district: rule.district,
      ward: rule.ward,
      fee: Number(rule.fee),
      isDefault: rule.isDefault,
      isActive: rule.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      upsertMutation.mutate({
        branchId: values.branchId,
        district: values.district.trim(),
        ward: values.ward.trim(),
        fee: values.fee,
        isDefault: values.isDefault,
        isActive: values.isActive,
      });
    } catch {
      // Validate form failed
    }
  };

  const columns = [
    {
      title: t('shippingPage.colDistrict'),
      dataIndex: 'district',
      key: 'district',
      render: (text: string) => (
        <span className="font-semibold text-sushi-text">{text}</span>
      ),
    },
    {
      title: t('shippingPage.colWard'),
      dataIndex: 'ward',
      key: 'ward',
      render: (text: string, record: ShippingRule) => (
        <div>
          <span className="font-medium text-sushi-text block">{text}</span>
          {record.isDefault && (
            <Tag color="gold" className="text-2xs font-semibold mt-0.5">
              {t('shippingPage.defaultBranch')}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: t('shippingPage.colBranch'),
      dataIndex: 'branch',
      key: 'branch',
      render: (_: unknown, record: ShippingRule) => (
        <div className="text-xs">
          <span className="font-semibold text-sushi-gold block">
            {record.branch?.name || record.branchId}
          </span>
          <span className="text-sushi-text-muted text-2xs truncate max-w-xs block">
            {record.branch?.address}
          </span>
        </div>
      ),
    },
    {
      title: t('shippingPage.colFee'),
      dataIndex: 'fee',
      key: 'fee',
      align: 'right' as const,
      render: (fee: number) => (
        <span className="font-mono font-bold text-sushi-text">
          {formatCurrency(fee)}
        </span>
      ),
    },
    {
      title: t('shippingPage.colStatus'),
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? t('shippingPage.statusActive') : t('shippingPage.statusPaused')}
        </Tag>
      ),
    },
    {
      title: t('shippingPage.colActions'),
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, record: ShippingRule) => (
        <Space size="small">
          <Button
            type="text"
            icon={<PencilSimple size={16} />}
            onClick={() => handleOpenEdit(record)}
            className="text-sushi-gold hover:text-sushi-gold"
          />
          <Button
            type="text"
            danger
            icon={<Trash size={16} />}
            onClick={() => {
              modal.confirm({
                title: t('shippingPage.deleteConfirmTitle'),
                content: `${record.ward}, ${record.district}?`,
                okText: t('shippingPage.deleteConfirmOk'),
                cancelText: t('common.cancel'),
                okType: 'danger',
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const handleDeleteRule = (rule: ShippingRule) => {
    modal.confirm({
      title: t('shippingPage.deleteConfirmTitle'),
      content: `${rule.ward}, ${rule.district}?`,
      okText: t('shippingPage.deleteConfirmOk'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: () => deleteMutation.mutate(rule.id),
    });
  };

  const handleWardSelect = (selectedWardName: string) => {
    const loc = locations.find((l) => l.ward === selectedWardName);
    if (loc) {
      form.setFieldsValue({
        ward: loc.ward,
        district: loc.district || '',
      });
    } else {
      form.setFieldsValue({ ward: selectedWardName });
    }
  };

  const wardSelectOptions = React.useMemo(() => {
    // Sắp xếp đưa các phường có hỗ trợ lên trước, sau đó theo alphabet A-Z
    return locations
      .slice()
      .sort((a, b) => {
        if (a.isSupported !== b.isSupported) {
          return a.isSupported ? -1 : 1;
        }
        return a.ward.localeCompare(b.ward, 'vi');
      })
      .map((l) => ({
        label: (
          <div className="flex items-center justify-between gap-2 py-0.5">
            <span className="font-semibold text-sushi-text">{l.ward}</span>
            <span className="text-2xs text-sushi-text-muted truncate max-w-[180px]">
              {l.district}
              {l.formerWards ? ` • Cũ: ${l.formerWards}` : ''}
            </span>
          </div>
        ),
        value: l.ward,
        district: l.district,
        searchKey: `${l.ward} ${l.district} ${l.formerWards || ''}`.toLowerCase(),
      }));
  }, [locations]);

  return (
    <div className="space-y-6">
      {/* Header chuẩn dùng chung SushiPageHeader */}
      <SushiPageHeader
        title={t('shippingPage.title')}
        subtitle={t('shippingPage.subtitle')}
        extra={
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/branches">
              <Button
                icon={<Storefront size={16} />}
                className="rounded-xl h-10 px-3.5 text-xs sm:text-sm font-medium"
              >
                {t('branchesPage.manageBtn')}
              </Button>
            </Link>
            <div className="hidden md:block">
              <SushiButton
                type="primary"
                icon={<Plus size={16} weight="bold" />}
                onClick={handleOpenCreate}
              >
                {t('shippingPage.addRuleButton')}
              </SushiButton>
            </div>
          </div>
        }
      />

      {/* Bảng dữ liệu (Desktop >= md) */}
      <Card className="hidden md:block rounded-2xl border-sushi-border/80 bg-sushi-card/90 shadow-sm overflow-hidden">
        <Table
          dataSource={rules}
          columns={columns}
          rowKey="id"
          loading={loadingRules || loadingBranches}
          pagination={{ pageSize: 15 }}
          locale={{
            emptyText: (
              <SushiEmptyState
                icon={<Truck size={24} />}
                title={t('shippingPage.emptyTitle')}
                description={t('shippingPage.emptyDescDesktop')}
              />
            ),
          }}
          className="[&_.ant-table]:bg-transparent [&_.ant-table-thead_th]:bg-zinc-900/80 [&_.ant-table-thead_th]:text-sushi-text-muted [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-semibold"
        />
      </Card>

      {/* Danh sách Dạng Card chuẩn dùng chung SushiMobileCardList (< md) */}
      <SushiMobileCardList
        items={rules}
        pageSize={10}
        loading={loadingRules || loadingBranches}
        emptyState={
          <SushiEmptyState
            isCard
            icon={<Truck size={24} />}
            title={t('shippingPage.emptyTitle')}
            description={t('shippingPage.emptyDescMobile')}
          />
        }
        renderItem={(rule) => (
          <SushiCardItem className="space-y-3 hover:border-sushi-gold/50 transition-colors">
            {/* Phường/Xã + Giá ship */}
            <div className="flex items-start justify-between gap-2 border-b border-sushi-border/60 pb-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-sushi-text">
                    {rule.ward}
                  </span>
                  {rule.isDefault && (
                    <Tag color="gold" className="text-2xs font-semibold m-0">
                      {t('shippingPage.defaultShort')}
                    </Tag>
                  )}
                </div>
                <span className="text-2xs text-sushi-text-muted flex items-center gap-1">
                  <MapPin size={12} className="text-sushi-gold shrink-0" />
                  <span>{rule.district || 'TP.HCM'}</span>
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-extrabold text-base text-sushi-gold block">
                  {formatCurrency(Number(rule.fee))}
                </span>
                <Tag
                  color={rule.isActive ? 'green' : 'default'}
                  className="text-2xs m-0 mt-0.5"
                >
                  {rule.isActive ? t('shippingPage.statusActive') : t('shippingPage.statusPaused')}
                </Tag>
              </div>
            </div>

            {/* Chi nhánh phục vụ & Nút thao tác chuẩn SushiCardActions */}
            <div className="flex items-center justify-between gap-2">
              <div className="rounded-xl bg-zinc-900/60 p-2.5 flex items-start gap-2 border border-sushi-border/40 flex-1 min-w-0">
                <Storefront size={15} className="text-sushi-gold mt-0.5 shrink-0" />
                <div className="min-w-0 text-xs">
                  <span className="font-semibold text-sushi-text block truncate">
                    {rule.branch?.name || rule.branchId}
                  </span>
                  <span className="text-2xs text-sushi-text-muted block truncate">
                    {rule.branch?.address || t('shippingPage.noAddress')}
                  </span>
                </div>
              </div>

              <SushiCardActions
                onEdit={() => handleOpenEdit(rule)}
                onDelete={() => handleDeleteRule(rule)}
              />
            </div>
          </SushiCardItem>
        )}
      />

      {/* Nút Floating Action Button trên Mobile */}
      <SushiFloatingButton
        onClick={handleOpenCreate}
        ariaLabel={t('shippingPage.addRuleButton')}
      />

      {/* Modal / Bottom Sheet Thêm / Sửa */}
      <ResponsiveModalDrawer
        open={isModalOpen}
        title={
          <div className="font-bold text-base text-sushi-text flex items-center gap-2">
            <Truck size={20} className="text-sushi-gold" />
            <span>
              {editingRule
                ? t('shippingPage.modalEditTitle')
                : t('shippingPage.modalCreateTitle')}
            </span>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto h-10 sm:h-auto rounded-xl"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={upsertMutation.isPending}
              className="w-full sm:w-auto h-10 sm:h-auto rounded-xl font-semibold"
            >
              {t('shippingPage.saveConfig')}
            </Button>
          </div>
        }
        className="[&_.ant-modal-content]:bg-sushi-card [&_.ant-modal-content]:border [&_.ant-modal-content]:border-sushi-border/80"
      >
        <Form form={form} layout="vertical" className="pt-1 space-y-1">
          <Form.Item
            name="branchId"
            label={<span className="text-xs font-semibold text-sushi-text">{t('shippingPage.formBranchLabel')}</span>}
            rules={[{ required: true, message: t('shippingPage.formBranchPlaceholder') }]}
          >
            <Select
              placeholder={t('shippingPage.formBranchPlaceholder')}
              className="w-full"
              options={branches.map((b) => ({
                label: `${b.name} (${b.code})`,
                value: b.id,
              }))}
            />
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="ward"
                label={
                  <span className="text-xs font-semibold text-sushi-text">
                    {t('shippingPage.formWardLabel')}
                  </span>
                }
                rules={[{ required: true, message: t('shippingPage.formWardPlaceholder') }]}
              >
                <Select
                  showSearch
                  placeholder={t('shippingPage.formWardPlaceholder')}
                  className="w-full"
                  options={wardSelectOptions}
                  onChange={handleWardSelect}
                  filterOption={(input, option) => {
                    const searchStr = (option as { searchKey?: string })?.searchKey || '';
                    return searchStr.includes(input.trim().toLowerCase());
                  }}
                  notFoundContent="Không tìm thấy phường/xã phù hợp"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="district"
                label={
                  <span className="text-xs font-semibold text-sushi-text">
                    {t('shippingPage.formDistrictLabel')}
                  </span>
                }
                rules={[{ required: true, message: t('shippingPage.formDistrictPlaceholder') }]}
              >
                <Input placeholder={t('shippingPage.formDistrictPlaceholder')} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fee"
            label={<span className="text-xs font-semibold text-sushi-text">{t('shippingPage.formFeeLabel')}</span>}
            rules={[{ required: true, message: t('shippingPage.formFeeLabel') }]}
          >
            <InputNumber
              min={0}
              step={1000}
              className="w-full"
              formatter={(value) =>
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
              }
              parser={(value) =>
                (value ? Number(value.replace(/,/g, '')) : 0) as 0
              }
            />
          </Form.Item>

          <Row gutter={16} className="pt-1">
            <Col span={12}>
              <Form.Item
                name="isDefault"
                label={<span className="text-xs font-semibold text-sushi-text">{t('shippingPage.formDefaultLabel')}</span>}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label={<span className="text-xs font-semibold text-sushi-text">{t('shippingPage.formActiveLabel')}</span>}
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ResponsiveModalDrawer>
    </div>
  );
}
