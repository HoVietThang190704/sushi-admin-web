import { OrderStatus } from './types';
import { ORDER_STATUS_CONFIG } from './components/order-status-badge';
import { TranslationKey } from '@/lib/i18n';

/**
 * Lấy nhãn tương ứng với mã OrderStatus (hỗ trợ hàm t() nếu có)
 */
export function getOrderStatusLabel(
  status: OrderStatus | string,
  t?: (key: TranslationKey) => string,
): string {
  const config = ORDER_STATUS_CONFIG[status as OrderStatus];
  if (!config) return status;
  if (t && config.labelKey) return t(config.labelKey);
  return config.label || status;
}

/**
 * Định dạng tên vai trò người thực hiện thay đổi vòng đời đơn
 */
export function formatOrderActor(
  actor?: string,
  t?: (key: TranslationKey) => string,
): string {
  if (!actor) return '';
  if (actor === 'CUSTOMER') return t ? t('common.customer') : 'Khách hàng';
  if (actor === 'SUPER_ADMIN' || actor === 'ADMIN')
    return t ? t('common.superAdmin') : 'Quản trị viên';
  if (actor === 'STAFF') return t ? t('common.cashier') : 'Nhân viên';
  return actor;
}
