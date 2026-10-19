'use client';

import { useEffect } from 'react';
import { Button, Typography, ArrowsClockwise } from '@/components/ui';

const { Title, Text } = Typography;

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error caught by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="max-w-md w-full bg-sushi-card border border-sushi-border rounded-2xl p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/40 text-sushi-primary flex items-center justify-center text-2xl mx-auto mb-4">
          ⚠️
        </div>
        
        <Title level={4} className="text-sushi-text mb-2">
          Đã Xảy Ra Sự Cố
        </Title>
        
        <Text className="text-sushi-text-muted text-sm block mb-6 leading-relaxed">
          {error?.message || 'Không thể tải dữ liệu trang. Vui lòng kiểm tra lại kết nối API Gateway.'}
        </Text>

        <Button
          type="primary"
          icon={<ArrowsClockwise size={16} />}
          onClick={() => reset()}
          style={{ height: 42, borderRadius: 10 }}
        >
          Thử Tải Lại Trang
        </Button>
      </div>
    </div>
  );
}
