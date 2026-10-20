'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Button,
  Space,
  ImageSquare,
  Trash,
  Spin,
  message,
} from '@/components/ui';
import { CreateProductInput } from '../types';
import { createProductSchema } from '../schemas/catalog.schema';
import { catalogApi } from '../api/catalog.api';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';
import { useCategoryOptions } from '../hooks/use-categories';

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateProductInput) => Promise<unknown>;
}

export function CreateProductModal({
  open,
  onClose,
  onSubmit,
}: CreateProductModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { options: categoryOptions } = useCategoryOptions();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh tối đa là 5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await catalogApi.uploadImage(file);
      setImageUrl(result.url);
      form.setFieldValue('imageUrl', result.url);
      message.success(t('dashboard.uploadSuccess'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh lên thất bại';
      message.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    form.setFieldValue('imageUrl', '');
  };

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
      setImageUrl('');
      onClose();
    } catch {
      // Error message is handled in mutation hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    form.resetFields();
    setImageUrl('');
    onClose();
  };

  return (
    <Modal
      title={t('dashboard.modalCreateProductTitle')}
      open={open}
      onCancel={handleModalClose}
      footer={null}
      destroyOnHidden
      width={560}
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
            <Input placeholder={t('dashboard.productSkuPlaceholder')} className="uppercase font-mono" />
          </Form.Item>

          {/* Danh mục */}
          <Form.Item
            name="categoryId"
            label={t('dashboard.productCategoryLabel')}
          >
            <Select
              placeholder={t('dashboard.productCategoryPlaceholder')}
              allowClear
              options={categoryOptions}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Loại sản phẩm: SINGLE vs COMBO */}
          <Form.Item
            name="type"
            label={t('dashboard.productTypeLabel')}
          >
            <Radio.Group buttonStyle="solid" className="w-full">
              <Radio.Button value="SINGLE" className="w-1/2 text-center">
                {t('dashboard.productTypeSingle')}
              </Radio.Button>
              <Radio.Button value="COMBO" className="w-1/2 text-center">
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

        {/* =====================================================================
            Khu Vực Tải Ảnh Cloudinary Trực Tiếp
           ===================================================================== */}
        <Form.Item
          name="imageUrl"
          label={t('dashboard.productImageLabel')}
          rules={[createZodRule(createProductSchema, 'imageUrl')]}
        >
          <div className="space-y-3">
            {/* Input file ẩn để kích hoạt chọn file */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Trạng thái xem trước ảnh đã tải lên */}
            {imageUrl ? (
              <div className="p-3 rounded-2xl bg-sushi-surface border border-sushi-border flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-sushi-border shrink-0">
                    <Image
                      src={imageUrl}
                      alt="Product preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-emerald-400 font-mono truncate">
                      Cloudinary CDN
                    </div>
                    <div className="text-2xs text-sushi-text-dim truncate font-mono mt-0.5">
                      {imageUrl}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {t('dashboard.changeImage')}
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<Trash size={14} />}
                    onClick={handleRemoveImage}
                    disabled={uploading}
                  />
                </div>
              </div>
            ) : (
              /* Vùng kéo thả hoặc click tải ảnh */
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-sushi-border hover:border-sushi-primary/50 bg-sushi-surface/50 hover:bg-sushi-surface transition-all duration-200 cursor-pointer text-center group flex flex-col items-center justify-center space-y-2"
              >
                {uploading ? (
                  <div className="py-2 flex flex-col items-center space-y-2">
                    <Spin />
                    <span className="text-xs text-sushi-primary font-medium animate-pulse">
                      {t('dashboard.uploading')}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-sushi-card border border-sushi-border flex items-center justify-center text-sushi-primary group-hover:scale-105 transition-transform shadow-inner">
                      <ImageSquare size={22} />
                    </div>
                    <div className="text-xs font-semibold text-sushi-text group-hover:text-sushi-primary transition-colors">
                      {t('dashboard.uploadImageCloudinary')}
                    </div>
                    <div className="text-2xs text-sushi-text-dim max-w-xs">
                      {t('dashboard.uploadHint')}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Input URL dự phòng */}
            <Input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                form.setFieldValue('imageUrl', e.target.value);
              }}
              placeholder={t('dashboard.productImagePlaceholder')}
              className="font-mono text-xs rounded-xl"
            />
          </div>
        </Form.Item>

        {/* Buttons */}
        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 20 }}>
          <Space>
            <Button onClick={handleModalClose}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {t('common.create')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
