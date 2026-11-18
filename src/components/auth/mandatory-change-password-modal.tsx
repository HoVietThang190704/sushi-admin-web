'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Key,
} from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuth } from '@/features/auth';

interface MandatoryChangePasswordModalProps {
  open: boolean;
}

export function MandatoryChangePasswordModal({ open }: MandatoryChangePasswordModalProps) {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (user) {
        setUser({
          ...user,
          ...res.user,
          mustChangePassword: false,
        });
      }
      form.resetFields();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.loginError');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center space-x-2 text-sushi-primary">
          <Key size={20} weight="bold" />
          <span className="font-bold text-base text-sushi-text">
            {t('changePasswordModal.title')}
          </span>
        </div>
      }
      closable={false}
      mask={{ closable: false }}
      keyboard={false}
      footer={null}
      destroyOnHidden
      className="sushi-modal"
    >
      <div className="py-2 space-y-4">
        <p className="text-xs text-sushi-text-muted leading-relaxed">
          {t('changePasswordModal.subtitle')}
        </p>

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            showIcon
            className="text-xs"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="currentPassword"
            label={
              <span className="text-xs font-semibold text-sushi-text">
                {t('changePasswordModal.currentPassword')}
              </span>
            }
            rules={[
              {
                required: true,
                message: t('changePasswordModal.currentPasswordRequired'),
              },
            ]}
          >
            <Input.Password
              placeholder="••••••••••••"
              className="sushi-input text-xs"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={
              <span className="text-xs font-semibold text-sushi-text">
                {t('changePasswordModal.newPassword')}
              </span>
            }
            rules={[
              {
                required: true,
                message: t('changePasswordModal.newPasswordRequired'),
              },
              {
                min: 8,
                message: t('changePasswordModal.newPasswordMinLength'),
              },
            ]}
          >
            <Input.Password
              placeholder="••••••••••••"
              className="sushi-input text-xs"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={
              <span className="text-xs font-semibold text-sushi-text">
                {t('changePasswordModal.confirmPassword')}
              </span>
            }
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
                message: t('changePasswordModal.confirmPasswordRequired'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('changePasswordModal.confirmPasswordMismatch')),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="••••••••••••"
              className="sushi-input text-xs"
            />
          </Form.Item>

          <div className="pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="sushi-button-primary"
            >
              {t('changePasswordModal.submitBtn')}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
