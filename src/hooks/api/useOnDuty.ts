import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface OnDutyStaff {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
  start_time: string;
  end_time: string;
  skill: string | null;
}

export function useOnDutyStaff(locationId: string | null) {
  return useQuery({
    queryKey: ['on-duty', locationId],
    queryFn: () => api.get<OnDutyStaff[]>(`/locations/${locationId}/on-duty`),
    enabled: !!locationId,
    refetchInterval: 60_000, // Auto-refresh every minute
  });
}
