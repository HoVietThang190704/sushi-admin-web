'use client';

import { useState } from 'react';
import { Modal, Form, Input, Button, Space } from '@/components/ui';
import { Category, CreateCategoryInput } from '../types';
import { createCategorySchema } from '../schemas/catalog.schema';
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
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: unknown) => {
    setSubmitting(true);

    // Zod Safe Parse trước khi submit
    const result = createCategorySchema.safeParse(values);
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
          rules={[createZodRule(createCategorySchema, 'name')]}
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
