import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface Invitation {
  id: string;
  email: string;
  role: 'manager' | 'staff';
  location_ids: string[];
  skill_ids: string[];
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  inviter_name?: string;
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => api.get<Invitation[]>('/invitations'),
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
