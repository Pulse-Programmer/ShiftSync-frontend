import { Bell, CheckCheck } from 'lucide-react';
import { DateTime } from 'luxon';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useUnreadCount,
} from '../hooks/api/useNotifications';

const typeIcons: Record<string, string> = {
  swap_request: 'Swap Request',
  swap_accepted: 'Swap Accepted',
  swap_approved: 'Swap Approved',
  shift_pickup: 'Shift Pickup',
  swap_cancelled: 'Swap Cancelled',
};

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications({ pageSize: 50 });
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const count = unread?.count ?? 0;

  // Group by date
  const grouped = new Map<string, typeof notifications>();
  notifications?.forEach((n) => {
    const date = DateTime.fromISO(n.created_at).toFormat('yyyy-MM-dd');
    const group = grouped.get(date) ?? [];
    group.push(n);
    grouped.set(date, group);
  });

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-primary" />
          <h1 className="text-xl font-display font-bold text-text">Notifications</h1>
          {count > 0 && (
            <span className="bg-error/15 text-error text-xs font-semibold px-2 py-0.5 rounded-full">
              {count} unread
            </span>
          )}
        </div>
        {count > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary
                       border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors press-effect"
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="text-center py-12">
          <Bell size={32} className="text-text-secondary/30 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No notifications yet</p>
        </div>
      )}

      {/* Grouped list */}
      {[...grouped.entries()].map(([date, items]) => (
        <div key={date} className="mb-6">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            {DateTime.fromISO(date).toFormat('EEEE, MMMM d')}
          </p>
          <div className="space-y-2">
            {items?.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-colors ${
                  n.is_read
                    ? 'border-border bg-surface'
                    : 'border-primary/20 bg-primary/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                      <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
                        {typeIcons[n.type] ?? n.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-text">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{n.message}</p>
                    <p className="text-[10px] text-text-secondary/60 mt-2">
                      {DateTime.fromISO(n.created_at).toRelative()}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className="px-2 py-1 text-[10px] font-medium text-primary border border-primary/20
                                 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
