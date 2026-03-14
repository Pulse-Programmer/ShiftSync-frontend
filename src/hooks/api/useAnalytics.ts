import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface FairnessEntry {
  id: string;
  first_name: string;
  last_name: string;
  desired_weekly_hours: number | null;
  total_hours: number;
  total_shifts: number;
  premium_shifts: number;
  target_hours: number | null;
  hours_deviation: number | null;
  scheduling_status: 'on_target' | 'over_scheduled' | 'under_scheduled' | 'no_target';
}

export interface StaffScoreBreakdown {
  id: string;
  name: string;
  premiumShifts: number;
  premiumDeviation: number;
  totalHours: number;
  schedulingStatus: string;
}

export interface FairnessScore {
  score: number;
  totalStaff: number;
  totalPremiumShifts: number;
  avgPremiumPerStaff: number;
  premiumStdDev: number;
  avgHoursDeviation: number;
  staffBreakdown: StaffScoreBreakdown[];
}

export interface StaffShiftHistory {
  id: string;
  start_time: string;
  end_time: string;
  location_name: string;
  timezone: string;
  skill_name: string | null;
  hours: number;
  is_premium: boolean;
}

export interface StaffHistoryResponse {
  userId: string;
  period: { startDate: string; endDate: string };
  totalShifts: number;
  totalHours: number;
  premiumShifts: number;
  shifts: StaffShiftHistory[];
}

export function useFairnessReport(
  locationId: string | null,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ['fairness-report', locationId, startDate, endDate],
    queryFn: () =>
      api.get<FairnessEntry[]>(
        `/analytics/fairness?locationId=${locationId}&startDate=${startDate}&endDate=${endDate}`,
      ),
    enabled: !!locationId,
  });
}

export function useFairnessScore(
  locationId: string | null,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ['fairness-score', locationId, startDate, endDate],
    queryFn: () =>
      api.get<FairnessScore>(
        `/analytics/fairness-score?locationId=${locationId}&startDate=${startDate}&endDate=${endDate}`,
      ),
    enabled: !!locationId,
  });
}

export function useStaffHistory(
  userId: string | null,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ['staff-history', userId, startDate, endDate],
    queryFn: () =>
      api.get<StaffHistoryResponse>(
        `/analytics/staff/${userId}/history?startDate=${startDate}&endDate=${endDate}`,
      ),
    enabled: !!userId,
  });
}
