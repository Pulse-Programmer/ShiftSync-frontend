import { ArrowUp, ArrowDown, Check, Minus } from 'lucide-react';
import type { FairnessEntry } from '../../hooks/api/useAnalytics';

interface SchedulingStatusPanelProps {
  data: FairnessEntry[];
  onSelectUser: (userId: string) => void;
}

const statusConfig = {
  over_scheduled: {
    label: 'Over-Scheduled',
    icon: ArrowUp,
    color: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/20',
  },
  under_scheduled: {
    label: 'Under-Scheduled',
    icon: ArrowDown,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  on_target: {
    label: 'On Target',
    icon: Check,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
  no_target: {
    label: 'No Target Set',
    icon: Minus,
    color: 'text-text-secondary',
    bg: 'bg-surface-alt',
    border: 'border-border',
  },
} as const;

export function SchedulingStatusPanel({ data, onSelectUser }: SchedulingStatusPanelProps) {
  const groups = {
    over_scheduled: data.filter((d) => d.scheduling_status === 'over_scheduled'),
    under_scheduled: data.filter((d) => d.scheduling_status === 'under_scheduled'),
    on_target: data.filter((d) => d.scheduling_status === 'on_target'),
    no_target: data.filter((d) => d.scheduling_status === 'no_target'),
  };

  return (
    <div className="space-y-3">
      {(Object.keys(groups) as Array<keyof typeof groups>).map((status) => {
        const entries = groups[status];
        if (entries.length === 0) return null;
        const config = statusConfig[status];
        const Icon = config.icon;

        return (
          <div key={status} className={`rounded-xl border ${config.border} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-2.5 ${config.bg}`}>
              <Icon size={14} className={config.color} />
              <span className={`text-xs font-semibold ${config.color}`}>
                {config.label} ({entries.length})
              </span>
            </div>
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelectUser(entry.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-surface hover:bg-surface-hover transition-colors text-left"
                >
                  <div>
                    <span className="text-sm font-medium text-text">
                      {entry.first_name} {entry.last_name}
                    </span>
                    {entry.target_hours != null && (
                      <span className="text-xs text-text-secondary ml-2">
                        target: {entry.target_hours}h
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-text">
                      {entry.total_hours}h
                    </span>
                    {entry.hours_deviation != null && (
                      <span className={`text-xs ml-2 font-medium ${
                        entry.hours_deviation > 0 ? 'text-error' :
                        entry.hours_deviation < 0 ? 'text-warning' : 'text-success'
                      }`}>
                        {entry.hours_deviation > 0 ? '+' : ''}{entry.hours_deviation}h
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
