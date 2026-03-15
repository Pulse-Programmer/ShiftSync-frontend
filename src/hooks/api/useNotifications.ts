import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { AppNotification, PaginatedResponse } from '../../api/types';

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  channel: 'in_app' | 'email';
  enabled: boolean;
}

export function useNotifications(params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params?.unreadOnly) qs.set('unreadOnly', 'true');
  const query_str = qs.toString();

  return useQuery({
    queryKey: ['notifications', query_str],
    queryFn: () =>
      api.get<PaginatedResponse<AppNotification>>(`/notifications${query_str ? `?${query_str}` : ''}`),
    select: (res) => res.data,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.get<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30_000, // Poll every 30s as fallback
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.get<NotificationPreference[]>('/notifications/preferences'),
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: { notificationType: string; channel: string; enabled: boolean }[]) =>
      api.put('/notifications/preferences', { preferences: prefs }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}
