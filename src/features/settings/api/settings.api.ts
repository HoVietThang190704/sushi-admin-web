import { fetchApi } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  PaymentConfig,
  UpdatePaymentConfigInput,
  StoreConfig,
  UpdateStoreConfigInput,
} from '../types';

export const settingsApi = {
  getPaymentConfig: () =>
    fetchApi<PaymentConfig>(API_ENDPOINTS.SETTINGS.PAYMENT_CONFIG),

  updatePaymentConfig: (input: UpdatePaymentConfigInput) =>
    fetchApi<PaymentConfig>(API_ENDPOINTS.SETTINGS.PAYMENT_CONFIG, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  getStoreConfig: () =>
    fetchApi<StoreConfig>(API_ENDPOINTS.SETTINGS.STORE_CONFIG),

  updateStoreConfig: (input: UpdateStoreConfigInput) =>
    fetchApi<StoreConfig>(API_ENDPOINTS.SETTINGS.STORE_CONFIG, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
