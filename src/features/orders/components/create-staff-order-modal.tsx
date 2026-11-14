'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Table,
  App,
  Divider,
  Radio,
} from 'antd';
import {
  User,
  Phone,
  MapPin,
  ForkKnife,
  Trash,
  Plus,
  Receipt,
  Coins,
  QrCode,
} from '@phosphor-icons/react';
import { useCreateStaffOrder } from '../hooks/use-orders';
import { useProducts } from '@/features/catalog/hooks/use-products';
import {
  fetchShippingLocations,
  fetchBranches,
  calculateShippingFee,
} from '@/features/shipping/api/shipping.api';
import { useFormatCurrency } from '@/lib/hooks/use-format-currency';

interface CreateStaffOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

interface SelectedDishItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

const VIETNAM_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$/;

function StaffOrderForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess?: () => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { formatCurrency } = useFormatCurrency();
  const createStaffOrderMutation = useCreateStaffOrder();

  const { data: allProducts = [], isLoading: isLoadingProducts } = useProducts();
  const [locations, setLocations] = useState<
    Array<{
      district: string;
      ward: string;
      wardCode?: string;
      formerWards?: string;
      isSupported: boolean;
    }>
  >([]);
  const [branches, setBranches] = useState<
    Array<{ id: string; code: string; name: string; address: string }>
  >([]);

  // Selected items state
  const [selectedItems, setSelectedItems] = useState<SelectedDishItem[]>([]);
  const [selectedDishToAdd, setSelectedDishToAdd] = useState<string | null>(null);

  // Raw calculated shipping fee
  const [fetchedShippingFee, setFetchedShippingFee] = useState<number>(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);

  // Active products only
  const activeProducts = useMemo(
    () => allProducts.filter((p) => p.isActive),
    [allProducts],
  );

  // Load locations and branches on mount
  useEffect(() => {
    let active = true;
    fetchShippingLocations().then((locs) => {
      if (active) setLocations(locs || []);
    });
    fetchBranches().then((brs) => {
      if (active) setBranches(brs || []);
    });
    return () => {
      active = false;
    };
  }, []);

  // Derived districts list
  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((l) => {
      if (l.district) set.add(l.district);
    });
    return Array.from(set).map((d) => ({ label: d, value: d }));
  }, [locations]);

  // Watch form fields
  const selectedDistrict = Form.useWatch('district', form);
  const selectedWard = Form.useWatch('ward', form);
  const selectedBranchId = Form.useWatch('branchId', form);

  // Derived wards list based on selected district
  const wardOptions = useMemo(() => {
    if (!selectedDistrict) return [];
    return locations
      .filter((l) => l.district === selectedDistrict)
      .map((l) => ({
        label: `${l.ward} ${l.isSupported ? '' : '(Chưa hỗ trợ)'}`,
        value: l.ward,
        disabled: !l.isSupported,
      }));
  }, [locations, selectedDistrict]);

  // Shipping fee is 0 if no ward is selected
  const shippingFee = selectedWard ? fetchedShippingFee : 0;

  // Re-calculate shipping fee when Ward or Branch changes
  useEffect(() => {
    if (!selectedWard) return;

    let isMounted = true;
    async function updateFee() {
      setIsCalculatingFee(true);
      try {
        const res = await calculateShippingFee({
          district: selectedDistrict,
          ward: selectedWard,
          branchId: selectedBranchId,
        });
        if (isMounted) {
          setFetchedShippingFee(res.fee || 0);
          if (res.branch?.id && !selectedBranchId) {
            form.setFieldValue('branchId', res.branch.id);
          }
        }
      } catch (err) {
        console.error('Calculate shipping fee error:', err);
      } finally {
        if (isMounted) setIsCalculatingFee(false);
      }
    }

    updateFee();
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, selectedWard, selectedBranchId, form]);

  // Add dish to order
  const handleAddDish = () => {
    if (!selectedDishToAdd) return;
    const product = activeProducts.find((p) => p.id === selectedDishToAdd);
    if (!product) return;

    const existingIndex = selectedItems.findIndex(
      (item) => item.productId === product.id,
    );

    if (existingIndex >= 0) {
      const copy = [...selectedItems];
      copy[existingIndex].quantity += 1;
      copy[existingIndex].subtotal =
        copy[existingIndex].quantity * copy[existingIndex].unitPrice;
      setSelectedItems(copy);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: Number(product.sellingPrice),
          quantity: 1,
          subtotal: Number(product.sellingPrice),
        },
      ]);
    }

    setSelectedDishToAdd(null);
  };

  const handleQuantityChange = (productId: string, qty: number | null) => {
    const quantity = Math.max(1, qty || 1);
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, subtotal: quantity * item.unitPrice }
          : item,
      ),
    );
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Subtotal and total calculation
  const itemsSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [selectedItems],
  );

  const finalTotal = itemsSubtotal + shippingFee;

  // Handle submit
  const handleSubmit = async (values: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: string;
    district: string;
    ward: string;
    branchId: string;
    paymentMethod: string;
    note?: string;
  }) => {
    if (selectedItems.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 món ăn vào đơn hàng!');
      return;
    }

    try {
      await createStaffOrderMutation.mutateAsync({
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        customerEmail: values.customerEmail?.trim() || undefined,
        address: values.address.trim(),
        province: 'TP. Hồ Chí Minh',
        district: values.district,
        ward: values.ward,
        branchId: values.branchId,
        paymentMethod: values.paymentMethod || 'CASH',
        note: values.note?.trim() || undefined,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      message.success('Tạo đơn hàng qua điện thoại thành công!');
      onCancel();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo đơn hàng thất bại';
      message.error(msg);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        paymentMethod: 'CASH',
      }}
      className="space-y-4 pt-2"
    >
      {/* Section 1: Thông tin khách hàng */}
      <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <User size={15} className="text-primary" />
          Thông tin người nhận
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="customerName"
            label="Tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
            className="mb-2"
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="customerPhone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              {
                pattern: VIETNAM_PHONE_REGEX,
                message: 'Số điện thoại Việt Nam không hợp lệ (10 chữ số)',
              },
            ]}
            className="mb-2"
          >
            <Input
              placeholder="Ví dụ: 0901234567"
              prefix={<Phone size={15} className="text-muted-foreground mr-1" />}
            />
          </Form.Item>
        </div>
      </div>

      {/* Section 2: Địa chỉ giao hàng & Chi nhánh phục vụ */}
      <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <MapPin size={15} className="text-primary" />
          Địa chỉ giao hàng & Chi nhánh phục vụ
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <Form.Item
            name="district"
            label="Quận / Huyện (TP.HCM)"
            rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện' }]}
            className="mb-2"
          >
            <Select
              placeholder="Chọn Quận/Huyện"
              options={districtOptions}
              showSearch
              onChange={() => form.setFieldValue('ward', undefined)}
            />
          </Form.Item>

          <Form.Item
            name="ward"
            label="Phường / Xã"
            rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã' }]}
            className="mb-2"
          >
            <Select
              placeholder="Chọn Phường/Xã"
              options={wardOptions}
              showSearch
              disabled={!selectedDistrict}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="address"
            label="Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà...)"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
            className="mb-2"
          >
            <Input placeholder="Ví dụ: 123 Lê Lợi, P. Bến Nghé" />
          </Form.Item>

          <Form.Item
            name="branchId"
            label="Chi nhánh chuẩn bị món"
            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh phục vụ' }]}
            className="mb-2"
          >
            <Select
              placeholder="Chọn chi nhánh chuẩn bị"
              options={branches.map((b) => ({
                label: `${b.name} (${b.address})`,
                value: b.id,
              }))}
            />
          </Form.Item>
        </div>
      </div>

      {/* Section 3: Chọn món ăn vào đơn */}
      <div className="border border-border/80 rounded-xl p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ForkKnife size={15} className="text-primary" />
            Món ăn đã chọn ({selectedItems.length})
          </h4>

          {/* Quick add product picker */}
          <div className="flex items-center gap-2">
            <Select
              placeholder="Chọn món thêm vào đơn..."
              options={activeProducts.map((p) => ({
                label: `${p.name} - ${formatCurrency(Number(p.sellingPrice))}`,
                value: p.id,
              }))}
              value={selectedDishToAdd}
              onChange={setSelectedDishToAdd}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              className="w-56 sm:w-64"
              loading={isLoadingProducts}
            />
            <Button
              type="primary"
              icon={<Plus size={15} />}
              onClick={handleAddDish}
              disabled={!selectedDishToAdd}
            >
              Thêm món
            </Button>
          </div>
        </div>

        {selectedItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border/80 rounded-lg">
            Chưa có món nào được chọn. Vui lòng chọn món ở ô trên và bấm &quot;Thêm món&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              dataSource={selectedItems}
              rowKey="productId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Món ăn',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (text) => <span className="font-medium text-xs">{text}</span>,
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  width: 110,
                  align: 'right',
                  render: (val) => (
                    <span className="text-xs font-mono">{formatCurrency(val)}</span>
                  ),
                },
                {
                  title: 'SL',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 90,
                  align: 'center',
                  render: (qty, record) => (
                    <InputNumber
                      min={1}
                      max={99}
                      size="small"
                      value={qty}
                      onChange={(val) => handleQuantityChange(record.productId, val)}
                      className="w-16"
                    />
                  ),
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  width: 120,
                  align: 'right',
                  render: (val) => (
                    <span className="font-semibold text-xs text-primary font-mono">
                      {formatCurrency(val)}
                    </span>
                  ),
                },
                {
                  title: '',
                  key: 'action',
                  width: 45,
                  align: 'center',
                  render: (_, record) => (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(record.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash size={15} />
                    </button>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Section 4: Phương thức thanh toán & Ghi chú */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
          className="mb-0 bg-muted/40 p-3 rounded-xl border border-border/60"
        >
          <Radio.Group className="w-full space-y-2 mt-1">
            <div className="flex items-center gap-2">
              <Radio value="CASH">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <Coins size={16} className="text-amber-500" />
                  Tiền mặt khi nhận hàng (COD)
                </span>
              </Radio>
            </div>
            <div className="flex items-center gap-2">
              <Radio value="VIETQR">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <QrCode size={16} className="text-blue-500" />
                  Chuyển khoản ngân hàng (VietQR)
                </span>
              </Radio>
            </div>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="note"
          label="Ghi chú đơn hàng"
          className="mb-0 bg-muted/40 p-3 rounded-xl border border-border/60"
        >
          <Input.TextArea
            rows={3}
            placeholder="Ghi chú yêu cầu đặc biệt của khách (không cay, nhiều gừng...)"
          />
        </Form.Item>
      </div>

      {/* Summary box */}
      <div className="p-3.5 rounded-xl bg-card border border-primary/20 space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Tiền món ({selectedItems.length} món):</span>
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(itemsSubtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Phí giao hàng:</span>
          <span className="font-mono font-medium text-foreground">
            {isCalculatingFee ? 'Đang tính...' : formatCurrency(shippingFee)}
          </span>
        </div>

        <Divider className="my-1.5" />

        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-foreground">Tổng thanh toán:</span>
          <span className="text-primary font-mono text-base">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2.5 pt-2">
        <Button onClick={onCancel}>Hủy bỏ</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={createStaffOrderMutation.isPending}
          disabled={selectedItems.length === 0}
          className="px-6 font-semibold"
        >
          Tạo Đơn Hàng ({formatCurrency(finalTotal)})
        </Button>
      </div>
    </Form>
  );
}

export function CreateStaffOrderModal({
  open,
  onCancel,
  onSuccess,
}: CreateStaffOrderModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2.5 text-base font-bold text-foreground">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Receipt size={20} weight="duotone" />
          </div>
          <span>Tạo Đơn Hàng Giao Tận Nơi Qua Điện Thoại</span>
        </div>
      }
      footer={null}
      width={780}
      destroyOnHidden
      className="max-w-[95vw]"
    >
      {open && <StaffOrderForm onCancel={onCancel} onSuccess={onSuccess} />}
    </Modal>
  );
}
