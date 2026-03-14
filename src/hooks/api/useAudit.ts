import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  performed_by: string;
  performer_first_name: string;
  performer_last_name: string;
  performed_at: string;
  ip_address: string | null;
  notes: string | null;
}

export interface ShiftHistoryEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  performed_by: string;
  performer_first_name: string;
  performer_last_name: string;
  performed_at: string;
  notes: string | null;
}

export function useAuditLogs(params?: {
  entityType?: string;
  startDate?: string;
  endDate?: string;
  locationId?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.entityType) qs.set('entityType', params.entityType);
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.locationId) qs.set('locationId', params.locationId);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const query_str = qs.toString();

  return useQuery({
    queryKey: ['audit-logs', query_str],
    queryFn: () =>
      api.get<AuditLogEntry[]>(`/audit${query_str ? `?${query_str}` : ''}`),
  });
}

export function useShiftHistory(shiftId: string | null) {
  return useQuery({
    queryKey: ['shift-history', shiftId],
    queryFn: () => api.get<ShiftHistoryEntry[]>(`/audit/shifts/${shiftId}`),
    enabled: !!shiftId,
  });
}

export function getAuditExportUrl(startDate: string, endDate: string, locationId?: string) {
  const qs = new URLSearchParams({ startDate, endDate });
  if (locationId) qs.set('locationId', locationId);
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  return `${baseUrl}/audit/export?${qs.toString()}`;
}
