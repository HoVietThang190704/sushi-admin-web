'use client';

import { PaymentSettingsView } from '@/features/settings';
import { SushiPageHeader } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('paymentSettingsPage.title')}
          subtitle={t('paymentSettingsPage.subtitle')}
        />
      </div>
      <PaymentSettingsView />
    </div>
  );
}
