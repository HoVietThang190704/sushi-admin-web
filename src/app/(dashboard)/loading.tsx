'use client';

import { Card, Skeleton, Row, Col } from '@/components/ui';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pb-6 border-b border-sushi-border">
        <div className="h-8 w-64 bg-sushi-card-hover rounded-lg mb-2"></div>
        <div className="h-4 w-96 bg-sushi-surface rounded-md"></div>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card className="bg-sushi-card border-sushi-border">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-sushi-card border-sushi-border">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-sushi-card border-sushi-border">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      </Row>

      <Card className="bg-sushi-card border-sushi-border">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </div>
  );
}
