'use client';

import { useEffect } from 'react';
import { Button, Typography, ArrowsClockwise, WarningCircle } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

const { Title, Text } = Typography;

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error('Dashboard Error caught by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-sushi-card border border-sushi-border rounded-2xl p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-sushi-surface border border-sushi-border text-sushi-primary flex items-center justify-center mx-auto mb-4">
          <WarningCircle size={32} />
        </div>
        
        <Title level={4} className="text-sushi-text mb-2 font-sans">
          {t('errors.title')}
        </Title>
        
        <Text className="text-sushi-text-muted text-sm block mb-6 leading-relaxed font-sans">
          {error?.message || t('errors.defaultMessage')}
        </Text>

        <Button
          type="primary"
          icon={<ArrowsClockwise size={16} />}
          onClick={() => reset()}
          className="h-10 rounded-xl font-medium"
        >
          {t('errors.retry')}
        </Button>
      </div>
    </div>
  );
}
