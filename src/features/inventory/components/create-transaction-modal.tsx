'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Radio,
} from '@/components/ui';
import { Ingredient, CreateTransactionInput, TransactionType } from '../types';
import { createTransactionSchema } from '../schemas/inventory.schema';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';

interface CreateTransactionModalProps {
  open: boolean;
  defaultType?: TransactionType;
  selectedIngredient?: Ingredient | null;
  ingredients: Ingredient[];
  onClose: () => void;
  onSubmit: (dto: CreateTransactionInput) => Promise<void>;
}

export function CreateTransactionModal({
  open,
  defaultType = 'IN',
  selectedIngredient,
  ingredients,
  onClose,
  onSubmit,
}: CreateTransactionModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateTransactionInput>();
  const [submitting, setSubmitting] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(defaultType);

  const watchedIngredientId = Form.useWatch('ingredientId', form);

  // Tìm nguyên liệu đang được chọn trong Form
  const currentIngredient = useMemo(() => {
    const id = watchedIngredientId || selectedIngredient?.id;
    return ingredients.find((item) => item.id === id) || selectedIngredient || null;
  }, [watchedIngredientId, selectedIngredient, ingredients]);

  useEffect(() => {
    if (open) {
      setTransactionType(defaultType);
      form.setFieldsValue({
        type: defaultType,
        ingredientId: selectedIngredient?.id,
        reason: defaultType === 'IN' ? 'PURCHASE' : 'KITCHEN_USAGE',
        unitPrice: selectedIngredient?.costPrice || 0,
        quantity: 1,
      });
    } else {
      form.resetFields();
    }
  }, [open, defaultType, selectedIngredient, form]);

  const handleSubmit = async (values: CreateTransactionInput) => {
    try {
      setSubmitting(true);
      await onSubmit({
        ...values,
        type: transactionType,
        quantity: Number(values.quantity),
        unitPrice: values.unitPrice !== undefined ? Number(values.unitPrice) : undefined,
      });
      form.resetFields();
      onClose();
    } catch {
      // Error is handled in mutation hook
    } finally {
      setSubmitting(false);
    }
  };

  const reasonOptions = useMemo(() => {
    if (transactionType === 'IN') {
      return [
        { value: 'PURCHASE', label: t('dashboard.reasonPurchase') },
        { value: 'INITIAL_STOCK', label: t('dashboard.reasonInitialStock') },
        { value: 'ADJUSTMENT', label: t('dashboard.reasonAdjustment') },
      ];
    }
    return [
      { value: 'KITCHEN_USAGE', label: t('dashboard.reasonKitchenUsage') },
      { value: 'DISCARD_WASTE', label: t('dashboard.reasonDiscardWaste') },
      { value: 'ADJUSTMENT', label: t('dashboard.reasonAdjustment') },
    ];
  }, [transactionType, t]);

  return (
    <Modal
      title={
        transactionType === 'IN'
          ? t('dashboard.modalStockInTitle')
          : t('dashboard.modalStockOutTitle')
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: defaultType,
          reason: defaultType === 'IN' ? 'PURCHASE' : 'KITCHEN_USAGE',
        }}
      >
        {/* Lựa chọn loại phiếu Nhập / Xuất */}
        <Form.Item label={t('dashboard.transactionType')}>
          <Radio.Group
            value={transactionType}
            onChange={(e) => {
              const newType = e.target.value as TransactionType;
              setTransactionType(newType);
              form.setFieldValue('type', newType);
              form.setFieldValue(
                'reason',
                newType === 'IN' ? 'PURCHASE' : 'KITCHEN_USAGE',
              );
            }}
            buttonStyle="solid"
            className="w-full"
          >
            <Radio.Button value="IN" className="w-1/2 text-center">
              {t('dashboard.stockIn')} (+ IN)
            </Radio.Button>
            <Radio.Button value="OUT" className="w-1/2 text-center">
              {t('dashboard.stockOut')} (- OUT)
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Chọn nguyên vật liệu */}
        <Form.Item
          name="ingredientId"
          label={t('dashboard.selectIngredient')}
          rules={[createZodRule(createTransactionSchema, 'ingredientId')]}
        >
          <Select
            showSearch
            placeholder={t('dashboard.selectIngredientPlaceholder')}
            optionFilterProp="label"
            options={ingredients.map((item) => ({
              value: item.id,
              label: `${item.name} (${item.code}) - Tồn: ${item.currentStock} ${item.unit}`,
            }))}
            onChange={(id) => {
              const matched = ingredients.find((i) => i.id === id);
              if (matched && transactionType === 'IN') {
                form.setFieldValue('unitPrice', matched.costPrice);
              }
            }}
          />
        </Form.Item>

        {/* Hiển thị tồn kho hiện có nếu là Xuất kho */}
        {transactionType === 'OUT' && currentIngredient && (
          <div className="mb-4 p-3 rounded-xl bg-sushi-surface/80 border border-sushi-border flex items-center justify-between text-xs font-mono">
            <span className="text-sushi-text-muted">Tồn kho khả dụng hiện tại:</span>
            <span
              className={`font-bold ${
                currentIngredient.currentStock <= 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {currentIngredient.currentStock} {currentIngredient.unit}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Số lượng */}
          <Form.Item
            name="quantity"
            label={`${t('dashboard.quantity')} (${currentIngredient?.unit || 'ĐVT'})`}
            rules={[createZodRule(createTransactionSchema, 'quantity')]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.001}
              step={0.5}
              placeholder="1"
            />
          </Form.Item>

          {/* Đơn giá (chỉ hiện khi Nhập kho) */}
          {transactionType === 'IN' ? (
            <Form.Item
              name="unitPrice"
              label={t('dashboard.unitPrice')}
              rules={[createZodRule(createTransactionSchema, 'unitPrice')]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={1000}
                placeholder="0"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="reason"
              label={t('dashboard.reason')}
              rules={[createZodRule(createTransactionSchema, 'reason')]}
            >
              <Select options={reasonOptions} />
            </Form.Item>
          )}
        </div>

        {transactionType === 'IN' && (
          <Form.Item
            name="reason"
            label={t('dashboard.reason')}
            rules={[createZodRule(createTransactionSchema, 'reason')]}
          >
            <Select options={reasonOptions} />
          </Form.Item>
        )}

        {/* Ghi chú */}
        <Form.Item name="note" label={t('dashboard.note')}>
          <Input.TextArea
            rows={2}
            placeholder="Nhập thông tin nhà cung cấp hoặc lý do xuất/nhập cụ thể..."
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className={transactionType === 'OUT' ? 'bg-amber-600 border-amber-600' : ''}
            >
              {transactionType === 'IN' ? t('dashboard.stockIn') : t('dashboard.stockOut')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
