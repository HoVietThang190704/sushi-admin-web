'use client';

import { StoreSettingsView } from '@/features/settings';
import { SushiPageHeader } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export default function StoreSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-sushi-border">
        <SushiPageHeader
          title={t('storeSettingsPage.title')}
          subtitle={t('storeSettingsPage.subtitle')}
        />
      </div>
      <StoreSettingsView />
    </div>
  );
}
