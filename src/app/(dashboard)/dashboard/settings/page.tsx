'use client';

import { PaymentSettingsView } from '@/features/orders';
import { SushiPageHeader } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <SushiPageHeader
        title={t('paymentSettingsPage.title')}
        subtitle={t('paymentSettingsPage.subtitle')}
      />
      <PaymentSettingsView />
    </div>
  );
}
