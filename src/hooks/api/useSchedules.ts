import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

interface ScheduleResponse {
  id: string;
  location_id: string;
  week_start: string;
  status: 'draft' | 'published';
  published_at: string | null;
  published_by: string | null;
  location_name: string;
  timezone: string;
}

export function useSchedule(locationId: string | null, weekStart: string) {
  return useQuery({
    queryKey: ['schedule', locationId, weekStart],
    queryFn: () =>
      api.get<ScheduleResponse | null>(
        `/schedules?locationId=${locationId}&weekStart=${weekStart}`,
      ),
    enabled: !!locationId,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { locationId: string; weekStart: string }) =>
      api.post<ScheduleResponse>('/schedules', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['schedule', vars.locationId, vars.weekStart] });
    },
  });
}

export function usePublishSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { scheduleId: string; locationId: string }) =>
      api.put(`/schedules/${data.scheduleId}/publish`, { locationId: data.locationId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useUnpublishSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { scheduleId: string; locationId: string }) =>
      api.put(`/schedules/${data.scheduleId}/unpublish`, { locationId: data.locationId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}
