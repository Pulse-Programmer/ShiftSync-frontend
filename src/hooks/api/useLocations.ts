import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Location } from '../../api/types';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => api.get<Location[]>('/locations'),
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      address?: string;
      timezone: string;
      editCutoffHours?: number;
    }) => api.post('/locations', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      name?: string;
      address?: string;
      timezone?: string;
      editCutoffHours?: number;
    }) => {
      const { id, ...body } = data;
      return api.put(`/locations/${id}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
