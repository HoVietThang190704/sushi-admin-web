'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Form,
  Input,
  Alert,
  SushiButton,
  EnvelopeSimple,
  LockSimple,
  ShieldCheck,
} from '@/components/ui';
import { authApi } from '../api/auth.api';
import { useTranslation } from '@/lib/i18n';
import { loginSchema } from '../schemas/auth.schema';
import { createZodRule } from '@/lib/zod-validator';

export function LoginForm() {
  const { t, locale, setLocale } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: unknown) => {
    setError(null);
    setLoading(true);

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Dữ liệu không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      await authApi.login(result.data);
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t('auth.loginError');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] sm:w-[430px] mx-auto">
      {/* Container kế thừa token theme bg-sushi-card và border-sushi-border */}
      <div className="relative rounded-3xl bg-sushi-card/95 border border-sushi-border shadow-2xl backdrop-blur-2xl p-8 sm:p-9 ring-1 ring-white/5 min-h-[500px] flex flex-col justify-between">
        
        <div>
          {/* Top Header Bar */}
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-sushi-border h-14">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-red-500/30 flex items-center justify-center bg-sushi-surface shadow-md shrink-0">
                <Image
                  src="/logo.png"
                  alt="Sushi Platform Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-sushi-text font-bold text-sm tracking-wider font-sans leading-none">
                  SUSHI PLATFORM
                </div>
                <div className="text-2xs font-mono tracking-wider uppercase text-sushi-text-muted mt-1 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sushi-emerald animate-pulse"></span>
                  <span>SYSTEM ONLINE</span>
                </div>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center p-0.5 rounded-full bg-sushi-surface border border-sushi-border text-xs shrink-0">
              <button
                type="button"
                onClick={() => setLocale('vi')}
                className={`w-[58px] py-1 rounded-full font-medium text-xs text-center transition-all cursor-pointer ${
                  locale === 'vi'
                    ? 'bg-sushi-primary text-sushi-text shadow-sm'
                    : 'text-sushi-text-muted hover:text-sushi-text'
                }`}
              >
                🇻🇳 VI
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`w-[58px] py-1 rounded-full font-medium text-xs text-center transition-all cursor-pointer ${
                  locale === 'en'
                    ? 'bg-sushi-primary text-sushi-text shadow-sm'
                    : 'text-sushi-text-muted hover:text-sushi-text'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Title Area */}
          <div className="mb-7 h-8 flex items-center">
            <h2 className="text-2xl font-bold text-sushi-text tracking-tight font-sans">
              {t('auth.loginTitle')}
            </h2>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6">
              <Alert
                message={error}
                type="error"
                showIcon
                className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300"
              />
            </div>
          )}

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
                <span className="text-2xs font-mono uppercase tracking-wider text-sushi-text-muted">
                  {t('auth.emailLabel')}
                </span>
              }
              rules={[createZodRule(loginSchema, 'email')]}
              style={{ marginBottom: 18 }}
            >
              <Input
                prefix={<EnvelopeSimple size={18} className="text-sushi-text-dim mr-2 shrink-0" />}
                placeholder={t('auth.emailPlaceholder')}
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={
                <div className="w-full flex items-center justify-between">
                  <span className="text-2xs font-mono uppercase tracking-wider text-sushi-text-muted">
                    {t('auth.passwordLabel')}
                  </span>
                </div>
              }
              rules={[createZodRule(loginSchema, 'password')]}
              style={{ marginBottom: 26 }}
            >
              <Input.Password
                prefix={<LockSimple size={18} className="text-sushi-text-dim mr-2 shrink-0" />}
                placeholder={t('auth.passwordPlaceholder')}
                style={{ height: 48, borderRadius: 12 }}
              />
            </Form.Item>

            {/* Submit Button dùng SushiButton chuẩn theme */}
            <Form.Item style={{ marginBottom: 0 }}>
              <SushiButton
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 48, borderRadius: 12, fontSize: 14 }}
              >
                {loading ? t('auth.authenticating') : t('auth.loginButton')}
              </SushiButton>
            </Form.Item>
          </Form>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 pt-5 border-t border-sushi-border flex items-center justify-center space-x-2 text-2xs text-sushi-text-dim font-sans text-center">
          <ShieldCheck size={16} className="text-sushi-emerald shrink-0" />
          <span className="whitespace-nowrap">{t('auth.cookieSecurityNotice')}</span>
        </div>
      </div>
    </div>
  );
}
