'use client';

import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Button,
  Space,
} from '@/components/ui';
import { CreateProductInput } from '../types';
import { createProductSchema } from '../schemas/catalog.schema';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';
import { useCategories } from '../hooks/use-categories';

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateProductInput) => Promise<any>;
}

export function CreateProductModal({
  open,
  onClose,
  onSubmit,
}: CreateProductModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { data: categories = [] } = useCategories();

  const handleSubmit = async (values: unknown) => {
    setSubmitting(true);

    const result = createProductSchema.safeParse(values);
    if (!result.success) {
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(result.data);
      form.resetFields();
      onClose();
    } catch {
      // Error message is handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t('dashboard.modalCreateProductTitle')}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={540}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: 'SINGLE', sellingPrice: 50000 }}
      >
        {/* Tên món */}
        <Form.Item
          name="name"
          label={t('dashboard.productNameLabel')}
          rules={[createZodRule(createProductSchema, 'name')]}
        >
          <Input placeholder={t('dashboard.productNamePlaceholder')} />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mã SKU */}
          <Form.Item
            name="sku"
            label={t('dashboard.productSkuLabel')}
            rules={[createZodRule(createProductSchema, 'sku')]}
          >
            <Input placeholder={t('dashboard.productSkuPlaceholder')} />
          </Form.Item>

          {/* Danh mục */}
          <Form.Item
            name="categoryId"
            label={t('dashboard.productCategoryLabel')}
          >
            <Select
              placeholder={t('dashboard.productCategoryPlaceholder')}
              allowClear
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Loại sản phẩm: SINGLE vs COMBO */}
          <Form.Item
            name="type"
            label={t('dashboard.productTypeLabel')}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="SINGLE">
                {t('dashboard.productTypeSingle')}
              </Radio.Button>
              <Radio.Button value="COMBO">
                {t('dashboard.productTypeCombo')}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Giá bán */}
          <Form.Item
            name="sellingPrice"
            label={t('dashboard.productPriceLabel')}
            rules={[createZodRule(createProductSchema, 'sellingPrice')]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={1000}
              step={5000}
              formatter={(value) =>
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
              }
              parser={(value) =>
                value ? Number(value.replace(/,/g, '')) : 0
              }
              placeholder="120,000"
            />
          </Form.Item>
        </div>

        {/* Link ảnh */}
        <Form.Item
          name="imageUrl"
          label={t('dashboard.productImageLabel')}
        >
          <Input placeholder={t('dashboard.productImagePlaceholder')} />
        </Form.Item>

        {/* Buttons */}
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
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
