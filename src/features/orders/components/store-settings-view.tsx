'use client';

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Switch,
  SushiButton,
  App,
  Storefront,
  CheckCircle,
  WarningCircle,
} from '@/components/ui';
import {
  PhoneCall,
  FloppyDisk,
} from '@phosphor-icons/react';
import { useStoreConfig, useUpdateStoreConfig } from '../hooks/use-orders';
import { useTranslation } from '@/lib/i18n';

const VIETNAM_PHONE_REGEX = /^(0|\+84)[35789]\d{8}$|^1[89]00\d{4,6}$|^(02\d{1,2})\d{7,8}$/;

export function StoreSettingsView() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data: config, isLoading } = useStoreConfig();
  const updateMutation = useUpdateStoreConfig();

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
