import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { PaginatedResponse } from '../../api/types';

export interface Invitation {
  id: string;
  email: string;
  role: 'manager' | 'staff';
  location_ids: string[];
  skill_ids: string[];
  token: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  inviter_name?: string;
}

export function useInvitations(params?: { page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  const query_str = qs.toString();

  return useQuery({
    queryKey: ['invitations', query_str],
    queryFn: () =>
      api.get<PaginatedResponse<Invitation>>(`/invitations${query_str ? `?${query_str}` : ''}`),
    select: (res) => res.data,
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      email: string;
      role: 'manager' | 'staff';
      locationIds?: string[];
      skillIds?: string[];
    }) => api.post('/invitations', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/invitations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useResendInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/invitations/${id}/resend`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}
