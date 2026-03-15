import { useMemo } from 'react';
import { useFairnessScore } from '../../hooks/api/useAnalytics';
import type { Location } from '../../api/types';
import { DateTime } from 'luxon';

interface Props {
  locations: Location[];
  weekStart: string;
}

export function AdminFairnessGrid({ locations, weekStart }: Props) {
  const dateRange = useMemo(() => {
    const start = DateTime.fromISO(weekStart).minus({ weeks: 3 }).toISODate()!;
    const end = DateTime.fromISO(weekStart).plus({ days: 6 }).toISODate()!;
    return { start, end };
  }, [weekStart]);

  return (
    <div className="border border-border bg-surface p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-4 bg-primary" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-text">
          Fairness by Location
        </h3>
      </div>

      <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-4">
        Last 4 weeks &middot; Premium shift equity
      </p>

      <div className="space-y-3">
        {locations.map((loc) => (
          <LocationFairnessRow
            key={loc.id}
            location={loc}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        ))}
      </div>

      {locations.length === 0 && (
        <p className="text-sm text-text-secondary text-center py-8">No locations.</p>
      )}
    </div>
  );
}

function LocationFairnessRow({
  location,
  startDate,
  endDate,
}: {
  location: Location;
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading } = useFairnessScore(location.id, startDate, endDate);

  const score = data?.score ?? null;
  const scoreColor =
    score === null
      ? 'text-text-secondary'
      : score >= 80
        ? 'text-success'
        : score >= 60
          ? 'text-warning'
          : 'text-error';

  const barWidth = score !== null ? `${Math.min(score, 100)}%` : '0%';
  const barColor =
    score === null
      ? 'bg-border'
      : score >= 80
        ? 'bg-success'
        : score >= 60
          ? 'bg-warning'
          : 'bg-error';

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-bold text-text truncate">
          {location.name}
        </span>
        {isLoading ? (
          <span className="text-[10px] text-text-secondary">...</span>
        ) : score !== null ? (
          <span className={`text-sm font-extrabold ${scoreColor}`}>
            {Math.round(score)}%
            {score < 70 && (
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider">Alert</span>
            )}
          </span>
        ) : (
          <span className="text-[10px] text-text-secondary">No data</span>
        )}
      </div>
      <div className="w-full h-1.5 bg-border/50 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}
