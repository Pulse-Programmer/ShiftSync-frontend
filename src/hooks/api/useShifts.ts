import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ValidationResult } from '../../api/types';

export interface ShiftResponse {
  id: string;
  schedule_id: string;
  location_id: string;
  start_time: string;
  end_time: string;
  required_skill_id: string | null;
  skill_name: string | null;
  headcount_needed: number;
  notes: string | null;
  timezone: string;
  assignments: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    status: string;
    version: number;
  }[];
}

export function useShifts(scheduleId: string | null | undefined) {
  return useQuery({
    queryKey: ['shifts', scheduleId],
    queryFn: () =>
      api.get<ShiftResponse[]>(`/shifts?scheduleId=${scheduleId}`),
    enabled: !!scheduleId,
  });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      scheduleId: string;
      locationId: string;
      startTime: string;
      endTime: string;
      requiredSkillId?: string;
      headcountNeeded: number;
      notes?: string;
      timezone: string;
    }) => api.post<ShiftResponse>('/shifts', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['shifts', vars.scheduleId] });
    },
  });
}

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, ...data }: {
      shiftId: string;
      startTime?: string;
      endTime?: string;
      requiredSkillId?: string | null;
      headcountNeeded?: number;
      notes?: string;
      timezone: string;
    }) => api.put<ShiftResponse>(`/shifts/${shiftId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shiftId: string) => api.delete(`/shifts/${shiftId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function usePreviewAssignment() {
  return useMutation({
    mutationFn: (data: { shiftId: string; userId: string }) =>
      api.post<ValidationResult>(`/shifts/${data.shiftId}/assignments/preview`, {
        userId: data.userId,
      }),
  });
}

export function useAssignStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      shiftId: string;
      userId: string;
      overrides?: { constraint: string; reason: string }[];
    }) =>
      api.post(`/shifts/${data.shiftId}/assignments`, {
        userId: data.userId,
        overrides: data.overrides,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useUnassignStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { shiftId: string; userId: string }) =>
      api.delete(`/shifts/${data.shiftId}/assignments/${data.userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useUserSchedule(userId: string | null, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['user-schedule', userId, startDate, endDate],
    queryFn: () =>
      api.get<ShiftResponse[]>(
        `/shifts/user/${userId}/schedule?startDate=${startDate}&endDate=${endDate}`,
      ),
    enabled: !!userId,
  });
}

interface LocationStaff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  desired_weekly_hours: number | null;
  is_active: boolean;
  skills: { id: string; name: string }[];
}

export function useLocationStaff(locationId: string | null) {
  return useQuery({
    queryKey: ['location-staff', locationId],
    queryFn: () =>
      api.get<LocationStaff[]>(`/locations/${locationId}/staff`),
    enabled: !!locationId,
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get<{ id: string; name: string }[]>('/skills'),
    staleTime: 5 * 60_000,
  });
}
