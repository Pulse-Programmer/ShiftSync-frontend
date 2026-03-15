import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from '../../hooks/api/useNotifications';
import { DateTime } from 'luxon';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: unread } = useUnreadCount();
  const { data: notifications } = useNotifications({ pageSize: 10 });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const count = unread?.count ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text
                   hover:bg-surface-hover transition-colors duration-fast"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center
                          bg-error text-white text-[10px] font-bold rounded-full px-1 animate-badge">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-surface border border-border
                        rounded-xl shadow-lg z-50 animate-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Notifications</h3>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {(!notifications || notifications.length === 0) && (
              <div className="py-8 text-center">
                <Bell size={24} className="text-text-secondary/20 mx-auto mb-2" />
                <p className="text-xs text-text-secondary">No notifications yet</p>
              </div>
            )}

            {notifications?.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.is_read) markRead.mutate(n.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0
                           hover:bg-surface-hover transition-colors
                           ${!n.is_read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                  <div className={`flex-1 ${n.is_read ? 'pl-4' : ''}`}>
                    <p className="text-sm font-medium text-text">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-text-secondary/60 mt-1">
                      {DateTime.fromISO(n.created_at).toRelative()}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead.mutate(n.id);
                      }}
                      className="p-1 rounded hover:bg-surface-alt text-text-secondary shrink-0"
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="w-full text-center text-xs text-primary font-medium hover:text-primary-hover transition-colors py-1"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
