'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Form,
  Input,
  Switch,
  Button,
  SushiButton,
  App,
  Storefront,
  CheckCircle,
  WarningCircle,
  Trash,
  ResponsiveModalDrawer,
} from '@/components/ui';
import {
  PhoneCall,
  FloppyDisk,
  Images,
  Plus,
  UploadSimple,
  Spinner,
  ArrowUp,
  ArrowDown,
  ArrowCounterClockwise,
  LinkSimple,
  PencilSimple,
} from '@phosphor-icons/react';
import { useStoreConfig, useUpdateStoreConfig } from '../hooks/use-orders';
import { HeroBannerItem } from '../types';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { useTranslation } from '@/lib/i18n';

const VIETNAM_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$|^1[89]00\d{4,6}$|^(02\d{1,2})\d{7,8}$/;

const DEFAULT_HERO_BANNERS: HeroBannerItem[] = [
  {
    id: 'authentic-sushi',
    imageUrl:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Hương vị tinh tế của',
    highlightTitle: 'Ẩm thực Sushi Nhật Bản',
    description:
      'Thưởng thức nghệ thuật sushi tươi ngon từ nguồn hải sản cao cấp nhập khẩu chính gốc. Trải nghiệm chất lượng và tinh hoa ẩm thực truyền thống xứ sở Phù Tang.',
    kanjiWatermark: '伝統 江戸 寿司',
    isActive: true,
  },
  {
    id: 'premium-sashimi',
    imageUrl:
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Tuyệt tác tươi ngon từ',
    highlightTitle: 'Sashimi Hải Sản Thượng Hạng',
    description:
      'Cá hồi Na Uy béo ngậy, cá ngừ đại dương và sò điệp Hokkaido được tuyển chọn mới mỗi ngày, cắt lát tinh tế giữ trọn vị ngọt nguyên bản từ đại dương.',
    kanjiWatermark: '新鮮 極上 刺身',
    isActive: true,
  },
  {
    id: 'artisan-nigiri',
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Tâm huyết nghệ nhân trong',
    highlightTitle: 'Từng Tuyệt Phẩm Nigiri',
    description:
      'Sự kết hợp hài hòa giữa hạt gạo Nhật dẻo thơm trộn giấm ủ truyền thống cùng kỹ nghệ nắm sushi chuẩn mực của các đầu bếp lành nghề.',
    kanjiWatermark: '職人 匠技 握り',
    isActive: true,
  },
  {
    id: 'signature-combo',
    imageUrl:
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Trọn vẹn bữa tiệc cùng',
    highlightTitle: 'Khay Combo Tươi Lạnh Tận Nơi',
    description:
      'Bài trí cân đối theo triết lý ngũ sắc Nhật Bản, đóng hộp giữ lạnh chuyên dụng giúp mỗi phần ăn giao đến tay bạn luôn tươi ngon như thưởng thức tại quầy.',
    kanjiWatermark: '彩り 特選 盛合',
    isActive: true,
  },
];

export function StoreSettingsView() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customBanners, setCustomBanners] = useState<HeroBannerItem[] | null>(
    null,
  );
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [uploadingBannerId, setUploadingBannerId] = useState<string | null>(null);
  const [targetUploadBannerId, setTargetUploadBannerId] = useState<string | null>(null);

  const { data: config, isLoading } = useStoreConfig();
  const updateMutation = useUpdateStoreConfig();

  const banners: HeroBannerItem[] =
    customBanners !== null
      ? customBanners
      : Array.isArray(config?.heroBanners) && config.heroBanners.length > 0
        ? config.heroBanners
        : DEFAULT_HERO_BANNERS;

  // Watch values for live preview
  const isOrderingEnabled = Form.useWatch('customerOrderingEnabled', form);

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        customerOrderingEnabled: config.customerOrderingEnabled ?? true,
        contactPhone: config.contactPhone || '',
      });
    }
  }, [config, form]);

  const handleBannerChange = (
    id: string,
    field: keyof HeroBannerItem,
    value: string | boolean,
  ) => {
    setCustomBanners(
      banners.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddBanner = () => {
    if (banners.length >= 10) {
      message.warning('Tối đa 10 slide banner trên trang chủ!');
      return;
    }
    const newId = `banner-${Date.now()}`;
    setCustomBanners([
      ...banners,
      {
        id: newId,
        imageUrl: '',
        leadTitle: 'Khám phá hương vị mới',
        highlightTitle: 'Tinh Hoa Ẩm Thực Nhật Bản',
        description:
          'Thưởng thức các món sushi và sashimi tươi ngon được chế biến từ nguyên liệu tuyển chọn hàng ngày.',
        kanjiWatermark: '伝統 江戸 寿司',
        isActive: true,
      },
    ]);
    setEditingBannerId(newId);
  };

  const handleRemoveBanner = (id: string) => {
    setCustomBanners(banners.filter((item) => item.id !== id));
    if (editingBannerId === id) {
      setEditingBannerId(null);
    }
  };

  const openBannerDetail = (id: string) => {
    setEditingBannerId(id);
  };

  const closeBannerDetail = () => {
    setEditingBannerId(null);
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const next = [...banners];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setCustomBanners(next);
  };

  const handleRestoreDefaultBanners = () => {
    setCustomBanners(DEFAULT_HERO_BANNERS);
    message.info('Đã nạp bộ 4 Banner mặc định. Nhấn "Lưu cấu hình" để áp dụng!');
  };

  const triggerUploadForBanner = (bannerId: string) => {
    setTargetUploadBannerId(bannerId);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const bannerId = targetUploadBannerId;
    if (!file || !bannerId) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Dung lượng ảnh tối đa cho phép là 5MB!');
      return;
    }

    try {
      setUploadingBannerId(bannerId);
      const res = await catalogApi.uploadImage(file);
      handleBannerChange(bannerId, 'imageUrl', res.url);
      message.success('Đã tải ảnh lên Cloudinary CDN thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh lên CDN thất bại';
      message.error(msg);
    } finally {
      setUploadingBannerId(null);
      setTargetUploadBannerId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (values: {
    customerOrderingEnabled: boolean;
    contactPhone: string;
  }) => {
    const invalidBanner = banners.find((b) => !b.imageUrl || !b.imageUrl.trim());
    if (invalidBanner) {
      setEditingBannerId(invalidBanner.id);
      message.error(
        'Vui lòng tải ảnh lên CDN hoặc nhập đường dẫn URL ảnh cho Slide Banner!',
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({
        customerOrderingEnabled: values.customerOrderingEnabled,
        contactPhone: values.contactPhone?.trim(),
        heroBanners: banners.map((b) => ({
          ...b,
          imageUrl: b.imageUrl.trim(),
          leadTitle: b.leadTitle?.trim() || '',
          highlightTitle: b.highlightTitle?.trim() || '',
          description: b.description?.trim() || '',
          kanjiWatermark: b.kanjiWatermark?.trim() || '',
          isActive: b.isActive ?? true,
        })),
      });
      message.success('Cập nhật cấu hình cửa hàng & Banner trang chủ thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      message.error(msg);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={isLoading}
        initialValues={{
          customerOrderingEnabled: true,
          contactPhone: '',
        }}
      >
        <div className="space-y-4">
          {/* Card 1: Trạng thái đặt hàng Storefront */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-sushi-border/60">
              <div className="flex items-center gap-2">
                <Storefront size={18} className="text-sushi-gold" />
                <span className="font-semibold text-sm text-sushi-text">
                  {t('storeSettingsPage.storefrontSectionTitle')}
                </span>
              </div>

              {isOrderingEnabled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle size={13} weight="fill" />
                  {t('storeSettingsPage.statusReceiving')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  <WarningCircle size={13} weight="fill" />
                  {t('storeSettingsPage.statusCallOnly')}
                </span>
              )}
            </div>

            {/* Switch container on mobile */}
            <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-900/60 border border-sushi-border/60">
              <div className="space-y-1 min-w-0 pr-2">
                <div className="text-sm font-semibold text-sushi-text">
                  {t('storeSettingsPage.allowOnlineOrderingTitle')}
                </div>
                <p className="text-xs text-sushi-text-muted leading-relaxed">
                  {isOrderingEnabled
                    ? t('storeSettingsPage.allowOnlineOrderingOnDesc')
                    : t('storeSettingsPage.allowOnlineOrderingOffDesc')}
                </p>
              </div>

              <Form.Item
                name="customerOrderingEnabled"
                valuePropName="checked"
                className="mb-0 shrink-0"
              >
                <Switch
                  checkedChildren={t('paymentSettingsPage.switchOn')}
                  unCheckedChildren={t('paymentSettingsPage.switchOff')}
                />
              </Form.Item>
            </div>
          </div>

          {/* Card 2: Hotline nhận đơn */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-sushi-border/60">
              <div className="flex items-center gap-2">
                <PhoneCall size={18} className="text-sushi-gold" />
                <span className="font-semibold text-sm text-sushi-text">
                  {t('storeSettingsPage.hotlineSectionTitle')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Form.Item
                name="contactPhone"
                label={
                  <span className="font-medium text-xs sm:text-sm text-sushi-text">
                    {t('storeSettingsPage.hotlineLabel')}
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại hotline' },
                  {
                    pattern: VIETNAM_PHONE_REGEX,
                    message:
                      'Số điện thoại không hợp lệ (hỗ trợ số di động 10 số, đầu số 1800/1900 hoặc số cố định)',
                  },
                ]}
                className="mb-1"
              >
                <Input
                  size="large"
                  placeholder={t('storeSettingsPage.hotlinePlaceholder')}
                  prefix={<PhoneCall size={18} className="text-sushi-text-muted mr-1" />}
                  className="w-full sm:max-w-md h-11 rounded-xl bg-zinc-900/80 border-sushi-border text-sushi-text"
                />
              </Form.Item>
              <p className="text-2xs sm:text-xs text-sushi-text-muted leading-relaxed">
                {t('storeSettingsPage.hotlineHint')}
              </p>
            </div>
          </div>

          {/* Card 3: Quản lý Banner Trang Chủ (Hero Slideshow & CDN) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-sushi-border/60">
              <div className="flex items-start gap-2.5">
                <Images size={18} className="text-sushi-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-sushi-text block">
                    Banner Trang Chủ (Hero Slideshow & CDN)
                  </span>
                  <span className="text-2xs text-sushi-text-muted leading-relaxed block mt-0.5">
                    Tự động chuyển cảnh mỗi 5 giây. Hỗ trợ tải ảnh trực tiếp lên Cloudinary CDN hoặc dán URL ảnh.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  size="small"
                  onClick={handleRestoreDefaultBanners}
                  className="flex-1 sm:flex-initial justify-center h-8 rounded-lg border-sushi-border text-sushi-text-muted hover:text-white text-2xs flex items-center gap-1"
                >
                  <ArrowCounterClockwise size={13} />
                  <span>Khôi phục mặc định</span>
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={handleAddBanner}
                  className="flex-1 sm:flex-initial justify-center h-8 rounded-lg text-2xs flex items-center gap-1"
                >
                  <Plus size={13} weight="bold" />
                  <span>Thêm Slide</span>
                </Button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              hidden
              aria-hidden="true"
              tabIndex={-1}
              style={{
                display: 'none',
                position: 'absolute',
                width: 0,
                height: 0,
                opacity: 0,
                pointerEvents: 'none',
              }}
            />

            <div className="space-y-2.5">
              {banners.map((banner, index) => {
                const isSlideActive = banner.isActive !== false;
                const isEditingThis = editingBannerId === banner.id;

                return (
                  <div
                    key={banner.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isEditingThis
                        ? 'bg-zinc-900/80 border-sushi-gold/50 shadow-md ring-1 ring-sushi-gold/30'
                        : isSlideActive
                          ? 'bg-zinc-900/50 border-sushi-border/70 hover:border-zinc-700'
                          : 'bg-zinc-950/40 border-zinc-800/60 opacity-65'
                    }`}
                  >
                    {/* Dòng danh sách thu gọn (Click mở Popup Modal trên Desktop / Bottom Sheet trên Mobile) */}
                    <div
                      onClick={() => openBannerDetail(banner.id)}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Cột trái: Badge + Thumbnail nhỏ + Tiêu đề */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                          Slide #{index + 1}
                        </span>

                        {/* Thumbnail ảnh preview nhỏ */}
                        <div className="relative w-12 h-7 rounded-md overflow-hidden bg-zinc-950 border border-zinc-700/60 shrink-0 flex items-center justify-center">
                          {banner.imageUrl.startsWith('/') ||
                          banner.imageUrl.startsWith('http://') ||
                          banner.imageUrl.startsWith('https://') ? (
                            <Image
                              src={banner.imageUrl}
                              alt={banner.highlightTitle || `Slide ${index + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <Images size={14} className="text-zinc-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="text-xs sm:text-sm font-semibold text-sushi-text line-clamp-1">
                              {banner.highlightTitle || 'Chưa đặt tiêu đề'}
                            </span>
                            {!banner.imageUrl?.trim() && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                Chưa có ảnh
                              </span>
                            )}
                          </div>
                          {banner.leadTitle && (
                            <span className="text-2xs text-sushi-text-muted line-clamp-1 block mt-0.5">
                              {banner.leadTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cột phải: Cụm công cụ thao tác */}
                      <div
                        className="flex items-center justify-between sm:justify-end gap-1.5 pt-2 sm:pt-0 border-t border-zinc-800/70 sm:border-t-0 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="small"
                            disabled={index === 0}
                            onClick={() => handleMoveBanner(index, 'up')}
                            title="Đưa lên trước"
                            className="px-2 border-zinc-700 text-sushi-text-muted hover:text-white"
                          >
                            <ArrowUp size={13} />
                          </Button>
                          <Button
                            size="small"
                            disabled={index === banners.length - 1}
                            onClick={() => handleMoveBanner(index, 'down')}
                            title="Đưa xuống sau"
                            className="px-2 border-zinc-700 text-sushi-text-muted hover:text-white"
                          >
                            <ArrowDown size={13} />
                          </Button>
                          <Switch
                            size="small"
                            checked={isSlideActive}
                            onChange={(checked) =>
                              handleBannerChange(banner.id, 'isActive', checked)
                            }
                            checkedChildren="Hiện"
                            unCheckedChildren="Ẩn"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="small"
                            onClick={() => openBannerDetail(banner.id)}
                            className="rounded-lg text-2xs flex items-center gap-1 px-2.5 border-zinc-700 text-sushi-text-muted hover:text-white hover:border-sushi-gold/60"
                          >
                            <PencilSimple size={13} />
                            <span>Chỉnh sửa</span>
                          </Button>
                          {banners.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBanner(banner.id)}
                              title="Xóa slide này"
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Render Form Chi tiết: Desktop dùng Modal, Mobile dùng Bottom Sheet Drawer */}
            {(() => {
              const activeBanner = banners.find((b) => b.id === editingBannerId);
              if (!activeBanner) return null;

              const activeIndex = banners.findIndex((b) => b.id === editingBannerId);
              const isUploadingThis = uploadingBannerId === activeBanner.id;
              const isBannerUrlValid =
                activeBanner.imageUrl.startsWith('/') ||
                activeBanner.imageUrl.startsWith('http://') ||
                activeBanner.imageUrl.startsWith('https://');

              const detailContent = (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Khối ảnh & Upload CDN */}
                    <div className="md:col-span-5 space-y-2.5">
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex items-center justify-center">
                        {isBannerUrlValid ? (
                          <Image
                            src={activeBanner.imageUrl}
                            alt={activeBanner.highlightTitle || `Banner ${activeIndex + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 space-y-1">
                            <Images size={28} className="text-zinc-600 mx-auto" />
                            <p className="text-2xs text-zinc-500">Chưa có ảnh Banner</p>
                          </div>
                        )}
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 text-sushi-gold">
                            <Spinner size={22} className="animate-spin" />
                            <span className="text-2xs font-medium">Đang tải lên CDN...</span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => triggerUploadForBanner(activeBanner.id)}
                        disabled={isUploadingThis}
                        className="w-full h-9 rounded-xl border-sushi-border text-sushi-text hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium"
                      >
                        <UploadSimple size={15} />
                        <span>Tải ảnh từ máy lên Cloudinary CDN</span>
                      </Button>

                      <div className="space-y-1">
                        <span className="text-2xs text-sushi-text-muted flex items-center gap-1">
                          <LinkSimple size={12} />
                          <span>Hoặc dán trực tiếp URL ảnh CDN:</span>
                        </span>
                        <Input
                          size="middle"
                          value={activeBanner.imageUrl}
                          onChange={(e) =>
                            handleBannerChange(
                              activeBanner.id,
                              'imageUrl',
                              e.target.value,
                            )
                          }
                          placeholder="https://res.cloudinary.com/... hoặc link ảnh CDN"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>

                    {/* Khối văn bản hiển thị trên Banner */}
                    <div className="md:col-span-7 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Dòng tiêu đề phụ (trên)
                          </label>
                          <Input
                            value={activeBanner.leadTitle || ''}
                            onChange={(e) =>
                              handleBannerChange(
                                activeBanner.id,
                                'leadTitle',
                                e.target.value,
                              )
                            }
                            placeholder="VD: Hương vị tinh tế của"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Tiêu đề chính nổi bật
                          </label>
                          <Input
                            value={activeBanner.highlightTitle || ''}
                            onChange={(e) =>
                              handleBannerChange(
                                activeBanner.id,
                                'highlightTitle',
                                e.target.value,
                              )
                            }
                            placeholder="VD: Ẩm thực Sushi Nhật Bản"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Mô tả chi tiết (có thể để trống nếu ảnh đã có chữ)
                        </label>
                        <Input.TextArea
                          rows={3}
                          value={activeBanner.description || ''}
                          onChange={(e) =>
                            handleBannerChange(
                              activeBanner.id,
                              'description',
                              e.target.value,
                            )
                          }
                          placeholder="Nhập đoạn mô tả ngắn hiển thị bên dưới tiêu đề..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Chữ Kanji thư pháp trang trí góc phải (cách nhau bởi dấu cách)
                        </label>
                        <Input
                          value={activeBanner.kanjiWatermark || ''}
                          onChange={(e) =>
                            handleBannerChange(
                              activeBanner.id,
                              'kanjiWatermark',
                              e.target.value,
                            )
                          }
                          placeholder="VD: 伝統 江戸 寿司"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text sm:max-w-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="primary"
                      onClick={closeBannerDetail}
                      className="px-5 rounded-lg text-xs font-medium"
                    >
                      Xong
                    </Button>
                  </div>
                </div>
              );

              return (
                <ResponsiveModalDrawer
                  open={!!editingBannerId}
                  onClose={closeBannerDetail}
                  width={780}
                  title={
                    <div className="flex items-center gap-2">
                      <Images size={18} className="text-sushi-gold shrink-0" />
                      <span>Chi Tiết Slide Banner</span>
                      <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 ml-1">
                        Slide #{activeIndex + 1}
                      </span>
                    </div>
                  }
                >
                  {detailContent}
                </ResponsiveModalDrawer>
              );
            })()}
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <SushiButton
              type="primary"
              htmlType="submit"
              size="large"
              loading={updateMutation.isPending}
              icon={<FloppyDisk size={18} weight="bold" />}
              className="w-full sm:w-auto h-12 sm:h-11 px-8 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {t('storeSettingsPage.saveBtn')}
            </SushiButton>
          </div>
        </div>
      </Form>
    </div>
  );
}
