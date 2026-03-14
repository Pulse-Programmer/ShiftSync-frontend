import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface AvailabilityRecord {
  id: string;
  user_id: string;
  location_id: string;
  type: 'recurring' | 'exception';
  day_of_week: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export function useAvailability(userId: string | null, locationId?: string) {
  const qs = locationId ? `?locationId=${locationId}` : '';
  return useQuery({
    queryKey: ['availability', userId, locationId],
    queryFn: () =>
      api.get<AvailabilityRecord[]>(`/users/${userId}/availability${qs}`),
    enabled: !!userId,
  });
}

export function useCreateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      userId: string;
      locationId: string;
      type: 'recurring' | 'exception';
      dayOfWeek?: number;
      specificDate?: string;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }) => {
      const { userId, ...body } = data;
      return api.post(`/users/${userId}/availability`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      userId: string;
      availabilityId: string;
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
    }) => {
      const { userId, availabilityId, ...body } = data;
      return api.put(`/users/${userId}/availability/${availabilityId}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useDeleteAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; availabilityId: string }) =>
      api.delete(`/users/${data.userId}/availability/${data.availabilityId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}
