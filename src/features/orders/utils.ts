import { OrderStatus } from './types';
import { ORDER_STATUS_CONFIG } from './components/order-status-badge';

/**
 * Lấy nhãn tiếng Việt tương ứng với mã OrderStatus
 */
export function getOrderStatusLabel(status: OrderStatus | string): string {
  return ORDER_STATUS_CONFIG[status as OrderStatus]?.label || status;
}

/**
 * Định dạng tên vai trò người thực hiện thay đổi vòng đời đơn sang tiếng Việt
 */
export function formatOrderActor(actor?: string): string {
  if (!actor) return '';
  if (actor === 'CUSTOMER') return 'Khách hàng';
  if (actor === 'SUPER_ADMIN' || actor === 'ADMIN') return 'Quản trị viên';
  if (actor === 'STAFF') return 'Nhân viên';
  return actor;
}
