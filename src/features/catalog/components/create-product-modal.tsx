'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  ResponsiveModalDrawer,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  ImageSquare,
  Trash,
  Spin,
  message,
} from '@/components/ui';
import { Product, CreateProductInput } from '../types';
import { createProductSchemaFactory } from '../schemas/catalog.schema';
import { catalogApi } from '../api/catalog.api';
import { createZodRule } from '@/lib/zod-validator';
import { useTranslation } from '@/lib/i18n';
import { useCategoryOptions } from '../hooks/use-categories';

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateProductInput) => Promise<unknown>;
  initialData?: Product | null;
}

export function CreateProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: CreateProductModalProps) {
  const { t, locale } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { options: categoryOptions } = useCategoryOptions();
  const isEditing = Boolean(initialData);

  const schema = useMemo(() => createProductSchemaFactory(t), [t]);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      const initialImg = initialData.imageUrl || '';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageUrl(initialImg);
      form.setFieldsValue({
        name: initialData.name,
        sku: initialData.sku,
        barcode: initialData.barcode || undefined,
        categoryId: initialData.categoryId || undefined,
        sellingPrice: Number(initialData.sellingPrice),
        imageUrl: initialImg,
        description: initialData.description || '',
        accompaniments:
          initialData.accompaniments !== undefined && initialData.accompaniments !== null
            ? initialData.accompaniments
            : '',
        isActive: initialData.isActive,
      });
    } else {
      setImageUrl('');
      form.resetFields();
      form.setFieldsValue({
        accompaniments: t('dashboard.presetSushiVal'),
      });
    }
  }, [open, initialData, form, t]);

  useEffect(() => {
    if (!open) return;
    const hasErrors = form.getFieldsError().some((item) => item.errors.length > 0);
    if (hasErrors) {
      form.validateFields();
    }
  }, [open, locale, form]);

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

    const result = schema.safeParse(values);
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
    <ResponsiveModalDrawer
      title={isEditing ? t('dashboard.modalEditProductTitle') : t('dashboard.modalCreateProductTitle')}
      open={open}
      onClose={handleModalClose}
      destroyOnHidden
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: 'SINGLE', sellingPrice: 50000, isActive: true }}
      >
        {/* Tên món */}
        <Form.Item
          name="name"
          label={t('dashboard.productNameLabel')}
          rules={[createZodRule(schema, 'name')]}
        >
          <Input placeholder={t('dashboard.productNamePlaceholder')} />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mã SKU / Tên phụ tiếng Việt */}
          <Form.Item
            name="sku"
            label={t('dashboard.productSkuLabel')}
            rules={[createZodRule(schema, 'sku')]}
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
              options={categoryOptions}
            />
          </Form.Item>
        </div>

        {/* Giá bán */}
        <Form.Item
          name="sellingPrice"
          label={t('dashboard.productPriceLabel')}
          rules={[createZodRule(schema, 'sellingPrice')]}
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

        {/* =====================================================================
            Gia vị / Đồ ăn kèm theo món & Mô tả hương vị
           ===================================================================== */}
        <Form.Item
          name="accompaniments"
          label={t('dashboard.productAccompanimentsLabel')}
        >
          <Input
            placeholder={t('dashboard.productAccompanimentsPlaceholder')}
            allowClear
          />
        </Form.Item>
        <div className="-mt-3 mb-4 space-y-1.5">
          <span className="text-2xs text-sushi-text-dim block">
            {t('dashboard.productAccompanimentsHint')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: t('dashboard.presetSushi'), value: t('dashboard.presetSushiVal') },
              { label: t('dashboard.presetRamen'), value: t('dashboard.presetRamenVal') },
              { label: t('dashboard.presetGrilled'), value: t('dashboard.presetGrilledVal') },
              { label: t('dashboard.presetNone'), value: '' },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => form.setFieldValue('accompaniments', preset.value)}
                className="px-2.5 py-1 rounded-lg text-2xs font-medium bg-sushi-surface hover:bg-sushi-card-hover text-sushi-text-muted hover:text-sushi-gold border border-sushi-border/80 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <Form.Item
          name="description"
          label={t('dashboard.productDescriptionLabel')}
        >
          <Input.TextArea
            rows={2}
            placeholder={t('dashboard.productDescriptionPlaceholder')}
            className="rounded-xl"
          />
        </Form.Item>

        {/* =====================================================================
            Khu Vực Tải Ảnh Cloudinary Trực Tiếp
           ===================================================================== */}
        <Form.Item
          name="imageUrl"
          label={t('dashboard.productImageLabel')}
          rules={[createZodRule(schema, 'imageUrl')]}
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

        {/* Trạng thái kinh doanh (Hiển thị khi chỉnh sửa món ăn) */}
        {isEditing && (
          <div className="mb-4 p-3 rounded-xl bg-sushi-surface/60 border border-sushi-border/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-sushi-text">
                {t('dashboard.productStatusLabel')}
              </div>
              <div className="text-2xs text-sushi-text-dim mt-0.5">
                {t('common.active')} / {t('common.inactive')}
              </div>
            </div>
            <Form.Item name="isActive" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        )}

        {/* Buttons */}
        <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <Button onClick={handleModalClose} className="w-full sm:w-auto h-10 sm:h-auto rounded-xl">
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="w-full sm:w-auto h-10 sm:h-auto rounded-xl font-semibold"
            >
              {isEditing ? t('dashboard.saveChanges') : t('common.create')}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </ResponsiveModalDrawer>
  );
}
