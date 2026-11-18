'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  SushiButton,
  EnvelopeSimple,
  LockSimple,
  ShieldCheck,
  Eye,
  EyeSlash,
  message,
} from '@/components/ui';
import { authApi } from '../api/auth.api';
import { useAuth } from '../context/auth-context';
import { useTranslation } from '@/lib/i18n';
import { createLoginSchema } from '../schemas/auth.schema';
import { createZodRule } from '@/lib/zod-validator';

export function LoginForm() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { setUser, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const schema = useMemo(() => createLoginSchema(t), [t]);

  // Nếu đã đăng nhập thành công, tự động chuyển vào dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cập nhật lại thông báo lỗi validation tức thì khi người dùng chuyển đổi ngôn ngữ (VI <-> EN)
  useEffect(() => {
    const hasErrors = form.getFieldsError().some((item) => item.errors.length > 0);
    if (hasErrors) {
      form.validateFields();
    }
  }, [locale, form]);

  const onFinish = async (values: unknown) => {
    setLoading(true);

    const result = schema.safeParse(values);
    if (!result.success) {
      messageApi.error(result.error.issues[0]?.message || 'Dữ liệu không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.login(result.data);
      // Cập nhật trực tiếp phiên đăng nhập vào AuthContext/TanStack Query để tránh lag/race condition
      setUser(response.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.loginError');
      messageApi.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {contextHolder}

      {/* Card Container dùng token theme chuẩn & hiệu ứng shadow sang trọng */}
      <div className="relative rounded-3xl bg-sushi-card/95 border border-sushi-border/90 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.65)] backdrop-blur-2xl p-6 sm:p-8 md:p-9 flex flex-col">
        {/* Status bar & Version indicator */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sushi-surface border border-sushi-border/70 text-2xs font-sans text-sushi-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-sushi-emerald animate-pulse" />
            <span className="font-medium tracking-wide">SYSTEM ONLINE</span>
          </div>
          <span className="text-3xs font-mono text-sushi-text-dim">v1.0.0</span>
        </div>

        {/* Title & Subtitle Area */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-sushi-text tracking-tight font-sans leading-tight">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-sushi-text-muted font-sans leading-relaxed">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          {/* Email Field */}
          <Form.Item
            name="email"
            label={
              <span className="text-xs font-semibold text-sushi-text-muted font-sans">
                {t('auth.emailLabel')}
              </span>
            }
            rules={[createZodRule(schema, 'email')]}
            style={{ marginBottom: 18 }}
          >
            <Input
              prefix={<EnvelopeSimple size={18} className="text-sushi-text-dim mr-2 shrink-0" />}
              placeholder={t('auth.emailPlaceholder')}
              className="h-12 rounded-xl text-sm"
              autoComplete="email"
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            label={
              <span className="text-xs font-semibold text-sushi-text-muted font-sans">
                {t('auth.passwordLabel')}
              </span>
            }
            rules={[createZodRule(schema, 'password')]}
            style={{ marginBottom: 24 }}
          >
            <Input.Password
              prefix={<LockSimple size={18} className="text-sushi-text-dim mr-2 shrink-0" />}
              placeholder={t('auth.passwordPlaceholder')}
              className="h-12 rounded-xl text-sm"
              autoComplete="current-password"
              visibilityToggle={{
                visible: showPassword,
                onVisibleChange: setShowPassword,
              }}
              iconRender={(visible) => (
                <button
                  type="button"
                  tabIndex={-1}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="p-1.5 flex items-center justify-center text-sushi-text-dim hover:text-sushi-text active:text-sushi-primary cursor-pointer touch-manipulation focus:outline-none"
                  aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {visible ? <Eye size={18} /> : <EyeSlash size={18} />}
                </button>
              )}
            />
          </Form.Item>

          {/* Submit Button dùng SushiButton chuẩn theme */}
          <Form.Item style={{ marginBottom: 0 }}>
            <SushiButton
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-xl text-sm font-semibold tracking-wide"
            >
              {loading ? t('auth.authenticating') : t('auth.loginButton')}
            </SushiButton>
          </Form.Item>
        </Form>

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-sushi-border/50 flex items-center justify-center space-x-2 text-2xs text-sushi-text-dim font-sans text-center">
          <ShieldCheck size={16} className="text-sushi-emerald shrink-0" />
          <span>{t('auth.cookieSecurityNotice')}</span>
        </div>
      </div>
    </div>
  );
}
