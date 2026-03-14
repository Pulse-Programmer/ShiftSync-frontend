import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from './useSocket';
import { useToast } from '../contexts/ToastContext';

/**
 * Subscribes to WebSocket events and invalidates relevant TanStack Query caches.
 * Mount this once inside the authenticated layout.
 */
export function useRealtimeSync() {
  const qc = useQueryClient();
  const { addToast } = useToast();

  // New notification → refresh badge + list
  useSocketEvent('notification:new', useCallback((data: { title?: string; message?: string }) => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
    qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    if (data?.title) {
      addToast({ title: data.title, message: data.message ?? '', type: 'info' });
    }
  }, [qc, addToast]));

  // Swap events → refresh swap list
  useSocketEvent('swap:new_drop', useCallback(() => {
    qc.invalidateQueries({ queryKey: ['swap-requests'] });
    qc.invalidateQueries({ queryKey: ['available-shifts'] });
  }, [qc]));
}
