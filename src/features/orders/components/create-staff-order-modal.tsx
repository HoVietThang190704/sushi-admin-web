'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  App,
  ResponsiveModalDrawer,
} from '@/components/ui';
import {
  User,
  Phone,
  MapPin,
  ForkKnife,
  Trash,
  Plus,
  Minus,
  Receipt,
  Coins,
  QrCode,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  PencilSimple,
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

const STEP_ITEMS = [
  { key: 0, label: 'Giao hàng', icon: MapPin },
  { key: 1, label: 'Chọn món', icon: ForkKnife },
  { key: 2, label: 'Xác nhận', icon: Receipt },
] as const;

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

  const [currentStep, setCurrentStep] = useState<number>(0);

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

  // Watch form fields for live summary & shipping calculation
  const customerName = Form.useWatch('customerName', form);
  const customerPhone = Form.useWatch('customerPhone', form);
  const address = Form.useWatch('address', form);
  const selectedDistrict = Form.useWatch('district', form);
  const selectedWard = Form.useWatch('ward', form);
  const selectedBranchId = Form.useWatch('branchId', form);
  const selectedPaymentMethod = Form.useWatch('paymentMethod', form) || 'CASH';

  const selectedBranchName = useMemo(() => {
    if (!selectedBranchId) return '';
    return branches.find((b) => b.id === selectedBranchId)?.name || '';
  }, [branches, selectedBranchId]);

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
  const handleAddDish = (productIdOverride?: string) => {
    const targetId = productIdOverride ?? selectedDishToAdd;
    if (!targetId) return;
    const product = activeProducts.find((p) => p.id === targetId);
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

  const handleQuantityStep = (productId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          return {
            ...item,
            quantity: nextQty,
            subtotal: nextQty * item.unitPrice,
          };
        })
        .filter((item): item is SelectedDishItem => item !== null),
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

  const totalQuantity = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems],
  );

  const finalTotal = itemsSubtotal + shippingFee;

  // Validate current step before moving forward
  const handleNextStep = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields([
          'customerName',
          'customerPhone',
          'district',
          'ward',
          'address',
          'branchId',
        ]);
        setCurrentStep(1);
      } catch {
        // Antd Form highlights invalid fields
      }
      return;
    }

    if (currentStep === 1) {
      if (selectedItems.length === 0) {
        message.warning('Vui lòng chọn ít nhất 1 món ăn để tiếp tục!');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    if (targetStep === 1) {
      await handleNextStep();
      return;
    }
    if (targetStep === 2) {
      try {
        await form.validateFields([
          'customerName',
          'customerPhone',
          'district',
          'ward',
          'address',
          'branchId',
        ]);
        if (selectedItems.length === 0) {
          setCurrentStep(1);
          message.warning('Vui lòng chọn ít nhất 1 món ăn trước khi xác nhận!');
          return;
        }
        setCurrentStep(2);
      } catch {
        setCurrentStep(0);
      }
    }
  };

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
      setCurrentStep(1);
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
      requiredMark={false}
      className="space-y-4"
    >
      {/* =====================================================================
          THANH TIẾN TRÌNH SEGMENTED 3 BƯỚC (ĐỒNG BỘ TÔNG TỐI SANG TRỌNG)
         ===================================================================== */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-sushi-bg/90 border border-sushi-border/80">
        {STEP_ITEMS.map((step) => {
          const IconComponent = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = currentStep > step.key;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => void handleStepClick(step.key)}
              className={`flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-sushi-card text-white border border-sushi-border shadow-sm'
                  : isCompleted
                    ? 'text-sushi-text-muted hover:text-white'
                    : 'text-sushi-text-dim hover:text-sushi-text-muted'
                }`}
            >
              {isCompleted ? (
                <CheckCircle
                  size={15}
                  weight="fill"
                  className="text-sushi-gold shrink-0"
                />
              ) : (
                <IconComponent
                  size={15}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-sushi-primary shrink-0' : 'shrink-0'}
                />
              )}
              <span className="truncate">
                {step.key + 1}. {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          BƯỚC 1: THÔNG TIN KHÁCH HÀNG & ĐỊA CHỈ GIAO HÀNG (PHẲNG, GỌN)
         ===================================================================== */}
      <div className={currentStep === 0 ? 'space-y-3' : 'hidden'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <Form.Item
            name="customerName"
            label={
              <span className="text-xs font-medium text-sushi-text-muted">
                Tên khách hàng <span className="text-sushi-primary">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
            className="!mb-0"
          >
            <Input
              placeholder="Ví dụ: Nguyễn Văn A"
              prefix={<User size={15} className="text-sushi-text-dim mr-1" />}
              className="rounded-xl h-10 !bg-sushi-surface !border-sushi-border"
            />
          </Form.Item>

          <Form.Item
            name="customerPhone"
            label={
              <span className="text-xs font-medium text-sushi-text-muted">
                Số điện thoại <span className="text-sushi-primary">*</span>
              </span>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              {
                pattern: VIETNAM_PHONE_REGEX,
                message: 'Số điện thoại 10 chữ số hợp lệ',
              },
            ]}
            className="!mb-0"
          >
            <Input
              placeholder="Ví dụ: 0901234567"
              prefix={<Phone size={15} className="text-sushi-text-dim mr-1" />}
              className="rounded-xl h-10 !bg-sushi-surface !border-sushi-border"
            />
          </Form.Item>
        </div>

        {/* Quận/Huyện & Phường/Xã nằm trên 2 cột ngang ngay cả trên Mobile */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <Form.Item
            name="district"
            label={
              <span className="text-xs font-medium text-sushi-text-muted">
                Quận / Huyện <span className="text-sushi-primary">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Chọn Quận/Huyện' }]}
            className="!mb-0"
          >
            <Select
              placeholder="Chọn Quận"
              options={districtOptions}
              showSearch
              onChange={() => form.setFieldValue('ward', undefined)}
              className="h-10 w-full"
            />
          </Form.Item>

          <Form.Item
            name="ward"
            label={
              <span className="text-xs font-medium text-sushi-text-muted">
                Phường / Xã <span className="text-sushi-primary">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Chọn Phường/Xã' }]}
            className="!mb-0"
          >
            <Select
              placeholder="Chọn Phường"
              options={wardOptions}
              showSearch
              disabled={!selectedDistrict}
              className="h-10 w-full"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="address"
          label={
            <span className="text-xs font-medium text-sushi-text-muted">
              Số nhà, tên đường, tòa nhà <span className="text-sushi-primary">*</span>
            </span>
          }
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          className="!mb-0"
        >
          <Input
            placeholder="Ví dụ: 56/3 Lê Lợi, Khu phố 1"
            prefix={<MapPin size={15} className="text-sushi-text-dim mr-1" />}
            className="rounded-xl h-10 !bg-sushi-surface !border-sushi-border"
          />
        </Form.Item>

        <Form.Item
          name="branchId"
          label={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-sushi-text-muted">
                Chi nhánh chuẩn bị món <span className="text-sushi-primary">*</span>
              </span>
              {selectedWard && (
                <span className="text-2xs font-mono text-sushi-gold">
                  Phí ship:{' '}
                  {isCalculatingFee ? 'Đang tính...' : formatCurrency(shippingFee)}
                </span>
              )}
            </div>
          }
          rules={[{ required: true, message: 'Vui lòng chọn chi nhánh phục vụ' }]}
          className="!mb-0"
        >
          <Select
            placeholder="Chọn chi nhánh chuẩn bị"
            options={branches.map((b) => ({
              label: `${b.name} (${b.address})`,
              value: b.id,
            }))}
            className="h-10 w-full"
          />
        </Form.Item>
      </div>

      {/* =====================================================================
          BƯỚC 2: CHỌN MÓN ĂN VÀO ĐƠN
         ===================================================================== */}
      <div className={currentStep === 1 ? 'space-y-3' : 'hidden'}>
        {/* Thanh tìm và bấm chọn món ngay */}
        <div className="flex items-center gap-2">
          <Select
            placeholder="Tìm món ăn để thêm vào đơn..."
            options={activeProducts.map((p) => ({
              label: `${p.name} — ${formatCurrency(Number(p.sellingPrice))}`,
              value: p.id,
            }))}
            value={selectedDishToAdd}
            onChange={(val) => {
              setSelectedDishToAdd(val);
              handleAddDish(val);
            }}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            className="flex-1 min-w-0 h-10"
            loading={isLoadingProducts}
          />
        </div>

        {selectedItems.length === 0 ? (
          <div className="text-center py-10 text-sushi-text-dim text-xs border border-dashed border-sushi-border rounded-2xl bg-sushi-surface/40 px-4">
            <ForkKnife size={24} className="mx-auto mb-2 text-sushi-text-dim/70" />
            Chưa có món nào trong giỏ. Chọn món ở ô tìm kiếm phía trên để tự động thêm vào đơn.
          </div>
        ) : (
          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-0.5">
            {selectedItems.map((record) => (
              <div
                key={record.productId}
                className="p-3 rounded-xl bg-sushi-surface border border-sushi-border/80 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs sm:text-sm text-sushi-text truncate">
                    {record.productName}
                  </div>
                  <div className="text-xs font-mono text-sushi-text-dim mt-0.5 flex items-center gap-1.5">
                    <span>{formatCurrency(record.unitPrice)}</span>
                    <span>→</span>
                    <span className="text-sushi-gold font-semibold">
                      {formatCurrency(record.subtotal)}
                    </span>
                  </div>
                </div>

                {/* Bộ nút tăng/giảm số lượng chuẩn cảm ứng */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="inline-flex items-center rounded-lg bg-sushi-card border border-sushi-border p-0.5">
                    <button
                      type="button"
                      onClick={() => handleQuantityStep(record.productId, -1)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface transition-colors cursor-pointer"
                      aria-label="Giảm số lượng"
                    >
                      <Minus size={13} weight="bold" />
                    </button>
                    <span className="w-7 text-center font-mono text-xs font-bold text-sushi-text">
                      {record.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityStep(record.productId, 1)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-sushi-text-muted hover:text-white hover:bg-sushi-surface transition-colors cursor-pointer"
                      aria-label="Tăng số lượng"
                    >
                      <Plus size={13} weight="bold" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(record.productId)}
                    aria-label="Xóa món"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sushi-text-dim hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 rounded-xl bg-sushi-surface/80 border border-sushi-border/80 flex items-center justify-between text-xs">
          <span className="text-sushi-text-muted">
            Đã chọn <strong className="text-sushi-text">{selectedItems.length}</strong> món (
            {totalQuantity} phần)
          </span>
          <span className="font-mono font-bold text-sm text-sushi-gold">
            {formatCurrency(itemsSubtotal)}
          </span>
        </div>
      </div>

      {/* =====================================================================
          BƯỚC 3: XÁC NHẬN ĐƠN HÀNG & THANH TOÁN (GỌN, SANG TRỌNG, KHÔNG LỒNG HỘP)
         ===================================================================== */}
      <div className={currentStep === 2 ? 'space-y-3.5' : 'hidden'}>
        {/* 1. Thẻ Biên Lai Tóm Tắt (Gộp Người nhận + Món ăn + Tổng tiền) */}
        <div className="rounded-2xl bg-sushi-surface/90 border border-sushi-border divide-y divide-sushi-border/60 overflow-hidden">
          {/* Phần A: Người nhận & Địa chỉ */}
          <div className="p-3.5 flex items-start justify-between gap-2.5 text-xs">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-sushi-text">
                  {customerName || 'Khách hàng'}
                </span>
                <span className="text-sushi-text-dim">·</span>
                <span className="font-mono font-semibold text-sushi-gold">
                  {customerPhone}
                </span>
              </div>
              <div className="text-sushi-text-muted leading-relaxed">
                {[address, selectedWard, selectedDistrict].filter(Boolean).join(', ')}
              </div>
              {selectedBranchName && (
                <div className="text-2xs text-sushi-text-dim">
                  Chi nhánh: <span className="text-sushi-text-muted">{selectedBranchName}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="px-2.5 py-1 rounded-lg border border-sushi-border bg-sushi-card text-2xs font-medium text-sushi-text-muted hover:text-white inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <PencilSimple size={12} />
              Sửa
            </button>
          </div>

          {/* Phần B: Danh sách món rút gọn */}
          <div className="p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xs font-semibold uppercase tracking-wider text-sushi-text-dim">
                Thực đơn ({selectedItems.length} món · {totalQuantity} phần)
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-2xs text-sushi-gold hover:underline cursor-pointer"
              >
                Sửa món
              </button>
            </div>
            {selectedItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-2 text-sushi-text-muted"
              >
                <span className="truncate">
                  <strong className="font-mono text-sushi-text">{item.quantity}x</strong>{' '}
                  {item.productName}
                </span>
                <span className="font-mono text-sushi-text shrink-0">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Phần C: Tiền món + Phí ship + Tổng cộng */}
          <div className="p-3.5 bg-sushi-bg/40 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-sushi-text-muted">
              <span>Tiền món:</span>
              <span className="font-mono">{formatCurrency(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sushi-text-muted">
              <span>Phí giao hàng:</span>
              <span className="font-mono">
                {isCalculatingFee ? 'Đang tính...' : formatCurrency(shippingFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-sushi-border/60 flex justify-between items-baseline">
              <span className="text-sm font-bold text-sushi-text">Tổng thanh toán:</span>
              <span className="font-mono font-bold text-base text-sushi-gold">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Chọn Phương Thức Thanh Toán (2 Thẻ Bấm Ngang Hiện Đại) */}
        <Form.Item name="paymentMethod" hidden>
          <Input />
        </Form.Item>
        <div>
          <div className="text-xs font-medium text-sushi-text-muted mb-2">
            Phương thức thanh toán
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => form.setFieldValue('paymentMethod', 'CASH')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${selectedPaymentMethod === 'CASH'
                  ? 'border-sushi-gold bg-sushi-gold/10 text-white shadow-sm'
                  : 'border-sushi-border bg-sushi-surface text-sushi-text-muted hover:text-white'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'CASH'
                    ? 'bg-sushi-gold/20 text-sushi-gold'
                    : 'bg-sushi-card text-sushi-text-dim'
                  }`}
              >
                <Coins size={18} weight="fill" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Tiền mặt</div>
                <div className="text-2xs text-sushi-text-dim truncate">Thu COD</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => form.setFieldValue('paymentMethod', 'VIETQR')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${selectedPaymentMethod === 'VIETQR'
                  ? 'border-blue-400 bg-blue-500/10 text-white shadow-sm'
                  : 'border-sushi-border bg-sushi-surface text-sushi-text-muted hover:text-white'
                }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'VIETQR'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-sushi-card text-sushi-text-dim'
                  }`}
              >
                <QrCode size={18} weight="fill" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Chuyển khoản</div>
                <div className="text-2xs text-sushi-text-dim truncate">Mã VietQR</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Ghi chú đơn hàng (Phẳng, không đóng khung lồng nhau) */}
        <Form.Item
          name="note"
          label={
            <span className="text-xs font-medium text-sushi-text-muted">
              Ghi chú đơn hàng (không bắt buộc)
            </span>
          }
          className="!mb-0"
        >
          <Input.TextArea
            rows={2}
            placeholder="Ví dụ: Không cay, lấy thêm gừng hồng, giao giờ hành chính..."
            className="rounded-xl !bg-sushi-surface !border-sushi-border text-xs"
          />
        </Form.Item>
      </div>

      {/* =====================================================================
          THANH NÚT ĐIỀU HƯỚNG DƯỚI ĐÁY (DÀN ĐỀU CÂN ĐỐI, KHÔNG LỆCH VIỀN)
         ===================================================================== */}
      <div className="flex items-center gap-2.5 pt-3 border-t border-sushi-border/70">
        {currentStep === 0 ? (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-4 rounded-xl border border-sushi-border bg-sushi-surface text-sushi-text-muted hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            Hủy bỏ
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className="h-11 px-4 rounded-xl border border-sushi-border bg-sushi-surface text-sushi-text-muted hover:text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={15} />
            <span>Quay lại</span>
          </button>
        )}

        {currentStep < 2 ? (
          <button
            type="button"
            onClick={() => void handleNextStep()}
            className="flex-1 h-11 px-5 rounded-xl bg-gradient-to-r from-sushi-primary to-[#b91c1c] hover:brightness-110 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>
              {currentStep === 0
                ? 'Tiếp tục: Chọn món'
                : `Tiếp tục: Xác nhận (${selectedItems.length} món)`}
            </span>
            <ArrowRight size={16} weight="bold" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={selectedItems.length === 0 || createStaffOrderMutation.isPending}
            className="flex-1 h-11 px-5 rounded-xl bg-gradient-to-r from-sushi-primary to-[#b91c1c] hover:brightness-110 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>
              {createStaffOrderMutation.isPending
                ? 'Đang tạo đơn...'
                : `Hoàn tất tạo đơn · ${formatCurrency(finalTotal)}`}
            </span>
          </button>
        )}
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
    <ResponsiveModalDrawer
      open={open}
      onClose={onCancel}
      width={680}
      maxHeight="92vh"
      destroyOnHidden
      title={
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-sushi-primary/15 border border-sushi-primary/30 text-sushi-primary flex items-center justify-center shrink-0">
            <Receipt size={16} weight="fill" />
          </div>
          <span className="truncate sm:hidden">Tạo Đơn Qua Điện Thoại</span>
          <span className="hidden sm:inline truncate">
            Tạo Đơn Hàng Giao Tận Nơi Qua Điện Thoại
          </span>
        </div>
      }
    >
      {open && <StaffOrderForm onCancel={onCancel} onSuccess={onSuccess} />}
    </ResponsiveModalDrawer>
  );
}
