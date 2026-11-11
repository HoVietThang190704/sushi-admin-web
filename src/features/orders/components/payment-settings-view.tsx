'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Form,
  Input,
  Switch,
  Button,
  App,
} from 'antd';
import {
  QrCode,
  Bank,
  Check,
  UploadSimple,
  Trash,
  Spinner,
} from '@phosphor-icons/react';
import { usePaymentConfig, useUpdatePaymentConfig } from '../hooks/use-orders';
import { catalogApi } from '@/features/catalog/api/catalog.api';

export function PaymentSettingsView() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [customQrUrl, setCustomQrUrl] = useState<string | null | undefined>(undefined);

  const { data: config, isLoading } = usePaymentConfig();
  const updateMutation = useUpdatePaymentConfig();

  const qrPreviewUrl = customQrUrl !== undefined ? customQrUrl : (config?.qrImageUrl || null);

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        bankName: config.bankName || '',
        accountNumber: config.accountNumber || '',
        accountHolder: config.accountHolder || '',
        transferSyntax: config.transferSyntax || 'HANBI',
        note: config.note || '',
        isActive: config.isActive ?? true,
      });
    }
  }, [config, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Dung lượng ảnh tối đa 5MB!');
      return;
    }

    try {
      setUploading(true);
      const res = await catalogApi.uploadImage(file);
      setCustomQrUrl(res.url);
      message.success('Tải ảnh mã QR thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh thất bại';
      message.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveQr = () => {
    setCustomQrUrl(null);
  };

  const handleSave = async (values: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferSyntax: string;
    note?: string;
    isActive: boolean;
  }) => {
    try {
      await updateMutation.mutateAsync({
        ...values,
        qrImageUrl: qrPreviewUrl || undefined,
      });
      message.success('Cập nhật cấu hình thanh toán QR thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      message.error(msg);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Khối Ảnh mã QR: Trên Mobile hiển thị ĐẦU TIÊN (order-1), Trên Desktop hiển thị CỘT PHẢI (md:order-2 md:col-span-5) */}
          <div className="order-1 md:order-2 md:col-span-5 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-sushi-border/60">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-sushi-gold" />
                  <span className="font-semibold text-sm text-sushi-text">
                    Ảnh Mã QR Chuyển Khoản
                  </span>
                </div>
                {qrPreviewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveQr}
                    className="text-2xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash size={13} />
                    <span>Gỡ ảnh</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {qrPreviewUrl ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-square max-w-[220px] sm:max-w-[260px] mx-auto rounded-xl overflow-hidden border-2 border-sushi-gold/40 bg-zinc-950 p-2 flex items-center justify-center shadow-inner">
                    <img
                      src={qrPreviewUrl}
                      alt="Mã QR chuyển khoản"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-10 rounded-xl border-sushi-border text-sushi-text hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium"
                  >
                    <UploadSimple size={16} />
                    <span>Đổi ảnh QR khác</span>
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-sushi-gold/70 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-colors bg-zinc-900/40 hover:bg-zinc-900/70"
                >
                  {uploading ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-sushi-gold">
                      <Spinner size={24} className="animate-spin" />
                      <span className="text-xs">Đang tải ảnh lên máy chủ...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3 sm:py-4">
                      <div className="w-12 h-12 rounded-full bg-sushi-gold/10 text-sushi-gold mx-auto flex items-center justify-center">
                        <UploadSimple size={24} />
                      </div>
                      <p className="text-xs font-semibold text-sushi-text">
                        Bấm để tải lên ảnh mã QR của quán
                      </p>
                      <p className="text-2xs text-sushi-text-dim">
                        Hỗ trợ PNG, JPG, WebP (Tối đa 5MB)
                      </p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-2xs text-sushi-text-dim leading-relaxed">
                💡 <em>Mẹo:</em> Mở app ngân hàng, chụp màn hình mã QR nhận tiền và tải ảnh lên đây.
              </p>
            </div>
          </div>

          {/* Khối Thông tin ngân hàng: Trên Mobile hiển thị THỨ HAI (order-2), Trên Desktop hiển thị CỘT TRÁI (md:order-1 md:col-span-7) */}
          <div className="order-2 md:order-1 md:col-span-7 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-sushi-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  <Bank size={18} className="text-sushi-gold shrink-0" />
                  <span className="font-semibold text-sm text-sushi-text truncate">
                    Thông Tin Tài Khoản Ngân Hàng
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-2xs text-sushi-text-muted hidden sm:inline">Nhận chuyển khoản:</span>
                  <Form.Item name="isActive" valuePropName="checked" noStyle>
                    <Switch
                      checkedChildren="Bật"
                      unCheckedChildren="Tắt"
                      className="bg-zinc-700"
                    />
                  </Form.Item>
                </div>
              </div>

              <Form.Item
                name="bankName"
                label={<span className="text-xs font-medium text-sushi-text-muted">Tên ngân hàng</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
              >
                <Input
                  placeholder="Ví dụ: MB Bank, Vietcombank, Techcombank..."
                  className="rounded-xl h-10"
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Form.Item
                  name="accountNumber"
                  label={<span className="text-xs font-medium text-sushi-text-muted">Số tài khoản</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
                >
                  <Input
                    placeholder="Ví dụ: 0988888888"
                    className="rounded-xl h-10 font-mono font-semibold"
                  />
                </Form.Item>

                <Form.Item
                  name="accountHolder"
                  label={<span className="text-xs font-medium text-sushi-text-muted">Chủ tài khoản (viết hoa)</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản' }]}
                >
                  <Input
                    placeholder="Ví dụ: NGUYEN VAN A"
                    className="rounded-xl h-10 uppercase"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="transferSyntax"
                label={
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium text-sushi-text-muted">
                      Tiền tố nội dung chuyển khoản
                    </span>
                    <span className="text-2xs text-sushi-gold">
                      Khách chuyển: [Tiền tố] [Mã đơn]
                    </span>
                  </div>
                }
                rules={[{ required: true, message: 'Nhập tiền tố cú pháp' }]}
              >
                <Input
                  placeholder="Ví dụ: HANBI, SUSHI..."
                  className="rounded-xl h-10 font-mono uppercase"
                />
              </Form.Item>

              <Form.Item
                name="note"
                label={<span className="text-xs font-medium text-sushi-text-muted">Lời nhắn / Lưu ý cho khách</span>}
              >
                <Input.TextArea
                  placeholder="Ví dụ: Vui lòng ghi chính xác nội dung chuyển khoản để hệ thống xác nhận nhanh nhất."
                  rows={2}
                  className="rounded-xl"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Nút lưu: Trên mobile rộng 100%, trên desktop rộng gọn */}
        <div className="pt-3">
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isPending}
            className="w-full sm:w-auto h-12 sm:h-11 px-8 rounded-xl bg-sushi-gold hover:bg-sushi-gold/90 text-black font-semibold border-none flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
          >
            <Check size={18} weight="bold" />
            <span>Lưu cấu hình thanh toán</span>
          </Button>
        </div>
      </Form>
    </div>
  );
}
