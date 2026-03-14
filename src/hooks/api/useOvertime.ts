import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface WeeklyOvertimeEntry {
  id: string;
  first_name: string;
  last_name: string;
  desired_weekly_hours: number | null;
  total_hours: number;
  days_worked: number;
  overtime_hours: number;
  status: 'normal' | 'warning' | 'overtime';
}

export interface UserShiftDetail {
  id: string;
  start_time: string;
  end_time: string;
  location_name: string;
  timezone: string;
  skill_name: string | null;
  hours: number;
  running_total: number;
  pushes_past_35: boolean;
  pushes_past_40: boolean;
}

export interface UserWeeklyDetail {
  userId: string;
  weekStart: string;
  totalHours: number;
  overtimeHours: number;
  shifts: UserShiftDetail[];
}

export interface OvertimeProjection {
  id: string;
  first_name: string;
  last_name: string;
  total_hours: number;
  published_hours: number;
  draft_hours: number;
  overtime_hours: number;
  projected_overtime_cost: number;
}

export function useWeeklyOvertime(locationId: string | null, weekStart: string) {
  return useQuery({
    queryKey: ['overtime-weekly', locationId, weekStart],
    queryFn: () =>
      api.get<WeeklyOvertimeEntry[]>(
        `/overtime/weekly?locationId=${locationId}&weekStart=${weekStart}`,
      ),
    enabled: !!locationId,
  });
}

export function useUserWeeklyDetail(userId: string | null, weekStart: string) {
  return useQuery({
    queryKey: ['overtime-user', userId, weekStart],
    queryFn: () =>
      api.get<UserWeeklyDetail>(`/overtime/user/${userId}?weekStart=${weekStart}`),
    enabled: !!userId,
  });
}

export function useOvertimeProjections(locationId: string | null, weekStart: string) {
  return useQuery({
    queryKey: ['overtime-projections', locationId, weekStart],
    queryFn: () =>
      api.get<OvertimeProjection[]>(
        `/overtime/projections?locationId=${locationId}&weekStart=${weekStart}`,
      ),
    enabled: !!locationId,
  });
}
