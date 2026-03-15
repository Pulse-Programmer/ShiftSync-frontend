import { useOutletContext } from 'react-router-dom';
import { Clock, Users, Wifi, WifiOff } from 'lucide-react';
import { DateTime } from 'luxon';
import { useOnDutyStaff } from '../hooks/api/useOnDuty';
import { useSocket } from '../hooks/useSocket';
import { formatInTimezone } from '../utils/date';

interface OutletCtx {
  selectedLocationId: string | null;
}

export function OnDutyPage() {
  const { selectedLocationId } = useOutletContext<OutletCtx>();
  const { data: staff, isLoading } = useOnDutyStaff(selectedLocationId);
  const { connected } = useSocket();

  if (!selectedLocationId) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-secondary">Select a location to view on-duty staff</p>
      </div>
    );
  }

  const now = DateTime.now();

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-primary" />
          <div>
            <h1 className="text-xl font-display font-bold text-text">On Duty Now</h1>
            <p className="text-xs text-text-secondary">
              {now.toFormat('EEEE, MMMM d · h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-alt">
          {connected ? (
            <Wifi size={12} className="text-success" />
          ) : (
            <WifiOff size={12} className="text-text-secondary" />
          )}
          <span className={`text-[10px] font-medium ${connected ? 'text-success' : 'text-text-secondary'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!staff || staff.length === 0) && (
        <div className="text-center py-12">
          <Users size={32} className="text-text-secondary/30 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No one is currently on duty</p>
          <p className="text-xs text-text-secondary/70 mt-1">
            Staff working active shifts will appear here
          </p>
        </div>
      )}

      {/* Count badge */}
      {staff && staff.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-success/15 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
            {staff.length} on duty
          </span>
          <span className="text-xs text-text-secondary">Auto-refreshes every minute</span>
        </div>
      )}

      {/* Staff list */}
      <div className="space-y-2 animate-stagger">
        {staff?.map((s) => {
          // Calculate shift progress
          const start = DateTime.fromISO(s.start_time);
          const end = DateTime.fromISO(s.end_time);
          const total = end.diff(start, 'minutes').minutes;
          const elapsed = now.diff(start, 'minutes').minutes;
          const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
          const remaining = end.diff(now, 'minutes').minutes;

          return (
            <div key={`${s.id}-${s.start_time}`} className="p-4 bg-surface rounded-xl border border-border card-hover">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {s.first_name[0]}{s.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {s.first_name} {s.last_name}
                    </p>
                    {s.skill && (
                      <span className="text-xs text-text-secondary capitalize">{s.skill}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold ${
                    remaining <= 30 ? 'text-warning' : 'text-text-secondary'
                  }`}>
                    {remaining <= 0 ? 'Ending' : `${Math.round(remaining)}m left`}
                  </span>
                </div>
              </div>

              {/* Shift time */}
              <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                <Clock size={10} />
                <span>
                  {formatInTimezone(s.start_time, 'UTC', 'h:mm a')} –{' '}
                  {formatInTimezone(s.end_time, 'UTC', 'h:mm a')}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    remaining <= 30 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
