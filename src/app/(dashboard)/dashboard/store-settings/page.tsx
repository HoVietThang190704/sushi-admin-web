'use client';

import { StoreSettingsView } from '@/features/settings';
import { SushiPageHeader } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export default function StoreSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <SushiPageHeader
        title={t('storeSettingsPage.title')}
        subtitle={t('storeSettingsPage.subtitle')}
      />
      <StoreSettingsView />
    </div>
  );
}
