'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
} from '@/components/ui';
import { CreateIngredientInput } from '../types';
import { createIngredientSchemaFactory } from '../schemas/inventory.schema';
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
  const { t, locale } = useTranslation();
  const [form] = Form.useForm<CreateIngredientInput>();
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(() => createIngredientSchemaFactory(t), [t]);

  useEffect(() => {
    if (!open) return;
    const hasErrors = form.getFieldsError().some((item) => item.errors.length > 0);
    if (hasErrors) {
      form.validateFields();
    }
  }, [open, locale, form]);

  const handleSubmit = async (values: CreateIngredientInput) => {
    try {
      setSubmitting(true);
      const result = schema.safeParse(values);
      if (!result.success) {
        setSubmitting(false);
        return;
      }
      await onSubmit({
        ...result.data,
        costPrice: Number(result.data.costPrice || 0),
        minStock: Number(result.data.minStock || 0),
        initialStock: result.data.initialStock ? Number(result.data.initialStock) : undefined,
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
            rules={[createZodRule(schema, 'code')]}
          >
            <Input placeholder="Ví dụ: NL-CA-HOI" className="uppercase font-mono" />
          </Form.Item>

          <Form.Item
            name="unit"
            label={t('dashboard.ingredientUnit')}
            rules={[createZodRule(schema, 'unit')]}
          >
            <Input placeholder="kg, gam, lít, gói, hộp..." />
          </Form.Item>
        </div>

        <Form.Item
          name="name"
          label={t('dashboard.ingredientName')}
          rules={[createZodRule(schema, 'name')]}
        >
          <Input placeholder="Ví dụ: Cá hồi Na Uy phi lê tươi" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            name="costPrice"
            label={t('dashboard.costPrice')}
            rules={[createZodRule(schema, 'costPrice')]}
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
            rules={[createZodRule(schema, 'minStock')]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="5" />
          </Form.Item>

          <Form.Item
            name="initialStock"
            label={t('dashboard.initialStock')}
            rules={[createZodRule(schema, 'initialStock')]}
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
