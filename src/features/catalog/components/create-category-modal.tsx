'use client';

import { useState, useMemo, useEffect } from 'react';
import { Modal, Form, Input, Button, Space } from '@/components/ui';
import { Category, CreateCategoryInput } from '../types';
import { createCategorySchemaFactory } from '../schemas/catalog.schema';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateCategoryInput) => Promise<Category | void>;
}

export function CreateCategoryModal({
  open,
  onClose,
  onSubmit,
}: CreateCategoryModalProps) {
  const { t, locale } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(() => createCategorySchemaFactory(t), [t]);

  useEffect(() => {
    if (!open) return;
    const hasErrors = form.getFieldsError().some((item) => item.errors.length > 0);
    if (hasErrors) {
      form.validateFields();
    }
  }, [open, locale, form]);

  const handleSubmit = async (values: unknown) => {
    setSubmitting(true);

    // Zod Safe Parse trước khi submit
    const result = schema.safeParse(values);
    if (!result.success) {
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(result.data);
      form.resetFields();
      onClose();
    } catch {
      // Error message is already handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t('dashboard.modalCreateTitle')}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={t('dashboard.categoryNameLabel')}
          rules={[createZodRule(schema, 'name')]}
        >
          <Input placeholder={t('dashboard.categoryNamePlaceholder')} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              {t('common.create')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
