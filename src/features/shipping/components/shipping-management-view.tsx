'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
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
  Pagination,
  Empty,
  Spin,
} from '@/components/ui';
import {
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
import { ShippingRule, UpsertShippingRuleInput } from '../types';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

export function ShippingManagementView() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { formatCurrency } = useFormatCurrency();

  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ShippingRule | null>(null);
  const [mobilePage, setMobilePage] = useState<number>(1);
  const mobilePageSize = 10;

  const [form] = Form.useForm();

  // Queries
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
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
      fee: 20000,
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
      title: 'KHU VỰC / QUẬN THAM CHIẾU',
      dataIndex: 'district',
      key: 'district',
      render: (text: string) => (
        <span className="font-semibold text-sushi-text">{text}</span>
      ),
    },
    {
      title: 'PHƯỜNG / XÃ (TP.HCM)',
      dataIndex: 'ward',
      key: 'ward',
      render: (text: string, record: ShippingRule) => (
        <div>
          <span className="font-medium text-sushi-text block">{text}</span>
          {record.isDefault && (
            <Tag color="gold" className="text-2xs font-semibold mt-0.5">
              Chi nhánh mặc định
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'CHI NHÁNH PHỤC VỤ',
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
      title: 'MỨC PHÍ SHIP',
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
      title: 'TRẠNG THÁI',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Đang phục vụ' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'THAO TÁC',
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
              Modal.confirm({
                title: 'Xóa cấu hình phí ship?',
                content: `Bạn có chắc muốn xóa phí ship cho ${record.ward}, ${record.district}?`,
                okText: 'Xác nhận xóa',
                cancelText: 'Hủy',
                okType: 'danger',
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const paginatedRulesMobile = React.useMemo(() => {
    const start = (mobilePage - 1) * mobilePageSize;
    return rules.slice(start, start + mobilePageSize);
  }, [rules, mobilePage]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sushi-border/70">
        <div>
          <h1 className="text-2xl font-bold font-sans text-sushi-text tracking-normal flex items-center gap-2.5">
            <Truck size={28} className="text-sushi-gold" />
            <span>Cấu Hình Phí Giao Hàng (TP.HCM)</span>
          </h1>
          <p className="text-xs text-sushi-text-muted mt-1">
            Thiết lập bảng giá ship và chỉ định chi nhánh mặc định theo từng Xã/Phường
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleOpenCreate}
          className="bg-sushi-gold hover:bg-amber-500 text-zinc-950 font-bold h-10 rounded-xl"
        >
          Thêm Mức Phí Phường/Xã
        </Button>
      </div>

      {/* Bảng dữ liệu (Desktop & Tablet ngang) */}
      <Card className="hidden sm:block rounded-2xl border-sushi-border/80 bg-sushi-card/90 shadow-sm overflow-hidden">
        <Table
          dataSource={rules}
          columns={columns}
          rowKey="id"
          loading={loadingRules || loadingBranches}
          pagination={{ pageSize: 15 }}
          className="[&_.ant-table]:bg-transparent [&_.ant-table-thead_th]:bg-zinc-900/80 [&_.ant-table-thead_th]:text-sushi-text-muted [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-semibold"
        />
      </Card>

      {/* Danh sách Dạng Card (Tối ưu riêng cho Mobile) */}
      <div className="block sm:hidden space-y-3">
        {loadingRules || loadingBranches ? (
          <div className="py-12 flex justify-center items-center">
            <Spin size="large" />
          </div>
        ) : rules.length === 0 ? (
          <Card className="rounded-2xl border-sushi-border/80 bg-sushi-card/90 p-6 text-center">
            <Empty description="Chưa có cấu hình phí giao hàng nào" />
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedRulesMobile.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-2xl border border-sushi-border/80 bg-sushi-card/95 p-4 shadow-sm space-y-3 transition-colors hover:border-sushi-gold/50"
                >
                  {/* Phường/Xã + Giá ship */}
                  <div className="flex items-start justify-between gap-2 border-b border-sushi-border/60 pb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-sushi-text">
                          {rule.ward}
                        </span>
                        {rule.isDefault && (
                          <Tag color="gold" className="text-2xs font-semibold m-0">
                            Mặc định
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
                        {rule.isActive ? 'Đang phục vụ' : 'Tạm dừng'}
                      </Tag>
                    </div>
                  </div>

                  {/* Chi nhánh phục vụ */}
                  <div className="rounded-xl bg-zinc-900/60 p-2.5 flex items-start gap-2 border border-sushi-border/40">
                    <Storefront size={15} className="text-sushi-gold mt-0.5 shrink-0" />
                    <div className="min-w-0 text-xs">
                      <span className="font-semibold text-sushi-text block truncate">
                        {rule.branch?.name || rule.branchId}
                      </span>
                      <span className="text-2xs text-sushi-text-muted block truncate">
                        {rule.branch?.address || 'Chưa cập nhật địa chỉ'}
                      </span>
                    </div>
                  </div>

                  {/* Hành động */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-sushi-border/40">
                    <Button
                      size="small"
                      icon={<PencilSimple size={14} />}
                      onClick={() => handleOpenEdit(rule)}
                      className="rounded-lg text-xs font-medium border-sushi-border/70 text-sushi-gold hover:text-amber-400 h-8"
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<Trash size={14} />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Xóa cấu hình phí ship?',
                          content: `Bạn có chắc muốn xóa phí ship cho ${rule.ward}, ${rule.district}?`,
                          okText: 'Xác nhận xóa',
                          cancelText: 'Hủy',
                          okType: 'danger',
                          onOk: () => deleteMutation.mutate(rule.id),
                        });
                      }}
                      className="rounded-lg text-xs font-medium h-8"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang Mobile */}
            {rules.length > mobilePageSize && (
              <div className="flex justify-center pt-2">
                <Pagination
                  current={mobilePage}
                  pageSize={mobilePageSize}
                  total={rules.length}
                  onChange={(page) => setMobilePage(page)}
                  size="small"
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Thêm / Sửa */}
      <Modal
        open={isModalOpen}
        title={
          <div className="font-bold text-base text-sushi-text flex items-center gap-2">
            <Truck size={20} className="text-sushi-gold" />
            <span>
              {editingRule
                ? 'Chỉnh Sửa Phí Giao Hàng'
                : 'Thêm Cấu Hình Phí Giao Hàng Mới'}
            </span>
          </div>
        }
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={upsertMutation.isPending}
        okText="Lưu cấu hình"
        cancelText="Hủy"
        className="[&_.ant-modal-content]:bg-sushi-card [&_.ant-modal-content]:border [&_.ant-modal-content]:border-sushi-border/80"
      >
        <Form form={form} layout="vertical" className="pt-3 space-y-1">
          <Form.Item
            name="branchId"
            label={<span className="text-xs font-semibold text-sushi-text">Chi Nhánh Phục Vụ</span>}
            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
          >
            <Select
              placeholder="Chọn chi nhánh"
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
                    Phường / Xã (Chọn chuẩn TP.HCM)
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã' }]}
              >
                <Select
                  showSearch
                  placeholder="Gõ tên mới hoặc cũ (Bến Nghé, Đa Kao...)"
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
                    Khu Vực / Quận (tham chiếu)
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập/chọn khu vực' }]}
              >
                <Input placeholder="Tự động điền theo phường/xã" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fee"
            label={<span className="text-xs font-semibold text-sushi-text">Mức Phí Giao Hàng (VNĐ)</span>}
            rules={[{ required: true, message: 'Nhập số tiền phí ship' }]}
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
                label={<span className="text-xs font-semibold text-sushi-text">Chi nhánh mặc định</span>}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label={<span className="text-xs font-semibold text-sushi-text">Đang phục vụ</span>}
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
