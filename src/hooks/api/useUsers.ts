import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { UserProfile } from '../../api/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<UserProfile[]>('/users'),
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.get<UserProfile>(`/users/${userId}`),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      userId: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      desiredWeeklyHours?: number;
    }) => {
      const { userId, ...body } = data;
      return api.put(`/users/${userId}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.put(`/users/${userId}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.put(`/users/${userId}/reactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAssignSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; skillId: string }) =>
      api.post(`/users/${data.userId}/skills`, { skillId: data.skillId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRemoveSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; skillId: string }) =>
      api.delete(`/users/${data.userId}/skills/${data.skillId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useCertifyLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; locationId: string }) =>
      api.post(`/users/${data.userId}/locations`, { locationId: data.locationId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useDecertifyLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; locationId: string }) =>
      api.put(`/users/${data.userId}/locations/${data.locationId}/decertify`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
