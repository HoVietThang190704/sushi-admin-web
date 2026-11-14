'use client';

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Switch,
  Button,
  App,
  Card,
  Alert,
  Tag,
  Divider,
} from 'antd';
import {
  Storefront,
  PhoneCall,
  CheckCircle,
  WarningCircle,
  FloppyDisk,
  Info,
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Storefront size={28} weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Cấu hình Cửa Hàng & Đặt Món Trực Tuyến
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý trạng thái nhận đơn trên Storefront và thông tin hotline liên hệ của nhà hàng
            </p>
          </div>
        </div>
      </div>

      {/* Main form */}
      <Card
        loading={isLoading}
        className="border border-border/80 shadow-sm rounded-xl overflow-hidden"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            customerOrderingEnabled: true,
            contactPhone: '0988888888',
          }}
        >
          {/* Section 1: Ordering Switch */}
          <div className="p-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base text-foreground">
                    Cho phép khách đặt hàng trên Storefront
                  </span>
                  {isOrderingEnabled ? (
                    <Tag color="success" icon={<CheckCircle size={13} className="inline mr-1" />}>
                      Đang nhận đơn
                    </Tag>
                  ) : (
                    <Tag color="warning" icon={<WarningCircle size={13} className="inline mr-1" />}>
                      Chỉ gọi điện
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-muted-foreground max-w-xl">
                  {isOrderingEnabled
                    ? 'Khách hàng có thể thêm món vào giỏ, chọn địa chỉ và thanh toán/gửi đơn trực tuyến trên website.'
                    : 'Storefront sẽ ẩn giỏ hàng và các nút thêm món, chuyển thành nút "Gọi đặt món" trực tiếp đến hotline. Nhân viên vẫn có thể tạo đơn giao tận nơi trong Admin.'}
                </p>
              </div>

              <Form.Item
                name="customerOrderingEnabled"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                  className={isOrderingEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}
                />
              </Form.Item>
            </div>
          </div>

          <Divider className="my-5" />

          {/* Section 2: Contact Hotline */}
          <div className="px-2">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <PhoneCall size={18} className="text-primary" />
              Thông tin liên hệ nhận đơn
            </h3>

            <Form.Item
              name="contactPhone"
              label={
                <span className="font-medium text-sm">
                  Số điện thoại Hotline nhận đơn
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
              extra="Số điện thoại này sẽ được dùng khi khách bấm vào các nút gọi điện thoại trực tiếp (tel:) trên website Storefront."
            >
              <Input
                size="large"
                placeholder="Ví dụ: 0988888888 hoặc 19006868"
                prefix={<PhoneCall size={18} className="text-muted-foreground mr-1" />}
                className="max-w-md"
              />
            </Form.Item>
          </div>

          {/* Live Preview Box */}
          <div className="px-2 mt-4">
            <Alert
              icon={<Info size={20} />}
              showIcon
              type={isOrderingEnabled ? 'info' : 'warning'}
              message={
                <span className="font-semibold text-sm">
                  Trải nghiệm Storefront hiện tại:{' '}
                  {isOrderingEnabled ? 'Chế độ Đặt hàng trực tuyến' : 'Chế độ Gọi hotline đặt món'}
                </span>
              }
              description={
                <div className="text-xs space-y-1.5 mt-1 text-muted-foreground">
                  <div>
                    • <strong>Trang chủ & Thực đơn:</strong>{' '}
                    {isOrderingEnabled
                      ? 'Hiển thị nút "Thêm vào giỏ hàng", mở popup giỏ hàng, cho chọn số lượng.'
                      : `Ẩn nút thêm giỏ, hiển thị nút "Gọi đặt món" gọi trực tiếp tới số: ${contactPhone || '(chưa nhập)'}.`}
                  </div>
                  <div>
                    • <strong>Thanh điều hướng & Giỏ hàng:</strong>{' '}
                    {isOrderingEnabled
                      ? 'Hiển thị biểu tượng giỏ hàng và số lượng món trên Header và Bottom Navigation.'
                      : 'Ẩn giỏ hàng, thay thế bằng tab Gọi Hotline trên thanh điều hướng di động.'}
                  </div>
                  <div>
                    • <strong>Đơn nhân viên (Admin):</strong> Luôn hoạt động bình thường qua chức năng Tạo đơn giao hàng qua điện thoại.
                  </div>
                </div>
              }
              className="rounded-xl"
            />
          </div>

          <Divider className="my-5" />

          {/* Submit */}
          <div className="flex justify-end gap-3 px-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={updateMutation.isPending}
              icon={<FloppyDisk size={18} weight="bold" />}
              className="px-6 rounded-lg font-medium"
            >
              Lưu Cấu Hình
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
