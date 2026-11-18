import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../api/staff.api';
import {
  ListStaffParams,
  CreateStaffDto,
  UpdateStaffDto,
  CreateStaffResponse,
  ResetPasswordResponse,
  StaffItem,
} from '../types';

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (params?: ListStaffParams) => [...staffKeys.lists(), params] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
};

export function useStaffList(params?: ListStaffParams) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffApi.getStaffList(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation<CreateStaffResponse, Error, CreateStaffDto>({
    mutationFn: (dto: CreateStaffDto) => staffApi.createStaff(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation<StaffItem, Error, { id: string; dto: UpdateStaffDto }>({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStaffDto }) =>
      staffApi.updateStaff(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useSetStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation<StaffItem, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      staffApi.setStaffStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useResetStaffPassword() {
  const queryClient = useQueryClient();
  return useMutation<ResetPasswordResponse, Error, string>({
    mutationFn: (id: string) => staffApi.resetStaffPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}
