'use client';

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Switch,
  Button,
  App,
} from 'antd';
import {
  Storefront,
  PhoneCall,
  CheckCircle,
  WarningCircle,
  FloppyDisk,
  Eye,
} from '@phosphor-icons/react';
import { useStoreConfig, useUpdateStoreConfig } from '../hooks/use-orders';

const VIETNAM_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$|^1[89]00\d{4,6}$|^(02\d{1,2})\d{7,8}$/;

export function StoreSettingsView() {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data: config, isLoading } = useStoreConfig();
  const updateMutation = useUpdateStoreConfig();

  // Watch values for live preview
  const isOrderingEnabled = Form.useWatch('customerOrderingEnabled', form);
  const contactPhone = Form.useWatch('contactPhone', form);

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        customerOrderingEnabled: config.customerOrderingEnabled ?? true,
        contactPhone: config.contactPhone || '0988888888',
      });
    }
  }, [config, form]);

  const handleSave = async (values: {
    customerOrderingEnabled: boolean;
    contactPhone: string;
  }) => {
    try {
      await updateMutation.mutateAsync({
        customerOrderingEnabled: values.customerOrderingEnabled,
        contactPhone: values.contactPhone?.trim(),
      });
      message.success('Cập nhật cấu hình cửa hàng thành công!');
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
          contactPhone: '0988888888',
        }}
      >
        <div className="space-y-4">
          {/* Card 1: Trạng thái đặt hàng Storefront */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-sushi-border/60">
              <div className="flex items-center gap-2">
                <Storefront size={18} className="text-sushi-gold" />
                <span className="font-semibold text-sm text-sushi-text">
                  Đặt Món Trực Tuyến Storefront
                </span>
              </div>

              {isOrderingEnabled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle size={13} weight="fill" />
                  Đang nhận đơn
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  <WarningCircle size={13} weight="fill" />
                  Chỉ gọi điện
                </span>
              )}
            </div>

            {/* Switch container on mobile */}
            <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-900/60 border border-sushi-border/60">
              <div className="space-y-1 min-w-0 pr-2">
                <div className="text-sm font-semibold text-sushi-text">
                  Cho phép khách tự đặt món trên website
                </div>
                <p className="text-xs text-sushi-text-muted leading-relaxed">
                  {isOrderingEnabled
                    ? 'Khách hàng có thể thêm món vào giỏ, chọn địa chỉ nhận hàng và tạo đơn trực tuyến.'
                    : 'Storefront sẽ ẩn giỏ hàng, chuyển nút đặt món thành nút gọi hotline trực tiếp. Nhân viên vẫn tạo được đơn trong Admin.'}
                </p>
              </div>

              <Form.Item
                name="customerOrderingEnabled"
                valuePropName="checked"
                className="mb-0 shrink-0"
              >
                <Switch
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
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
                  Hotline Nhận Đơn Hàng
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Form.Item
                name="contactPhone"
                label={
                  <span className="font-medium text-xs sm:text-sm text-sushi-text">
                    Số điện thoại Hotline của cửa hàng
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
                  placeholder="Ví dụ: 0988888888 hoặc 19006868"
                  prefix={<PhoneCall size={18} className="text-sushi-text-muted mr-1" />}
                  className="w-full sm:max-w-md h-11 rounded-xl bg-zinc-900/80 border-sushi-border text-sushi-text"
                />
              </Form.Item>
              <p className="text-2xs sm:text-xs text-sushi-text-muted leading-relaxed">
                Số điện thoại này sẽ được dùng khi khách bấm vào các nút gọi điện thoại trực tiếp (<code className="text-sushi-gold font-mono">tel:</code>) trên website Storefront khi tắt đặt món.
              </p>
            </div>
          </div>

          {/* Card 3: Live Preview Info */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-sushi-border/60">
              <Eye size={18} className="text-sushi-gold" />
              <span className="font-semibold text-sm text-sushi-text">
                Trạng Thái Hiển Thị Thực Tế Trên Storefront
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-sushi-border/60 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-sushi-text">
                <span className="w-1.5 h-1.5 rounded-full bg-sushi-gold mt-1.5 shrink-0" />
                <span>
                  <strong>Trang chủ & Thực đơn:</strong>{' '}
                  <span className="text-sushi-text-muted">
                    {isOrderingEnabled
                      ? 'Hiển thị nút "Chọn món" thêm vào giỏ hàng.'
                      : `Ẩn nút chọn món, hiển thị nút "Gọi đặt" gọi số ${contactPhone || '(chưa nhập)'}.`}
                  </span>
                </span>
              </div>

              <div className="flex items-start gap-2 text-sushi-text">
                <span className="w-1.5 h-1.5 rounded-full bg-sushi-gold mt-1.5 shrink-0" />
                <span>
                  <strong>Thanh điều hướng & Giỏ hàng:</strong>{' '}
                  <span className="text-sushi-text-muted">
                    {isOrderingEnabled
                      ? 'Hiển thị icon giỏ hàng và số lượng món trên Header & Bottom Nav.'
                      : 'Ẩn giỏ hàng, thay thế bằng tab Gọi Hotline trên thanh điều hướng di động.'}
                  </span>
                </span>
              </div>

              <div className="flex items-start gap-2 text-sushi-text">
                <span className="w-1.5 h-1.5 rounded-full bg-sushi-gold mt-1.5 shrink-0" />
                <span>
                  <strong>Đơn nhân viên (Admin):</strong>{' '}
                  <span className="text-sushi-text-muted">
                    Luôn tạo đơn giao tận nơi bình thường qua nút &quot;+ Tạo đơn qua điện thoại&quot; trong trang Quản lý đơn hàng.
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={updateMutation.isPending}
              icon={<FloppyDisk size={18} weight="bold" />}
              className="w-full sm:w-auto h-12 sm:h-11 px-8 rounded-xl bg-sushi-gold hover:bg-sushi-gold/90 text-black font-semibold border-none flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
            >
              Lưu Cấu Hình Cửa Hàng
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
