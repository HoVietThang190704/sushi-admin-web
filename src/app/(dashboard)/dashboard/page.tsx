'use client';

import { Card, Row, Col, Statistic, ForkKnife, CheckCircle, Database, Package, SushiPageHeader, Button, Space } from '@/components/ui';
import { SUSHICOLORS, SUSHITYPO } from '@/lib/theme';
import { useAuth } from '@/features/auth';
import { useCategories } from '@/features/catalog';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function DashboardOverviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();

  return (
    <div>
      <SushiPageHeader
        title={t('dashboard.overviewTitle')}
        subtitle={t('dashboard.overviewSubtitle')}
      />

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card className="bg-sushi-card border-sushi-border">
            <Statistic
              title={<span className="text-sushi-text-muted">{t('dashboard.totalCategories')}</span>}
              value={categories.length}
              styles={{ content: { color: SUSHICOLORS.primary, fontWeight: 'bold' } }}
              prefix={<ForkKnife size={22} className="text-sushi-primary mr-2" />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-sushi-card border-sushi-border">
            <Statistic
              title={<span className="text-sushi-text-muted">{t('dashboard.currentRole')}</span>}
              value={user?.role}
              styles={{ content: { color: SUSHICOLORS.gold, fontSize: SUSHITYPO.fontSize.xl } }}
              prefix={<CheckCircle size={22} className="text-sushi-gold mr-2" />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-sushi-card border-sushi-border">
            <Statistic
              title={<span className="text-sushi-text-muted">{t('dashboard.database')}</span>}
              value={t('dashboard.databaseValue')}
              styles={{ content: { color: SUSHICOLORS.emerald, fontSize: SUSHITYPO.fontSize.xl } }}
              prefix={<Database size={22} className="text-sushi-emerald mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="bg-sushi-card border-sushi-border"
        title={<span className="text-sushi-text font-semibold">{t('dashboard.shortcutsTitle')}</span>}
      >
        <Space size="middle" wrap>
          <Button
            type="primary"
            icon={<ForkKnife size={16} />}
            onClick={() => router.push('/dashboard/categories')}
          >
            {t('dashboard.manageCategoriesBtn')}
          </Button>
          <Button
            icon={<Package size={16} />}
            onClick={() => router.push('/dashboard/orders')}
          >
            {t('dashboard.trackOrdersBtn')}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
