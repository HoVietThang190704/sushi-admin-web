'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
} from '@/components/ui';
import { CreateIngredientInput } from '../types';
import { createIngredientSchema } from '../schemas/inventory.schema';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';

interface CreateIngredientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateIngredientInput) => Promise<void>;
}

export function CreateIngredientModal({
  open,
  onClose,
  onSubmit,
}: CreateIngredientModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateIngredientInput>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: CreateIngredientInput) => {
    try {
      setSubmitting(true);
      await onSubmit({
        ...values,
        costPrice: Number(values.costPrice || 0),
        minStock: Number(values.minStock || 0),
        initialStock: values.initialStock ? Number(values.initialStock) : undefined,
      });
      form.resetFields();
      onClose();
    } catch {
      // Error is handled in mutation hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t('dashboard.modalCreateIngredientTitle')}
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
        initialValues={{ costPrice: 0, minStock: 5, initialStock: 0 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="code"
            label={t('dashboard.ingredientCode')}
            rules={[createZodRule(createIngredientSchema, 'code')]}
          >
            <Input placeholder="Ví dụ: NL-CA-HOI" className="uppercase font-mono" />
          </Form.Item>

          <Form.Item
            name="unit"
            label={t('dashboard.ingredientUnit')}
            rules={[createZodRule(createIngredientSchema, 'unit')]}
          >
            <Input placeholder="kg, gam, lít, gói, hộp..." />
          </Form.Item>
        </div>

        <Form.Item
          name="name"
          label={t('dashboard.ingredientName')}
          rules={[createZodRule(createIngredientSchema, 'name')]}
        >
          <Input placeholder="Ví dụ: Cá hồi Na Uy phi lê tươi" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            name="costPrice"
            label={t('dashboard.costPrice')}
            rules={[createZodRule(createIngredientSchema, 'costPrice')]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1000}
              placeholder="0"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            name="minStock"
            label={t('dashboard.minStock')}
            rules={[createZodRule(createIngredientSchema, 'minStock')]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="5" />
          </Form.Item>

          <Form.Item
            name="initialStock"
            label={t('dashboard.initialStock')}
            rules={[createZodRule(createIngredientSchema, 'initialStock')]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="0" />
          </Form.Item>
        </div>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {t('common.create')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
