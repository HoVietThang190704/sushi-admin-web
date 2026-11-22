import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import {
  UpdatePaymentConfigInput,
  UpdateStoreConfigInput,
} from '../types';

export const settingsKeys = {
  all: ['settings'] as const,
  paymentConfig: ['payment-config'] as const,
  storeConfig: ['store-config'] as const,
};

export function usePaymentConfig() {
  return useQuery({
    queryKey: settingsKeys.paymentConfig,
    queryFn: () => settingsApi.getPaymentConfig(),
  });
}

export function useUpdatePaymentConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePaymentConfigInput) =>
      settingsApi.updatePaymentConfig(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentConfig });
    },
  });
}

export function useStoreConfig() {
  return useQuery({
    queryKey: settingsKeys.storeConfig,
    queryFn: () => settingsApi.getStoreConfig(),
  });
}

export function useUpdateStoreConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStoreConfigInput) =>
      settingsApi.updateStoreConfig(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.storeConfig });
    },
  });
}
