import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { PaginatedResponse } from '../../api/types';

export interface SwapRequestResponse {
  id: string;
  type: 'swap' | 'drop';
  requester_assignment_id: string;
  target_assignment_id: string | null;
  target_user_id: string | null;
  status: 'pending_peer' | 'pending_manager' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  requester_reason: string | null;
  manager_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  requester_first: string;
  requester_last: string;
  target_first: string | null;
  target_last: string | null;
  shift_start: string;
  shift_end: string;
  location_name: string;
  timezone: string;
  skill_name: string | null;
}

export interface AvailableShiftResponse {
  swap_request_id: string;
  requester_reason: string | null;
  expires_at: string | null;
  start_time: string;
  end_time: string;
  required_skill_id: string | null;
  location_name: string;
  timezone: string;
  skill_name: string | null;
  requester_first: string;
  requester_last: string;
}

export function useSwapRequests(params?: { status?: string; locationId?: string; page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.locationId) qs.set('locationId', params.locationId);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const query_str = qs.toString();

  return useQuery({
    queryKey: ['swap-requests', query_str],
    queryFn: () =>
      api.get<PaginatedResponse<SwapRequestResponse>>(`/swap-requests${query_str ? `?${query_str}` : ''}`),
    select: (res) => res.data,
  });
}

export function useAvailableShifts() {
  return useQuery({
    queryKey: ['available-shifts'],
    queryFn: () => api.get<AvailableShiftResponse[]>('/swap-requests/available'),
  });
}

export function useCreateSwapRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: 'swap' | 'drop';
      assignmentId: string;
      targetAssignmentId?: string;
      reason?: string;
    }) => api.post('/swap-requests', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swap-requests'] });
      qc.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useAcceptSwap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (swapId: string) => api.put(`/swap-requests/${swapId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
}

export function useApproveSwap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { swapId: string; reason?: string }) =>
      api.put(`/swap-requests/${data.swapId}/approve`, { reason: data.reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swap-requests'] });
      qc.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useRejectSwap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { swapId: string; reason: string }) =>
      api.put(`/swap-requests/${data.swapId}/reject`, { reason: data.reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
}

export function useCancelSwap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (swapId: string) => api.put(`/swap-requests/${swapId}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
}

export function usePickupShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (swapId: string) => api.post(`/swap-requests/${swapId}/pickup`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swap-requests'] });
      qc.invalidateQueries({ queryKey: ['available-shifts'] });
    },
  });
}
