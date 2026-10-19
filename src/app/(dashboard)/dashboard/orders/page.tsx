'use client';

import { Card, Empty, SushiPageHeader } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export default function OrdersPage() {
  const { t } = useTranslation();

  return (
    <div>
      <SushiPageHeader
        title={t('dashboard.ordersTitle')}
        subtitle={t('dashboard.ordersSubtitle')}
      />

      <Card className="bg-sushi-card border-sushi-border text-center py-12">
        <Empty
          description={
            <span className="text-sushi-text-muted">
              {t('dashboard.ordersComingSoon')}
            </span>
          }
        />
      </Card>
    </div>
  );
}
